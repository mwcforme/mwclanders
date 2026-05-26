/**
 * DayStrip — week navigation + day pill grid.
 * White card interior. Dark navy pills, orange selected.
 * Matches mwclocked.pplx.app mockup exactly.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { TIMEZONE } from "@/lib/ghlCalendars";
import { isSundayInTimeZone } from "@/lib/etDate";

const ORANGE    = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const NAVY      = "#0B1029";
// hardcoded-color-allow-next-line
const NAVY_MID  = "#162040";
// hardcoded-color-allow-next-line
const INK       = "#0B1029";

const ymd = (d: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);

const fmtDayShort = (d: Date): string =>
  d.toLocaleDateString("en-US", { weekday: "short", timeZone: TIMEZONE }).toUpperCase();

const fmtMonthDay = (d: Date): string =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();

const todayET = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

const isTodayET   = (day: Date): boolean => todayET() === ymd(day);
const isTomorrowET = (day: Date): boolean => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const tom = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(t);
  return tom === ymd(day);
};

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
  weekStart,
  selectedDay,
  slotsByDay,
  loading,
  prevDisabled,
  loadError,
  onPrevWeek,
  onNextWeek,
  onDaySelect,
}: DayStripProps) => {

  return (
    <>
      {/* ── Week navigation ── */}
      <div style={{ padding: "18px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          disabled={prevDisabled}
          onClick={onPrevWeek}
          aria-label="Previous week"
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#FFFFFF",
            // hardcoded-color-allow-next-line
            border: "1.5px solid #D1D5DB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: prevDisabled ? "not-allowed" : "pointer",
            opacity: prevDisabled ? 0.30 : 1,
            flexShrink: 0,
            // hardcoded-color-allow-next-line
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {/* hardcoded-color-allow-next-line */}
          <ChevronLeft size={16} style={{ color: "#374151" }} />
        </button>

        <div style={{
          fontSize: 14, fontWeight: 700, color: INK,
          fontFamily: "Montserrat, Inter, sans-serif", letterSpacing: "0.05em",
        }}>
          {days.length > 0 ? `${fmtMonthDay(days[0])} – ${fmtMonthDay(days[days.length - 1])}` : ""}
        </div>

        <button
          type="button"
          onClick={onNextWeek}
          aria-label="Next week"
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#FFFFFF",
            // hardcoded-color-allow-next-line
            border: "1.5px solid #D1D5DB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
            // hardcoded-color-allow-next-line
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {/* hardcoded-color-allow-next-line */}
          <ChevronRight size={16} style={{ color: "#374151" }} />
        </button>
      </div>

      {/* ── Day pills grid ── */}
      <div style={{ padding: "0 16px 16px", position: "relative" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {days.map((d) => {
            const key         = ymd(d);
            const actualCount = slotsByDay[key]?.length || 0;
            const isSunday    = isSundayInTimeZone(d, TIMEZONE);
            const isToday     = isTodayET(d);
            const isTomorrow  = isTomorrowET(d);
            const available   = actualCount > 0 && !isSunday;
            const selected    = selectedDay === key;
            const isDisabled  = isSunday || !available;

            const badgeText = !loading
              ? isSunday    ? "Closed"
              : !available  ? "Full"
              :               `${actualCount} slots`
              : "···";

            const dayLabel = isToday ? "TODAY" : isTomorrow ? "TMRW" : fmtDayShort(d);
            const dayNum   = d.toLocaleDateString("en-US", { day: "numeric", timeZone: TIMEZONE });

            return (
              <button
                key={key}
                type="button"
                disabled={isDisabled}
                aria-pressed={selected}
                onClick={isDisabled ? undefined : () => onDaySelect(key)}
                style={{
                  background: selected
                    ? ORANGE
                    // hardcoded-color-allow-next-line
                    : isDisabled ? "rgba(11,16,41,0.35)" : NAVY,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 4px",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  transition: "background 150ms ease, box-shadow 150ms ease",
                  // hardcoded-color-allow-next-line
                  boxShadow: selected ? "0 4px 16px rgba(232,103,10,0.45)" : "none",
                  opacity: isDisabled && !isSunday ? 0.50 : 1,
                  minHeight: 78,
                  justifyContent: "center",
                }}
              >
                <span style={{
                  fontFamily: "Montserrat, Inter, sans-serif",
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
                  color: "rgba(255,255,255,0.70)",
                  lineHeight: 1,
                }}>
                  {dayLabel}
                </span>
                <span style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 26, fontWeight: 700, lineHeight: 1,
                  color: "#FFFFFF",
                  letterSpacing: "0.01em",
                }}>
                  {dayNum}
                </span>
                <span style={{
                  fontFamily: "Montserrat, Inter, sans-serif",
                  fontSize: 9, fontWeight: 600,
                  color: selected
                    ? "rgba(255,255,255,0.90)"
                    : isDisabled ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.65)",
                  lineHeight: 1, marginTop: 2,
                }}>
                  {badgeText}
                </span>
              </button>
            );
          })}
        </div>
        {loadError && (
          // hardcoded-color-allow-next-line
          <div style={{ marginTop: 8, fontSize: 13, color: "#B91C1C", fontFamily: "Montserrat, Inter, sans-serif" }}>{loadError}</div>
        )}
      </div>
    </>
  );
};

export default DayStrip;
