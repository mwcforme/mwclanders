/** Shared types for the AdminAnalytics sub-components. */
export interface ConversionStats {
  totalLeads: number;
  bookedLeads: number;
  partialLeads: number;
  syncedLeads: number;
  failedLeads: number;
  leadsByLocation: { location: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
}
