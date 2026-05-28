/**
 * Lightweight non-form analytics. dataLayer.push wrapper used by every
 * non-form CTA on the landing pages. Form submit/field events are
 * deliberately NOT routed through here — the lead-form pass owns those.
 *
 * Funnel conversion events:
 * - booking_started   : LP form submitted successfully, funnel entered
 * - location_selected : user picks a clinic location
 * - date_selected     : user picks a calendar date
 * - time_selected     : user selects a specific time slot
 * - booking_completed : GHL appointment confirmed successfully
 */

import { useEffect, useRef } from "react";

export function trackCro(slug: string, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "cro_click", cro: slug, ...extra });
}

/**
 * Track key booking funnel conversion events.
 * PII-safe: never pass names, phones, or emails as event properties.
 *
 * Accepts the 5 core funnel events plus any arbitrary string event name
 * for one-off product-specific events (e.g. "product_trt_funnel_complete").
 */
export function trackFunnelEvent(
  event: "booking_started" | "location_selected" | "date_selected" | "time_selected" | "booking_completed" | (string & {}),
  extra?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Strip any accidental PII keys before pushing
  const safe = extra ? Object.fromEntries(
    Object.entries(extra).filter(([k]) => !/(name|email|phone|first|last)/i.test(k))
  ) : {};
  window.dataLayer.push({ event, ...safe });
}

/** Fire scroll-depth events at 25/50/75/100% — once each per page load. */
export function useScrollDepth() {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      [25, 50, 75, 100].forEach((threshold) => {
        if (pct >= threshold && !fired.current.has(threshold)) {
          fired.current.add(threshold);
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: "scroll_depth", depth: threshold });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
