/**
 * useLeadSubmitController — clean state machine for lead form submission.
 *
 * Design principles:
 *  1. State machine: idle → submitting → success/error → idle
 *  2. Single inFlight guard (ref, not state) prevents double-submit
 *  3. Navigation is synchronous + deferred to next frame — no async gaps
 *  4. GHL and analytics are fully fire-and-forget after navigation
 *  5. Supabase capture is fire-and-forget — never blocks the user
 *  6. Hard 6s timeout as last resort — button can never hang permanently
 */
import { useCallback, useRef, useState } from "react";

import type { ZodSchema } from "zod";
import { useServices } from "@/app/providers/ServicesProvider";
import { getAttribution, attributionTags } from "@/lib/attribution";
import { trackConversion } from "@/lib/capi";
// Lazy-load Supabase — only needed on form submit, not on page load
const getSupabase = () => import("@/integrations/supabase/client").then(m => m.supabase);
import { useBookingStore } from "@/domain/booking/bookingStore";
import type { LeadInput, LeadResult } from "@/services/contracts/ILeadSubmitter";
import type { Database } from "@/integrations/supabase/types";

type LeadCaptureInsert = Database["public"]["Tables"]["lead_captures"]["Insert"];

export type LeadSubmitStatus = "idle" | "submitting" | "success" | "error";

export interface LeadSubmitOptions<TInput> {
  schema: ZodSchema<TInput>;
  toLeadInput: (input: TInput) => LeadInput;
  source?: string;
  tags?: string[];
  onSuccess?: (result: LeadResult, input: TInput) => void;
  navigateTo?: string;
  toastOnError?: boolean;
  persistToBookingState?: boolean; // reserved
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- TInput preserved for type-inference at call sites
export interface LeadSubmitController<TInput> {
  status: LeadSubmitStatus;
  error: string | null;
  fieldErrors: Record<string, string>;
  submit: (raw: unknown) => void; // void — caller never needs to await
  reset: () => void;
  isSubmitting: boolean;
}

/** Fire-and-forget Supabase capture — never throws, never blocks. */
function persistCapture(row: LeadCaptureInsert): void {
  void getSupabase()
    .then(sb => sb.from("lead_captures").insert(row))
    .catch(() => { /* non-critical, logged server-side */ });
}

/** Update GHL contact + fire analytics after navigation — fully async. */
function syncToGhlAsync(
  submitLead: (input: LeadInput) => Promise<LeadResult>,
  leadInput: LeadInput,
  v: Record<string, unknown>,
): void {
  submitLead(leadInput).then((result) => {
    // Update booking store with real GHL contactId
    const identity = useBookingStore.getState().identity;
    if (identity) {
      useBookingStore.getState().setIdentity({ ...identity, ghlContactId: result.contactId });
    }
    // Fire analytics
    const fullName = typeof v.name === "string" ? v.name.trim() : "";
    const [firstName, ...rest] = fullName.split(/\s+/);
    void trackConversion("Lead", {
      user_data: {
        email: typeof v.email === "string" ? v.email : undefined,
        phone: typeof v.phone === "string" ? v.phone : undefined,
        first_name: firstName || undefined,
        last_name: rest.length ? rest.join(" ") : undefined,
        state: typeof v.location === "string" ? "VA" : undefined,
        external_id: result.contactId,
      },
      custom_data: {
        content_name: leadInput.source,
        lp_slug: typeof window !== "undefined" ? window.location.pathname : undefined,
      },
    });
  }).catch(() => { /* GHL failure logged server-side */ });
}

export function useLeadSubmitController<TInput>(
  opts: LeadSubmitOptions<TInput>,
): LeadSubmitController<TInput> {
  const { leads, nav } = useServices();
  const [status, setStatus] = useState<LeadSubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Ref guard — prevents double-submit without state race conditions
  const inFlight = useRef(false);
  // Timeout ref — cleared on success, fires after 6s as hard backstop
  const timeoutRef = useRef<number | null>(null);

  const clearHardTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearHardTimeout();
    inFlight.current = false;
    setStatus("idle");
    setError(null);
    setFieldErrors({});
  }, [clearHardTimeout]);

  const submit = useCallback((raw: unknown): void => {
    // Guard: block double-submit
    if (inFlight.current) return;

    // ── Validate ──────────────────────────────────────────────────────────
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fe[key]) fe[key] = issue.message;
      }
      setFieldErrors(fe);
      setStatus("error");
      setError("Please fix the highlighted fields.");
      return;
    }

    // ── Enter submitting state ────────────────────────────────────────────
    setFieldErrors({});
    setError(null);
    setStatus("submitting");
    inFlight.current = true;

    // Hard backstop: if something goes wrong, reset after 6s — no permanent hang
    timeoutRef.current = window.setTimeout(() => {
      if (inFlight.current) {
        inFlight.current = false;
        setStatus("idle");
        timeoutRef.current = null;
      }
    }, 6000);

    const validated = parsed.data;
    const v = validated as Record<string, unknown>;
    const base = opts.toLeadInput(validated);
    const attr = getAttribution();

    const leadInput: LeadInput = {
      ...base,
      source: opts.source ?? base.source ?? "lead-form",
      tags: [...(opts.tags ?? []), ...(base.tags ?? []), ...attributionTags(attr)],
    };

    // ── Persist to Supabase (fire-and-forget) ─────────────────────────────
    persistCapture({
      name: typeof v.name === "string" ? v.name : null,
      phone: typeof v.phone === "string" ? v.phone : (leadInput.phone ?? null),
      email: typeof v.email === "string" ? v.email : (leadInput.email ?? null),
      location: typeof v.location === "string" ? v.location : null,
      service: typeof v.service === "string" ? v.service : null,
      source: leadInput.source ?? null,
      page_url: typeof window !== "undefined" ? window.location.href : null,
      tags: leadInput.tags ?? null,
      attribution: attr as Database["public"]["Tables"]["lead_captures"]["Insert"]["attribution"],
      crm_status: "pending",
    });

    // ── Transition to success + navigate (synchronous) ────────────────────
    // Clear timeout and inFlight BEFORE setStatus to avoid stale closure issues.
    clearHardTimeout();
    inFlight.current = false;
    setStatus("success");

    // Navigate in next animation frame — React flushes "success" render first,
    // then we navigate. This prevents the component from being in a torn state.
    const pendingResult: LeadResult = { contactId: "pending" };
    window.requestAnimationFrame(() => {
      try {
        opts.onSuccess?.(pendingResult, validated);
        if (opts.navigateTo) nav.go(opts.navigateTo);
      } catch {
        // Navigation errors are non-fatal — user is already past the form
      }
    });

    // ── GHL + analytics (fully async, after navigation) ───────────────────
    syncToGhlAsync(leads.submitLead.bind(leads), leadInput, v);
  }, [leads, nav, opts, clearHardTimeout]);

  return {
    status,
    error,
    fieldErrors,
    submit,
    reset,
    isSubmitting: status === "submitting",
  };
}
