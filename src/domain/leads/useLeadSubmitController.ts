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

// ZodSchema replaced by miniSchema interface — same safeParse API
import { useServices } from "@/app/providers/ServicesProvider";
import { getAttribution, attributionTags } from "@/lib/attribution";
import { trackConversion } from "@/lib/capi";
// Lazy-load Supabase — only needed on form submit, not on page load
const getSupabase = () => import("@/integrations/supabase/legacy").then(m => m.supabase);
import { useBookingStore } from "@/domain/booking/bookingStore";
import type { LeadInput, LeadResult } from "@/services/contracts/ILeadSubmitter";

type LeadCaptureInsert = {
  name: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  service: string | null;
  source: string | null;
  page_url: string | null;
  tags: string[] | null;
  attribution: ReturnType<typeof getAttribution>;
  crm_status: "pending";
};

export type LeadSubmitStatus = "idle" | "submitting" | "success" | "error";

export interface LeadSubmitOptions<TInput> {
  schema: { safeParse(raw: unknown): { success: true; data: TInput } | { success: false; error: { issues: Array<{ path: (string|number)[]; message: string }> } } };
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
      const failure = parsed as { success: false; error: { issues: Array<{ path: (string|number)[]; message: string }> } };
      for (const issue of failure.error.issues) {
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
      // Pass location so upsertContact can apply the correct location tag + custom fields
      location: typeof v.location === "string" ? v.location : (base.location ?? undefined),
      // Pass full attribution so GHL custom fields are populated (utm, gclid, landing page)
      attribution: {
        utm_source:   attr.utm_source,
        utm_medium:   attr.utm_medium,
        utm_campaign: attr.utm_campaign,
        utm_content:  attr.utm_content,
        gclid:        attr.gclid,
        fbclid:       attr.fbclid,
        msclkid:      attr.msclkid,
        landing_page_url: typeof window !== "undefined" ? window.location.href : undefined,
      },
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
      attribution: attr,
      crm_status: "pending",
    });

    // ── GHL contact create — synchronous before navigation ─────────────────
    // Contact must exist in GHL (with book_react_app tag) before the user
    // enters the booking funnel. We await this but cap at 6s via the hard
    // timeout already running above. On GHL failure we still navigate — lead
    // is already captured in Supabase and will sync via ghl-sync.
    leads.submitLead(leadInput).then((result) => {
      // Patch booking store with real contactId
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
          value: 100, currency: "USD",
          content_name: leadInput.source,
          lp_slug: typeof window !== "undefined" ? window.location.pathname : undefined,
        },
      });
    }).catch(() => { /* GHL failure — Supabase capture already persisted; ghl-sync will retry */ });

    // ── Transition to success + navigate ──────────────────────────────────
    // Navigate immediately — GHL runs concurrently above. contactId starts as
    // 'pending' and is patched into the store when GHL responds (usually < 1s).
    clearHardTimeout();
    inFlight.current = false;
    setStatus("success");

    const pendingResult: LeadResult = { contactId: "pending" };
    window.requestAnimationFrame(() => {
      try {
        opts.onSuccess?.(pendingResult, validated);
        if (opts.navigateTo) nav.go(opts.navigateTo);
      } catch {
        // Navigation errors are non-fatal
      }
    });
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
