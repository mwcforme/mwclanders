/**
 * AdminAnalytics — /admin/analytics route.
 * Fetches conversion stats from Supabase; delegates rendering to sub-components.
 */
import { useCallback, useEffect, useState } from "react";
import { AdminLayout }  from "@/components/admin/AdminLayout";
import { AdminError, AdminLoading } from "@/components/admin/AdminFeedback";
import { fetchConversionStats } from "@/services/impl/AdminStatsService";

import { AnalyticsToolCards }  from "@/components/admin/AnalyticsToolCards";
import { AnalyticsSetupGuide } from "@/components/admin/AnalyticsSetupGuide";
import { ConversionKPIs }      from "@/components/admin/ConversionKPIs";
import { LeadBreakdownBars }   from "@/components/admin/LeadBreakdownBars";
import type { ConversionStats } from "@/components/admin/analyticsTypes";

export default function AdminAnalytics() {
  const [stats, setStats]     = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConversionStats();
      setStats(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchStats(); }, [fetchStats]);

  return (
    <AdminLayout title="Analytics">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[28px] font-bold text-white leading-none print:text-black"
          style={{ fontFamily: "Oswald, Inter, sans-serif" }}>
          Analytics
        </h2>
      </div>

      {error && <AdminError message={error} />}

      <AnalyticsToolCards />
      <AnalyticsSetupGuide />

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
          Conversion Metrics (Supabase)
        </h3>
        {loading ? (
          <AdminLoading label="Loading metrics…" />
        ) : stats ? (
          <>
            <ConversionKPIs stats={stats} />
            <LeadBreakdownBars stats={stats} />
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
