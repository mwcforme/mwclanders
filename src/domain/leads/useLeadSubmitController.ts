import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { ZodSchema } from "zod";
import { useServices } from "@/app/providers/ServicesProvider";
import { getAttribution, attributionTags } from "@/lib/attribution";
import { trackConversion } from "@/lib/capi";
import { supabase } from "@/integrations/supabase/client";
import type { LeadInput, LeadResult } from "@/services/contracts/ILeadSubmitter";

export type LeadSubmitStatus = "idle" | "submitting" | "success" | "error";

export interface LeadSubmitOptions<TInput> {
  schema: ZodSchema<TInput>;
  toLeadInput: (input: TInput) => LeadInput;
  source?: string;
  tags?: string[];
  onSuccess?: (result: LeadResult, input: TInput) => void | Promise<void>;
  navigateTo?: string;
  toastOnError?: boolean;
  /** Reserved for future use; persistence is now handled by the booking store. */
  persistToBookingState?: boolean;
}

export interface LeadSubmitController<TInput> {
  status: LeadSubmitStatus;
  error: string | null;
  fieldErrors: Record<string, string>;
  submit: (raw: unknown) => Promise<LeadResult | null>;
  reset: () => void;
  isSubmitting: boolean;
}

export function useLeadSubmitController<TInput>(
  opts: LeadSubmitOptions<TInput>,
): LeadSubmitController<TInput> {
  const { leads, nav } = useServices();
  const [status, setStatus] = useState<LeadSubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (raw: unknown): Promise<LeadResult | null> => {
      if (inFlight.current) return null;

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
        return null;
      }

      setFieldErrors({});
      setError(null);
      setStatus("submitting");
      inFlight.current = true;

      const validated = parsed.data;
      const base = opts.toLeadInput(validated);
      const attr = getAttribution();

      // Names are NEVER read from attribution anymore (PHI: see attribution.ts).
      const leadInput: LeadInput = {
        ...base,
        source: opts.source ?? base.source ?? "lead-form",
        tags: [...(opts.tags ?? []), ...(base.tags ?? []), ...attributionTags(attr)],
      };

      const v = validated as Record<string, unknown>;
      const captureRow = {
        name: typeof v.name === "string" ? v.name : null,
        phone: typeof v.phone === "string" ? v.phone : (leadInput.phone ?? null),
        email: typeof v.email === "string" ? v.email : (leadInput.email ?? null),
        location: typeof v.location === "string" ? v.location : null,
        service: typeof v.service === "string" ? v.service : null,
        source: leadInput.source ?? null,
        page_url: typeof window !== "undefined" ? window.location.href : null,
        tags: leadInput.tags ?? null,
        attribution: attr as unknown as Record<string, unknown>,
        crm_status: "pending",
      };
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from("lead_captures").insert(captureRow as any);
      } catch (persistErr) {
        console.warn("[lead-capture] insert failed", persistErr);
      }

      try {
        const result = await leads.submitLead(leadInput);

        setStatus("success");

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

        await opts.onSuccess?.(result, validated);
        if (opts.navigateTo) nav.go(opts.navigateTo);
        return result;
      } catch (e) {
        const msg = (e as Error).message || "Something went wrong. Please try again.";
        setError(msg);
        setStatus("error");
        if (opts.toastOnError !== false) toast.error(msg);
        return null;
      } finally {
        inFlight.current = false;
      }
    },
    [leads, nav, opts],
  );

  return {
    status,
    error,
    fieldErrors,
    submit,
    reset,
    isSubmitting: status === "submitting",
  };
}
