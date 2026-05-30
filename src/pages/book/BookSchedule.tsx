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
import { BookHeader } from "@/components/book/BookHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
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

  const onCommit = useCallback(async () => {
    if (!selectedSlot || confirming) return;
    setConfirming(true);
    trackFunnelEvent("appointment_committed", { slot: selectedSlot, location: location ?? "" });
    if (!identity?.phone) {
      setAppointmentTime(selectedSlot);
      navigate("/book/confirmed", { state: { appointmentTime: selectedSlot } });
      return;
    }
    const ok = await confirmBooking({
      slotIso: selectedSlot,
      location: location as LocationKey,
      firstName, lastName,
      email: identity?.email,
      phone: identity.phone,
      source: source ?? "mwc-book-funnel",
      urgencyTier,
      customFields,
    });
    // BUG 2 fix: only clear local confirming — button disabled is driven by
    // hookSubmitting || confirming, so hook reset will also release the button.
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
        <BookHeader />
        <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-5xl px-4 sm:px-6 pt-14 pb-32 sm:pb-12">

          {/* ── Page header ── */}
          <div className="mb-4">

            {/* Back + location breadcrumb */}
            <div className="flex items-center gap-2 mb-4">
              <button type="button" onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 text-sm font-semibold hover:text-primary -ml-1 px-1 py-1"
                style={{ color: "rgba(255,255,255,0.70)" }}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </button>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.70)" }}>
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
                {clinicCity ?? "Select center"}
              </span>
            </div>

            {/* Headline — calm, clear */}
            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight leading-tight" style={{ color: "#FFFFFF" }}>
              {firstName ? `Choose a time, ${firstName}.` : "Choose your appointment time."}
            </h1>

            {/* Visit type — 3 small inline chips, no wrapping pill */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["In-person visit", "60 minutes", "Labs on-site"].map(tag => (
                <span key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: "rgba(232,103,10,0.12)", border: "1px solid rgba(232,103,10,0.30)", color: "rgba(255,255,255,0.88)" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden />
                  {tag}
                </span>
              ))}
            </div>

            {/* Next available shortcut */}
            {nextAvailable && !selectedSlot && (
              <button type="button"
                onClick={() => { setSelectedDayIdx(nextAvailable.idx); setSelectedSlot(nextAvailable.iso); }}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
                style={{ color: "rgba(255,255,255,0.60)" }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden />
                Next available: <span className="font-semibold ml-1" style={{ color: "rgba(255,255,255,0.85)" }}>{nextAvailable.label}</span>
              </button>
            )}

            {/* Subtle trust line */}
            <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.40)", fontFamily: "Inter, sans-serif" }}>
              4.9 ★ 191 Google reviews &middot; 10,000+ Virginia members &middot; All times ET
            </p>
          </div>

          {/* Booking panel */}
          <section className="mt-2 overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card"
            aria-label="Choose your appointment day and time">

            {/* Week navigator */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-3 pb-2">
              <button type="button"
                onClick={() => {
                  // Don't allow navigating to weeks entirely in the past
                  const prevStart = addDaysInTimeZone(weekStart, -7, TIMEZONE);
                  const todayYmdET = ymdInTimeZone(new Date(), TIMEZONE);
                  const prevEndYmd = ymdInTimeZone(addDaysInTimeZone(prevStart, 6, TIMEZONE), TIMEZONE);
                  if (prevEndYmd < todayYmdET) return; // entire week is past
                  setWeekStart(prevStart);
                  setSelectedDayIdx(null);
                  setSelectedSlot(null);
                  setReviewOpen(false);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-panel-border text-panel-foreground hover:border-primary hover:text-primary-hover"
                aria-label="Previous week">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-panel-foreground">
                {MONTHS_UPPER[days[0].getMonth()]} {days[0].getDate()} to {MONTHS_UPPER[days[6].getMonth()]} {days[6].getDate()}
              </h2>
              <button type="button"
                onClick={() => {
                  setWeekStart(addDaysInTimeZone(weekStart, 7, TIMEZONE));
                  setSelectedDayIdx(null);
                  setSelectedSlot(null);
                  setReviewOpen(false);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-panel-border text-panel-foreground hover:border-primary hover:text-primary-hover"
                aria-label="Next week">
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* 5-day strip */}
            <div className="px-4 sm:px-6 pb-3">
              <div role="radiogroup" aria-label="Day" className="grid grid-cols-5 gap-2">
                {dayCells.slice(0, 5).map((day, dayIdx) => (
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
        <TRTFooter />

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
