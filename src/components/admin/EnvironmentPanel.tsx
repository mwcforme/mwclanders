import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APP_ENV } from "@/lib/env";

export function EnvironmentPanel() {
  const navigate = useNavigate();
  const isProd = APP_ENV === "prod";

  return (
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
          Live data — changes affect real customers
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
  );
}
