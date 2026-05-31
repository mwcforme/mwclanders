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
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, MapPin, Phone } from "lucide-react";
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

  // Scroll the day picker to center the selected day pill
  useEffect(() => {
    if (selectedDayIdx === null || !dayGroupRef.current) return;
    const el = dayGroupRef.current;
    const pill = el.children[selectedDayIdx] as HTMLElement | undefined;
    if (!pill) return;
    const pillCenter = pill.offsetLeft + pill.offsetWidth / 2;
    const containerCenter = el.offsetWidth / 2;
    el.scrollLeft = pillCenter - containerCenter;
  }, [selectedDayIdx]);

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
  const slotRefs    = useRef<(HTMLButtonElement | null)[]>([]);
  const dayGroupRef  = useRef<HTMLDivElement | null>(null);

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

  const heading = firstName ? `Lock in a time, ${firstName}.` : "Lock in a time.";

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── No location → show location picker ───────────────────────────────────
  if (!cal) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--brand-navy-deep)", fontFamily: "Inter, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "20px 16px 96px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
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
        <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-5xl px-4 sm:px-6 pt-5 pb-8">

          {/* Compact header */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-foreground uppercase tracking-[0.01em]">
            {heading}
          </h1>

          {/* Location drawer trigger — own line */}
          {locationData && (
            <button
              type="button"
              onClick={() => setDrawerOpen(o => !o)}
              aria-expanded={drawerOpen}
              aria-controls="location-drawer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-white/20 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
              {locationData.city}
              <ChevronDown
                className={`h-3.5 w-3.5 text-text-muted transition-transform duration-200 ${drawerOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          )}

          {/* Location drawer — sits under header, above calendar */}
          {locationData && (
            <div
              id="location-drawer"
              role="region"
              aria-label="Location details"
              className={`overflow-hidden rounded-2xl border border-border-subtle transition-all duration-300 ${
                drawerOpen ? "mt-3 max-h-96 opacity-100 bg-white" : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="px-5 py-4 space-y-3">
                {/* Location pill — matches booking popup style */}
                <div className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--brand-cta)" }} aria-hidden />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{locationData.name.replace("Men's Wellness Centers, ", "")} Center</p>
                    <p className="text-xs text-gray-600 mt-0.5">{locationData.fullAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationData.mapsQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    Directions
                  </a>
                  <a
                    href={locationData.phoneHref}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {locationData.phone}
                  </a>
                </div>
                <p className="text-xs text-gray-600">In-person &middot; 60 min &middot; Labs on-site</p>
              </div>
            </div>
          )}

          {/* Next available — inline chip */}
          {nextAvailable && !selectedSlot && (
            <button
              type="button"
              onClick={() => { setSelectedDayIdx(nextAvailable.idx); setSelectedSlot(nextAvailable.iso); }}
              aria-label={`Lock in next available time: ${nextAvailable.label}`}
              data-testid="button-next-available"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-white/20 transition-colors"
            >
              <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Next available: <span className="font-bold text-foreground">{nextAvailable.label}</span>
              <span className="text-text-muted" aria-hidden>&#8594;</span>
            </button>
          )}

          {/* Booking panel */}
          <section id="book" className="mt-4 overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card"
            aria-label="Choose your appointment day and time">

            {/* Week navigator */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-4">
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
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-panel-border text-panel-foreground hover:border-primary hover:text-primary-hover"
                data-testid="button-prev-week"
                aria-label="Previous week">
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-[0.12em] text-panel-foreground">
                {MONTHS_UPPER[days[0].getMonth()]} {days[0].getDate()} – {MONTHS_UPPER[days[6].getMonth()]} {days[6].getDate()}
              </h2>
              <button type="button"
                onClick={() => {
                  setWeekStart(addDaysInTimeZone(weekStart, 7, TIMEZONE));
                  setSelectedDayIdx(null);
                  setSelectedSlot(null);
                  setReviewOpen(false);
                }}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-panel-border text-panel-foreground hover:border-primary hover:text-primary-hover"
                data-testid="button-next-week"
                aria-label="Next week">
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </div>

            {/* 7-day strip — 4 visible at a time, scroll for rest */}
            <div ref={dayGroupRef} role="radiogroup" aria-label="Day"
              className="mt-3 flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 sm:px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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


            <div className="h-px bg-panel-divider" aria-hidden />
            {/* Time slots */}
            <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-7">
              {loading && (
                <p className="text-panel-muted text-sm font-semibold py-4 text-center">Loading availability…</p>
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
