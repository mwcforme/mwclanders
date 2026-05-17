import { useCallback, useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { APP_ENV } from "@/lib/env";
import { Loader2, RefreshCw, Play, ShieldCheck } from "lucide-react";
import { EnvChangeHistory } from "@/components/admin/EnvChangeHistory";

interface Run {
  id: string;
  status: string;
  slot_count: number | null;
  started_at: string;
  finished_at: string | null;
  error: string | null;
}

const STATUS_TONE: Record<string, string> = {
  ok: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  running: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function AdminSync() {
  const [rows, setRows] = useState<Run[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"sync" | "validate" | null>(null);
  const [validation, setValidation] = useState<unknown>(null);
  const pollRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("ghl_sync_runs")
      .select("id,status,slot_count,started_at,finished_at,error")
      .order("started_at", { ascending: false })
      .limit(50);
    if (error) { setError(error.message); return; }
    setRows((data ?? []) as Run[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-poll every 30s while a run is active.
  useEffect(() => {
    const hasRunning = rows?.some((r) => r.status === "running");
    if (hasRunning) {
      pollRef.current = window.setInterval(load, 30_000);
      return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
    }
  }, [rows, load]);

  const runSync = async () => {
    setBusy("sync"); setError(null);
    // ghl-sync returns 202 immediately and runs the work in the background.
    // The auto-poll picks up the running row and flips it to ok/error.
    const { error } = await supabase.functions.invoke("ghl-sync");
    if (error) setError(error.message);
    await load();
    // Brief debounce so the button doesn't get hammered.
    setTimeout(() => setBusy(null), 1500);
  };

  const runValidate = async () => {
    setBusy("validate"); setError(null); setValidation(null);
    const { data, error } = await supabase.functions.invoke("ghl-sync-validate");
    setBusy(null);
    if (error) { setError(error.message); return; }
    setValidation(data);
    await load();
  };

  return (
    <AdminLayout title="Sync">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runSync}
          disabled={busy !== null}
          className="flex h-10 items-center gap-2 rounded-md bg-[#E8670A] px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy === "sync" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run sync now
        </button>
        <button
          type="button"
          onClick={runValidate}
          disabled={busy !== null}
          className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-[#070B1F] px-4 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          {busy === "validate" ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          Run validation
        </button>
        <button
          type="button"
          onClick={load}
          className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-[#070B1F] px-3 text-sm hover:bg-white/5"
        >
          <RefreshCw size={14} /> Refresh
        </button>
        <span className="ml-auto text-xs uppercase tracking-wider text-white/50">env: {APP_ENV}</span>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {validation !== null && (
        <div className="mb-4 rounded-md border border-white/10 bg-[#070B1F] p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
            Validation result
          </div>
          <pre className="overflow-auto text-xs text-white/80">
            {JSON.stringify(validation, null, 2)}
          </pre>
        </div>
      )}

      {!rows && !error && (
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {rows && (
        <div className="overflow-auto rounded-xl border border-white/10 bg-[#070B1F]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Started</th>
                <th className="px-4 py-3 font-semibold">Finished</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Slots</th>
                <th className="px-4 py-3 font-semibold">Error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 align-top">{new Date(r.started_at).toLocaleString()}</td>
                  <td className="px-4 py-3 align-top">{r.finished_at ? new Date(r.finished_at).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${STATUS_TONE[r.status] ?? "bg-red-500/15 text-red-300 border-red-500/30"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">{r.slot_count ?? "—"}</td>
                  <td className="px-4 py-3 align-top max-w-[360px] text-xs text-red-300 truncate" title={r.error ?? ""}>{r.error ?? ""}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-white/50">No sync runs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-white/40">
        Showing the most recent 50 sync runs. Auto-refreshes every 30 s while a run is active.
      </p>

      <div className="mt-8">
        <EnvChangeHistory />
      </div>
    </AdminLayout>
  );
}
