import type { AnalyticsEvent, IAnalytics } from "@/services/contracts/IAnalytics";

/**
 * Default analytics sink. Currently the project emits no analytics calls from
 * client code; this implementation exists so consumers can depend on
 * `IAnalytics` today without a behavior change. Swap for a real impl
 * (GA4, Meta pixel) later by changing only `ServicesProvider`.
 */
export class NoopAnalytics implements IAnalytics {
  track(_event: AnalyticsEvent): void {
    // intentionally empty
  }
}
