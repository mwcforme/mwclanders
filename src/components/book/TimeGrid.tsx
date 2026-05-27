/**
 * TimeGrid — time slots grouped by Morning / Afternoon / Evening.
 * White card interior. White rectangular pills with dark ink text.
 * Orange selected pill with → arrow. Matches mwclocked mockup.
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
      <div style={{
        padding: "20px 20px 24px",
        // hardcoded-color-allow-next-line
        borderTop: "1px solid #F3F4F6",
      }}>
        <div style={{
          // hardcoded-color-allow-next-line
          color: "#9CA3AF",
          fontSize: 15, fontWeight: 500,
          fontFamily: "Montserrat, Inter, sans-serif", lineHeight: 1.6,
        }}>
          {loading ? "Loading availability…" : "Pick a date above to see available times."}
        </div>
      </div>
    );
  }

  if (times.length === 0) {
    return (
      <div style={{
        padding: "20px 20px 24px",
        // hardcoded-color-allow-next-line
        borderTop: "1px solid #F3F4F6",
      }}>
        <div style={{
          // hardcoded-color-allow-next-line
          color: "#9CA3AF",
          fontSize: 15, fontWeight: 500,
          fontFamily: "Montserrat, Inter, sans-serif", lineHeight: 1.6,
        }}>
          No times available. Try another day.
        </div>
      </div>
    );
  }

  const groups: Record<string, string[]> = { morning: [], afternoon: [], evening: [] };
  for (const iso of times) {
    const { hour } = fmtTimeParts(iso);
    if (hour < 12) groups.morning.push(iso);
    else if (hour < 17) groups.afternoon.push(iso);
    else groups.evening.push(iso);
  }

  let firstRendered = true;

  return (
    <div style={{
      padding: "4px 20px 20px",
      // hardcoded-color-allow-next-line
      borderTop: "1px solid #F3F4F6",
    }}>
      {(["morning", "afternoon", "evening"] as const).map((period) => {
        const slots = groups[period];
        if (!slots.length) return null;
        const isFirst = firstRendered;
        firstRendered = false;
        return (
          <div key={period} style={{ marginTop: isFirst ? 16 : 20 }}>
            {/* Period label — dark ink, small caps */}
            <p style={{
              fontFamily: "Montserrat, Inter, sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase",
              // hardcoded-color-allow-next-line
              color: "#374151",
              marginBottom: 10,
            }}>
              {GROUP_LABELS[period]}
            </p>
            {/* Slot grid — responsive: 1 col mobile, 4 col desktop */}
            <div className="mwc-time-grid" style={{ display: "grid", gap: 8 }}>
              {slots.map((iso) => {
                const active = iso === selectedSlot;
                const { time, ampm } = fmtTimeParts(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSlotSelect(iso)}
                    className="mwc-time-slot-btn"
                    style={{
                      background: active ? ORANGE : "#FFFFFF",
                      border: active
                        ? `2px solid ${ORANGE}`
                        // hardcoded-color-allow-next-line
                        : "1.5px solid #0B1029",
                      borderRadius: 17,
                      padding: "0 16px",
                      display: "flex", alignItems: "center",
                      justifyContent: active ? "space-between" : "flex-start",
                      gap: 3,
                      color: active ? "#FFFFFF" : INK,
                      cursor: "pointer",
                      transition: "all 150ms ease",
                      whiteSpace: "nowrap",
                      // hardcoded-color-allow-next-line
                      boxShadow: active ? "0 8px 20px -6px rgba(232,103,10,0.55)" : "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                      <span className="mwc-time-slot-time" style={{
                        fontFamily: "Montserrat, Inter, sans-serif",
                        fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em",
                      }}>
                        {time}
                      </span>
                      <span className="mwc-time-slot-ampm" style={{
                        fontFamily: "Montserrat, Inter, sans-serif",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                        color: active ? "rgba(255,255,255,0.85)" : INK,
                      }}>
                        {ampm}
                      </span>
                    </div>
                    {active && <ArrowRight size={16} strokeWidth={2.5} aria-hidden />}
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
