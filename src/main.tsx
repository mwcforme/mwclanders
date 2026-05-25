import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
// react-helmet-async removed — replaced by useSEO hook (direct DOM manipulation)
// Analytics deferred — they inject scripts via useEffect; no need to block initial render
const Analytics    = lazy(() => import("@vercel/analytics/react").then(m => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import("@vercel/speed-insights/react").then(m => ({ default: m.SpeedInsights })));
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

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Suspense fallback={null}><Analytics /></Suspense>
    <Suspense fallback={null}><SpeedInsights /></Suspense>
  </>
);
