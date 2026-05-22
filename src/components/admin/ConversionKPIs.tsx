/**
 * ConversionKPIs — 4-tile KPI metrics grid for AdminAnalytics.
 */
import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ConversionStats } from "./analyticsTypes";

interface ConversionKPIsProps {
  stats: ConversionStats;
}

export const ConversionKPIs = ({ stats }: ConversionKPIsProps) => {
  const bookingRate =
    stats.totalLeads > 0 ? ((stats.bookedLeads / stats.totalLeads) * 100).toFixed(1) : null;
  const completionRate =
    stats.totalLeads > 0
      ? (((stats.totalLeads - stats.partialLeads) / stats.totalLeads) * 100).toFixed(1)
      : null;

  const kpis = [
    { label: "Total Leads",      value: stats.totalLeads,                    icon: Users,     color: "text-[var(--brand-cta)]" },
    { label: "Booking Rate",     value: bookingRate ? `${bookingRate}%` : "—", icon: TrendingUp, color: "text-emerald-400" },
    { label: "Form Completion",  value: completionRate ? `${completionRate}%` : "—", icon: BarChart3, color: "text-blue-400" },
    { label: "Sync Failures",    value: stats.failedLeads,                   icon: BarChart3,  color: "text-red-400" },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
      {kpis.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-xl border border-white/8 bg-[#070B1F] p-5 print:border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50 print:text-gray-600">
              {label}
            </span>
            <Icon size={16} strokeWidth={1.75} className={color} />
          </div>
          <div className="text-3xl font-bold text-white print:text-black"
            style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700 }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
};
