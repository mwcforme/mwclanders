import { Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminError } from "@/components/admin/AdminFeedback";
import { StatusPill } from "@/components/admin/AdminTable";

export interface SyncRun {
  status: string;
  slot_count: number | null;
  started_at: string;
  finished_at: string | null;
  error: string | null;
}

interface Props {
  lastSync: SyncRun | null | undefined;
  loading: boolean;
  busy: boolean;
  error: string | null;
  onRunSync: () => void;
}

export function SyncStatusPanel({
  lastSync,
  loading,
  busy,
  error,
  onRunSync,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-white/8 bg-[#070B1F] p-6 print:border-gray-300">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
          GHL Sync Status
        </h3>
        <button
          type="button"
          onClick={onRunSync}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md bg-[var(--brand-cta)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity print:hidden"
        >
          {busy ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RefreshCw size={12} strokeWidth={1.75} />
          )}
          Run Sync
        </button>
      </div>

      {error && <AdminError message={error} />}

      {loading ? (
        <div className="flex items-center gap-2 text-white/40">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : lastSync ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-24 shrink-0">Status</span>
            <StatusPill status={lastSync.status} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-24 shrink-0">Last run</span>
            <span className="text-xs text-white/80">
              {lastSync.finished_at
                ? new Date(lastSync.finished_at).toLocaleString()
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-24 shrink-0">
              Slots synced
            </span>
            <span className="text-xs text-white/80">
              {lastSync.slot_count ?? "—"}
            </span>
          </div>
          {lastSync.error && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-white/50 w-24 shrink-0 mt-0.5">
                Error
              </span>
              <span className="text-xs text-red-300 break-all">
                {lastSync.error}
              </span>
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
          className="text-xs text-white/40 hover:text-white/70 transition-colors print:hidden"
        >
          View full sync history →
        </button>
      </div>
    </div>
  );
}
