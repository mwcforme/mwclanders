import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv } from "@/lib/admin/csv";
import { APP_ENV } from "@/lib/env";
import { Loader2, Download, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface Lead {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  service: string | null;
  location: string | null;
  source: string | null;
  crm_status: string;
  crm_contact_id: string | null;
  crm_error: string | null;
  page_url: string | null;
  tags: string[] | null;
  attribution: Record<string, unknown> | null;
}

const STATUS_TONE: Record<string, string> = {
  synced: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  ok: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  partial: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  failed: "bg-red-500/15 text-red-300 border-red-500/30",
};

// Re-sync a single lead to GHL via the lead-intake edge function
async function resyncLead(lead: Lead): Promise<{ ok: boolean; error?: string; contactId?: string }> {
  const [firstName, ...rest] = (lead.name ?? "Guest").trim().split(/\s+/);
  const body = {
    firstName: firstName || "Guest",
    lastName: rest.join(" ") || undefined,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    location: lead.location ?? undefined,
    source: lead.source ?? "admin-resync",
    __env: APP_ENV,
  };

  // Call ghl-proxy /contacts/upsert directly
  const { data, error } = await supabase.functions.invoke("ghl-proxy", {
    body: { path: "/contacts/upsert", method: "POST", body },
  });

  if (error || !data?.ok) {
    const msg = data?.data?.message || error?.message || "GHL upsert failed";
    await supabase.from("lead_captures").update({ crm_status: "failed", crm_error: msg }).eq("id", lead.id);
    return { ok: false, error: msg };
  }

  const contactId = data?.data?.contact?.id ?? data?.data?.id;
  await supabase.from("lead_captures").update({ crm_status: "synced", crm_contact_id: contactId ?? null, crm_error: null }).eq("id", lead.id);
  return { ok: true, contactId };
}

export default function AdminLeads() {
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("unsynced");
  const [q, setQ] = useState("");
  const [resyncing, setResyncing] = useState<Set<string>>(new Set());
  const [resyncResults, setResyncResults] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const loadLeads = useCallback(async () => {
    setError(null);
    let query = supabase
      .from("lead_captures")
      .select("id,created_at,name,email,phone,service,location,source,crm_status,crm_contact_id,crm_error,page_url,tags,attribution")
      .order("created_at", { ascending: false })
      .limit(500);
    if (filter === "unsynced") {
      query = query.in("crm_status", ["failed", "pending", "partial"]);
    } else if (filter === "other") {
      query = query.not("crm_status", "in", "(ok,synced,pending,failed,partial)");
    } else if (filter !== "all") {
      query = query.eq("crm_status", filter);
    }
    const { data, error } = await query;
    if (error) { setError(error.message); return; }
    setRows((data ?? []) as Lead[]);
  }, [filter]);

  useEffect(() => { void loadLeads(); }, [loadLeads]);

  const handleResync = async (lead: Lead) => {
    setResyncing((s) => new Set(s).add(lead.id));
    const result = await resyncLead(lead);
    setResyncResults((r) => ({ ...r, [lead.id]: { ok: result.ok, msg: result.ok ? `Synced: ${result.contactId ?? "ok"}` : (result.error ?? "failed") } }));
    setResyncing((s) => { const next = new Set(s); next.delete(lead.id); return next; });
    if (result.ok) {
      setRows((prev) => prev ? prev.map((r) => r.id === lead.id ? { ...r, crm_status: "synced", crm_error: null } : r) : prev);
    }
  };

  const handleResyncAll = async () => {
    const unsynced = (rows ?? []).filter((r) => ["failed", "pending"].includes(r.crm_status));
    for (const lead of unsynced) {
      await handleResync(lead);
    }
  };

  const filtered = (rows ?? []).filter((r) => {
    if (!q) return true;
    const hay = `${r.name ?? ""} ${r.email ?? ""} ${r.phone ?? ""} ${r.service ?? ""} ${r.location ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const exportCsv = () => {
    downloadCsv(`leads-${new Date().toISOString().slice(0, 10)}.csv`, filtered, [
      { key: "created_at", header: "Created" },
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
      { key: "service", header: "Service" },
      { key: "location", header: "Location" },
      { key: "source", header: "Source" },
      { key: "crm_status", header: "CRM Status" },
      { key: "crm_contact_id", header: "GHL Contact ID" },
      { key: "crm_error", header: "CRM Error" },
      { key: "page_url", header: "Page" },
    ]);
  };

  const unsyncedCount = (rows ?? []).filter((r) => ["failed", "pending"].includes(r.crm_status)).length;

  return (
    <AdminLayout title="Leads">
      {/* Unsynced alert banner */}
      {unsyncedCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
            <AlertCircle size={15} />
            {unsyncedCount} lead{unsyncedCount !== 1 ? "s" : ""} not synced to GHL
          </div>
          <button
            type="button"
            onClick={handleResyncAll}
            className="flex items-center gap-1.5 rounded-md bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30"
          >
            <RefreshCw size={12} /> Resync All
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search name, email, phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-10 flex-1 min-w-[200px] rounded-md border border-white/10 bg-[#070B1F] px-3 text-sm placeholder:text-white/40 focus:border-[#E8670A] focus:outline-none"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 rounded-md border border-white/10 bg-[#070B1F] px-3 text-sm focus:border-[#E8670A] focus:outline-none"
        >
          <option value="unsynced">Not synced (failed + pending)</option>
          <option value="all">All statuses</option>
          <option value="synced">Synced</option>
          <option value="ok">OK</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="partial">Partial (abandoned)</option>
          <option value="other">Other</option>
        </select>
        <button
          type="button"
          onClick={() => void loadLeads()}
          className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-[#070B1F] px-3 text-sm hover:bg-white/5"
        >
          <RefreshCw size={14} /> Refresh
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!filtered.length}
          className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-[#070B1F] px-3 text-sm hover:bg-white/5 disabled:opacity-40"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

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
                <Th>Created</Th><Th>Name</Th><Th>Contact</Th><Th>Service / Loc</Th><Th>Source</Th><Th>CRM Status</Th><Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const syncing = resyncing.has(r.id);
                const result = resyncResults[r.id];
                const canResync = ["failed", "pending", "partial"].includes(r.crm_status);
                return (
                  <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <Td><div className="text-xs">{new Date(r.created_at).toLocaleString()}</div></Td>
                    <Td>{r.name ?? "—"}</Td>
                    <Td>
                      <div>{r.email ?? "—"}</div>
                      <div className="text-xs text-white/50">{r.phone ?? ""}</div>
                    </Td>
                    <Td><div>{r.service ?? "—"}</div><div className="text-xs text-white/40">{r.location ?? ""}</div></Td>
                    <Td><div className="text-xs text-white/60 max-w-[120px] truncate">{r.source ?? "—"}</div></Td>
                    <Td>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${STATUS_TONE[r.crm_status] ?? "border-white/10 text-white/60"}`}>
                        {r.crm_status}
                      </span>
                      {r.crm_contact_id && <div className="mt-1 text-xs text-white/30 font-mono">{r.crm_contact_id.slice(0, 12)}…</div>}
                      {r.crm_error && <div className="mt-1 max-w-[200px] truncate text-xs text-red-300" title={r.crm_error}>{r.crm_error}</div>}
                      {result && (
                        <div className={`mt-1 flex items-center gap-1 text-xs ${result.ok ? "text-emerald-300" : "text-red-300"}`}>
                          {result.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                          {result.msg}
                        </div>
                      )}
                    </Td>
                    <Td>
                      {canResync && (
                        <button
                          type="button"
                          disabled={syncing}
                          onClick={() => void handleResync(r)}
                          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold hover:bg-white/10 disabled:opacity-50"
                        >
                          {syncing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                          {syncing ? "Syncing…" : "Resync"}
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/50">No leads match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-white/40">Showing the most recent 500 records. Default view: unsynced leads only.</p>
    </AdminLayout>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-4 py-3 font-semibold">{children}</th>;
const Td = ({ children }: { children: React.ReactNode }) => <td className="px-4 py-3 align-top">{children}</td>;
