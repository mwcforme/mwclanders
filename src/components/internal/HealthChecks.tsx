type Health = "ok" | "fail" | "pending";

const COLORS = {
  // hardcoded-color-allow-next-line
  green: "#22C55E",
  // hardcoded-color-allow-next-line
  red: "#EF4444",
  // hardcoded-color-allow-next-line
  amber: "#F59E0B",
};

function Dot({ state }: { state: Health }) {
  const color = state === "ok" ? COLORS.green : state === "fail" ? COLORS.red : COLORS.amber;
  return (
    <span
      aria-hidden
      style={{ display: "inline-block", width: 10, height: 10, borderRadius: 9999, background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

interface HealthItem {
  label: string;
  state: Health;
}

interface Props {
  checks: HealthItem[];
}

export function HealthChecks({ checks }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {checks.map((c) => (
        <div
          key={c.label}
          className="rounded-xl p-4 flex items-center justify-between"
          style={{
            // hardcoded-color-allow-next-line
            background: "rgba(255,255,255,0.04)",
            // hardcoded-color-allow-next-line
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div>
            <div className="text-xs uppercase mb-1" style={{ color: "rgba(245,240,235,0.55)", letterSpacing: "0.08em" }}>Check</div>
            <div className="font-semibold">{c.label}</div>
          </div>
          <Dot state={c.state} />
        </div>
      ))}
    </div>
  );
}

export type { Health };
