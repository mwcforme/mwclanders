/**
 * TimeGrid — time slots grouped by Morning / Afternoon / Evening.
 * Mobile: full-width single column, ~80px tall.
 * Desktop: 4-col grid via CSS class.
 * Matches mwclocked.pplx.app exactly.
 */
import { ArrowRight } from "lucide-react";
import { TIMEZONE } from "@/lib/ghlCalendars";

const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const INK    = "#0B1029";

const fmtTimeParts = (iso: string): { time: string; ampm: string; hour: number } => {
  const d = new Date(iso);
  const s = d.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  // Split on any whitespace including narrow no-break space (U+202F) which
  // Safari/iOS uses between time and AM/PM in toLocaleTimeString.
  const parts = s.split(/[\s\u202f]+/);
  const time = parts[0] ?? "";
  const ampm = parts[1] ?? "";
  const hour = parseInt(new Date(iso).toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: TIMEZONE }), 10);
  return { time, ampm, hour };
};

const GROUP_LABELS: Record<string, string> = {
  morning:   "Morning",
  afternoon: "Afternoon",
  evening:   "Evening",
};

export interface TimeGridProps {
  selectedDay: string | null;
  times: string[];
  selectedSlot: string | null;
  loading: boolean;
  onSlotSelect: (iso: string) => void;
}

const TimeGrid = ({ selectedDay, times, selectedSlot, loading, onSlotSelect }: TimeGridProps) => {
  // hardcoded-color-allow-next-line
  const emptyStyle = { padding: "20px 20px 24px", borderTop: "1px solid #F3F4F6" };
  // hardcoded-color-allow-next-line
  const emptyTextStyle = { color: "#9CA3AF", fontSize: 15, fontWeight: 500, fontFamily: "Inter, sans-serif", lineHeight: 1.6 };

  if (!selectedDay) return <div style={emptyStyle}><div style={emptyTextStyle}>{loading ? "Loading availability…" : "Pick a date above to see available times."}</div></div>;
  if (times.length === 0) return <div style={emptyStyle}><div style={emptyTextStyle}>No times available. Try another day.</div></div>;

  const groups: Record<string, string[]> = { morning: [], afternoon: [], evening: [] };
  for (const iso of times) {
    const { hour } = fmtTimeParts(iso);
    if (hour < 12) groups.morning.push(iso);
    else if (hour < 17) groups.afternoon.push(iso);
    else groups.evening.push(iso);
  }

  let firstRendered = true;

  return (
    <>
      {/* Responsive grid: 1-col mobile, 4-col desktop */}
      <style>{`
        .mwc-slot-grid { display: grid; gap: 10px; grid-template-columns: 1fr; }
        .mwc-slot-btn  { min-height: 68px; }
        @media (min-width: 640px) {
          .mwc-slot-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
          .mwc-slot-btn  { min-height: 58px; }
        }
      `}</style>
      <div style={{ padding: "4px 20px 20px", borderTop: "1px solid #F3F4F6" }}>
        {(["morning", "afternoon", "evening"] as const).map((period) => {
          const slots = groups[period];
          if (!slots.length) return null;
          const isFirst = firstRendered;
          firstRendered = false;
          return (
            <div key={period} style={{ marginTop: isFirst ? 16 : 20 }}>
              {/* Period label */}
              <p style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase",
                // hardcoded-color-allow-next-line
                color: "#374151", marginBottom: 10,
              }}>
                {GROUP_LABELS[period]}
              </p>
              <div className="mwc-slot-grid">
                {slots.map((iso) => {
                  const active = iso === selectedSlot;
                  const { time, ampm } = fmtTimeParts(iso);
                  return (
                    <button
                      key={iso}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSlotSelect(iso)}
                      className="mwc-slot-btn"
                      style={{
                        background: active ? ORANGE : "#FFFFFF",
                        border: active ? `2px solid ${ORANGE}` : `1.5px solid ${INK}`,
                        borderRadius: 17,
                        padding: "0 16px",
                        display: "flex", alignItems: "center",
                        justifyContent: active ? "space-between" : "flex-start",
                        gap: 4,
                        color: active ? "#FFFFFF" : INK,
                        cursor: "pointer",
                        transition: "all 150ms ease",
                        width: "100%",
                        // hardcoded-color-allow-next-line
                        boxShadow: active ? "0 8px 20px -6px rgba(232,103,10,0.55)" : "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Time + AM/PM — large time, small AM/PM label */}
                      <span style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: 22,
                        letterSpacing: "-0.01em",
                        lineHeight: 1,
                        display: "flex", alignItems: "baseline", gap: 3,
                      }}>
                        {time}
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1,
                          // WCAG AA: rgba/80 on #B84A08=3.91:1 FAIL for 12px → solid white 5.22:1 ✅
                          color: active ? "#FFFFFF" : "rgba(11,16,41,0.60)",
                        }}>
                          {ampm}
                        </span>
                      </span>
                      {active && <ArrowRight size={18} strokeWidth={2.5} aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TimeGrid;
