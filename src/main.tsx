import { createRoot } from "react-dom/client";
import "./brand-tokens.css"; // MWC brand token system v1.3.0 — source of truth
// react-helmet-async removed — replaced by useSEO hook (direct DOM manipulation)
// @vercel/analytics and @vercel/speed-insights replaced with native script injection
// (saves ~14KB raw from index chunk; same auto-tracking behavior)
import App from "./App.tsx";
import "./index.css";
import { initAttribution } from "./lib/attribution";
import { initBookingQueue } from "./lib/bookingQueue";
import { sanitizeAnalyticsForBookingRoute, fireSanitizedPageView } from "./lib/analyticsGuard";

// Clear the legacy v1 attribution cookie (which could contain first/last name
// values from old URL params) before anything else runs.
if (typeof document !== "undefined") {
  document.cookie = "mwc_attr=; Max-Age=0; Path=/; SameSite=Lax";
}

// Capture URL-borne attribution (utm_*, click ids only) into the v2 cookie.
initAttribution();

// Initialize offline booking queue — retries any failed bookings on load/focus/online.
initBookingQueue();

// Fire a sanitized GA4 page_view manually so /book/* never reports its raw
// (potentially PHI-laden) URL. send_page_view is set to false in index.html.
if (typeof window !== "undefined") {
  if (window.location.pathname.startsWith("/book/")) {
    sanitizeAnalyticsForBookingRoute(window.location.pathname);
  } else {
    fireSanitizedPageView(window.location.pathname);
  }
}

// ── Vercel Analytics + Speed Insights: native script injection ─────────────
// Replaces @vercel/analytics/react and @vercel/speed-insights/react React components.
// The scripts themselves load asynchronously; no impact on LCP or TBT.
if (typeof window !== "undefined") {
  // Initialize queues (consumed by deferred scripts)
  (window as { va?: unknown }).va = function (...args: unknown[]) {
    ((window as { vaq?: unknown[] }).vaq = (window as { vaq?: unknown[] }).vaq ?? []).push(args);
  };
  (window as { si?: unknown }).si = function (...args: unknown[]) {
    ((window as { siq?: unknown[] }).siq = (window as { siq?: unknown[] }).siq ?? []).push(args);
  };

  // Inject scripts after first interaction to keep TBT at zero
  const injectVercel = () => {
    const inject = (src: string, attrs: Record<string, string>) => {
      if (document.head.querySelector(`script[src*="${src}"]`)) return;
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
      document.head.appendChild(s);
    };
    inject("/_vercel/insights/script.js",       { "data-sdkn": "@vercel/analytics/react",      "data-sdkv": "2.0.1" });
    inject("/_vercel/speed-insights/script.js", { "data-sdkn": "@vercel/speed-insights/react", "data-sdkv": "2.0.0" });
  };
  // Fire after first user gesture OR after 5s, whichever is first
  const once = { once: true, passive: true } as const;
  ["click", "scroll", "keydown", "touchstart"].forEach(e =>
    document.addEventListener(e, injectVercel, once)
  );
  setTimeout(injectVercel, 5000);
}

createRoot(document.getElementById("root")!).render(<App />);
