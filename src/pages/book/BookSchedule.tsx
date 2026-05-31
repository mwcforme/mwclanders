/**
 * BookSchedule — PickTime UI wired to real Supabase slot data.
 *
 * Sub-components extracted to:
 *   src/components/book/DayPill.tsx
 *   src/components/book/SlotGroup.tsx
 *   src/components/book/ReviewSheet.tsx
 * Slot fetching extracted to:
 *   src/hooks/useSlotFetching.ts
 * Shared utils/types:
 *   src/lib/scheduleUtils.ts
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, MapPin, Phone } from "lucide-react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { useConfirmAppointment } from "@/domain/booking/useConfirmAppointment";
import { CENTER_CALENDARS, TIMEZONE, type LocationKey } from "@/lib/ghlCalendars";
import { LOCATIONS, LOCATION_KEY_TO_SLUG } from "@/data/locations";
import { PHONE } from "@/lib/constants";
import { addDaysInTimeZone, isSundayInTimeZone, ymdInTimeZone, dateFromYmdInTimeZone } from "@/lib/etDate";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { Lock } from "lucide-react";
import { DayPill } from "@/components/book/DayPill";
import { SlotGroup } from "@/components/book/SlotGroup";
import { ReviewSheet } from "@/components/book/ReviewSheet";
import { useSlotFetching } from "@/hooks/useSlotFetching";
import {
  MONTHS_UPPER, DOW_SHORT, MONTHS_SHORT,
  dropPastAndOutOfHours, fmtTimeParts, groupSlots, ymd,
  type DayCell,
} from "@/lib/scheduleUtils";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookSchedule() {
  const navigate = useNavigate();

  // ── Store ──────────────────────────────────────────────────────────────────
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

  // ── Week state ─────────────────────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState(() => {
    // Always anchor weekStart to today's date in US Eastern time.
    // new Date() + setHours(0,0,0,0) uses the device's local timezone which
    // is wrong for users in UTC or other timezones. Use ET-aware date instead.
    const todayYmdET = ymdInTimeZone(new Date(), TIMEZONE);
    return dateFromYmdInTimeZone(todayYmdET, TIMEZONE);
  });

  // ── Slot fetching (OPT 2 extracted hook; BUG 4 fix inside hook) ────────────
  const { slotsByDay, loading, loadError } = useSlotFetching(
    cal?.calendarId ?? null,
    location ?? null,
    weekStart,
  );

  // ── Build 7-day array ──────────────────────────────────────────────────────
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDaysInTimeZone(weekStart, i, TIMEZONE)),
    [weekStart],
  );

  // ── Build DayCell array (OPT 5: useMemo) ──────────────────────────────────
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

  // Auto-select first available day once slots load (BUG 5: guard already present)
  useEffect(() => {
    if (selectedDayIdx === null && firstAvailableIdx !== -1 && !loading) {
      setSelectedDayIdx(firstAvailableIdx);
    }
  }, [firstAvailableIdx, loading, selectedDayIdx]);

  // Open review sheet when slot picked
  useEffect(() => {
    if (selectedSlot) {
      setReviewOpen(true);
      trackFunnelEvent("time_selected", { location: location ?? "" });
    }
  }, [selectedSlot, location]);

  // ── Time slots for selected day ────────────────────────────────────────────
  const selectedDay = selectedDayIdx !== null ? dayCells[selectedDayIdx] : null;
  const rawTimes    = selectedDayIdx !== null ? slotsByDay[ymd(days[selectedDayIdx])] || [] : [];
  const filteredTimes = selectedDay ? dropPastAndOutOfHours(selectedDay.date, rawTimes) : [];
  const timeSlots = filteredTimes.map(iso => ({ iso, ...fmtTimeParts(iso) }));
  const groups    = useMemo(() => groupSlots(timeSlots), [timeSlots]);

  // ── Next available label ───────────────────────────────────────────────────
  const nextAvailable = useMemo(() => {
    if (firstAvailableIdx === -1) return null;
    const d   = dayCells[firstAvailableIdx];
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

  // ── Keyboard navigation for slot grid ─────────────────────────────────────
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSlotKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (!["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const cols = 3;
    const all = [...groups.morning, ...groups.afternoon, ...groups.evening];
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(all.length - 1, idx + (e.key === "ArrowRight" ? 1 : cols));
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   next = Math.max(0, idx - (e.key === "ArrowLeft" ? 1 : cols));
    slotRefs.current[next]?.focus();
  };

  // ── Confirm appointment hook ───────────────────────────────────────────────
  const confirmCtl = useConfirmAppointment({
    onBooked: useCallback((slotIso: string) => {
      setAppointmentTime(slotIso);
      navigate("/book/confirmed", { state: { appointmentTime: slotIso } });
    }, [setAppointmentTime, navigate]),
  });

  // OPT 6 fix: Destructure confirmCtl before useCallback so onCommit is NOT recreated
  // on every render (confirmCtl itself is a new object reference every render).
  const {
    confirm: confirmBooking,
    isSubmitting: hookSubmitting,
    error: bookingError,
    redirect: bookingRedirect,
  } = confirmCtl;

  const customFields = useMemo(() => ({
    ...(symptom     ? { mwc_symptom: symptom }                 : {}),
    ...(duration    ? { mwc_symptom_duration: duration }        : {}),
    ...(urgencyTier ? { mwc_urgency_tier: urgencyTier }         : {}),
    ...(note        ? { mwc_clinical_note: note.slice(0, 500) } : {}),
    ...(service     ? { mwc_funnel_service: service }           : {}),
    ...(lpSlug      ? { mwc_lp_slug: lpSlug }                   : {}),
  }), [symptom, duration, urgencyTier, note, service, lpSlug]);

  const onCommit = useCallback(async (capturedEmail?: string) => {
    if (!selectedSlot || confirming) return;
    setConfirming(true);
    trackFunnelEvent("appointment_committed", { slot: selectedSlot, location: location ?? "" });
    // MWC-005: use captured email from ReviewSheet if provided, fall back to stored identity email
    const emailToUse = capturedEmail || identity?.email;
    if (!identity?.phone) {
      setAppointmentTime(selectedSlot);
      navigate("/book/confirmed", { state: { appointmentTime: selectedSlot } });
      return;
    }
    const ok = await confirmBooking({
      slotIso: selectedSlot,
      location: location as LocationKey,
      firstName, lastName,
      email: emailToUse,
      phone: identity.phone,
      source: source ?? "mwc-book-funnel",
      urgencyTier,
      customFields,
    });
    if (!ok) setConfirming(false);
  }, [selectedSlot, confirming, location, firstName, lastName, identity, source, urgencyTier, customFields, setAppointmentTime, navigate, confirmBooking]);

  const onChangeTime = useCallback(() => {
    setReviewOpen(false);
    setSelectedSlot(null);
    setConfirming(false);
  }, []);

  const heading = firstName ? `${firstName}, lock in a time.` : "Lock in a time.";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── No location → show location picker ───────────────────────────────────
  if (!cal) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--brand-navy-deep)", fontFamily: "Inter, sans-serif" }}>
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
        <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-5xl px-4 sm:px-6 pt-5 pb-40 sm:pb-12">

          {/* Back */}
          <button type="button" onClick={() => navigate(-1)}
            data-testid="button-back"
            className="inline-flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary -ml-2 px-2 min-h-[48px]">
            <ArrowLeft className="h-5 w-5" aria-hidden />
            Back
          </button>

          {/* Hero */}
          <div className="mt-7">
            <h1 className="font-display text-[34px] sm:text-5xl font-bold leading-[1.1] text-foreground uppercase tracking-[0.01em]">
              {heading}
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-foreground">
              {clinicCity ? `${clinicCity}.` : "Select center."}
            </p>
            <p className="mt-1 text-base sm:text-lg text-text-muted">
              60-minute consult. No charge today.
            </p>
          </div>

          {/* Next available — prominent card */}
          {nextAvailable && !selectedSlot && (
            <button type="button"
              onClick={() => { setSelectedDayIdx(nextAvailable.idx); setSelectedSlot(nextAvailable.iso); }}
              aria-label={`Lock in next available time: ${nextAvailable.label}`}
              data-testid="button-next-available"
              className="mt-6 group flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 w-full rounded-xl border-2 border-border-subtle bg-surface px-5 py-4 text-left hover:border-primary hover:bg-surface-2 transition-colors min-h-[60px]">
              <span className="flex items-center gap-3 min-w-0">
                <span className="relative flex h-3 w-3 flex-shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
                <span className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                  Next available: <span className="text-text-muted">{nextAvailable.label}</span>
                </span>
              </span>
              <span className="flex-shrink-0 inline-flex items-center gap-2 font-display text-base font-bold uppercase tracking-wide text-primary-hover group-hover:text-primary transition-colors">
                <Lock className="h-4 w-4" aria-hidden />
                Lock in <span aria-hidden>&#8594;</span>
              </span>
            </button>
          )}

          {/* Booking panel */}
          <section id="book" className="mt-7 overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card"
            aria-label="Choose your appointment day and time">

            {/* Week navigator */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-5">
              <button type="button"
                onClick={() => {
                  const prevStart = addDaysInTimeZone(weekStart, -7, TIMEZONE);
                  const todayYmdET = ymdInTimeZone(new Date(), TIMEZONE);
                  const prevEndYmd = ymdInTimeZone(addDaysInTimeZone(prevStart, 6, TIMEZONE), TIMEZONE);
                  if (prevEndYmd < todayYmdET) return;
                  setWeekStart(prevStart);
                  setSelectedDayIdx(null);
                  setSelectedSlot(null);
                  setReviewOpen(false);
                }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-panel-border text-panel-foreground hover:border-primary hover:text-primary-hover"
                data-testid="button-prev-week"
                aria-label="Previous week">
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <h2 className="font-display text-base sm:text-lg font-semibold uppercase tracking-[0.15em] text-panel-foreground">
                {MONTHS_UPPER[days[0].getMonth()]} {days[0].getDate()} – {MONTHS_UPPER[days[6].getMonth()]} {days[6].getDate()}
              </h2>
              <button type="button"
                onClick={() => {
                  setWeekStart(addDaysInTimeZone(weekStart, 7, TIMEZONE));
                  setSelectedDayIdx(null);
                  setSelectedSlot(null);
                  setReviewOpen(false);
                }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-panel-border text-panel-foreground hover:border-primary hover:text-primary-hover"
                data-testid="button-next-week"
                aria-label="Next week">
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </div>

            {/* 7-day strip — horizontal scroll on mobile */}
            <div role="radiogroup" aria-label="Day"
              className="mt-4 flex sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto sm:overflow-visible scroll-smooth snap-x snap-mandatory px-4 sm:px-6 pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {dayCells.map((day, dayIdx) => (
                <DayPill
                  key={`${weekStart.getTime()}-${dayIdx}`}
                  day={day}
                  selected={dayIdx === selectedDayIdx}
                  onSelect={() => {
                    if (day.full || day.closed) return;
                    setSelectedDayIdx(dayIdx);
                    setSelectedSlot(null);
                    trackFunnelEvent("date_selected", { location: location ?? "" });
                  }}
                />
              ))}
            </div>
            <p className="sm:hidden -mt-2 mb-2 text-center text-sm text-panel-muted">Swipe to see more days</p>

            <div className="h-px bg-panel-divider" aria-hidden />
            {/* Time slots */}
            <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-7">
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
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border text-foreground px-5 py-4">
            <Phone className="h-5 w-5 text-primary" aria-hidden />
            Need help? Call {PHONE.display}
          </a>
        </main>

        {/* Mobile sticky CTA — only when no slot picked */}
        {!reviewOpen && (
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border-subtle bg-background/97 backdrop-blur px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.6)]">
            <button type="button" disabled
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-5 font-display font-bold uppercase tracking-wider text-lg transition-colors bg-disabled text-disabled-foreground cursor-not-allowed">
              Select a time
            </button>
          </div>
        )}

        {reviewOpen && selectedSlot && selectedDay && (
          <ReviewSheet
            firstName={firstName}
            slotIso={selectedSlot}
            day={selectedDay}
            onCommit={onCommit}
            onChangeTime={onChangeTime}
            confirming={hookSubmitting || confirming}  // BUG 2 fix: source of truth from hook
            error={bookingError}                       // BUG 1 fix: surface error to user
            redirect={bookingRedirect}                 // BUG 1 fix: show redirect countdown
            locationLabel={cal?.label ?? null}
            locationAddress={locationData?.fullAddress ?? null}
          />
        )}
      </div>
    </BookingErrorBoundary>
  );
}
