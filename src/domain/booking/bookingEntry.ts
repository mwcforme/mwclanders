/**
 * Hand-off from the LP hero form into the booking funnel.
 *
 * The hero form has already (1) validated input, (2) upserted the GHL contact
 * via `useLeadSubmitController`, and (3) fired the Meta CAPI `Lead` event. All
 * identity data is in memory only — never written to the URL or analytics.
 *
 * Routing logic:
 *  - Full hero form (name + phone + location): skip straight to /book/schedule.
 *  - Identity set but no location: go to /book/location picker.
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

  // Location already set (full LP form) — skip straight to calendar.
  if (args.location) {
    navigate("/book/schedule");
    return;
  }

  // No location — go to location picker.
  navigate("/book/location");
}
