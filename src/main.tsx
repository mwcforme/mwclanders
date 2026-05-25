import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { inject } from "@vercel/analytics";
import App from "./App.tsx";
import "./index.css";

// Vercel Web Analytics — Core Web Vitals + page views, privacy-friendly
inject();
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
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
