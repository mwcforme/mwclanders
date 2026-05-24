/**
 * GHLDayView — thin orchestrator for the appointment picker.
 *
 * State, data-fetching, and event-wiring live here.
 * Rendering is delegated to DayStrip, TimeGrid, and ConfirmDialog.
 */
import { useEffect, useMemo, useRef, useState } from "react";
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
// ConfirmDialog removed — slot tap confirms directly, no modal step

// Brand tokens (confirm bar only — child components manage their own)
const INK    = "var(--brand-navy-deep)";
// hardcoded-color-allow-next-line
const _MUTED  = "#4B5563";
// hardcoded-color-allow-next-line
const LINE   = "#E5E7EB";
const SURFACE = "var(--bg-white)";
const ORANGE  = "var(--brand-cta)";

// ─── Supabase lazy import ─────────────────────────────────────────────────────

const getSupabase = () => import("@/integrations/supabase/client").then(m => m.supabase);

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

const _fmtTimeParts = (iso: string): { time: string; ampm: string } => {
  const s = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const [time, ampm] = s.split(" ");
  return { time, ampm };
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
  // modalOpen removed — no confirmation dialog
  const [refreshNonce, _setRefreshNonce] = useState(0);

  const confirmCtl = useConfirmAppointment({
    onBooked: (slot) => {
      trackFunnelEvent("booking_completed", { location });
      // Fire Schedule CAPI event with value — $500 = conservative estimated revenue
      // per booked consult (accounts for no-shows). Signals booking quality to Meta + Google.
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

  // Visible window: 7 operating days from weekStart (Sundays excluded).
  const days = useMemo(() => {
    return Array.from({ length: 7 })
      .map((_, i) => addDaysInTimeZone(weekStart, i, TIMEZONE))
      .filter((d) => d >= today)
      .filter((d) => !isSundayInTimeZone(d, TIMEZONE));
  }, [weekStart, today]);

  // Slot loading
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
          const now = new Date();
          lastUpdatedRef.current = now;
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

  // Focus the confirm button when a slot is picked (a11y + CRO).
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

  // Earliest recommended slots (for onNextAvailable callback).
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
  const _fullName   = [firstName, lastName].filter(Boolean).join(" ").trim();

  const handleFinalConfirm = async () => {
    if (!selectedSlot) return;
    // If no phone, we're in the product funnel (contact captured later).
    // Fire onBooked immediately with the selected slot — skip GHL API.
    if (!phone) {
      onBooked?.(selectedSlot);
      return;
    }
    // Normal booking flow — confirm in GHL first.
    await confirmCtl.confirm({
      slotIso: selectedSlot, location, firstName, lastName, email, phone, source, customFields,
    });
  };

  return (
    <>
      <div style={{
        background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 16,
        overflow: "hidden", color: INK, fontFamily: "Inter, system-ui, sans-serif",
        // hardcoded-color-allow-next-line
        boxShadow: "0 1px 2px rgba(11,16,41,0.04), 0 24px 48px -24px rgba(11,16,41,0.18)",
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
        <div className="px-5 md:px-7 py-4" style={{ borderTop: `1px solid ${LINE}`, background: SURFACE }}>
          {/* Selected slot recap — shown when a slot is chosen */}
          {selectedSlot && (
            <p style={{
              fontSize: 15, color: "#374151", fontFamily: "Inter, sans-serif",
              marginBottom: 10, textAlign: "center", fontWeight: 500, lineHeight: 1.4,
            }}>
              {new Date(selectedSlot).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: TIMEZONE })}
              {" · "}
              {new Date(selectedSlot).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE })}
            </p>
          )}
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => canConfirm && handleFinalConfirm()}
            disabled={!canConfirm}
            style={{
              width: "100%", minHeight: 60,
              // hardcoded-color-allow-next-line
              background: canConfirm ? ORANGE : "#E5E7EB",
              // hardcoded-color-allow-next-line
              color: canConfirm ? "var(--c-text-on-dark)" : "#3D4350",
              border: 0, borderRadius: 12, fontSize: 16, fontWeight: 700,
              letterSpacing: canConfirm ? "0.06em" : "0.02em",
              textTransform: canConfirm ? "uppercase" : "none",
              cursor: canConfirm ? "pointer" : "not-allowed",
              fontFamily: "Oswald, Inter, sans-serif",
              // hardcoded-color-allow-next-line
              boxShadow: canConfirm ? "0 10px 24px -10px rgba(232,103,10,0.55)" : "none",
              transition: "all 150ms ease",
            }}
          >
            {canConfirm ? "Confirm My Appointment" : "Select a time to continue"}
          </button>
        </div>
      </div>

      {/* ConfirmDialog removed — booking fires directly on button tap */}
    </>
  );
};

export default GHLDayView;
