/**
 * BookSchedule — new PickTime UI wired to real Supabase slot data.
 * Design: /data/.openclaw/workspace/mwc-book-upload/client/src/pages/PickTime.tsx
 * Data:   GHLDayView slot fetching logic (Supabase ghl_free_slots)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Calendar, ChevronLeft, ChevronRight,
  Clock, Lock, MapPin, Phone, X,
} from "lucide-react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { useConfirmAppointment } from "@/domain/booking/useConfirmAppointment";
import { CENTER_CALENDARS, TIMEZONE, type LocationKey } from "@/lib/ghlCalendars";
import { LOCATIONS, LOCATION_KEY_TO_SLUG } from "@/data/locations";
import { PHONE } from "@/lib/constants";
import {
  addDaysInTimeZone, dateFromYmdInTimeZone, isSundayInTimeZone, ymdInTimeZone,
} from "@/lib/etDate";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";

// ─── Types ────────────────────────────────────────────────────────────────────

type DayCell = {
  date: Date;
  slotsLeft: number;
  full: boolean;
  closed: boolean;
};

type TimeSlot = { iso: string; display: string; meridiem: "AM" | "PM" };

// ─── Constants ────────────────────────────────────────────────────────────────

const HOLD_SECONDS = 5 * 60;
const HOUR_MIN = 8;
const HOUR_MAX = 18;
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW_SHORT    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS_UPPER = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// ─── Supabase slot fetching (from GHLDayView) ─────────────────────────────────

const getSupabase = () => import("@/integrations/supabase/legacy").then(m => m.supabase);

async function fetchCachedSlots(
  calendarId: string,
  start: Date,
  end: Date,
): Promise<Record<string, string[]>> {
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
}

const ymd = (d: Date): string => ymdInTimeZone(d, TIMEZONE);

function isTodayET(d: Date): boolean {
  return ymd(d) === new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function etHourOf(iso: string): number {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE, hour: "numeric", hour12: false,
  }).format(new Date(iso));
  const n = parseInt(s, 10);
  return n === 24 ? 0 : n;
}

function dropPastAndOutOfHours(d: Date, slots: string[]): string[] {
  const cutoffMs = isTodayET(d) ? Date.now() : 0;
  return slots.filter(iso => {
    const h = etHourOf(iso);
    if (h < HOUR_MIN || h >= HOUR_MAX) return false;
    return new Date(iso).getTime() > cutoffMs;
  });
}

function fmtTimeParts(iso: string): { display: string; meridiem: "AM" | "PM" } {
  const s = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
  });
  const parts = s.split(/[\s\u202f]+/);
  return {
    display: parts[0] ?? "",
    meridiem: (parts[1]?.toUpperCase() === "PM" ? "PM" : "AM") as "AM" | "PM",
  };
}

function formatLong(d: Date): string {
  const dow = DOW_SHORT[d.getDay()];
  const mo  = MONTHS_SHORT[d.getMonth()];
  return `${dow}, ${mo} ${d.getDate()}`;
}

function formatLongFull(d: Date): string {
  return `${DOW_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function groupSlots(slots: TimeSlot[]) {
  const morning: TimeSlot[]   = [];
  const afternoon: TimeSlot[] = [];
  const evening: TimeSlot[]   = [];
  for (const s of slots) {
    const h = parseInt(s.display.split(":")[0], 10);
    if (s.meridiem === "AM") morning.push(s);
    else if (h === 12 || h < 5) afternoon.push(s);
    else evening.push(s);
  }
  return { morning, afternoon, evening };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DayPill({ day, selected, onSelect }: { day: DayCell; selected: boolean; onSelect: () => void }) {
  const disabled = day.full || day.closed;
  const dow = ["SUN","MON","TUE","WED","THU","FRI","SAT"][day.date.getDay()];
  const base = "relative flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-center select-none transition-colors min-h-[72px] cursor-pointer";

  if (disabled) {
    return (
      <div
        role="radio" aria-checked={false} aria-disabled
        aria-label={`${formatLong(day.date)} — ${day.full ? "Fully booked" : "Closed"}`}
        className={`${base} bg-disabled-light text-disabled-light-foreground`}
      >
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em]">{dow}</p>
        <p className="font-display text-xl font-bold leading-none">{day.date.getDate()}</p>
        <p className="text-[9px] font-bold uppercase">{day.full ? "Full" : "Closed"}</p>
      </div>
    );
  }

  if (selected) {
    return (
      <button type="button" onClick={onSelect} role="radio" aria-checked
        className={`${base} bg-primary text-white shadow-cta`}>
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em] opacity-90">{dow}</p>
        <p className="font-display text-xl font-bold leading-none">{day.date.getDate()}</p>
        <span className="h-[5px] w-[5px] rounded-full bg-white" aria-hidden />
      </button>
    );
  }

  return (
    <button type="button" onClick={onSelect} role="radio" aria-checked={false}
      aria-label={`${formatLong(day.date)} — ${day.slotsLeft} slots available`}
      className={`${base} bg-panel text-panel-foreground border-[1.5px] border-panel-border hover:border-primary`}>
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-panel-muted">{dow}</p>
      <p className="font-display text-xl font-bold leading-none">{day.date.getDate()}</p>
      <span className="h-[5px] w-[5px] rounded-full bg-primary" aria-hidden />
    </button>
  );
}

function SlotGroup({
  title, slots, startIdx, selected, setSelected, slotRefs, onKey,
}: {
  title: string; slots: TimeSlot[]; startIdx: number;
  selected: string | null; setSelected: (v: string) => void;
  slotRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  onKey: (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => void;
}) {
  if (slots.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-panel-foreground">
        {title}
      </h3>
      <div className="h-px bg-panel-divider mb-2.5" aria-hidden />
      <div role="radiogroup" aria-label={`${title} time slots`}
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {slots.map((s, i) => {
          const idx = startIdx + i;
          const value = s.iso;
          const isSelected = selected === value;
          return (
            <button
              key={value}
              ref={el => (slotRefs.current[idx] = el)}
              type="button" role="radio" aria-checked={isSelected}
              onKeyDown={e => onKey(e, idx)}
              onClick={() => setSelected(value)}
              className={[
                "h-[50px] rounded-xl px-2 inline-flex items-center justify-center transition-colors border-[1.5px]",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-cta"
                  : "bg-panel text-panel-foreground border-panel-border hover:border-primary",
              ].join(" ")}
            >
              <span className="font-display text-base font-bold leading-none">
                {s.display}
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider opacity-75">{s.meridiem}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewSheet({
  firstName, slotIso, day, onCommit, onChangeTime, confirming,
}: {
  firstName: string; slotIso: string; day: DayCell;
  onCommit: () => void; onChangeTime: () => void; confirming: boolean;
}) {
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  useEffect(() => {
    const id = window.setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const { display: slotDisplay, meridiem } = fmtTimeParts(slotIso);
  const slotLabel = `${slotDisplay} ${meridiem}`;

  const endTimeLabel = useMemo(() => {
    const d = new Date(slotIso);
    const end = new Date(d.getTime() + 60 * 60 * 1000);
    return end.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
    }).replace(/\u202f/g, " ");
  }, [slotIso]);

  const dayLong = formatLongFull(day.date);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timer = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog" aria-modal aria-labelledby="review-title">
      <button type="button" aria-label="Close" onClick={onChangeTime}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-panel text-panel-foreground rounded-t-3xl sm:rounded-3xl sm:mb-8 shadow-card"
        style={{ animation: "slideUp 280ms cubic-bezier(0.22,1,0.36,1)" }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="h-1 w-10 rounded-full bg-panel-divider" aria-hidden />
        </div>
        <button type="button" onClick={onChangeTime}
          className="hidden sm:inline-flex absolute top-4 right-4 h-9 w-9 items-center justify-center rounded-full text-panel-muted hover:bg-panel-divider"
          aria-label="Close">
          <X className="h-5 w-5" aria-hidden />
        </button>
        <div className="px-6 pt-2 pb-4 text-center">
          <p id="review-title" className="font-display text-2xl font-bold uppercase tracking-[0.05em] text-panel-foreground">
            {DOW_SHORT[day.date.getDay()]}, {MONTHS_SHORT[day.date.getMonth()].toUpperCase()} {day.date.getDate()}{" "}
            <span className="text-primary">·</span> {slotLabel}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-primary">
            <Clock className="h-3.5 w-3.5" aria-hidden /> Holding your slot · {timer}
          </p>
        </div>
        <div className="h-px bg-panel-divider" aria-hidden />
        <div className="px-6 py-5 flex items-start gap-4">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary" aria-hidden>
            <Calendar className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-base font-bold uppercase tracking-wide text-panel-foreground">Consultation</p>
            <p className="mt-1 text-sm leading-snug text-panel-foreground">
              {dayLong}<br />
              {slotLabel} <span className="text-panel-muted">to</span> {endTimeLabel}{" "}
              <span className="text-panel-muted">(60-minute visit)</span>
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-panel-muted">
              Physician-led · In-person
            </p>
          </div>
        </div>
        <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-5 border-t border-panel-divider">
          <button type="button" onClick={onCommit} disabled={confirming}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-display font-bold uppercase tracking-wider text-lg bg-primary text-white hover:bg-primary-hover shadow-cta disabled:opacity-60 disabled:cursor-wait">
            <Lock className="h-5 w-5" aria-hidden strokeWidth={2.5} />
            {confirming ? "Booking…" : firstName ? `Lock it in, ${firstName}` : "Lock it in"}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" onClick={onChangeTime}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-panel-muted hover:text-panel-foreground">
            Change time
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookSchedule() {
  const navigate = useNavigate();

  // Store
  const location    = useBookingStore(s => s.location);
  const identity    = useBookingStore(s => s.identity);
  const symptom     = useBookingStore(s => s.symptom);
  const note        = useBookingStore(s => s.note);
  const duration    = useBookingStore(s => s.duration);
  const urgencyTier = useBookingStore(s => s.urgencyTier);
  const service     = useBookingStore(s => s.service);
  const lpSlug      = useBookingStore(s => s.lpSlug);
  const source      = useBookingStore(s => s.source);
  const setLocation        = useBookingStore(s => s.setLocation);
  const setAppointmentTime = useBookingStore(s => s.setAppointmentTime);

  const firstName = (identity?.firstName ?? "").trim().split(/\s+/)[0] || "";
  const lastName  = identity?.lastName ?? "";

  // Derive clinic name from location
  const locationSlug = location ? LOCATION_KEY_TO_SLUG[location] : null;
  const locationData = locationSlug ? LOCATIONS.find(l => l.slug === locationSlug) : null;
  const clinicCity   = locationData ? locationData.name.replace("Men's Wellness Centers, ", "") + " center" : null;

  const cal = location && location in CENTER_CALENDARS
    ? CENTER_CALENDARS[location as LocationKey]
    : null;

  // Week / day state
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });
  const [slotsByDay, setSlotsByDay] = useState<Record<string, string[]>>({});
  const [loading, setLoading]       = useState(false);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  // Build 7-day array
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDaysInTimeZone(weekStart, i, TIMEZONE)),
    [weekStart],
  );

  // Build DayCell array
  const dayCells: DayCell[] = useMemo(() => days.map(d => {
    const key = ymd(d);
    const closed = isSundayInTimeZone(d, TIMEZONE);
    const rawSlots = slotsByDay[key] || [];
    const available = dropPastAndOutOfHours(d, rawSlots);
    return {
      date: d,
      slotsLeft: available.length,
      full: !loading && !closed && rawSlots.length > 0 && available.length === 0,
      closed,
    };
  }), [days, slotsByDay, loading]);

  const firstAvailableIdx = dayCells.findIndex(d => !d.full && !d.closed && d.slotsLeft > 0);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot]     = useState<string | null>(null);
  const [reviewOpen, setReviewOpen]         = useState(false);
  const [confirming, setConfirming]         = useState(false);

  // Auto-select first available day once slots load
  useEffect(() => {
    if (selectedDayIdx === null && firstAvailableIdx !== -1 && !loading) {
      setSelectedDayIdx(firstAvailableIdx);
    }
  }, [firstAvailableIdx, loading, selectedDayIdx]);

  // Fetch slots
  useEffect(() => {
    if (!cal) return;
    let cancelled = false;
    const fetchWeek = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const end = addDaysInTimeZone(weekStart, 7, TIMEZONE);
        const data = await fetchCachedSlots(cal.calendarId, weekStart, end);
        if (!cancelled) setSlotsByDay(data);
      } catch (e) {
        if (!cancelled) setLoadError("Couldn't load slots. Tap to retry.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWeek();
    const interval = window.setInterval(() => setRefreshNonce(n => n + 1), 60_000);
    const onFocus = () => setRefreshNonce(n => n + 1);
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.clearInterval(interval); window.removeEventListener("focus", onFocus); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, location, refreshNonce]);

  // Open review sheet when slot picked
  useEffect(() => {
    if (selectedSlot) {
      setReviewOpen(true);
      trackFunnelEvent("time_selected", { location: location ?? "" });
    }
  }, [selectedSlot, location]);

  // Build time slots for selected day
  const selectedDay = selectedDayIdx !== null ? dayCells[selectedDayIdx] : null;
  const rawTimes = selectedDayIdx !== null ? slotsByDay[ymd(days[selectedDayIdx])] || [] : [];
  const filteredTimes = selectedDay ? dropPastAndOutOfHours(selectedDay.date, rawTimes) : [];
  const timeSlots: TimeSlot[] = filteredTimes.map(iso => ({ iso, ...fmtTimeParts(iso) }));
  const groups = useMemo(() => groupSlots(timeSlots), [timeSlots]);

  // Next available
  const nextAvailable = useMemo(() => {
    if (firstAvailableIdx === -1) return null;
    const d = dayCells[firstAvailableIdx];
    const key = ymd(days[firstAvailableIdx]);
    const raw = slotsByDay[key] || [];
    const avail = dropPastAndOutOfHours(d.date, raw);
    if (!avail.length) return null;
    const { display, meridiem } = fmtTimeParts(avail[0]);
    return {
      idx: firstAvailableIdx,
      iso: avail[0],
      label: `${DOW_SHORT[d.date.getDay()]}, ${MONTHS_SHORT[d.date.getMonth()]} ${d.date.getDate()} · ${display} ${meridiem}`,
    };
  }, [firstAvailableIdx, dayCells, days, slotsByDay]);

  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSlotKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (!["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const cols = 3;
    const all = [...groups.morning, ...groups.afternoon, ...groups.evening];
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(all.length - 1, idx + (e.key === "ArrowRight" ? 1 : cols));
    if (e.key === "ArrowLeft" || e.key === "ArrowUp")   next = Math.max(0, idx - (e.key === "ArrowLeft" ? 1 : cols));
    slotRefs.current[next]?.focus();
  };

  // Confirm appointment
  const confirmCtl = useConfirmAppointment();

  const customFields = useMemo(() => ({
    ...(symptom     ? { mwc_symptom: symptom }                      : {}),
    ...(duration    ? { mwc_symptom_duration: duration }             : {}),
    ...(urgencyTier ? { mwc_urgency_tier: urgencyTier }              : {}),
    ...(note        ? { mwc_clinical_note: note.slice(0, 500) }      : {}),
    ...(service     ? { mwc_funnel_service: service }                : {}),
    ...(lpSlug      ? { mwc_lp_slug: lpSlug }                        : {}),
  }), [symptom, duration, urgencyTier, note, service, lpSlug]);

  const onCommit = useCallback(async () => {
    if (!selectedSlot || confirming) return;
    setConfirming(true);
    trackFunnelEvent("appointment_committed", { slot: selectedSlot, location: location ?? "" });
    if (!identity?.phone) {
      setAppointmentTime(selectedSlot);
      navigate("/book/confirmed", { state: { appointmentTime: selectedSlot } });
      return;
    }
    try {
      await confirmCtl.confirm({
        slotIso: selectedSlot,
        location: location as LocationKey,
        firstName, lastName,
        email: identity?.email,
        phone: identity.phone,
        source: source ?? "mwc-book-funnel",
        urgencyTier,
        customFields,
      });
    } catch {
      setConfirming(false);
    }
  }, [selectedSlot, confirming, location, firstName, lastName, identity, source, urgencyTier, customFields, setAppointmentTime, navigate, confirmCtl]);

  // Listen for GHL confirm success
  useEffect(() => {
    if (confirmCtl.booked && confirmCtl.slotIso) {
      setAppointmentTime(confirmCtl.slotIso);
      navigate("/book/confirmed", { state: { appointmentTime: confirmCtl.slotIso } });
    }
  }, [confirmCtl.booked, confirmCtl.slotIso, setAppointmentTime, navigate]);

  const onChangeTime = useCallback(() => {
    setReviewOpen(false);
    setSelectedSlot(null);
    setConfirming(false);
  }, []);

  // Day strip shows all 7 days — week nav arrows (above) handle week changes.

  const heading = firstName ? `${firstName}, lock in a time.` : "Lock in a time.";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // No location → show location picker
  if (!cal) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--brand-navy-deep)", fontFamily: "Montserrat, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "20px 16px 96px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
          <button type="button" onClick={() => navigate(-1)}
            style={{ background: "transparent", border: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 16, fontWeight: 600 }}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 28, color: "#fff", textTransform: "uppercase", fontWeight: 700 }}>
            Choose your center
          </h1>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.values(CENTER_CALENDARS).map(c => (
              <button key={c.key} type="button" onClick={() => setLocation(c.key)}
                style={{ padding: "14px 16px", borderRadius: 10, border: "1.5px solid #D1D5DB", background: "#fff", color: "#0B1029", fontSize: 16, fontWeight: 600, textAlign: "left", cursor: "pointer" }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <BookingErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-5xl px-4 sm:px-6 pt-5 pb-32 sm:pb-12">

          {/* Back */}
          <button type="button" onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-base font-semibold text-panel-foreground hover:text-primary -ml-2 px-2">
            <ArrowLeft className="h-5 w-5" aria-hidden /> Back
          </button>

          {/* Location row */}
          <div className="mt-4 flex items-center gap-3 min-h-[36px]">
            <MapPin className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden />
            <span className="font-display text-xl font-bold uppercase tracking-wide text-panel-foreground">
              {clinicCity ?? "Select center"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-panel-foreground leading-tight">
            {heading}
          </h1>
          <p className="mt-1 text-base" style={{ color: "var(--c-text-on-light-muted)" }}>60-minute consult. No charge today.</p>

          {/* Next available */}
          {nextAvailable && !selectedSlot && (
            <button type="button"
              onClick={() => { setSelectedDayIdx(nextAvailable.idx); setSelectedSlot(nextAvailable.iso); }}
              className="mt-2.5 inline-flex items-center gap-2 text-sm leading-tight text-panel-foreground hover:text-primary transition-colors">
              <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden />
              <span>
                Next: <span className="whitespace-nowrap" style={{ color: "var(--c-text-on-light-muted)" }}>{nextAvailable.label}</span>
                {" "}<span className="ml-1 font-display font-bold uppercase tracking-wide text-primary underline underline-offset-4">Lock in →</span>
              </span>
            </button>
          )}

          {/* Booking panel */}
          <section className="mt-3 overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card"
            aria-label="Choose your appointment day and time">

            {/* Week navigator */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-3">
              <button type="button"
                onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); setSelectedDayIdx(null); setDayWindowStart(0); }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-panel-border text-panel-foreground hover:border-primary hover:text-primary-hover"
                aria-label="Previous week">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-panel-foreground">
                {MONTHS_UPPER[days[0].getMonth()]} {days[0].getDate()} to {MONTHS_UPPER[days[6].getMonth()]} {days[6].getDate()}
              </h2>
              <button type="button"
                onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); setSelectedDayIdx(null); setDayWindowStart(0); }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-panel-border text-panel-foreground hover:border-primary hover:text-primary-hover"
                aria-label="Next week">
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* 5-day strip — first 5 days of the week, nav arrows handle prev/next */}
            <div className="px-4 sm:px-6 pb-4">
              <div role="radiogroup" aria-label="Day" className="grid grid-cols-5 gap-2">
                {dayCells.slice(0, 5).map((day, dayIdx) => (
                  <DayPill key={`${weekStart.getTime()}-${dayIdx}`}
                    day={day} selected={dayIdx === selectedDayIdx}
                    onSelect={() => { if (day.full || day.closed) return; setSelectedDayIdx(dayIdx); setSelectedSlot(null); trackFunnelEvent("date_selected", { location: location ?? "" }); }} />
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div className="px-4 sm:px-6 pb-5 space-y-5">
              {loading && (
                <p className="text-panel-muted text-sm font-semibold py-4 text-center">Loading availability…</p>
              )}
              {!loading && selectedDayIdx === null && (
                <p className="text-panel-muted text-sm font-semibold py-4 text-center">Pick a date above to see available times.</p>
              )}
              {!loading && selectedDayIdx !== null && timeSlots.length === 0 && (
                <p className="text-panel-muted text-sm font-semibold py-4 text-center">No times available for this day. Try another.</p>
              )}
              {loadError && (
                <p className="text-red-500 text-sm font-semibold py-2 text-center">{loadError}</p>
              )}
              {!loading && timeSlots.length > 0 && (
                <>
                  <SlotGroup title="Morning" slots={groups.morning} startIdx={0}
                    selected={selectedSlot} setSelected={setSelectedSlot}
                    slotRefs={slotRefs} onKey={handleSlotKey} />
                  <SlotGroup title="Afternoon" slots={groups.afternoon} startIdx={groups.morning.length}
                    selected={selectedSlot} setSelected={setSelectedSlot}
                    slotRefs={slotRefs} onKey={handleSlotKey} />
                  <SlotGroup title="Evening" slots={groups.evening} startIdx={groups.morning.length + groups.afternoon.length}
                    selected={selectedSlot} setSelected={setSelectedSlot}
                    slotRefs={slotRefs} onKey={handleSlotKey} />
                </>
              )}
            </div>
          </section>

          {/* Help line */}
          <a href={PHONE.tel}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-surface px-5 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity">
            <Phone className="h-5 w-5 text-primary" aria-hidden />
            Need help? Call {PHONE.display}
          </a>
        </main>

        {/* Mobile sticky CTA — only when no slot picked */}
        {!reviewOpen && (
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border-subtle bg-background/97 backdrop-blur px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.6)]">
            <button type="button" disabled
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-display font-bold uppercase tracking-wider text-base bg-disabled text-disabled-foreground cursor-not-allowed">
              Select a time
            </button>
          </div>
        )}

        {/* Review sheet */}
        {reviewOpen && selectedSlot && selectedDay && (
          <ReviewSheet
            firstName={firstName} slotIso={selectedSlot} day={selectedDay}
            onCommit={onCommit} onChangeTime={onChangeTime} confirming={confirming} />
        )}
      </div>
    </BookingErrorBoundary>
  );
}
