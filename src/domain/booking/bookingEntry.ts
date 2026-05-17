/**
 * Hand-off from the LP hero form into the booking funnel.
 *
 * The hero form has already (1) validated input, (2) upserted the GHL contact
 * via `useLeadSubmitController`, and (3) fired the Meta CAPI `Lead` event. All
 * identity data is in memory only — never written to the URL or analytics.
 *
 * Routing logic:
 *  - Full hero form (has real name + email + location): skip to /book/schedule
 *    (identity + location already captured).
 *  - Short hero form (firstName="Guest", no email): send to /book/contact
 *    to collect real name + phone before calendar.
 *  - `forceContact=true`: always go to /book/contact (for edge cases).
 *
 * PHI: never include in URL — see BookingRouteGuard.
 */
import type { NavigateFunction } from "react-router-dom";
import { useBookingStore, type Service, type BookingIdentity } from "@/domain/booking/bookingStore";

export interface EnterBookingArgs {
  identity: BookingIdentity;
  service?: Service;
  location?: string;
  source?: string;
  lpSlug?: string;
  /** Force navigation to /book/contact even if identity is complete. */
  forceContact?: boolean;
}

export function enterBookingFunnel(
  args: EnterBookingArgs,
  navigate: NavigateFunction | ((path: string) => void),
): void {
  const store = useBookingStore.getState();
  store.reset();
  store.patch({
    identity: args.identity,
    service: args.service,
    location: args.location,
    source: args.source,
    lpSlug: args.lpSlug,
  });

  // Short form produces a Guest identity — send to /book/contact to collect
  // real first name and phone before the calendar.
  const isGuestIdentity =
    !args.identity.firstName ||
    args.identity.firstName === "Guest" ||
    !args.identity.email;

  if (args.forceContact || isGuestIdentity) {
    navigate("/book/contact");
    return;
  }

  // Full identity + location already set — skip straight to calendar.
  if (args.location) {
    navigate("/book/schedule");
    return;
  }

  // Full identity but no location — go to location picker.
  navigate("/book/location");
}
