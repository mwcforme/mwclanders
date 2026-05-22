import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, History } from "lucide-react";

interface Entry {
  id: string;
  changed_at: string;
  user_email: string | null;
  from_env: string | null;
  to_env: string;
}

/**
 * Admin-only history of environment switches. Reads `env_change_log`
 * (RLS-gated to admins). Renders as a compact table.
 */
export function EnvChangeHistory() {
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("env_change_log")
        .select("id,changed_at,user_email,from_env,to_env")
        .order("changed_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) setError(error.message);
      else setRows((data ?? []) as Entry[]);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-[#070B1F]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <History size={14} className="text-white/50" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/70">
          Environment change history
        </h2>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {!rows && !error && (
        <div className="flex items-center gap-2 px-4 py-6 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {rows && (
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="px-4 py-3 font-semibold">To</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 align-top">{new Date(r.changed_at).toLocaleString()}</td>
                  <td className="px-4 py-3 align-top text-white/80">{r.user_email ?? "—"}</td>
                  <td className="px-4 py-3 align-top">
                    <EnvPill env={r.from_env} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <EnvPill env={r.to_env} />
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                    No environment changes recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EnvPill({ env }: { env: string | null }) {
  if (!env) return <span className="text-white/50">—</span>;
  const tone =
    env === "stage"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-red-500/15 text-red-300 border-red-500/30";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>
      {env}
    </span>
  );
}
