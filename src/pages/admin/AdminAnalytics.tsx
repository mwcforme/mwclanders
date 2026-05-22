/**
 * AdminAnalytics — /admin/analytics route.
 * Fetches conversion stats from Supabase; delegates rendering to sub-components.
 */
import { useCallback, useEffect, useState } from "react";
import { AdminLayout }  from "@/components/admin/AdminLayout";
import { AdminError, AdminLoading } from "@/components/admin/AdminFeedback";
import { supabase }     from "@/integrations/supabase/client";

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
      const [total, booked, partial, synced, failed, byLocation, bySource] =
        await Promise.all([
          supabase.from("lead_captures").select("id", { count: "exact", head: true }),
          supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "booked"),
          supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "partial"),
          supabase.from("lead_captures").select("id", { count: "exact", head: true }).in("crm_status", ["synced", "ok"]),
          supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "failed"),
          supabase.from("lead_captures").select("location").order("location"),
          supabase.from("lead_captures").select("source").order("source"),
        ]);

      const locMap: Record<string, number> = {};
      (byLocation.data ?? []).forEach((r) => { const k = r.location ?? "(unknown)"; locMap[k] = (locMap[k] ?? 0) + 1; });

      const srcMap: Record<string, number> = {};
      (bySource.data ?? []).forEach((r) => { const k = r.source ?? "(direct)"; srcMap[k] = (srcMap[k] ?? 0) + 1; });

      setStats({
        totalLeads: total.count ?? 0,
        bookedLeads: booked.count ?? 0,
        partialLeads: partial.count ?? 0,
        syncedLeads: synced.count ?? 0,
        failedLeads: failed.count ?? 0,
        leadsByLocation: Object.entries(locMap).map(([location, count]) => ({ location, count })).sort((a, b) => b.count - a.count).slice(0, 10),
        leadsBySource:   Object.entries(srcMap).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 10),
      });
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
