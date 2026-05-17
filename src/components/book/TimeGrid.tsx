/**
 * TimeGrid — scrollable grid of available time slots for a selected day.
 * Extracted from GHLDayView as part of P2-1 component split.
 */
import { TIMEZONE } from "@/lib/ghlCalendars";

// Brand tokens
const INK    = "var(--brand-navy-deep)";
const MUTED  = "#4B5563";
const LINE   = "#E5E7EB";
const BORDER = "#8B92A0";
const SURFACE = "var(--bg-white)";
const CANVAS  = "#F7F8FB";
const ORANGE  = "var(--brand-cta)";

// ─── Helper ───────────────────────────────────────────────────────────────────

const fmtTimeParts = (iso: string): { time: string; ampm: string } => {
  const s = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const [time, ampm] = s.split(" ");
  return { time, ampm };
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TimeGridProps {
  selectedDay: string | null;
  times: string[];
  selectedSlot: string | null;
  loading: boolean;
  onSlotSelect: (iso: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TimeGrid = ({ selectedDay, times, selectedSlot, loading, onSlotSelect }: TimeGridProps) => (
  <div
    className="px-5 md:px-7 pb-6"
    style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16, background: CANVAS }}
  >
    {!selectedDay ? (
      <div style={{ color: MUTED, fontSize: 14, fontStyle: "italic", padding: "20px 4px" }}>
        {loading ? "Loading availability..." : "Pick a date above to see available times."}
      </div>
    ) : times.length === 0 ? (
      <div style={{ color: MUTED, fontSize: 14, fontStyle: "italic", padding: "20px 4px" }}>
        No times available on this day between 8 AM and 5 PM.
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {times.map((iso) => {
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
                borderRadius: 12, padding: "16px 18px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: active ? "var(--c-text-on-dark)" : INK, cursor: "pointer", textAlign: "center",
                transition: "background-color 120ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.01em" }}>
                  {time}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: active ? "var(--c-text-on-dark)" : MUTED }}>
                  {ampm}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

export default TimeGrid;
