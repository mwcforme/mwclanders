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
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { sanitizeAnalyticsForBookingRoute } from "@/lib/analyticsGuard";

// Routes that may be entered without prior identity (entry / fallback pages).
const PUBLIC_BOOKING_ROUTES = new Set(["/book/lets-talk", "/book/entry"]);

const lpFor = (service?: string): string => {
  switch (service) {
    case "wl":  return "/wl";
    case "ed":  return "/ed";
    case "trt":
    default:    return "/";
  }
};

export const BookingRouteGuard = () => {
  const location    = useLocation();
  const identity    = useBookingStore((s) => s.identity);
  const symptom     = useBookingStore((s) => s.symptom);
  const service     = useBookingStore((s) => s.service);
  const storedLocation = useBookingStore((s) => s.location);

  // Analytics + Sentry hardening on every /book/* navigation, BEFORE any
  // potential redirect, so the unsanitised URL is never reported.
  useEffect(() => {
    sanitizeAnalyticsForBookingRoute(location.pathname);
  }, [location.pathname]);

  const path     = location.pathname;
  const isPublic = PUBLIC_BOOKING_ROUTES.has(path);

  // No identity → must re-enter through the LP hero form.
  if (!isPublic && !identity) {
    return <Navigate to={lpFor(service)} replace />;
  }

  // /book/schedule requires a location to be selected.
  if (identity && !storedLocation && path === "/book/schedule") {
    return <Navigate to="/book/location" replace />;
  }

  // Legacy symptom guard kept for WP-entry flow compatibility.
  if (identity && !symptom && path === "/book/duration") {
    return <Navigate to="/book/symptom" replace />;
  }

  // Note: we deliberately do NOT block /book/confirmed when appointmentTime
  // is missing — once a user has booked we want them to land on the page even
  // if the store is partially populated by a slow round-trip.

  return <Outlet />;
};
