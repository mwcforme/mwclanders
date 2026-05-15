/**
 * Lightweight non-form analytics. dataLayer.push wrapper used by every
 * non-form CTA on the landing pages. Form submit/field events are
 * deliberately NOT routed through here — the lead-form pass owns those.
 */

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackCro(slug: string, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "cro_click", cro: slug, ...extra });
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
