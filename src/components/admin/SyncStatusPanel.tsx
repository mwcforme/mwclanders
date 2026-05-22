import { Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface SyncRun {
  status: string;
  slot_count: number | null;
  started_at: string;
  finished_at: string | null;
  error: string | null;
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

interface Props {
  lastSync: SyncRun | null | undefined;
  loading: boolean;
  busy: boolean;
  error: string | null;
  onRunSync: () => void;
}

export function SyncStatusPanel({ lastSync, loading, busy, error, onRunSync }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-white/8 bg-[#070B1F] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">GHL Sync Status</h3>
        <button
          type="button"
          onClick={onRunSync}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md bg-[var(--brand-cta)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} strokeWidth={1.75} />}
          Run Sync
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-white/40">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : lastSync ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-24 shrink-0">Status</span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${STATUS_PILL[lastSync.status] ?? "bg-red-500/15 text-red-300 border-red-500/30"}`}>
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
  );
}
