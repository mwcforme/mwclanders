import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CENTER_CALENDARS,
  TIMEZONE,
  type LocationKey,
} from "@/lib/ghlCalendars";
import {
  addDaysInTimeZone,
  dateFromYmdInTimeZone,
  isSundayInTimeZone,
  timeZoneOffsetMinutes,
  ymdInTimeZone,
} from "@/lib/etDate";
const getSupabase = () => import("@/integrations/supabase/client").then(m => m.supabase);
import { useConfirmAppointment } from "@/domain/booking/useConfirmAppointment";

// banned-wording-allow-next-line — GHL API table/endpoint name
// Read free slots from the cached `ghl_free_slots` table (synced hourly from GHL).
const fetchCachedSlots = async (
  calendarId: string,
  start: Date,
  end: Date,
): Promise<Record<string, string[]>> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("ghl_free_slots")
    .select("slot_start")
    .eq("calendar_id", calendarId)
    .gte("slot_start", start.toISOString())
    .lt("slot_start", end.toISOString())
    .order("slot_start", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  const out: Record<string, string[]> = {};
  for (const row of data || []) {
    const iso = row.slot_start as string;
    // Bucket by ET calendar day
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date(iso));
    (out[key] ||= []).push(iso);
  }
  return out;
};

interface Props {
  location: LocationKey;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** @deprecated PHI: do not pass — clinical context flows via `customFields`. */
  notes?: string;
  source?: string;
  urgencyTier?: "early" | "urgent" | "building" | "overdue" | "long_overdue" | "flexible" | string;
  customFields?: import("@/services/contracts/ILeadSubmitter").MwcCustomFields;
  onBooked?: (slotIso: string) => void;
  /** Called once slots load with the earliest available ISO string (or null if none). */
  onNextAvailable?: (iso: string | null) => void;
}

// Brand tokens (light surface, navy ink, orange accent).
// Two border tokens:
//   LINE   — decorative dividers (header/section underlines, badge dots). Not WCAG 1.4.11 scope.
//   BORDER — interactive component outlines (buttons, day pills, time slots). ≥3:1 vs SURFACE/CANVAS.
const INK = "#0B1029";
const INK_SOFT = "#2C3346";
const MUTED = "#4B5563";
const LINE = "#E5E7EB";
const BORDER = "#8B92A0";
const SURFACE = "#FFFFFF";
const CANVAS = "#F7F8FB";
// Brand orange tokens only — see mem://style/color-palette.
const ORANGE = "#E8670A";       // primary CTA / accent
const ORANGE_ALT = "#F97316";   // approved alt (Tailwind orange-500)
const ORANGE_SOFT = "#FFF1E6";  // tint of #E8670A, decorative bg only

// Business hours
const HOUR_MIN = 8;   // 8 AM ET
const HOUR_MAX = 18;  // exclusive — last slot is 5 PM (17:00)

const ymd = (d: Date) => ymdInTimeZone(d, TIMEZONE);

const startOfWeek = (d: Date) => {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay()); // Sunday
  x.setHours(0, 0, 0, 0);
  return x;
};

const fmtDayShort = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", timeZone: TIMEZONE }).toUpperCase();
const fmtMonthDay = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();
const fmtWeekRange = (start: Date) => {
  const end = new Date(start); end.setDate(end.getDate() + 3);
  const s = start.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TIMEZONE });
  const e = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: TIMEZONE });
  return `${s} – ${e}`;
};
const fmtTimeParts = (iso: string) => {
  const s = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const [time, ampm] = s.split(" ");
  return { time, ampm };
};
const fmtFullDay = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TIMEZONE });

// Build a Date for the given ET wall-clock time (YYYY-MM-DD + hour, minute=0).
// Uses ET's offset on that calendar date so display is always 8 AM..5 PM ET.
const etWallToDate = (ymdStr: string, hour: number): Date => {
  const [y, m, d] = ymdStr.split("-").map((n) => parseInt(n, 10));
  // Probe at noon UTC on that date to get a stable ET offset (avoids DST edge ambiguity).
  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const offsetMin = timeZoneOffsetMinutes(probe, TIMEZONE); // e.g. -240
  // ET wall hour H corresponds to UTC = H - offsetMin (in minutes).
  const utcMs = Date.UTC(y, m - 1, d, hour, 0, 0) - offsetMin * 60_000;
  return new Date(utcMs);
};

// Current hour in America/New_York (0-23).
const etHourNow = (): number => {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE, hour: "numeric", hour12: false,
  }).format(new Date());
  const n = parseInt(s, 10);
  return n === 24 ? 0 : n;
};

// Today (and tomorrow) in ET as "YYYY-MM-DD".
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

const dateFromEtYmd = (s: string): Date => dateFromYmdInTimeZone(s, TIMEZONE);

// banned-wording-allow-next-line — GHL API endpoint name
// Parse the GHL free-slots payload into a per-day map of ISO start times.
// GHL returns shape: { "YYYY-MM-DD": { slots: [iso, iso, ...] }, traceId?: ... }
const parseFreeSlots = (raw: unknown): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
    const slots = (v as { slots?: unknown })?.slots;
    if (Array.isArray(slots)) {
      out[k] = slots.filter((s): s is string => typeof s === "string");
    }
  }
  return out;
};

// Filter out slots that are already in the past (today only) AND any slot
// outside business hours (clinic closes at 6 PM ET — last bookable start = 5 PM).
const etHourOf = (iso: string): number => {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE, hour: "numeric", hour12: false,
  }).format(new Date(iso));
  const n = parseInt(s, 10);
  return n === 24 ? 0 : n;
};
const dropPastSlots = (day: Date, slots: string[]): string[] => {
  const cutoffMs = isTodayET(day) ? Date.now() : 0;
  return slots.filter((iso) => {
    const h = etHourOf(iso);
    if (h < HOUR_MIN || h >= HOUR_MAX) return false; // 8 AM .. 5 PM inclusive
    return new Date(iso).getTime() > cutoffMs;
  });
};


const GHLDayView = ({ location, firstName, lastName, email, phone, source, urgencyTier, customFields, onBooked, onNextAvailable }: Props) => {
  // Anchor "today" to ET, not the visitor's local midnight, so the picker is
  // correct for PT/MT/CT visitors near midnight ET.
  const today = useMemo(() => dateFromEtYmd(todayET()), []);
  // Rolling 7-day window starting today (Sun-Sat naturally included).
  const [weekStart, setWeekStart] = useState<Date>(() => dateFromEtYmd(todayET()));
  const [slotsByDay, setSlotsByDay] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const confirmCtl = useConfirmAppointment({ onBooked: (slot) => onBooked?.(slot) });
  const submitting = confirmCtl.isSubmitting;
  const submitError = confirmCtl.error;
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastUpdatedRef = useRef<Date | null>(null);
  const [lastReason, setLastReason] = useState<"initial" | "timer" | "focus" | "manual">("initial");
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const dayStripRef = useRef<HTMLDivElement | null>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const dialogTitleId = "book-confirm-title";

  // Move focus to the confirm button when a slot is picked (a11y + CRO).
  // Focus without auto-scroll, then smooth-scroll into view only if needed,
  // so mobile doesn't snap awkwardly when the button is already on-screen.
  useEffect(() => {
    if (!selectedSlot) return;
    const btn = confirmBtnRef.current;
    if (!btn) return;
    btn.focus({ preventScroll: true });
    const r = btn.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const fullyVisible = r.top >= 0 && r.bottom <= vh;
    if (!fullyVisible) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [selectedSlot]);

  // Tick every 5s so the "X seconds ago" label stays fresh
  useEffect(() => {
    const t = window.setInterval(() => setNowTick(Date.now()), 5_000);
    return () => window.clearInterval(t);
  }, []);

  // Recompute date-strip edge fade visibility whenever the day list re-renders.
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

  const cal = CENTER_CALENDARS[location];

  // Visible window: 7 days from weekStart.
  const days = useMemo(() => {
    return Array.from({ length: 7 })
      .map((_, i) => addDaysInTimeZone(weekStart, i, TIMEZONE))
      .filter((d) => d >= today)
      // Hide closed days (Sunday) from the day strip; only show operating days.
      .filter((d) => !isSundayInTimeZone(d, TIMEZONE));
  }, [weekStart, today]);

  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const start = new Date(weekStart);
    if (start < today) start.setTime(today.getTime());
    const end = addDaysInTimeZone(weekStart, 7, TIMEZONE);

    const load = (reason: "initial" | "timer" | "focus" | "manual") => {
      const isInitial = reason === "initial";
      if (isInitial) {
        setLoading(true); setLoadError(null); setSlotsByDay({}); setSelectedSlot(null);
      }
      return fetchCachedSlots(cal.calendarId, start, end)
        .then((parsed) => {
          if (cancelled) return;
          const out: Record<string, string[]> = {};
          days.forEach((d) => {
            const key = ymd(d);
            const slots = dropPastSlots(d, parsed[key] || []);
            if (slots.length > 0) out[key] = slots;
          });
          setSlotsByDay(out);
          const now = new Date();
          setLastUpdated(now);
          lastUpdatedRef.current = now;
          setLastReason(reason);
          setNowTick(Date.now());
          if (isInitial) {
            const firstWith = days.find((d) => out[ymd(d)]?.length);
            setSelectedDay(firstWith ? ymd(firstWith) : null);
          } else if (selectedDay && !out[selectedDay]) {
            // selected day no longer has slots after refresh — fall back gracefully
            const firstWith = days.find((d) => out[ymd(d)]?.length);
            setSelectedDay(firstWith ? ymd(firstWith) : null);
            setSelectedSlot(null);
          } else if (selectedSlot && selectedDay && !out[selectedDay]?.includes(selectedSlot)) {
            // selected slot got booked by someone else — drop it
            setSelectedSlot(null);
          }
        })
        .catch((e: Error) => { if (!cancelled && isInitial) setLoadError(e.message || "Could not load times."); })
        .finally(() => { if (!cancelled && isInitial) setLoading(false); });
    };


    load(refreshNonce > 0 ? "manual" : "initial");
    // Auto-refresh every 2 min — slots update hourly in Supabase, 30s was too aggressive.
    // On tab focus, only refresh if data is >2 min old.
    const REFRESH_MS = 2 * 60 * 1000;
    const interval = window.setInterval(() => load("timer"), REFRESH_MS);
    const onFocus = () => {
      const last = lastUpdatedRef.current;
      if (!last || Date.now() - last.getTime() > REFRESH_MS) load("focus");
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, location, refreshNonce]);

  const times = selectedDay ? slotsByDay[selectedDay] || [] : [];
  const canConfirm = Boolean(selectedSlot);
  const prevDisabled = weekStart <= today;

  // Earliest 2 actually-available slots across the visible window.
  const recommendedSlots = useMemo(() => {
    const all: { iso: string; day: Date }[] = [];
    days.forEach((d) => {
      const key = ymd(d);
      (slotsByDay[key] || []).forEach((iso) => all.push({ iso, day: d }));
    });
    all.sort((a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime());
    return all.slice(0, 2);
  }, [days, slotsByDay]);

  // Fire onNextAvailable whenever the earliest slot changes.
  useEffect(() => {
    if (loading) return;
    onNextAvailable?.(recommendedSlots[0]?.iso ?? null);
  }, [recommendedSlots, loading, onNextAvailable]);

  // Show next-available banner for ALL users — urgency is universal CRO signal
  const showRecommended = recommendedSlots.length > 0;

  // One-tap confirm for the recommended-slot card.
  const confirmDirectly = (iso: string) => {
    setSelectedSlot(iso);
    void confirmCtl.confirm({
      slotIso: iso,
      location, firstName, lastName, email, phone, source, customFields,
    });
  };

  const handleFinalConfirm = async () => {
    if (!selectedSlot) return;
    const ok = await confirmCtl.confirm({
      slotIso: selectedSlot,
      location,
      firstName,
      lastName,
      email,
      phone,
      source,
      customFields,
    });
    if (ok) setModalOpen(false);
  };

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return (
    <>
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${LINE}`,
          borderRadius: 16,
          overflow: "hidden",
          color: INK,
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 1px 2px rgba(11,16,41,0.04), 0 24px 48px -24px rgba(11,16,41,0.18)",
        }}
      >
        {/* Clinic name removed from card header — surfaced in the page meta
            line above (e.g. "Richmond clinic · 60-min · No charge today"). */}

        {/* WEEK NAV */}
        <div className="px-4 md:px-7 pt-3 md:pt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={prevDisabled}
            onClick={() => setWeekStart(addDaysInTimeZone(weekStart, -7, TIMEZONE))}
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
            onClick={() => setWeekStart(addDaysInTimeZone(weekStart, 7, TIMEZONE))}
            aria-label="Next week"
            style={{
              background: SURFACE, color: INK, border: `1px solid ${BORDER}`,
              borderRadius: 999, padding: "10px 14px",
              fontSize: 13, fontWeight: 600, minHeight: 44,
              display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        {/* DAY PILLS */}
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
                className="flex gap-2 overflow-x-auto justify-center"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  paddingBottom: 4,
                  scrollbarWidth: "none",
                  flexWrap: "nowrap",
                }}
              >
                {days.map((d) => {
                  const key = ymd(d);
                  const actualCount = slotsByDay[key]?.length || 0;
                  const count = actualCount;
                  const isSunday = isSundayInTimeZone(d, TIMEZONE);
                  const isToday = isTodayET(d);
                  // Hide today's tile entirely if it has no availability — never
                  // contradict the "same-day" promise with a "Full" badge.
                  if (isToday && !loading && actualCount === 0) return null;
                  const available = actualCount > 0 && !isSunday;
                  const selected = selectedDay === key;
                  const isTomorrow = isTomorrowET(d);
                  const scarce = available && count > 0 && count <= 3;
                  const badgeText = !loading
                    ? isSunday
                      ? "Closed"
                      : !available
                        ? "Full"
                        : scarce
                          ? `Only ${count} left`
                          : `${count} slots`
                    : "···";
                  const badgeColor = selected
                    ? "rgba(255,255,255,0.85)"
                    : isSunday || !available
                      ? MUTED
                      : scarce
                        ? "#FFB37A"
                        : "rgba(255,255,255,0.85)";
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isSunday || !available}
                      aria-pressed={selected}
                      aria-label={`${fmtFullDay(d)} — ${isSunday ? "Closed on Sundays" : `${count} times available`}`}
                      onClick={isSunday ? undefined : (e) => {
                        setSelectedDay(key);
                        setSelectedSlot(null);
                        // Scroll partially-visible edge chips fully into view.
                        e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                      }}
                      style={{
                        flex: "0 0 84px",
                        minWidth: 84,
                        scrollSnapAlign: "start",
                        background: selected
                          ? ORANGE
                          : isSunday || !available
                            ? "#F4F5F8"
                            : SURFACE,
                        border: selected
                          ? `1px solid ${ORANGE}`
                          : `1px solid ${BORDER}`,
                        borderRadius: 14,
                        padding: "10px 6px 12px",
                        color: selected
                          ? "#FFFFFF"
                          : isSunday || !available
                            ? MUTED
                            : INK,
                        cursor: isSunday || !available ? "not-allowed" : "pointer",
                        textAlign: "center",
                        transition: "background-color 120ms ease, border-color 120ms ease, transform 120ms ease",
                        position: "relative",
                        opacity: !available && !selected ? 0.7 : 1,
                        boxShadow: selected
                          ? "0 8px 18px -8px rgba(232,103,10,0.45)"
                          : "0 1px 2px rgba(11,16,41,0.04)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          color: selected
                            ? "#FFFFFF"
                            : isSunday || !available
                              ? MUTED
                              : isToday || isTomorrow
                                ? ORANGE
                                : INK_SOFT,
                          marginBottom: 2,
                        }}
                      >
                        {isToday ? "TODAY" : isTomorrow ? "TMRW" : fmtDayShort(d)}
                      </div>
                      <div style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.01em", lineHeight: 1.1 }}>
                        {fmtMonthDay(d)}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: selected
                            ? "#FFFFFF"
                            : isSunday || !available
                              ? MUTED
                              : scarce
                                ? ORANGE
                                : INK_SOFT,
                          marginTop: 6,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {badgeText}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Edge fade affordances — show that more dates exist off-screen. */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", left: 0, top: 0, bottom: 4, width: 28,
                  pointerEvents: "none",
                  background: `linear-gradient(to right, ${SURFACE}, rgba(255,255,255,0))`,
                  opacity: showLeftFade ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", right: 0, top: 0, bottom: 4, width: 28,
                  pointerEvents: "none",
                  background: `linear-gradient(to left, ${SURFACE}, rgba(255,255,255,0))`,
                  opacity: showRightFade ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
              />
            </div>
          )}
          {loadError && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#B91C1C" }}>{loadError}</div>
          )}
        </div>

        {/* TIMES */}
        <div className="px-5 md:px-7 pb-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16, background: CANVAS }}>

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
                    onClick={() => setSelectedSlot(iso)}
                    style={{
                      background: active ? ORANGE : SURFACE,
                      border: active ? "1px solid transparent" : `1px solid ${BORDER}`,
                      borderRadius: 12, padding: "16px 18px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: active ? "#FFFFFF" : INK, cursor: "pointer", textAlign: "center",
                      transition: "background-color 120ms ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontFamily: "Oswald, Inter, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.01em" }}>
                        {time}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: active ? "#FFFFFF" : MUTED }}>
                        {ampm}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CONFIRM BAR */}
        <div
          className="px-5 md:px-7 py-4"
          style={{ borderTop: `1px solid ${LINE}`, background: SURFACE }}
        >
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => canConfirm && setModalOpen(true)}
            disabled={!canConfirm}
            style={{
              width: "100%", minHeight: 56,
              background: canConfirm ? ORANGE : "#E5E7EB",
              color: canConfirm ? "#FFFFFF" : "#3D4350",
              border: 0, borderRadius: 12, fontSize: 16, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: canConfirm ? "pointer" : "not-allowed",
              fontFamily: "Oswald, Inter, sans-serif",
              boxShadow: canConfirm ? "0 10px 24px -10px rgba(232,103,10,0.55)" : "none",
              transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
          >
            {canConfirm && selectedSlot
              ? (() => {
                  const day = new Date(selectedSlot);
                  const dayLabel = day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: TIMEZONE }).toUpperCase();
                  const { time, ampm } = fmtTimeParts(selectedSlot);
                  return `Confirm ${dayLabel} · ${time} ${ampm} →`;
                })()
              : "Tap a time above to continue"}
          </button>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(o) => !submitting && setModalOpen(o)}>
        <DialogContent
          className="sm:max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          style={{ background: SURFACE, color: INK, border: `1px solid ${LINE}`, fontFamily: "Inter, sans-serif" }}
        >
          <DialogHeader>
            <DialogTitle id={dialogTitleId} style={{ color: INK, fontFamily: "Oswald, Inter, sans-serif", letterSpacing: "0.02em" }}>
              Confirm your appointment
            </DialogTitle>
          </DialogHeader>
          <div style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, marginTop: 4 }}>
            <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
              You're booking
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              New Patient Consultation (60 min)
            </div>
            {selectedSlot && (
              <div style={{ fontSize: 15, color: INK, marginBottom: 4 }}>
                {fmtFullDay(new Date(selectedSlot))} · {fmtTimeParts(selectedSlot).time} {fmtTimeParts(selectedSlot).ampm}
              </div>
            )}
            <div style={{ fontSize: 14, color: MUTED }}>{cal.label}, In-person</div>
            {fullName && (
              <div style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>
                For: <strong style={{ color: INK }}>{fullName}</strong>
              </div>
            )}
          </div>

          {submitError && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                marginTop: 12,
                padding: "12px 14px",
                background: "#FEF2F2",
                border: "1px solid #EF4444",
                borderRadius: 8,
                color: "#B91C1C",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 600 }}>{submitError}</div>
              {confirmCtl.redirect && (
                <>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#7F1D1D", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span>
                      Connecting you with a coordinator in{" "}
                      <strong>{Math.max(1, Math.ceil(confirmCtl.redirect.remainingMs / 1000))}s</strong>
                    </span>
                    <button
                      type="button"
                      onClick={confirmCtl.cancelRedirect}
                      style={{
                        background: "transparent",
                        border: "1px solid #B91C1C",
                        color: "#7F1D1D",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={confirmCtl.redirect.totalMs}
                    aria-valuenow={confirmCtl.redirect.totalMs - confirmCtl.redirect.remainingMs}
                    style={{
                      marginTop: 8,
                      height: 4,
                      background: "#FECACA",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, ((confirmCtl.redirect.totalMs - confirmCtl.redirect.remainingMs) / confirmCtl.redirect.totalMs) * 100)}%`,
                        background: "#B91C1C",
                        transition: "width 100ms linear",
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={handleFinalConfirm}
              disabled={submitting || !!confirmCtl.redirect}
              style={{
                width: "100%", minHeight: 52,
                background: ORANGE, color: "#FFFFFF",
                border: 0, borderRadius: 12, fontSize: 15, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: submitting || confirmCtl.redirect ? "wait" : "pointer",
                opacity: submitting || confirmCtl.redirect ? 0.85 : 1,
                fontFamily: "Oswald, Inter, sans-serif",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 10px 24px -10px rgba(232,103,10,0.55)",
              }}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Booking..." : "Confirm booking"}
            </button>
            <button
              type="button"
              onClick={() => { if (!submitting) { confirmCtl.cancelRedirect(); setModalOpen(false); } }}
              style={{ width: "100%", minHeight: 44, background: "transparent", color: MUTED, border: 0, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              ← Change time
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GHLDayView;
