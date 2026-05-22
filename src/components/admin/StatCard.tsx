import { Loader2 } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accentClass: string;
  loading?: boolean;
}

export function StatCard({ label, value, sub, icon: Icon, accentClass, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#070B1F] p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">{label}</span>
        <Icon size={20} strokeWidth={1.75} className={accentClass} />
      </div>
      <div className="mt-3">
        {loading ? (
          <Loader2 size={24} className="animate-spin text-white/40" />
        ) : (
          <div
            className="text-[36px] font-bold leading-none text-white"
            style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700 }}
          >
            {value}
          </div>
        )}
      </div>
      {sub && <div className="mt-2 text-xs text-white/55">{sub}</div>}
    </div>
  );
}
