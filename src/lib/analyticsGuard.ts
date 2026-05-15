/**
 * Analytics sanitizer for `/book/*` routes.
 *
 * The default GA4 / GTM behavior reports `page_location = window.location.href`
 * which would leak any URL-borne PII. Even though the booking funnel no longer
 * puts PII in URLs, this is a belt-and-suspenders guarantee: we always force
 * `page_location` to `origin + pathname` (no query, no fragment) for any
 * `/book/*` page_view.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

const GA4_ID = "G-286547777";

export function sanitizeAnalyticsForBookingRoute(pathname: string): void {
  if (typeof window === "undefined") return;
  const cleanUrl = `${window.location.origin}${pathname}`;

  if (typeof window.gtag === "function") {
    window.gtag("config", GA4_ID, {
      page_location: cleanUrl,
      page_path: pathname,
      send_page_view: true,
    });
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "page_view_sanitized",
    page_location: cleanUrl,
    page_path: pathname,
  });
}

/** Manual sanitized page_view for non-/book routes (called once on route change). */
export function fireSanitizedPageView(pathname: string): void {
  if (typeof window === "undefined") return;
  const cleanUrl = `${window.location.origin}${pathname}${window.location.search}`;
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_location: cleanUrl,
      page_path: pathname,
    });
  }
}
