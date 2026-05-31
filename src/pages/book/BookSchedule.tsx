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
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Phone, Star, ShieldCheck, Clock4, Lock } from "lucide-react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { useConfirmAppointment } from "@/domain/booking/useConfirmAppointment";
import { CENTER_CALENDARS, TIMEZONE, type LocationKey } from "@/lib/ghlCalendars";
import { LOCATIONS, LOCATION_KEY_TO_SLUG } from "@/data/locations";
import { PHONE } from "@/lib/constants";
import { addDaysInTimeZone, isSundayInTimeZone, ymdInTimeZone, dateFromYmdInTimeZone } from "@/lib/etDate";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
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

  const [searchParams] = useSearchParams();
  const isVariantB = searchParams.get("v") === "b";

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

          {/* ── HEADER — Variant A / Variant B ─────────────────────── */}
          {isVariantB ? (
            /* Variant B: Bold editorial */
            <div style={{ marginBottom: 4 }}>
              <p style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--brand-accent)",
                marginBottom: 8,
              }}>
                Your consultation awaits
              </p>
              <h1
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(2.4rem, 7vw, 3.5rem)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                  color: "var(--c-text-on-dark)",
                  margin: 0,
                }}
              >
                {firstName ? `${firstName}, take\ncontrol today.` : "Take\ncontrol today."}
              </h1>
              {/* Social proof badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 999,
                padding: "6px 14px",
              }}>
                <Star
                  style={{ width: 13, height: 13, fill: "var(--brand-accent)", color: "var(--brand-accent)", flexShrink: 0 }}
                  aria-hidden
                />
                <span style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.90)",
                  letterSpacing: "0.01em",
                }}>4.9 stars &middot; 400+ men seen this year</span>
              </div>
              {/* Location label */}
              {locationData && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 10,
                }}>
                  <MapPin style={{ width: 14, height: 14, color: "var(--brand-accent)", flexShrink: 0 }} aria-hidden />
                  <span style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.70)",
                  }}>{locationData.city} Men's Wellness Center</span>
                </div>
              )}
            </div>
          ) : (
            /* Variant A: Clean & confident */
            <div style={{ marginBottom: 4 }}>
              <p style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--brand-accent)",
                marginBottom: 8,
              }}>Almost done</p>
              <h1
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                  color: "var(--c-text-on-dark)",
                  margin: 0,
                }}
              >
                {heading}
              </h1>
              {locationData && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 8,
                }}>
                  <MapPin style={{ width: 13, height: 13, color: "var(--brand-accent)", flexShrink: 0 }} aria-hidden />
                  <span style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.65)",
                  }}>{locationData.city} Men's Wellness Center</span>
                </div>
              )}
            </div>
          )}

          {/* ── NEXT AVAILABLE — featured card ─────────────────────── */}
          {nextAvailable && !selectedSlot && (
            <div
              style={{
                marginTop: 20,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                borderLeft: "3px solid var(--brand-accent)",
                background: "rgba(255,255,255,0.07)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span
                  style={{ position: "relative", display: "flex", flexShrink: 0, width: 10, height: 10 }}
                  aria-hidden
                >
                  <span style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "var(--brand-accent)",
                    opacity: 0.75,
                    animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                  }} />
                  <span style={{
                    position: "relative",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--brand-accent)",
                    display: "inline-block",
                  }} />
                  <style>{`@keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }`}</style>
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--brand-accent)",
                    margin: 0,
                    marginBottom: 2,
                  }}>Next available</p>
                  <p style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--c-text-on-dark)",
                    margin: 0,
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{nextAvailable.label}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedDayIdx(nextAvailable.idx); setSelectedSlot(nextAvailable.iso); }}
                aria-label={`Lock in next available time: ${nextAvailable.label}`}
                data-testid="button-next-available"
                style={{
                  flexShrink: 0,
                  background: "var(--brand-cta)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(184,74,8,0.40)",
                  transition: "filter 0.15s ease, transform 0.12s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
              >
                Book This
              </button>
            </div>
          )}

          {/* ── TRUST STRIP ────────────────────────────────────────── */}
          <div style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }} aria-label="Trust signals">
            {[
              { Icon: Clock4,      label: "Same-week appts" },
              { Icon: ShieldCheck, label: "Labs on-site" },
              { Icon: MapPin,      label: "No commitment" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 999,
                  padding: "5px 11px",
                }}
              >
                <Icon style={{ width: 12, height: 12, color: "var(--brand-accent)", flexShrink: 0 }} aria-hidden />
                <span style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.75)",
                }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── BOOKING PANEL ──────────────────────────────────────── */}
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
                  loading={loading}
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

          {/* ── HELP LINE ─────────────────────────────────────────────── */}
          <a href={PHONE.tel}
            style={{
              marginTop: 20,
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 16,
              border: "1.5px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.75)",
              padding: "14px 20px",
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          >
            <Phone style={{ width: 16, height: 16, color: "var(--brand-accent)", flexShrink: 0 }} aria-hidden />
            Prefer to talk? Call {PHONE.display}
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
