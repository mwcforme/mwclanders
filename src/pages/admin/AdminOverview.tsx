import { useCallback, useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/legacy";
import { fetchQuickStats, fetchRecentLeads, fetchLastSyncRun } from "@/services/impl/AdminStatsService";
import { AlertCircle, Calendar, RefreshCw, TrendingUp, Users } from "lucide-react";
import { AdminError } from "@/components/admin/AdminFeedback";
import { StatCard } from "@/components/admin/StatCard";
import { ToolsGrid } from "@/components/admin/ToolsGrid";
import { RecentLeadsTable, type RecentLead } from "@/components/admin/RecentLeadsTable";
import { SyncStatusPanel, type SyncRun } from "@/components/admin/SyncStatusPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface QuickStats {
  totalLeads: number;
  leadsToday: number;
  leadsYesterday: number;
  bookings: number;
  partialLeads: number;
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------
export default function AdminOverview() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [recentLeads, setRecentLeads] = useState<RecentLead[] | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(true);

  const [lastSync, setLastSync] = useState<SyncRun | null | undefined>(undefined);
  const [syncLoading, setSyncLoading] = useState(true);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const intervalRef = useRef<number | null>(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await fetchQuickStats();
      setStats({
        totalLeads: data.totalLeads,
        leadsToday: data.leadsToday,
        leadsYesterday: data.leadsYesterday,
        bookings: data.bookings,
        partialLeads: data.partialLeads,
      });
    } catch (e: unknown) {
      setStatsError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchRecentLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const { data } = await supabase
        .from("lead_captures")
        .select("id,name,phone,location,source,crm_status,created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setRecentLeads((data ?? []) as RecentLead[]);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  const fetchSync = useCallback(async () => {
    setSyncLoading(true);
    try {
      const { data } = await supabase
        .from("ghl_sync_runs")
        .select("status,slot_count,started_at,finished_at,error")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLastSync(data as SyncRun | null);
    } finally {
      setSyncLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLastRefreshed(new Date());
    await Promise.all([fetchStats(), fetchRecentLeads(), fetchSync()]);
  }, [fetchStats, fetchRecentLeads, fetchSync]);

  useEffect(() => {
    void refreshAll();
    intervalRef.current = window.setInterval(() => { void refreshAll(); }, 60_000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [refreshAll]);

  const runSync = async () => {
    setSyncBusy(true);
    setSyncError(null);
    const { error } = await supabase.functions.invoke("ghl-sync");
    if (error) setSyncError(error.message);
    await fetchSync();
    setTimeout(() => setSyncBusy(false), 1500);
  };

  const todayDelta = stats ? stats.leadsToday - stats.leadsYesterday : 0;
  const minutesSince = Math.floor((Date.now() - lastRefreshed.getTime()) / 60_000);
  const refreshLabel = minutesSince === 0 ? "just now" : `${minutesSince} min ago`;

  return (
    <AdminLayout title="Dashboard">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[28px] font-bold text-white leading-none" style={{ fontFamily: "Oswald, Inter, sans-serif" }}>
            Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50">Last refreshed: {refreshLabel}</span>
          <button type="button" onClick={() => void refreshAll()} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#070B1F] px-3 py-1.5 text-xs hover:bg-white/5 transition-colors">
            <RefreshCw size={12} strokeWidth={1.75} /> Refresh
          </button>
        </div>
      </div>

      {statsError && <AdminError message={statsError} />}

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <AlertCircle size={16} strokeWidth={1.75} className="shrink-0" />
        <span>Live data — changes affect real customers</span>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={stats?.totalLeads ?? "—"} sub="All time" icon={Users} accentClass="text-[var(--brand-cta)]" loading={statsLoading} />
        <StatCard
          label="Today's Leads"
          value={stats?.leadsToday ?? "—"}
          sub={stats ? (todayDelta > 0 ? `▲ ${todayDelta} vs yesterday` : todayDelta < 0 ? `▼ ${Math.abs(todayDelta)} vs yesterday` : "Same as yesterday") : undefined}
          icon={TrendingUp}
          accentClass="text-emerald-400"
          loading={statsLoading}
        />
        <StatCard label="Bookings" value={stats?.bookings ?? "—"} sub="Confirmed appointments" icon={Calendar} accentClass="text-blue-400" loading={statsLoading} />
        <StatCard label="Partial Leads" value={stats?.partialLeads ?? "—"} sub="Follow up needed" icon={AlertCircle} accentClass="text-amber-400" loading={statsLoading} />
      </div>

      <RecentLeadsTable leads={recentLeads} loading={leadsLoading} />

      {/* Bottom row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SyncStatusPanel
          lastSync={lastSync}
          loading={syncLoading}
          busy={syncBusy}
          error={syncError}
          onRunSync={() => void runSync()}
        />
      </div>

      <ToolsGrid />
    </AdminLayout>
  );
}
