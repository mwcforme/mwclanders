/**
 * DayStrip — week navigation + day pill grid.
 *
 * Matches mwclocked.pplx.app reference design:
 *  • Chips render on the inner white panel of the calendar card
 *  • Available chip:  filled navy #0B1029, white labels + Oswald number
 *  • Selected chip:   filled brand orange #E8670A, white labels
 *  • Disabled chip:   transparent (white panel shows through), navy text
 *  • Closed (Sunday): transparent, navy text, "Closed" badge
 *  • Mobile:  3 columns + swipe hint
 *  • Desktop: up to 7 columns (1 per available weekday)
 *
 * Day labels are weekday abbreviations (TUE / WED / THU). The previous
 * TODAY / TMRW kicker was removed to match the reference.
 */
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { TIMEZONE } from "@/lib/ghlCalendars";
import { isSundayInTimeZone } from "@/lib/etDate";

const ORANGE   = "var(--brand-cta)";
// hardcoded-color-allow-next-line — Midnight Navy fill for available chip
const NAVY     = "#0B1029";
// hardcoded-color-allow-next-line — Dark ink for text on white
const INK      = "#0B1029";

const ymd = (d: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);

const fmtDayShort = (d: Date): string =>
  d.toLocaleDateString("en-US", { weekday: "short", timeZone: TIMEZONE }).toUpperCase();

const fmtMonthDay = (d: Date): string =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();

export interface DayStripProps {
  days: Date[];
  weekStart: Date;
  today: Date;
  selectedDay: string | null;
  slotsByDay: Record<string, string[]>;
  loading: boolean;
  prevDisabled: boolean;
  loadError: string | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDaySelect: (key: string) => void;
}

const DayStrip = ({
  days,
  selectedDay,
  slotsByDay,
  loading,
  prevDisabled,
  loadError,
  onPrevWeek,
  onNextWeek,
  onDaySelect,
}: DayStripProps) => {
  // Render up to 7 chips. Mobile clamps to 3 via CSS grid template + overflow scroll.
  const visibleDays = days.slice(0, 7);

  return (
    <>
      {/* ── Week navigation ── */}
      <div style={{ padding: "18px 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          disabled={prevDisabled}
          onClick={onPrevWeek}
          aria-label="Previous week"
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "#FFFFFF",
            // hardcoded-color-allow-next-line
            border: "1.5px solid #D1D5DB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: prevDisabled ? "not-allowed" : "pointer",
            opacity: prevDisabled ? 0.30 : 1,
            flexShrink: 0,
          }}
        >
          {/* hardcoded-color-allow-next-line */}
          <ChevronLeft size={16} style={{ color: "#374151" }} />
        </button>

        <div style={{
          fontFamily: "Montserrat, Inter, sans-serif",
          fontSize: 13, fontWeight: 700, color: INK,
          letterSpacing: "0.10em",
        }}>
          {visibleDays.length > 0 ? `${fmtMonthDay(visibleDays[0])} – ${fmtMonthDay(visibleDays[visibleDays.length - 1])}` : ""}
        </div>

        <button
          type="button"
          onClick={onNextWeek}
          aria-label="Next week"
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "#FFFFFF",
            // hardcoded-color-allow-next-line
            border: "1.5px solid #D1D5DB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          {/* hardcoded-color-allow-next-line */}
          <ChevronRight size={16} style={{ color: "#374151" }} />
        </button>
      </div>

      {/* ── Day pills grid ──
          Mobile (.day-strip-grid): 3-col + horizontal scroll; chips snap.
          Desktop (≥768px): all days fit in equal columns.                */}
      <div style={{ padding: "20px 3px 4px", position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            // hardcoded-color-allow-next-line
            background: "rgba(255,255,255,0.80)",
            zIndex: 1, borderRadius: 8,
          }}>
            <Loader2 size={22} className="animate-spin" style={{ color: ORANGE }} />
          </div>
        )}
        <div className="mwc-day-strip-grid">
          {visibleDays.map((d) => {
            const key         = ymd(d);
            const actualCount = slotsByDay[key]?.length || 0;
            const isSunday    = isSundayInTimeZone(d, TIMEZONE);
            const available   = actualCount > 0 && !isSunday;
            const selected    = selectedDay === key;
            const isDisabled  = isSunday || !available;

            const badgeText = !loading
              ? isSunday    ? "Closed"
              : !available  ? "Full"
              :               `${actualCount} slots`
              : "···";

            const dayLabel = fmtDayShort(d);
            const dayNum   = d.toLocaleDateString("en-US", { day: "numeric", timeZone: TIMEZONE });

            // Chip background:
            //   selected  → orange
            //   disabled  → transparent (panel shows through)
            //   available → navy
            const bg = selected ? ORANGE : isDisabled ? "transparent" : NAVY;
            // Text colors invert based on chip surface
            const isOnDark = selected || (!isDisabled);
            const labelColor = isOnDark ? "rgba(255,255,255,0.78)" : "rgba(11,16,41,0.65)";
            const numColor   = isOnDark ? "#FFFFFF" : INK;
            const badgeColor = isOnDark ? "rgba(255,255,255,0.85)" : "rgba(11,16,41,0.60)";

            return (
              <button
                key={key}
                type="button"
                disabled={isDisabled}
                aria-pressed={selected}
                aria-label={`${dayLabel} ${dayNum} — ${badgeText}`}
                onClick={isDisabled ? undefined : () => onDaySelect(key)}
                className="mwc-day-chip"
                data-state={selected ? "selected" : isDisabled ? "disabled" : "available"}
                style={{
                  background: bg,
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 6px",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "background 150ms ease, box-shadow 150ms ease, transform 120ms ease",
                  // hardcoded-color-allow-next-line
                  boxShadow: selected ? "0 6px 18px rgba(232,103,10,0.40)" : "none",
                  minHeight: 123,
                  justifyContent: "center",
                  scrollSnapAlign: "start",
                }}
              >
                <span style={{
                  fontFamily: "Montserrat, Inter, sans-serif",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                  color: labelColor,
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}>
                  {dayLabel}
                </span>
                <span style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 32, fontWeight: 700, lineHeight: 1,
                  color: numColor,
                  letterSpacing: "0.01em",
                  marginTop: 2,
                }}>
                  {dayNum}
                </span>
                <span style={{
                  fontFamily: "Montserrat, Inter, sans-serif",
                  fontSize: 10, fontWeight: 600,
                  color: badgeColor,
                  lineHeight: 1, marginTop: 4,
                  letterSpacing: "0.04em",
                }}>
                  {badgeText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile-only swipe hint — hidden ≥768px via CSS */}
        <p className="mwc-day-strip-hint" style={{
          textAlign: "center",
          fontFamily: "Montserrat, Inter, sans-serif",
          fontSize: 11, fontWeight: 500,
          // hardcoded-color-allow-next-line — matches mwclocked.pplx.app swipe hint: orange-tinted
          color: "rgba(232,103,10,0.55)",
          letterSpacing: "0.04em",
          margin: "10px 0 8px",
        }}>
          Swipe to see more days
        </p>

        {loadError && (
          // hardcoded-color-allow-next-line
          <div style={{ marginTop: 8, fontSize: 13, color: "#B91C1C", fontFamily: "Montserrat, Inter, sans-serif" }}>{loadError}</div>
        )}
      </div>
    </>
  );
};

export default DayStrip;
