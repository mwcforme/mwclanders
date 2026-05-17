/**
 * DayStrip — horizontal week-navigation + day-pill date picker.
 * Extracted from GHLDayView as part of P2-1 component split.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { TIMEZONE } from "@/lib/ghlCalendars";
import { isSundayInTimeZone } from "@/lib/etDate";

// Brand tokens (duplicated from GHLDayView — intentional; each file is self-contained)
const INK       = "var(--brand-navy-deep)";
const INK_SOFT  = "#2C3346";
const MUTED     = "#4B5563";
const BORDER    = "#8B92A0";
const SURFACE   = "var(--bg-white)";
const ORANGE    = "var(--brand-cta)";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ymd = (d: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);

const fmtDayShort = (d: Date): string =>
  d.toLocaleDateString("en-US", { weekday: "short", timeZone: TIMEZONE }).toUpperCase();

const fmtMonthDay = (d: Date): string =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();

const fmtFullDay = (d: Date): string =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TIMEZONE });

const todayET = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

const isTodayET = (day: Date): boolean => todayET() === ymd(day);

const isTomorrowET = (day: Date): boolean => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const tom = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(t);
  return tom === ymd(day);
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DayStripProps {
  days: Date[];
  /** First date of the visible 7-day window. */
  weekStart: Date;
  today: Date;
  selectedDay: string | null;
  slotsByDay: Record<string, string[]>;
  loading: boolean;
  prevDisabled: boolean;
  loadError: string | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  /** Called with the YYYY-MM-DD key of the tapped day. */
  onDaySelect: (key: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  const dayStripRef = useRef<HTMLDivElement | null>(null);
  const [showLeftFade, setShowLeftFade]   = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Recompute edge-fade visibility whenever days / loading state changes.
  useEffect(() => {
    const el = dayStripRef.current;
    if (!el) return;
    const update = () => {
      setShowLeftFade(el.scrollLeft > 4);
      setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [slotsByDay, weekStart, loading]);

  return (
    <>
      {/* ── Week navigation ──────────────────────────────────────────────── */}
      <div className="px-4 md:px-7 pt-3 md:pt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={prevDisabled}
          onClick={onPrevWeek}
          aria-label="Previous week"
          style={{
            background: SURFACE, color: INK, border: `1px solid ${BORDER}`,
            borderRadius: 999, padding: "10px 14px",
            fontSize: 13, fontWeight: 600, minHeight: 44,
            display: "inline-flex", alignItems: "center", gap: 6,
            cursor: prevDisabled ? "not-allowed" : "pointer",
            opacity: prevDisabled ? 0.6 : 1,
          }}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onNextWeek}
          aria-label="Next week"
          style={{
            background: SURFACE, color: INK, border: `1px solid ${BORDER}`,
            borderRadius: 999, padding: "10px 14px",
            fontSize: 13, fontWeight: 600, minHeight: 44,
            display: "inline-flex", alignItems: "center", gap: 6,
            cursor: "pointer",
          }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Day pills ────────────────────────────────────────────────────── */}
      <div className="px-5 md:px-7 py-5" style={{ position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", zIndex: 1 }}>
            <Loader2 size={22} className="animate-spin" color={INK} />
          </div>
        )}
        {days.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 14, fontStyle: "italic", padding: "12px 4px" }}>
            No remaining days this week. Tap Next.
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <div
              ref={dayStripRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                setShowLeftFade(el.scrollLeft > 4);
                setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
              }}
              className="flex gap-2 overflow-x-auto scrollbar-hide"
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                paddingBottom: 4,
                scrollbarWidth: "none",
                flexWrap: "nowrap",
                /* justify-start — overflow-x-auto + justify-center breaks scroll-to-start on narrow screens */
                justifyContent: "flex-start",
              }}
            >
              {days.map((d) => {
                const key        = ymd(d);
                const actualCount = slotsByDay[key]?.length || 0;
                const isSunday   = isSundayInTimeZone(d, TIMEZONE);
                const isToday    = isTodayET(d);
                // Hide today's tile if it has no availability
                if (isToday && !loading && actualCount === 0) return null;
                const available  = actualCount > 0 && !isSunday;
                const selected   = selectedDay === key;
                const isTomorrow = isTomorrowET(d);
                const scarce     = available && actualCount <= 3;
                const badgeText  = !loading
                  ? isSunday    ? "Closed"
                  : !available  ? "Full"
                  : scarce      ? `Only ${actualCount} left`
                  :               `${actualCount} slots`
                  : "···";

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isSunday || !available}
                    aria-pressed={selected}
                    aria-label={`${fmtFullDay(d)} — ${isSunday ? "Closed on Sundays" : `${actualCount} times available`}`}
                    onClick={isSunday ? undefined : (e) => {
                      onDaySelect(key);
                      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                    }}
                    style={{
                      flex: "0 0 84px",
                      minWidth: 84,
                      scrollSnapAlign: "start",
                      background: selected ? ORANGE : (isSunday || !available) ? "#F4F5F8" : SURFACE,
                      border: selected ? `1px solid ${ORANGE}` : `1px solid ${BORDER}`,
                      borderRadius: 14,
                      padding: "10px 6px 12px",
                      color: selected ? "var(--c-text-on-dark)" : (isSunday || !available) ? MUTED : INK,
                      cursor: (isSunday || !available) ? "not-allowed" : "pointer",
                      textAlign: "center",
                      transition: "background-color 120ms ease, border-color 120ms ease, transform 120ms ease",
                      position: "relative",
                      opacity: !available && !selected ? 0.7 : 1,
                      boxShadow: selected
                        ? "0 8px 18px -8px rgba(232,103,10,0.45)"
                        : "0 1px 2px rgba(11,16,41,0.04)",
                    }}
                  >
                    <div style={{
                      fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                      color: selected ? "var(--c-text-on-dark)"
                        : (isSunday || !available) ? MUTED
                        : (isToday || isTomorrow) ? ORANGE
                        : INK_SOFT,
                      marginBottom: 2,
                    }}>
                      {isToday ? "TODAY" : isTomorrow ? "TMRW" : fmtDayShort(d)}
                    </div>
                    <div style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.01em", lineHeight: 1.1 }}>
                      {fmtMonthDay(d)}
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700,
                      color: selected ? "var(--c-text-on-dark)"
                        : (isSunday || !available) ? MUTED
                        : scarce ? ORANGE
                        : INK_SOFT,
                      marginTop: 6, letterSpacing: "0.04em",
                    }}>
                      {badgeText}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Edge fade affordances */}
            <div aria-hidden="true" style={{
              position: "absolute", left: 0, top: 0, bottom: 4, width: 28,
              pointerEvents: "none",
              background: `linear-gradient(to right, ${SURFACE}, rgba(255,255,255,0))`,
              opacity: showLeftFade ? 1 : 0,
              transition: "opacity 150ms ease",
            }} />
            <div aria-hidden="true" style={{
              position: "absolute", right: 0, top: 0, bottom: 4, width: 28,
              pointerEvents: "none",
              background: `linear-gradient(to left, ${SURFACE}, rgba(255,255,255,0))`,
              opacity: showRightFade ? 1 : 0,
              transition: "opacity 150ms ease",
            }} />
          </div>
        )}
        {loadError && (
          <div style={{ marginTop: 10, fontSize: 13, color: "#B91C1C" }}>{loadError}</div>
        )}
      </div>
    </>
  );
};

export default DayStrip;
