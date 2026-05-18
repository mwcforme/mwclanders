import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Evt {
  id: string;
  created_at: string;
  event_type: string;
  location: string | null;
  slot_iso: string | null;
  source: string | null;
  page_url: string | null;
  error: string | null;
  meta: unknown;
}

export default function AdminEvents() {
  const [rows, setRows] = useState<Evt[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = supabase
        .from("booking_event_log")
        .select("id,created_at,event_type,location,slot_iso,source,page_url,error,meta")
        .order("created_at", { ascending: false })
        .limit(500);
      if (type !== "all") q = q.eq("event_type", type);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) { setError(error.message); return; }
      setRows((data ?? []) as Evt[]);
    })();
    return () => { cancelled = true; };
  }, [type]);

  return (
    <AdminLayout title="Booking events">
      <div className="mb-4 flex flex-wrap gap-3">
        // hardcoded-color-allow-next-line
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-md border border-white/10 bg-[#070B1F] px-3 text-sm focus:border-[#E8670A] focus:outline-none">
          <option value="all">All event types</option>
          <option value="confirm_attempt">confirm_attempt</option>
          <option value="confirm_success">confirm_success</option>
          <option value="confirm_failed">confirm_failed</option>
          <option value="lead_capture">lead_capture</option>
        </select>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

      {!rows && !error && <div className="flex items-center gap-2 text-white/60"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

      {rows && (
        // hardcoded-color-allow-next-line
        <div className="overflow-auto rounded-xl border border-white/10 bg-[#070B1F]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Slot</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 align-top">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 align-top font-mono text-xs">{r.event_type}</td>
                  <td className="px-4 py-3 align-top">{r.location ?? "—"}</td>
                  <td className="px-4 py-3 align-top">{r.slot_iso ? new Date(r.slot_iso).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 align-top">{r.source ?? "—"}</td>
                  <td className="px-4 py-3 align-top max-w-[280px] text-xs text-red-300 truncate" title={r.error ?? ""}>{r.error ?? ""}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-white/50">No events.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-white/40">Showing the most recent 500 events.</p>
    </AdminLayout>
  );
}
