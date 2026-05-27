/**
 * GHLDayView — thin orchestrator for the appointment picker.
 *
 * State, data-fetching, and event-wiring live here.
 * Rendering is delegated to DayStrip, TimeGrid, and ConfirmDialog.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { CENTER_CALENDARS, TIMEZONE, type LocationKey } from "@/lib/ghlCalendars";
import {
  addDaysInTimeZone,
  dateFromYmdInTimeZone,
  isSundayInTimeZone,
  ymdInTimeZone,
} from "@/lib/etDate";
import { useConfirmAppointment } from "@/domain/booking/useConfirmAppointment";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import DayStrip from "./DayStrip";
import TimeGrid from "./TimeGrid";

const ORANGE = "var(--brand-cta)";

// ─── Supabase lazy import ─────────────────────────────────────────────────────

const getSupabase = () => import("@/integrations/supabase/legacy").then(m => m.supabase);

// ─── Slot fetching ────────────────────────────────────────────────────────────

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
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date(iso));
    (out[key] ||= []).push(iso);
  }
  return out;
};

// ─── Date utilities ───────────────────────────────────────────────────────────

const ymd = (d: Date): string => ymdInTimeZone(d, TIMEZONE);

const todayET = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

const dateFromEtYmd = (s: string): Date => dateFromYmdInTimeZone(s, TIMEZONE);

const etHourOf = (iso: string): number => {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE, hour: "numeric", hour12: false,
  }).format(new Date(iso));
  const n = parseInt(s, 10);
  return n === 24 ? 0 : n;
};

const isTodayET = (day: Date): boolean =>
  todayET() === ymd(day);

const HOUR_MIN = 8;
const HOUR_MAX = 18;

const dropPastSlots = (day: Date, slots: string[]): string[] => {
  const cutoffMs = isTodayET(day) ? Date.now() : 0;
  return slots.filter((iso) => {
    const h = etHourOf(iso);
    if (h < HOUR_MIN || h >= HOUR_MAX) return false;
    return new Date(iso).getTime() > cutoffMs;
  });
};

// ─── Confirm button label ─────────────────────────────────────────────────────

const fmtConfirmLabel = (iso: string): string => {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: TIMEZONE });
  const month   = d.toLocaleDateString("en-US", { month: "short", timeZone: TIMEZONE });
  const day     = d.toLocaleDateString("en-US", { day: "numeric", timeZone: TIMEZONE });
  const time    = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE });
  return `LOCK IN ${weekday.toUpperCase()}, ${month.toUpperCase()} ${day} AT ${time}`;
};

// ─── Props ────────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

const GHLDayView = ({ location, firstName, lastName, email, phone, source, urgencyTier: _urgencyTier, customFields, onBooked, onNextAvailable }: Props) => {
  const today = useMemo(() => dateFromEtYmd(todayET()), []);
  const [weekStart, setWeekStart]     = useState<Date>(() => dateFromEtYmd(todayET()));
  const [slotsByDay, setSlotsByDay]   = useState<Record<string, string[]>>({});
  const [loading, setLoading]         = useState(false);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [refreshNonce, _setRefreshNonce] = useState(0);

  const confirmCtl = useConfirmAppointment({
    onBooked: (slot) => {
      trackFunnelEvent("booking_completed", { location });
      void import("@/lib/capi").then(({ trackConversion }) =>
        trackConversion("Schedule", {
          custom_data: {
            value: 500,
            currency: "USD",
            content_name: "booked_consultation",
            lp_slug: typeof window !== "undefined" ? window.location.pathname : undefined,
          },
        })
      );
      onBooked?.(slot);
    },
  });
  const _submitting  = confirmCtl.isSubmitting;
  const _submitError = confirmCtl.error;

  const lastUpdatedRef = useRef<Date | null>(null);
  const confirmBtnRef  = useRef<HTMLButtonElement | null>(null);

  const cal = CENTER_CALENDARS[location];

  const days = useMemo(() => {
    return Array.from({ length: 7 })
      .map((_, i) => addDaysInTimeZone(weekStart, i, TIMEZONE))
      .filter((d) => d >= today)
      .filter((d) => !isSundayInTimeZone(d, TIMEZONE));
  }, [weekStart, today]);

  useEffect(() => {
    let cancelled = false;
    const start = new Date(weekStart);
    if (start < today) start.setTime(today.getTime());
    const end = addDaysInTimeZone(weekStart, 7, TIMEZONE);
    const REFRESH_MS = 2 * 60 * 1000;

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
          lastUpdatedRef.current = new Date();
          if (isInitial) {
            const firstWith = days.find((d) => out[ymd(d)]?.length);
            setSelectedDay(firstWith ? ymd(firstWith) : null);
          } else if (selectedDay && !out[selectedDay]) {
            const firstWith = days.find((d) => out[ymd(d)]?.length);
            setSelectedDay(firstWith ? ymd(firstWith) : null);
            setSelectedSlot(null);
          } else if (selectedSlot && selectedDay && !out[selectedDay]?.includes(selectedSlot)) {
            setSelectedSlot(null);
          }
        })
        .catch((e: Error) => { if (!cancelled && isInitial) setLoadError(e.message || "Could not load times."); })
        .finally(() => { if (!cancelled && isInitial) setLoading(false); });
    };

    load(refreshNonce > 0 ? "manual" : "initial");
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

  useEffect(() => {
    if (!selectedSlot) return;
    const btn = confirmBtnRef.current;
    if (!btn) return;
    btn.focus({ preventScroll: true });
    const r = btn.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < 0 || r.bottom > vh) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [selectedSlot]);

  const recommendedSlots = useMemo(() => {
    const all: { iso: string }[] = [];
    days.forEach((d) => {
      const key = ymd(d);
      (slotsByDay[key] || []).forEach((iso) => all.push({ iso }));
    });
    all.sort((a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime());
    return all.slice(0, 2);
  }, [days, slotsByDay]);

  useEffect(() => {
    if (loading) return;
    onNextAvailable?.(recommendedSlots[0]?.iso ?? null);
  }, [recommendedSlots, loading, onNextAvailable]);

  const times      = selectedDay ? slotsByDay[selectedDay] || [] : [];
  const canConfirm = Boolean(selectedSlot);
  const prevDisabled = weekStart <= today;

  const handleFinalConfirm = async () => {
    if (!selectedSlot) return;
    if (!phone) { onBooked?.(selectedSlot); return; }
    await confirmCtl.confirm({
      slotIso: selectedSlot, location, firstName, lastName, email, phone, source, customFields,
    });
  };

  // Guard after all hooks: unknown/stale location key — render nothing instead of crashing
  if (!cal) {
    console.warn("[GHLDayView] unknown location key:", location);
    return null;
  }

  return (
    <>
      {/* Fixed-bottom "Select a time" overlay — matches mwclocked mockup.
          Mockup: position fixed, height 101px wrapper, dark navy btn 72px.
          Only shown when no slot selected (canConfirm === false). */}
      {!canConfirm && (
        <div
          aria-hidden="true"
          className="mwc-select-time-overlay"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            height: 101, zIndex: 50,
            // hardcoded-color-allow-next-line
            background: "linear-gradient(to bottom, transparent 0%, #0B1029 40%)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: "0 16px 15px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%", maxWidth: 720,
              height: 72,
              // hardcoded-color-allow-next-line
              background: "#1F274C",
              borderRadius: 17,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Montserrat, Inter, sans-serif",
              fontSize: 15, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#FFFFFF",
            }}
          >
            Select a Time
          </div>
        </div>
      )}
      {/* White card — matches mockup exactly */}
      <div style={{
        background: "#FFFFFF",
        // hardcoded-color-allow-next-line
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "Montserrat, Inter, system-ui, sans-serif",
        // hardcoded-color-allow-next-line
        boxShadow: "0 20px 60px -10px rgba(0,0,0,0.40)",
      }}>
        <DayStrip
          days={days}
          weekStart={weekStart}
          today={today}
          selectedDay={selectedDay}
          slotsByDay={slotsByDay}
          loading={loading}
          prevDisabled={prevDisabled}
          loadError={loadError}
          onPrevWeek={() => setWeekStart(addDaysInTimeZone(weekStart, -7, TIMEZONE))}
          onNextWeek={() => setWeekStart(addDaysInTimeZone(weekStart, 7, TIMEZONE))}
          onDaySelect={(key) => { setSelectedDay(key); setSelectedSlot(null); trackFunnelEvent("date_selected", { location }); }}
        />

        <TimeGrid
          selectedDay={selectedDay}
          times={times}
          selectedSlot={selectedSlot}
          loading={loading}
          onSlotSelect={(iso) => { setSelectedSlot(iso); trackFunnelEvent("time_selected", { location }); }}
        />

        {/* Confirm bar */}
        <div style={{
          // hardcoded-color-allow-next-line
          borderTop: "1px solid #F3F4F6",
          padding: "16px 20px",
          background: "#FFFFFF",
        }}>
          {canConfirm ? (
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={() => handleFinalConfirm()}
              style={{
                width: "100%", minHeight: 56,
                background: ORANGE,
                border: "none",
                color: "#fff",
                borderRadius: 12,
                fontSize: 15, fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "Montserrat, Inter, sans-serif",
                // hardcoded-color-allow-next-line
                boxShadow: "0 10px 24px -8px rgba(232,103,10,0.55)",
                transition: "all 150ms ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Lock size={15} strokeWidth={2.5} aria-hidden />
              {selectedSlot ? fmtConfirmLabel(selectedSlot) : "Confirm My Appointment"} →
            </button>
          ) : (
            /* Inactive state — dark navy button matching mwclocked mockup */
            <button
              type="button"
              disabled
              aria-disabled="true"
              style={{
                width: "100%", minHeight: 56,
                // hardcoded-color-allow-next-line
                background: "#0B1029",
                border: "none",
                color: "#FFFFFF",
                borderRadius: 12,
                fontSize: 15, fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "default",
                fontFamily: "Montserrat, Inter, sans-serif",
                opacity: 0.55,
              }}
            >
              Select a Time
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default GHLDayView;
