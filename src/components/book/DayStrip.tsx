/**
 * DayStrip — week navigation + day pill grid.
 * 2-row grid layout matching reference design.
 * Dark navy pills, orange selected, muted unavailable.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { TIMEZONE } from "@/lib/ghlCalendars";
import { isSundayInTimeZone } from "@/lib/etDate";

const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const NAVY = "#161B3A";
// hardcoded-color-allow-next-line
const NAVY_DEEP = "#0B1029";

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

const isTodayET = (day: Date): boolean => todayET() === ymd(day);
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
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          disabled={prevDisabled}
          onClick={onPrevWeek}
          aria-label="Previous week"
          style={{
            width: 36, height: 36, borderRadius: 8,
            // hardcoded-color-allow-next-line
            background: "rgba(255,255,255,0.06)",
            // hardcoded-color-allow-next-line
            border: "1.5px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: prevDisabled ? "not-allowed" : "pointer",
            opacity: prevDisabled ? 0.25 : 1,
            flexShrink: 0,
          }}
        >
          {/* hardcoded-color-allow-next-line */}
          <ChevronLeft size={16} style={{ color: "rgba(255,255,255,0.70)" }} />
        </button>

        <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.90)", fontFamily: "Montserrat, Inter, sans-serif", letterSpacing: "0.04em" }}>
          {days.length > 0 ? `${fmtMonthDay(days[0])} – ${fmtMonthDay(days[days.length - 1])}` : ""}
        </div>

        <button
          type="button"
          onClick={onNextWeek}
          aria-label="Next week"
          style={{
            width: 36, height: 36, borderRadius: 8,
            // hardcoded-color-allow-next-line
            background: "rgba(255,255,255,0.06)",
            // hardcoded-color-allow-next-line
            border: "1.5px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          {/* hardcoded-color-allow-next-line */}
          <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.70)" }} />
        </button>
      </div>

      {/* ── Day pills grid — 2 rows of up to 4 ── */}
      <div style={{ padding: "0 16px 16px", position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            // hardcoded-color-allow-next-line
            background: "rgba(13,27,62,0.80)", zIndex: 1, borderRadius: 8 }}>
            <Loader2 size={22} className="animate-spin" style={{ color: ORANGE }} />
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {days.map((d) => {
            const key         = ymd(d);
            const actualCount = slotsByDay[key]?.length || 0;
            const isSunday    = isSundayInTimeZone(d, TIMEZONE);
            const isToday     = isTodayET(d);
            const isTomorrow  = isTomorrowET(d);
            const available   = actualCount > 0 && !isSunday;
            const selected    = selectedDay === key;
            const scarce      = available && actualCount <= 3;
            const isFull      = !isSunday && !available;
            const isDisabled  = isSunday || !available;

            const badgeText = !loading
              ? isSunday   ? "Closed"
              : !available ? "Full"
              : scarce     ? `${actualCount} left`
              :              `${actualCount} slots`
              : "···";

            const dayLabel = isToday ? "TODAY" : isTomorrow ? "TMRW" : fmtDayShort(d);
            const dayNum = d.toLocaleDateString("en-US", { day: "numeric", timeZone: TIMEZONE });

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
                    : isDisabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                  border: selected
                    ? `2px solid ${ORANGE}`
                    // hardcoded-color-allow-next-line
                    : "2px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  padding: "10px 8px 10px",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  transition: "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
                  // hardcoded-color-allow-next-line
                  boxShadow: selected ? "0 4px 20px rgba(232,103,10,0.50)" : "none",
                  opacity: isDisabled && !isSunday ? 0.35 : 1,
                  minHeight: 80,
                  justifyContent: "center",
                }}
              >
                {/* Day label */}
                <span style={{
                  fontFamily: "Montserrat, Inter, sans-serif",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.10em",
                  // hardcoded-color-allow-next-line
                  color: selected ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
                  lineHeight: 1,
                }}>
                  {dayLabel}
                </span>
                {/* Day number */}
                <span style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 28, fontWeight: 700, lineHeight: 1,
                  color: selected ? "#fff" : isDisabled ? "rgba(255,255,255,0.40)" : "#fff",
                  letterSpacing: "0.01em",
                }}>
                  {dayNum}
                </span>
                {/* Slot badge */}
                <span style={{
                  fontFamily: "Montserrat, Inter, sans-serif",
                  fontSize: 11, fontWeight: 600,
                  // hardcoded-color-allow-next-line
                  color: selected ? "rgba(255,255,255,0.90)" : isDisabled ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.65)",
                  lineHeight: 1, marginTop: 2,
                }}>
                  {badgeText}
                </span>
              </button>
            );
          })}
        </div>
        {loadError && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#B91C1C", fontFamily: "Montserrat, Inter, sans-serif" }}>{loadError}</div>
        )}
      </div>
    </>
  );
};

export default DayStrip;
