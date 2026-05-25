/**
 * TimeGrid — time slots grouped by Morning / Afternoon / Evening.
 * MangoRx-inspired grouping reduces cognitive load.
 * Senior-mobile optimised: 52px touch targets, 16px body, 14px labels.
 */
import { TIMEZONE } from "@/lib/ghlCalendars";

// hardcoded-color-allow-next-line
const MUTED  = "var(--c-text-on-light-muted)";
// hardcoded-color-allow-next-line
const LINE   = "#E5E7EB";
const SURFACE = "#F4F6FA";
const ORANGE  = "var(--brand-cta)";

const fmtTimeParts = (iso: string): { time: string; ampm: string; hour: number } => {
  const d = new Date(iso);
  const s = d.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const [time, ampm] = s.split(" ");
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
  if (!selectedDay) {
    return (
      <div className="px-5 md:px-7 pb-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 20, background: SURFACE }}>
        <div style={{ color: MUTED, fontSize: 16, fontWeight: 500, lineHeight: 1.6, padding: "20px 4px" }}>
          {loading ? "Loading availability…" : "Pick a date above to see available times."}
        </div>
      </div>
    );
  }

  if (times.length === 0) {
    return (
      <div className="px-5 md:px-7 pb-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 20, background: SURFACE }}>
        <div style={{ color: MUTED, fontSize: 16, fontWeight: 500, lineHeight: 1.6, padding: "20px 4px" }}>
          No times available on this day between 8 AM and 5 PM. Try selecting another day.
        </div>
      </div>
    );
  }

  // Group slots by period
  const groups: Record<string, string[]> = { morning: [], afternoon: [], evening: [] };
  for (const iso of times) {
    const { hour } = fmtTimeParts(iso);
    if (hour < 12) groups.morning.push(iso);
    else if (hour < 17) groups.afternoon.push(iso);
    else groups.evening.push(iso);
  }

  // Track first rendered group for conditional top border (mutated synchronously in map — safe in render)
  let firstRendered = true;

  return (
    <div className="px-5 md:px-7 pb-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 20, background: SURFACE }}>
      {(["morning", "afternoon", "evening"] as const).map((period) => {
        const slots = groups[period];
        if (!slots.length) return null;
        const isFirst = firstRendered;
        firstRendered = false;
        return (
          <div key={period} style={{ marginBottom: 20 }}>
            {/* Period label — 14px, uppercase ok (≤3 words) */}
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.10em",
              textTransform: "uppercase", color: "var(--c-text-on-light-muted)",
              marginBottom: 12, paddingBottom: 0,
              ...(isFirst ? {} : { borderTop: "1px solid #E5E7EB", paddingTop: 16, marginTop: 8 }),
            }}>
              {GROUP_LABELS[period]}
            </p>
            {/* Slot pills — 52px touch target, 10px gap */}
            <div className="flex flex-wrap" style={{ gap: 10 }}>
              {slots.map((iso) => {
                const active = iso === selectedSlot;
                const { time, ampm } = fmtTimeParts(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSlotSelect(iso)}
                    style={{
                              background: active ? ORANGE : "#FFFFFF",
                      border: active ? "2px solid var(--brand-cta)" : "1.5px solid #D1D5DB",
                      borderRadius: 10,
                      padding: "0 16px",
                      display: "inline-flex", alignItems: "center", gap: 5,
                      color: active ? "#fff" : "var(--brand-navy)",
                      cursor: "pointer",
                      transition: "all 120ms ease",
                      whiteSpace: "nowrap",
                      minHeight: 52,
                      // hardcoded-color-allow-next-line
                      boxShadow: active ? "0 4px 16px rgba(232,103,10,0.45)" : "none",
                    }}
                  >
                    <span style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 18 }}>
                      {time}
                    </span>
                    {/* hardcoded-color-allow-next-line */}
                    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", color: active ? "rgba(255,255,255,0.85)" : "var(--c-text-on-light-muted)" }}>
                      {ampm}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

    </div>
  );
};

export default TimeGrid;
