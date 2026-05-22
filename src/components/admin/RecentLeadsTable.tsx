import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface RecentLead {
  id: string;
  name: string | null;
  phone: string | null;
  location: string | null;
  source: string | null;
  crm_status: string;
  created_at: string;
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  leads: RecentLead[] | null;
  loading: boolean;
}

export function RecentLeadsTable({ leads, loading }: Props) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Recent Leads</h3>
        <button
          type="button"
          onClick={() => navigate("/admin/leads")}
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          View all →
        </button>
      </div>
      <div className="overflow-auto rounded-xl border border-white/8 bg-[#070B1F]">
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-6 text-white/50">
            <Loader2 size={16} className="animate-spin" /> Loading leads…
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Location</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Source</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {(leads ?? []).map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigate("/admin/leads")}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-white">{lead.name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">{lead.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-white/60 hidden md:table-cell">{lead.location ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/50 max-w-[120px] truncate hidden lg:table-cell">
                    {lead.source ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                        STATUS_PILL[lead.crm_status] ?? "border-white/10 text-white/60"
                      }`}
                    >
                      {lead.crm_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-white/40 whitespace-nowrap">
                    {timeAgo(lead.created_at)}
                  </td>
                </tr>
              ))}
              {leads?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                    No leads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
