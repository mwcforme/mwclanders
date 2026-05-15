/**
 * Narrow analytics surface. Components dispatch domain events; transport
 * details (GA4, Meta pixel, server logs) are hidden behind the interface.
 */
export interface AnalyticsEvent {
  name: string;
  payload?: Record<string, unknown>;
}

export interface IAnalytics {
  track(event: AnalyticsEvent): void;
}
