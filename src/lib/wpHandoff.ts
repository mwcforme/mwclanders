/**
 * wpHandoff.ts — WordPress → Lovable handoff types + partial lead capture
 *
 * The token exchange is handled server-side via the wp-token-exchange Supabase
 * edge function. This module only holds:
 *   - WpHandoffPayload — the identity shape returned by the exchange
 *   - pushWpPartialLead — fire-and-forget GHL upsert (called after exchange)
 *
 * Previous HMAC-SHA256 approach (signed URL params) was replaced by Hammad's
 * Gravity Forms → lead-intake → opaque token flow. That approach is retired.
 */

import type { Service } from "@/domain/booking/bookingStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WpHandoffPayload {
  readonly firstName: string;
  readonly phone:     string;
  readonly email?:    string;
  readonly location?: string;
  readonly service?:  string;
}

// ── Partial lead capture ─────────────────────────────────────────────────────

/**
 * Fire-and-forget: upsert a GHL contact when a WP handoff token is exchanged.
 * The contact was already created by lead-intake, so this is a lightweight
 * tag/status sync — GHL deduplicates on phone number.
 *
 * Non-blocking — never throws to caller.
 */
export function pushWpPartialLead(payload: WpHandoffPayload): void {
  import("@/lib/ghlCalendars").then(({ upsertContact }) =>
    upsertContact({
      firstName: payload.firstName,
      phone:     `+1${payload.phone.replace(/\D/g, "")}`,
      ...(payload.email    ? { email: payload.email }       : {}),
      ...(payload.location ? { location: payload.location } : {}),
      source: "wordpress-form",
      tags:   ["source:wp-form", "status:partial"],
      ...(payload.service ? { customFields: { mwc_funnel_service: payload.service as Service } } : {}),
    })
  ).catch((err) => {
    if (import.meta.env.DEV) console.warn("[wpHandoff] partial lead push failed", err);
  });
}
