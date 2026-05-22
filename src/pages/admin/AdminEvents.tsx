import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminError, AdminLoading, AdminEmpty } from "@/components/admin/AdminFeedback";
import { Th, Td } from "@/components/admin/AdminTable";
import { supabase } from "@/integrations/supabase/client";

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
        .select(
          "id,created_at,event_type,location,slot_iso,source,page_url,error,meta"
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (type !== "all") q = q.eq("event_type", type);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setRows((data ?? []) as Evt[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return (
    <AdminLayout title="Booking events">
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-10 rounded-md border border-white/10 bg-[#070B1F] px-3 text-sm focus:border-[#E8670A] focus:outline-none"
        >
          <option value="all">All event types</option>
          <option value="confirm_attempt">confirm_attempt</option>
          <option value="confirm_success">confirm_success</option>
          <option value="confirm_failed">confirm_failed</option>
          <option value="lead_capture">lead_capture</option>
        </select>
      </div>

      {error && <AdminError message={error} />}

      {!rows && !error && <AdminLoading label="Loading…" />}

      {rows && (
        <div className="overflow-auto rounded-xl border border-white/10 bg-[#070B1F]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <Th>When</Th>
                <Th>Type</Th>
                <Th>Location</Th>
                <Th>Slot</Th>
                <Th>Source</Th>
                <Th>Error</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5"
                >
                  <Td>{new Date(r.created_at).toLocaleString()}</Td>
                  <Td>
                    <span className="font-mono text-xs">{r.event_type}</span>
                  </Td>
                  <Td>{r.location ?? "—"}</Td>
                  <Td>
                    {r.slot_iso ? new Date(r.slot_iso).toLocaleString() : "—"}
                  </Td>
                  <Td>{r.source ?? "—"}</Td>
                  <Td>
                    <div
                      className="max-w-[280px] text-xs text-red-300 truncate"
                      title={r.error ?? ""}
                    >
                      {r.error ?? ""}
                    </div>
                  </Td>
                </tr>
              ))}
              {!rows.length && (
                <AdminEmpty message="No events." colSpan={6} />
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-white/40">
        Showing the most recent 500 events.
      </p>
    </AdminLayout>
  );
}
