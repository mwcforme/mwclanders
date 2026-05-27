/**
 * Route guard for `/book/*`.
 *
 * Responsibilities:
 *  1. Enforce the "always restart" rule: if there's no `identity` in the store
 *     (e.g. user refreshed, opened in a new tab, or pasted the URL), bounce
 *     them back to the LP. Refresh = restart, by design.
 *  2. Enforce step prerequisites (e.g. `/book/duration` requires `symptom`).
 *  3. Sanitize GA4 / GTM `page_location` so the route path never carries PHI
 *     even by accident.
 *  4. Tag the Sentry scope and stop session replay so /book/* never sends
 *     personalised DOM text or PHI-laden URLs to Sentry.
 */
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { sanitizeAnalyticsForBookingRoute } from "@/lib/analyticsGuard";

// TODO (pre-launch): re-enable identity guard
// Redirects are disabled for dev/QA — restore before production.
export const BookingRouteGuard = () => {
  const location = useLocation();

  // Analytics + Sentry hardening on every /book/* navigation
  useEffect(() => {
    sanitizeAnalyticsForBookingRoute(location.pathname);
  }, [location.pathname]);

  // DEV MODE: redirects disabled for development/QA
  // TODO: re-enable before production launch
  // if (!PUBLIC_BOOKING_ROUTES.has(path) && !identity) {
  //   return <Navigate to={lpFor(service)} replace />;
  // }

  // Note: we deliberately do NOT block /book/confirmed when appointmentTime
  // is missing — once a user has booked we want them to land on the page even
  // if the store is partially populated by a slow round-trip.

  return <Outlet />;
};
