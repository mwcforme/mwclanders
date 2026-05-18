import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { APP_ENV } from "@/lib/env";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Code2,
  Database,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

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

interface RecentLead {
  id: string;
  name: string | null;
  phone: string | null;
  location: string | null;
  source: string | null;
  crm_status: string;
  created_at: string;
}

interface SyncRun {
  status: string;
  slot_count: number | null;
  started_at: string;
  finished_at: string | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_PILL: Record<string, string> = {
  booked:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  synced:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  ok:       "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  partial:  "bg-amber-500/15 text-amber-300 border-amber-500/30",
  pending:  "bg-amber-500/15 text-amber-300 border-amber-500/30",
  captured: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  failed:   "bg-red-500/15 text-red-300 border-red-500/30",
};

// ---------------------------------------------------------------------------
// External tools data
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    name: "Sentry",
    desc: "Error monitoring · Crashes & exceptions",
    url: "https://sentry.io",
    Icon: AlertTriangle,
  },
  {
    name: "Google Analytics 4",
    desc: "Traffic · Conversions · Funnel analysis",
    url: "https://analytics.google.com",
    Icon: BarChart3,
  },
  {
    name: "GHL (GoHighLevel)",
    desc: "CRM · Contacts · Appointments",
    url: "https://app.gohighlevel.com",
    Icon: Users,
  },
  {
    name: "Supabase",
    desc: "Database · Edge Functions · Auth",
    url: "https://supabase.com/dashboard",
    Icon: Database,
  },
  {
    name: "GitHub",
    desc: "Source code · mwcforme/mwclanders",
    url: "https://github.com/mwcforme/mwclanders",
    Icon: Code2,
  },
  {
    name: "LegitScript",
    desc: "Certification verification",
    url: "https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com",
    Icon: ShieldCheck,
  },
] as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accentClass,
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accentClass: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#070B1F] p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">{label}</span>
        <Icon size={20} strokeWidth={1.75} className={accentClass} />
      </div>
      <div className="mt-3">
        {loading ? (
          <Loader2 size={24} className="animate-spin text-white/40" />
        ) : (
          <div
            className="text-[36px] font-bold leading-none text-white"
            style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700 }}
          >
            {value}
          </div>
        )}
      </div>
      {sub && <div className="mt-2 text-xs text-white/55">{sub}</div>}
    </div>
  );
}

function ToolCard({ name, desc, url, Icon }: (typeof TOOLS)[number]) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 rounded-xl border border-white/8 bg-[#070B1F] p-5 transition-colors hover:border-white/20 hover:bg-white/5 group"
    >
      <Icon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-white/60 group-hover:text-white/80" />
      <div className="min-w-0">
        <div className="font-semibold text-white text-sm">{name}</div>
        <div className="mt-0.5 text-xs text-white/50 leading-relaxed">{desc}</div>
      </div>
      <span className="ml-auto shrink-0 text-xs text-white/40 group-hover:text-white/70 transition-colors">Open →</span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------
export default function AdminOverview() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<QuickStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [recentLeads, setRecentLeads] = useState<RecentLead[] | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(true);

  const [lastSync, setLastSync] = useState<SyncRun | null | undefined>(undefined); // undefined = not loaded
  const [syncLoading, setSyncLoading] = useState(true);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const intervalRef = useRef<number | null>(null);

  // ── data fetching ───────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const now = new Date();
      const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const since48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

      const [total, today, yesterday, bookings, partial] = await Promise.all([
        supabase.from("lead_captures").select("id", { count: "exact", head: true }),
        supabase.from("lead_captures").select("id", { count: "exact", head: true }).gte("created_at", since24h),
        supabase.from("lead_captures").select("id", { count: "exact", head: true }).gte("created_at", since48h).lt("created_at", since24h),
        supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "booked"),
        supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "partial"),
      ]);

      setStats({
        totalLeads: total.count ?? 0,
        leadsToday: today.count ?? 0,
        leadsYesterday: yesterday.count ?? 0,
        bookings: bookings.count ?? 0,
        partialLeads: partial.count ?? 0,
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

  // Initial load + auto-refresh every 60 s
  useEffect(() => {
    void refreshAll();
    intervalRef.current = window.setInterval(() => { void refreshAll(); }, 60_000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [refreshAll]);

  // ── sync action ─────────────────────────────────────────────────────────
  const runSync = async () => {
    setSyncBusy(true);
    setSyncError(null);
    const { error } = await supabase.functions.invoke("ghl-sync");
    if (error) setSyncError(error.message);
    await fetchSync();
    setTimeout(() => setSyncBusy(false), 1500);
  };

  // ── derived ─────────────────────────────────────────────────────────────
  const isProd = APP_ENV === "prod";
  const todayDelta = stats ? stats.leadsToday - stats.leadsYesterday : 0;

  const minutesSince = Math.floor((Date.now() - lastRefreshed.getTime()) / 60_000);
  const refreshLabel =
    minutesSince === 0 ? "just now" : `${minutesSince} min ago`;

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="Dashboard">
      {/* ── Header row ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2
            className="text-[28px] font-bold text-white leading-none"
            style={{ fontFamily: "Oswald, Inter, sans-serif" }}
          >
            Dashboard
          </h2>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
              isProd
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
            }`}
          >
            {APP_ENV}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50">Last refreshed: {refreshLabel}</span>
          <button
            type="button"
            onClick={() => void refreshAll()}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#070B1F] px-3 py-1.5 text-xs hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={12} strokeWidth={1.75} />
            Refresh
          </button>
        </div>
      </div>

      {statsError && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {statsError}
        </div>
      )}

      {/* ── PROD warning ── */}
      {isProd && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle size={16} strokeWidth={1.75} className="shrink-0" />
          <span>⚠️ <strong>Live data</strong> — changes affect real customers</span>
        </div>
      )}

      {/* ── Quick stats ── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={stats?.totalLeads ?? "—"}
          sub="All time"
          icon={Users}
          accentClass="text-[var(--brand-cta)]"
          loading={statsLoading}
        />
        <StatCard
          label="Today's Leads"
          value={stats?.leadsToday ?? "—"}
          sub={
            stats
              ? todayDelta > 0
                ? `▲ ${todayDelta} vs yesterday`
                : todayDelta < 0
                ? `▼ ${Math.abs(todayDelta)} vs yesterday`
                : "Same as yesterday"
              : undefined
          }
          icon={TrendingUp}
          accentClass="text-emerald-400"
          loading={statsLoading}
        />
        <StatCard
          label="Bookings"
          value={stats?.bookings ?? "—"}
          sub="Confirmed appointments"
          icon={Calendar}
          accentClass="text-blue-400"
          loading={statsLoading}
        />
        <StatCard
          label="Partial Leads"
          value={stats?.partialLeads ?? "—"}
          sub="Follow up needed"
          icon={AlertCircle}
          accentClass="text-amber-400"
          loading={statsLoading}
        />
      </div>

      {/* ── Recent leads ── */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Recent Leads</h3>
          <button
            type="button"
            onClick={() => navigate("/admin/leads")}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            View all →
          </button>
        </div>
        <div className="overflow-auto rounded-xl border border-white/8 bg-[#070B1F]">
          {leadsLoading ? (
            <div className="flex items-center gap-2 px-4 py-6 text-white/50">
              <Loader2 size={16} className="animate-spin" /> Loading leads…
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Location</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Source</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {(recentLeads ?? []).map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate("/admin/leads")}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-white">{lead.name ?? "—"}</td>
                    <td className="px-4 py-3 text-white/70">{lead.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-white/60 hidden md:table-cell">{lead.location ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/50 max-w-[120px] truncate hidden lg:table-cell">
                      {lead.source ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                          STATUS_PILL[lead.crm_status] ?? "border-white/10 text-white/60"
                        }`}
                      >
                        {lead.crm_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-white/40 whitespace-nowrap">
                      {timeAgo(lead.created_at)}
                    </td>
                  </tr>
                ))}
                {recentLeads?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                      No leads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Bottom row: sync status + env status ── */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Sync status */}
        <div className="rounded-xl border border-white/8 bg-[#070B1F] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">GHL Sync Status</h3>
            <button
              type="button"
              onClick={() => void runSync()}
              disabled={syncBusy}
              className="flex items-center gap-1.5 rounded-md bg-[var(--brand-cta)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {syncBusy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} strokeWidth={1.75} />}
              Run Sync
            </button>
          </div>

          {syncError && (
            <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {syncError}
            </div>
          )}

          {syncLoading ? (
            <div className="flex items-center gap-2 text-white/40">
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : lastSync ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-24 shrink-0">Status</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                    STATUS_PILL[lastSync.status] ?? "bg-red-500/15 text-red-300 border-red-500/30"
                  }`}
                >
                  {lastSync.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-24 shrink-0">Last run</span>
                <span className="text-xs text-white/80">
                  {lastSync.finished_at ? new Date(lastSync.finished_at).toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-24 shrink-0">Slots synced</span>
                <span className="text-xs text-white/80">{lastSync.slot_count ?? "—"}</span>
              </div>
              {lastSync.error && (
                <div className="flex items-start gap-3">
                  <span className="text-xs text-white/50 w-24 shrink-0 mt-0.5">Error</span>
                  <span className="text-xs text-red-300 break-all">{lastSync.error}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-white/40">No sync runs found.</div>
          )}

          <div className="mt-4 border-t border-white/8 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/sync")}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              View full sync history →
            </button>
          </div>
        </div>

        {/* Environment status */}
        <div className="rounded-xl border border-white/8 bg-[#070B1F] p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">Environment</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-28 shrink-0">APP_ENV</span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                  isProd
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
              >
                {APP_ENV.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-28 shrink-0">GHL Account</span>
              <span className="text-xs text-white/80">
                {isProd ? "Production — menswellnesscenters.com" : "Stage — sandbox account"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-28 shrink-0">Host</span>
              <span className="text-xs text-white/60 font-mono">{window.location.hostname}</span>
            </div>
          </div>

          {isProd && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              <AlertCircle size={13} strokeWidth={1.75} className="shrink-0" />
              ⚠️ Live data — changes affect real customers
            </div>
          )}

          <div className="mt-4 border-t border-white/8 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/sync")}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Manage environment &amp; sync →
            </button>
          </div>
        </div>
      </div>

      {/* ── External tools grid ── */}
      <div className="mb-2">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50">External Tools</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.name} {...tool} />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
