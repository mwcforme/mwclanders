import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { CENTER_CALENDARS } from "@/lib/ghlCalendars";
import { APP_ENV } from "@/lib/env";
import { Loader2 } from "lucide-react";

interface Stats {
  leads24h: number;
  pendingCrm: number;
  failedCrm: number;
  lastSync: { status: string; finished_at: string | null; slot_count: number | null } | null;
  freeSlotCount: number;
  freshestSlotFetched: string | null;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const envCalendarIds = Object.values(CENTER_CALENDARS).map((c) => c.calendarId);
        const [leads24, pendingCrm, failedCrm, lastSync, slotCount, freshest] =
          await Promise.all([
            supabase.from("lead_captures").select("id", { count: "exact", head: true }).gte("created_at", since),
            supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "pending"),
            supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "failed"),
            supabase.from("ghl_sync_runs").select("status, finished_at, slot_count").order("started_at", { ascending: false }).limit(1).maybeSingle(),
            supabase.from("ghl_free_slots").select("calendar_id", { count: "exact", head: true }).in("calendar_id", envCalendarIds),
            supabase.from("ghl_free_slots").select("fetched_at").in("calendar_id", envCalendarIds).order("fetched_at", { ascending: false }).limit(1).maybeSingle(),
          ]);

        if (cancelled) return;
        setStats({
          leads24h: leads24.count ?? 0,
          pendingCrm: pendingCrm.count ?? 0,
          failedCrm: failedCrm.count ?? 0,
          lastSync: lastSync.data,
          freeSlotCount: slotCount.count ?? 0,
          freshestSlotFetched: freshest.data?.fetched_at ?? null,
        });
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load stats");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminLayout title="Overview">
      {error && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}
      {!stats && !error && (
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Leads (24h)" value={stats.leads24h} />
          <Stat label="CRM pending" value={stats.pendingCrm} tone={stats.pendingCrm > 0 ? "warn" : "ok"} />
          <Stat label="CRM failed" value={stats.failedCrm} tone={stats.failedCrm > 0 ? "bad" : "ok"} />
          <Stat
            label="Last sync"
            value={stats.lastSync ? `${stats.lastSync.status}` : "n/a"}
            sub={stats.lastSync?.finished_at ? new Date(stats.lastSync.finished_at).toLocaleString() : "—"}
            tone={stats.lastSync?.status === "ok" ? "ok" : stats.lastSync ? "bad" : "warn"}
          />
          <Stat label="Cached open slots" value={stats.freeSlotCount} sub={`env: ${APP_ENV}`} />
          <Stat
            label="Freshest slot fetched"
            value={stats.freshestSlotFetched ? new Date(stats.freshestSlotFetched).toLocaleString() : "—"}
          />
        </div>
      )}
    </AdminLayout>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "ok",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "ok" | "warn" | "bad";
}) {
  const ring =
    tone === "bad"
      ? "border-red-500/40"
      : tone === "warn"
        ? "border-amber-500/40"
        : "border-white/10";
  return (
    <div className={`rounded-xl border ${ring} bg-[#070B1F] p-5`}>
      <div className="text-xs font-semibold uppercase tracking-widest text-white/50">{label}</div>
      <div className="mt-2 text-2xl font-bold" style={{ fontFamily: "Oswald, Inter, sans-serif" }}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
    </div>
  );
}
