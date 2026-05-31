import { useNavigate } from "react-router-dom";
import { AdminLoading, AdminEmpty } from "@/components/admin/AdminFeedback";
import { StatusPill, Th, Td } from "@/components/admin/AdminTable";
import { timeAgo } from "@/lib/admin/adminUtils";

export interface RecentLead {
  id: string;
  name: string | null;
  phone: string | null;
  location: string | null;
  source: string | null;
  crm_status: string;
  created_at: string;
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
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
          Recent Leads
        </h3>
        <button
          type="button"
          onClick={() => navigate("/admin/leads")}
          className="text-xs text-white/55 hover:text-white/80 transition-colors print:hidden"
        >
          View all →
        </button>
      </div>
      <div className="overflow-auto rounded-xl border border-white/8 bg-[#070B1F] print:border-gray-300">
        {loading ? (
          <div className="px-4">
            <AdminLoading label="Loading leads…" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/55 print:border-gray-200 print:text-gray-800">
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th className="hidden md:table-cell">Location</Th>
                <Th className="hidden lg:table-cell">Source</Th>
                <Th>Status</Th>
                <Th className="text-right">Time</Th>
              </tr>
            </thead>
            <tbody>
              {(leads ?? []).map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigate("/admin/leads")}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors print:border-gray-200"
                >
                  <Td>
                    <span className="font-medium text-white print:text-black">
                      {lead.name ?? "—"}
                    </span>
                  </Td>
                  <Td className="text-white/70">{lead.phone ?? "—"}</Td>
                  <Td className="text-white/60 hidden md:table-cell">
                    {lead.location ?? "—"}
                  </Td>
                  <Td className="text-xs text-white/50 max-w-[120px] truncate hidden lg:table-cell">
                    {lead.source ?? "—"}
                  </Td>
                  <Td>
                    <StatusPill status={lead.crm_status} />
                  </Td>
                  <Td className="text-right text-xs text-white/55 whitespace-nowrap">
                    {timeAgo(lead.created_at)}
                  </Td>
                </tr>
              ))}
              {leads?.length === 0 && (
                <AdminEmpty message="No leads yet." colSpan={6} />
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
