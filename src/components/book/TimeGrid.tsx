/**
 * TimeGrid — time slots grouped by Morning / Afternoon / Evening.
 * MangoRx-inspired grouping reduces cognitive load.
 */
import { TIMEZONE } from "@/lib/ghlCalendars";

const INK    = "var(--brand-navy-deep)";
const MUTED  = "#4B5563";
const LINE   = "#E5E7EB";
const BORDER = "#8B92A0";
const SURFACE = "var(--bg-white)";
const CANVAS  = "#F7F8FB";
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
      <div className="px-5 md:px-7 pb-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16, background: CANVAS }}>
        <div style={{ color: MUTED, fontSize: 14, fontStyle: "italic", padding: "20px 4px" }}>
          {loading ? "Loading availability…" : "Pick a date above to see available times."}
        </div>
      </div>
    );
  }

  if (times.length === 0) {
    return (
      <div className="px-5 md:px-7 pb-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16, background: CANVAS }}>
        <div style={{ color: MUTED, fontSize: 14, fontStyle: "italic", padding: "20px 4px" }}>
          No times available on this day between 8 AM and 5 PM.
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

  return (
    <div className="px-5 md:px-7 pb-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16, background: CANVAS }}>
      {(["morning", "afternoon", "evening"] as const).map((period) => {
        const slots = groups[period];
        if (!slots.length) return null;
        return (
          <div key={period} style={{ marginBottom: 20 }}>
            {/* Period label */}
            <p style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: MUTED,
              marginBottom: 10, paddingBottom: 6,
              borderBottom: `1px solid ${LINE}`,
            }}>
              {GROUP_LABELS[period]}
            </p>
            {/* Slot pills */}
            <div className="flex flex-wrap gap-2">
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
                      background: active ? ORANGE : SURFACE,
                      border: active ? "1px solid transparent" : `1px solid ${BORDER}`,
                      borderRadius: 999,
                      padding: "10px 18px",
                      display: "inline-flex", alignItems: "center", gap: 4,
                      color: active ? "white" : INK,
                      cursor: "pointer",
                      transition: "background-color 120ms ease",
                      whiteSpace: "nowrap",
                      minHeight: 44,
                    }}
                  >
                    <span style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 16 }}>
                      {time}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: active ? "rgba(255,255,255,0.80)" : MUTED }}>
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
