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

/** True when this app is running inside a cross-origin iframe. */
function isEmbeddedInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // If access to window.top throws, we're definitely cross-origin framed.
    return true;
  }
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

  const path = args.location ? "/book/schedule" : "/book/location";

  // If running inside an iframe (e.g. WP embed), bust out to the parent
  // window instead of navigating in-place — the full booking funnel must
  // own the entire viewport.
  if (isEmbeddedInIframe()) {
    const fullUrl = `${window.location.origin}${path}`;
    try {
      // Tell the parent to take over navigation
      window.parent.postMessage(
        { type: "mwc-navigate", url: fullUrl },
        "*",
      );
    } catch {
      // Fallback: try direct top-level navigation
      window.top!.location.href = fullUrl;
    }
    return;
  }

  // Normal in-app navigation (not framed).
  navigate(path);
}
