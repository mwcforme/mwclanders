/**
 * LeadBreakdownBars — side-by-side location & source breakdown bars.
 */
import type { ConversionStats } from "./analyticsTypes";

interface BreakdownBarProps {
  label: string;
  count: number;
  total: number;
  barColor: string;
}

const BreakdownBar = ({ label, count, total, barColor }: BreakdownBarProps) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/80 truncate max-w-[200px]">{label}</span>
        <span className="text-white/50 ml-2 shrink-0">{count}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/8">
        <div className={`h-1 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

interface LeadBreakdownBarsProps {
  stats: ConversionStats;
}

export const LeadBreakdownBars = ({ stats }: LeadBreakdownBarsProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div className="rounded-xl border border-white/8 bg-[#070B1F] p-5 print:border-gray-300">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40 print:text-gray-800">
        Leads by Location
      </h4>
      <div className="space-y-2">
        {stats.leadsByLocation.map(({ location, count }) => (
          <BreakdownBar key={location} label={location} count={count}
            total={stats.totalLeads} barColor="bg-[var(--brand-cta)]" />
        ))}
        {!stats.leadsByLocation.length && (
          <p className="text-xs text-white/40">No data yet.</p>
        )}
      </div>
    </div>

    <div className="rounded-xl border border-white/8 bg-[#070B1F] p-5 print:border-gray-300">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40 print:text-gray-800">
        Leads by Source
      </h4>
      <div className="space-y-2">
        {stats.leadsBySource.map(({ source, count }) => (
          <BreakdownBar key={source} label={source} count={count}
            total={stats.totalLeads} barColor="bg-blue-500" />
        ))}
        {!stats.leadsBySource.length && (
          <p className="text-xs text-white/40">No data yet.</p>
        )}
      </div>
    </div>
  </div>
);
