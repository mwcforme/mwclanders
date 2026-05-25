/**
 * DayStrip — horizontal week-navigation + day-pill date picker.
 * Extracted from GHLDayView as part of P2-1 component split.
 * Senior-mobile optimised: 80px wide pills, 56px nav targets, 16px body text.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { TIMEZONE } from "@/lib/ghlCalendars";
import { isSundayInTimeZone } from "@/lib/etDate";

// Brand tokens (duplicated from GHLDayView — intentional; each file is self-contained)
const INK       = "var(--brand-cream)";
// hardcoded-color-allow-next-line
const INK_SOFT  = "rgba(255,255,255,0.70)";
// hardcoded-color-allow-next-line
const MUTED     = "rgba(255,255,255,0.45)";
// hardcoded-color-allow-next-line
const BORDER    = "rgba(255,255,255,0.18)";
const SURFACE   = "var(--brand-navy-deep)";
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
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: prevDisabled ? "not-allowed" : "pointer",
            opacity: prevDisabled ? 0.3 : 1,
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={18} style={{ color: "var(--brand-cream)" }} />
        </button>

        {/* Week range label — centered between nav buttons */}
        {days.length > 0 && (
          <div style={{ fontSize: 13, color: MUTED, fontWeight: 700, fontFamily: "Inter, sans-serif", textAlign: "center", flex: 1, letterSpacing: "0.03em" }}>
            {fmtMonthDay(days[0])} – {fmtMonthDay(days[days.length - 1])}
          </div>
        )}
        {days.length === 0 && <div style={{ flex: 1 }} />}

        <button
          type="button"
          onClick={onNextWeek}
          aria-label="Next week"
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ChevronRight size={18} style={{ color: "var(--brand-cream)" }} />
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
          <div style={{ color: MUTED, fontSize: 16, fontWeight: 500, lineHeight: 1.6, padding: "12px 4px" }}>
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
                const key         = ymd(d);
                const actualCount = slotsByDay[key]?.length || 0;
                const isSunday    = isSundayInTimeZone(d, TIMEZONE);
                const isToday     = isTodayET(d);
                // Today always renders — shows as "Full" if no slots, like other full days
                const available   = actualCount > 0 && !isSunday;
                const selected    = selectedDay === key;
                const isTomorrow  = isTomorrowET(d);
                const scarce      = available && actualCount <= 3;
                const isFull      = !isSunday && !available;
                const badgeText   = !loading
                  ? isSunday   ? "Closed"
                  : !available ? "Full"
                  : scarce     ? `Only ${actualCount} left`
                  :              `${actualCount} slots`
                  : "···";

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isSunday || !available}
                    aria-pressed={selected}
                    aria-label={`${fmtFullDay(d)} — ${isSunday ? "Closed on Sundays" : `${actualCount} times available`}`}
                    title={isFull ? "No availability — tap another day" : undefined}
                    onClick={isSunday ? undefined : (e) => {
                      onDaySelect(key);
                      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                    }}
                    style={{
                      flex: "0 0 80px",
                      minWidth: 80,
                      minHeight: 72,
                      scrollSnapAlign: "start",
                      // hardcoded-color-allow-next-line
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
                        // hardcoded-color-allow-next-line
                        ? "0 8px 18px -8px rgba(232,103,10,0.45)"
                        // hardcoded-color-allow-next-line
                        : "0 1px 2px rgba(11,16,41,0.04)",
                    }}
                  >
                    {/* Day-of-week label */}
                    <div style={{
                      fontSize: 12, fontWeight: 800, letterSpacing: "0.08em",
                      color: selected ? "var(--c-text-on-dark)"
                        : (isSunday || !available) ? MUTED
                        : (isToday || isTomorrow) ? ORANGE
                        : INK_SOFT,
                      marginBottom: 2,
                    }}>
                      {isToday ? "TODAY" : isTomorrow ? "TMRW" : fmtDayShort(d)}
                    </div>
                    {/* Date number only — month shown in week header above, no redundancy */}
                    {/* Strikethrough ONLY on Sundays (closed) — full days just show greyed, not struck */}
                    <div style={{
                      fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 22,
                      letterSpacing: "0.01em", lineHeight: 1.1,
                      textDecoration: isSunday ? "line-through" : "none",
                      textDecorationColor: MUTED,
                    }}>
                      {d.toLocaleDateString("en-US", { day: "numeric", timeZone: TIMEZONE })}
                    </div>
                    {/* Slot count / status badge */}
                    <div style={{
                      fontSize: 12, fontWeight: 700,
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
              // hardcoded-color-allow-next-line
              background: `linear-gradient(to right, ${SURFACE}, rgba(255,255,255,0))`,
              opacity: showLeftFade ? 1 : 0,
              transition: "opacity 150ms ease",
            }} />
            <div aria-hidden="true" style={{
              position: "absolute", right: 0, top: 0, bottom: 4, width: 28,
              pointerEvents: "none",
              // hardcoded-color-allow-next-line
              background: `linear-gradient(to left, ${SURFACE}, rgba(255,255,255,0))`,
              opacity: showRightFade ? 1 : 0,
              transition: "opacity 150ms ease",
            }} />
          </div>
        )}

        {loadError && (
          <div style={{ marginTop: 10, fontSize: 14, color: "#B91C1C" }}>{loadError}</div>
        )}
      </div>
    </>
  );
};

export default DayStrip;
