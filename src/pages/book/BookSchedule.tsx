/**
 * /book/schedule — Step 2 of 2 (new funnel architecture).
 *
 * Features added per brief:
 * - Compact physician + address bar at top (moat signal, no separate step)
 * - Time-of-day filter chips (ALL / MORNING / AFTERNOON / EVENING)
 * - Inline email reveal after date + time selected (Rev 2.1 pattern)
 * - No-availability fallback (3 action chips — never a dead end)
 * - Capacity nudge (hidden by default, only shown when API confirms ≤3 slots)
 */

import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import GHLDayView from "@/components/book/GHLDayView";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { CENTER_CALENDARS, type LocationKey } from "@/lib/ghlCalendars";
import { LOCATIONS, LOCATION_KEY_TO_SLUG } from "@/data/locations";
import { PHONE } from "@/lib/constants";

// ─── Location lookup ─────────────────────────────────────────────────────────


const LOCATION_LABEL: Record<string, string> = {
  richmond: "Richmond Center",
  "virginia-beach": "Virginia Beach Center",
  "newport-news": "Newport News Center",
};


// ─── No-availability fallback ─────────────────────────────────────────────────

const NoAvailFallback = ({ onChangeCenter }: { onChangeCenter: () => void }) => (
  <div style={{
    // hardcoded-color-allow-next-line
    background: "rgba(255,107,122,0.06)",
    // hardcoded-color-allow-next-line
    border: "1px solid rgba(255,107,122,0.25)",
    borderRadius: 10, padding: 16,
    fontFamily: "Inter, sans-serif",
  }}>
    <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--brand-cream)", marginBottom: 8 }}>
      No times for this day
    </p>
    <p style={{ fontSize: 16, color: "rgba(245,243,240,0.85)", marginBottom: 16, fontWeight: 500, lineHeight: 1.6 }}>
      Try a different date or another Men's Wellness Centers location.
    </p>
    {/* Primary: try another center. Secondary: call us — not equal weight */}
    <button
      type="button"
      onClick={onChangeCenter}
      style={{
        display: "block", width: "100%", minHeight: 56,
        background: "var(--brand-cta)", border: "none",
        color: "#FFFFFF", borderRadius: 8, fontSize: 16, fontWeight: 700,
        fontFamily: "Inter, sans-serif", cursor: "pointer",
        padding: "12px 16px", marginBottom: 12,
        // hardcoded-color-allow-next-line
        boxShadow: "0 4px 16px rgba(232,103,10,0.35)",
      }}
    >
      Try Another Center
    </button>
    <p style={{ textAlign: "center", margin: 0 }}>
      <a
        href={PHONE.tel}
        style={{
          color: "rgba(245,243,240,0.70)", fontSize: 14, fontWeight: 600,
          fontFamily: "Inter, sans-serif", textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        Or call us: {PHONE.display}
      </a>
    </p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const BookSchedule = () => {
  const navigate = useNavigate();
  const identity = useBookingStore((s) => s.identity);
  const location = useBookingStore((s) => s.location);
  const symptom = useBookingStore((s) => s.symptom);
  const note = useBookingStore((s) => s.note);
  const duration = useBookingStore((s) => s.duration);
  const urgencyTier = useBookingStore((s) => s.urgencyTier);
  const service = useBookingStore((s) => s.service);
  const lpSlug = useBookingStore((s) => s.lpSlug);
  const source = useBookingStore((s) => s.source);
  const setLocation = useBookingStore((s) => s.setLocation);
  const setAppointmentTime = useBookingStore((s) => s.setAppointmentTime);
  const setIdentity = useBookingStore((s) => s.setIdentity);

  const firstName = identity?.firstName || "";
  const lastName = identity?.lastName || "";
  // PICK YOUR TIME — ≤4 words, Oswald uppercase. Personalised when firstName present.
  const heading = firstName ? `${firstName}, LOCK IN A TIME.` : "LOCK IN A TIME.";

  // Resolve location data for compact bar
  const locationSlug = location ? LOCATION_KEY_TO_SLUG[location] : null;
  const locationData = locationSlug ? LOCATIONS.find((l) => l.slug === locationSlug) : null;

  const customFields = {
    ...(symptom ? { mwc_symptom: symptom } : {}),
    ...(duration ? { mwc_symptom_duration: duration } : {}),
    ...(urgencyTier ? { mwc_urgency_tier: urgencyTier } : {}),
    ...(note ? { mwc_clinical_note: note.slice(0, 500) } : {}),
    ...(service ? { mwc_funnel_service: service } : {}),
    ...(lpSlug ? { mwc_lp_slug: lpSlug } : {}),
  };

  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [_bookedSlot, _setBookedSlot] = useState<string | null>(null);
  const [_emailCaptured, _setEmailCaptured] = useState(false);
  const handleNextAvailable = useCallback((iso: string | null) => setNextAvailable(iso), []);

  // Time-first label format: "Mon, May 25 · 11:00 AM" (no em-dash, no "at")
  const nextAvailableLabel = nextAvailable ? (() => {
    const d = new Date(nextAvailable);
    const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
    return `${day} · ${time}`;
  })() : null;

  const bookedSlotLabel = _bookedSlot ? (() => {
    const d = new Date(_bookedSlot);
    const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
    return `${day} · ${time}`;
  })() : null;

  const _emailRecap = bookedSlotLabel
    ? `${bookedSlotLabel} · ${LOCATION_LABEL[location ?? ""] ?? "MWC"} · 60-min Physician Assessment`
    : "";

  const _handleEmailComplete = (email: string) => {
    if (identity) setIdentity({ ...identity, email });
    _setEmailCaptured(true);
    if (_bookedSlot) {
      navigate("/book/confirmed", { state: { appointmentTime: _bookedSlot } });
    }
  };

  const _inlineEmailRef = useRef<HTMLDivElement>(null);

  return (
    <>{""}  
    <BookLayout page="schedule" title="Book Your Physician Assessment | Men's Wellness Centers">
      <div className="px-4 md:px-6 py-1 md:py-6 space-y-3 md:space-y-5 pb-24">

        {/* ── Progress + back ─────────────────────────────────────────────── */}
        <div className="mx-auto w-full" style={{ maxWidth: 720 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1"
            style={{
              background: "transparent", border: 0, color: "var(--c-text-on-dark)",
              fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 600,
              opacity: 0.85, cursor: "pointer", minHeight: 56, minWidth: 56,
              padding: "10px 12px", marginLeft: -12,
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} /> Back
          </button>

        </div>

        {/* ── Compact location line ────────────────────────────── */}
        {locationData && (
          <div className="mx-auto w-full" style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 4px" }}>
              <span style={{ fontFamily: "Montserrat, Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
                {locationData.name.replace("Men's Wellness Centers, ", "")}
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>·</span>
              <button
                type="button"
                onClick={() => navigate("/book/location")}
                style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, color: "var(--brand-cta)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* ── Identity zone (heading + trust line only — 2 text nodes max) ──── */}
        {/* DO NOT add instruction copy here — the day-picker grid is self-evident. */}
        <section className="mx-auto" style={{ maxWidth: 720 }}>
          <h1 style={{
            fontFamily: "Oswald, sans-serif", fontWeight: 700,
            fontSize: "clamp(22px, 4vw, 32px)", lineHeight: 1.1,
            letterSpacing: "0.02em", marginBottom: 6, color: "var(--c-text-on-dark)",
            textTransform: "uppercase",
          }}>
            {heading}
          </h1>

        </section>

        {/* ── Next available inline pill ─────────────────────────────────────── */}
        {nextAvailableLabel && (
          <div className="mx-auto w-full" style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 8px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand-cta)", flexShrink: 0, animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite" }} />
              <span style={{ fontFamily: "Montserrat, Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                Next available: {nextAvailableLabel}
              </span>
              <button
                type="button"
                onClick={() => document.querySelector<HTMLElement>('[aria-label="Pick a date and time"]')?.scrollIntoView({ behavior: "smooth", block: "start" })}
                style={{ marginLeft: "auto", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: "var(--brand-cta)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", whiteSpace: "nowrap" }}
              >
                Book →
              </button>
            </div>
          </div>
        )}

        {/* ── Calendar ───────────────────────────────────────────────────── */}
        <section className="mx-auto" aria-label="Pick a date and time" style={{ maxWidth: 720 }}>
          {location && location in CENTER_CALENDARS ? (
            <BookingErrorBoundary>
              <GHLDayView
                location={location as LocationKey}
                firstName={firstName}
                lastName={lastName}
                email={identity?.email}
                phone={identity?.phone}
                source={source || "mwc-book-funnel"}
                urgencyTier={urgencyTier}
                customFields={customFields}
                onNextAvailable={handleNextAvailable}
                onBooked={(slotIso) => {
                  setAppointmentTime(slotIso);
                  navigate("/book/confirmed", { state: { appointmentTime: slotIso } });
                }}
              />
            </BookingErrorBoundary>
          ) : (
            /* No location set — show center picker inline */
            <div style={{ background: "#161B3A", border: "1px solid #2B3247", borderRadius: 12, padding: 20, fontFamily: "Inter, sans-serif" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 12 }}>
                Choose your center
              </div>
              <div className="grid gap-2">
                {Object.values(CENTER_CALENDARS).map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setLocation(c.key)}
                    style={{
                      padding: "14px 16px", borderRadius: 8,
                      // hardcoded-color-allow-next-line
                      border: "1px solid #2B3247", background: "var(--brand-navy-deep)",
                      color: "var(--brand-cream)", fontSize: 16, fontWeight: 600,
                      textAlign: "left", cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {/* No-avail fallback pattern */}
              <div style={{ marginTop: 16 }}>
                <NoAvailFallback onChangeCenter={() => navigate("/book/location")} />
              </div>
            </div>
          )}
        </section>



        {/* ── Help line ──────────────────────────────────────────────────── */}
        <div className="mx-auto text-center" style={{ maxWidth: 720, color: "var(--c-text-on-dark)", fontSize: 16, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
          Need help?{" "}
          <a href={PHONE.tel} style={{ color: "var(--c-text-on-dark)", textDecoration: "underline", fontWeight: 600 }}>
            Call {PHONE.display}
          </a>
        </div>
      </div>
    </BookLayout>
    <style>{`@keyframes pulse { 50% { opacity: .5; } }`}</style>
  </>);
};

export default BookSchedule;
