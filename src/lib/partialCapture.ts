/**
 * Partial lead capture — fires when a user fills phone (and optionally name)
 * but abandons before submitting. Writes to lead_captures with status "partial"
 * so zero form-fill data is lost.
 */
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";

const FIRED_KEY = "mwc_partial_fired";

export async function capturePartialLead(opts: {
  phone: string;
  name?: string;
  email?: string;
  location?: string;
  source?: string;
}) {
  const digits = opts.phone.replace(/\D/g, "");
  if (digits.length < 10) return; // not enough to be useful
  if (sessionStorage.getItem(FIRED_KEY)) return; // already captured this session

  sessionStorage.setItem(FIRED_KEY, "1");

  const attr = getAttribution();
  try {
    await supabase.from("lead_captures").insert({
      name: opts.name || null,
      phone: opts.phone,
      email: opts.email || null,
      location: opts.location || null,
      source: opts.source || "partial-abandon",
      page_url: typeof window !== "undefined" ? window.location.href : null,
      crm_status: "partial",
      attribution: attr as import("@/integrations/supabase/types").Json,
    });
  } catch {
    // non-blocking — never break the UX
  }
}

/** Call this on full successful submit to prevent duplicate partial row */
export function markSessionSubmitted() {
  sessionStorage.setItem(FIRED_KEY, "1");
}
