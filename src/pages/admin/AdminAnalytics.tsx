import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminError, AdminLoading } from "@/components/admin/AdminFeedback";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  ExternalLink,
  TrendingUp,
  Users,
  MousePointerClick,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ConversionStats {
  totalLeads: number;
  bookedLeads: number;
  partialLeads: number;
  syncedLeads: number;
  failedLeads: number;
  leadsByLocation: { location: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Analytics link cards
// ---------------------------------------------------------------------------
const ANALYTICS_TOOLS = [
  {
    name: "Google Analytics 4",
    desc: "View sessions, conversions, traffic sources, and user journeys",
    url: "https://analytics.google.com",
    Icon: BarChart3,
    badge: "GA4",
  },
  {
    name: "Microsoft Clarity",
    desc: "Heatmaps, session recordings, and rage-click analysis",
    url: "https://clarity.microsoft.com",
    Icon: MousePointerClick,
    badge: "Clarity",
  },
  {
    name: "GHL Reporting",
    desc: "CRM pipeline, opportunity stages, and appointment metrics",
    url: "https://app.gohighlevel.com/reporting",
    Icon: TrendingUp,
    badge: "GHL",
  },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminAnalytics() {
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [total, booked, partial, synced, failed, byLocation, bySource] =
        await Promise.all([
          supabase
            .from("lead_captures")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("lead_captures")
            .select("id", { count: "exact", head: true })
            .eq("crm_status", "booked"),
          supabase
            .from("lead_captures")
            .select("id", { count: "exact", head: true })
            .eq("crm_status", "partial"),
          supabase
            .from("lead_captures")
            .select("id", { count: "exact", head: true })
            .in("crm_status", ["synced", "ok"]),
          supabase
            .from("lead_captures")
            .select("id", { count: "exact", head: true })
            .eq("crm_status", "failed"),
          supabase.from("lead_captures").select("location").order("location"),
          supabase.from("lead_captures").select("source").order("source"),
        ]);

      // Count by location
      const locMap: Record<string, number> = {};
      (byLocation.data ?? []).forEach((r) => {
        const key = r.location ?? "(unknown)";
        locMap[key] = (locMap[key] ?? 0) + 1;
      });

      // Count by source
      const srcMap: Record<string, number> = {};
      (bySource.data ?? []).forEach((r) => {
        const key = r.source ?? "(direct)";
        srcMap[key] = (srcMap[key] ?? 0) + 1;
      });

      setStats({
        totalLeads: total.count ?? 0,
        bookedLeads: booked.count ?? 0,
        partialLeads: partial.count ?? 0,
        syncedLeads: synced.count ?? 0,
        failedLeads: failed.count ?? 0,
        leadsByLocation: Object.entries(locMap)
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        leadsBySource: Object.entries(srcMap)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const bookingRate =
    stats && stats.totalLeads > 0
      ? ((stats.bookedLeads / stats.totalLeads) * 100).toFixed(1)
      : null;

  const completionRate =
    stats && stats.totalLeads > 0
      ? (
          ((stats.totalLeads - stats.partialLeads) / stats.totalLeads) *
          100
        ).toFixed(1)
      : null;

  return (
    <AdminLayout title="Analytics">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2
          className="text-[28px] font-bold text-white leading-none print:text-black"
          style={{ fontFamily: "Oswald, Inter, sans-serif" }}
        >
          Analytics
        </h2>
      </div>

      {error && <AdminError message={error} />}

      {/* ── External analytics tools ── */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
          Analytics Platforms
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ANALYTICS_TOOLS.map((tool) => {
            const Icon = tool.Icon;
            return (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#070B1F] p-5 transition-colors hover:border-white/20 hover:bg-white/5 group print:border-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      className="text-white/60 group-hover:text-white/80"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50 bg-white/8 px-2 py-0.5 rounded">
                      {tool.badge}
                    </span>
                  </div>
                  <ExternalLink
                    size={14}
                    strokeWidth={1.75}
                    className="text-white/30 group-hover:text-white/60"
                  />
                </div>
                <div>
                  <div className="font-semibold text-white">{tool.name}</div>
                  <div className="mt-1 text-xs text-white/50 leading-relaxed">
                    {tool.desc}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* ── GA4 setup instructions ── */}
      <div className="mb-6 rounded-xl border border-white/8 bg-[#070B1F] p-6 print:border-gray-300">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
          GA4 &amp; Clarity Setup
        </h3>
        <div className="space-y-3 text-sm text-white/70">
          <p>
            <span className="font-semibold text-white">
              Google Analytics 4:
            </span>{" "}
            The GA4 measurement ID is injected via{" "}
            <code className="rounded bg-white/8 px-1.5 py-0.5 text-xs font-mono text-white/80">
              VITE_GA_MEASUREMENT_ID
            </code>
            . Verify events in{" "}
            <span className="text-white/50">
              GA4 → Reports → Realtime
            </span>
            .
          </p>
          <p>
            <span className="font-semibold text-white">
              Microsoft Clarity:
            </span>{" "}
            Session recordings and heatmaps are configured via the Clarity
            script tag. View recordings at{" "}
            <a
              href="https://clarity.microsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand-cta)] hover:underline"
            >
              clarity.microsoft.com
            </a>
            .
          </p>
          <p>
            <span className="font-semibold text-white">
              Conversion funnel:
            </span>{" "}
            Track{" "}
            <code className="rounded bg-white/8 px-1.5 py-0.5 text-xs font-mono text-white/80">
              lead_capture
            </code>{" "}
            →{" "}
            <code className="rounded bg-white/8 px-1.5 py-0.5 text-xs font-mono text-white/80">
              appointment_booked
            </code>{" "}
            custom events in GA4 → Explore → Funnel exploration.
          </p>
        </div>
      </div>

      {/* ── Supabase conversion metrics ── */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
          Conversion Metrics (Supabase)
        </h3>

        {loading ? (
          <AdminLoading label="Loading metrics…" />
        ) : stats ? (
          <>
            {/* KPI row */}
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Total Leads",
                  value: stats.totalLeads,
                  icon: Users,
                  color: "text-[var(--brand-cta)]",
                },
                {
                  label: "Booking Rate",
                  value: bookingRate ? `${bookingRate}%` : "—",
                  icon: TrendingUp,
                  color: "text-emerald-400",
                },
                {
                  label: "Form Completion",
                  value: completionRate ? `${completionRate}%` : "—",
                  icon: BarChart3,
                  color: "text-blue-400",
                },
                {
                  label: "Sync Failures",
                  value: stats.failedLeads,
                  icon: BarChart3,
                  color: "text-red-400",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/8 bg-[#070B1F] p-5 print:border-gray-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
                      {label}
                    </span>
                    <Icon size={16} strokeWidth={1.75} className={color} />
                  </div>
                  <div
                    className="text-3xl font-bold text-white print:text-black"
                    style={{
                      fontFamily: "Oswald, Inter, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown tables */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* By location */}
              <div className="rounded-xl border border-white/8 bg-[#070B1F] p-5 print:border-gray-300">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40 print:text-gray-800">
                  Leads by Location
                </h4>
                <div className="space-y-2">
                  {stats.leadsByLocation.map(({ location, count }) => {
                    const pct =
                      stats.totalLeads > 0
                        ? (count / stats.totalLeads) * 100
                        : 0;
                    return (
                      <div key={location}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-white/80 truncate max-w-[200px]">
                            {location}
                          </span>
                          <span className="text-white/50 ml-2 shrink-0">
                            {count}
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/8">
                          <div
                            className="h-1 rounded-full bg-[var(--brand-cta)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {!stats.leadsByLocation.length && (
                    <p className="text-xs text-white/40">No data yet.</p>
                  )}
                </div>
              </div>

              {/* By source */}
              <div className="rounded-xl border border-white/8 bg-[#070B1F] p-5 print:border-gray-300">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40 print:text-gray-800">
                  Leads by Source
                </h4>
                <div className="space-y-2">
                  {stats.leadsBySource.map(({ source, count }) => {
                    const pct =
                      stats.totalLeads > 0
                        ? (count / stats.totalLeads) * 100
                        : 0;
                    return (
                      <div key={source}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-white/80 truncate max-w-[200px]">
                            {source}
                          </span>
                          <span className="text-white/50 ml-2 shrink-0">
                            {count}
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/8">
                          <div
                            className="h-1 rounded-full bg-blue-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {!stats.leadsBySource.length && (
                    <p className="text-xs text-white/40">No data yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
