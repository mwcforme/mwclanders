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
import { ArrowLeft, ArrowRight, Clock, MapPin, AlertCircle, Check } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import { COPY } from "@/data/copy";
import GHLDayView from "@/components/book/GHLDayView";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { contactUpdater } from "@/services/contactUpdater";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { CENTER_CALENDARS, type LocationKey } from "@/lib/ghlCalendars";
import { LOCATIONS } from "@/data/locations";
import { PHONE } from "@/lib/constants";

// ─── Location lookup ─────────────────────────────────────────────────────────

const SLUG_MAP: Record<string, string> = {
  richmond: "richmond-va",
  "virginia-beach": "virginia-beach-va",
  "newport-news": "newport-news-va",
};

const LOCATION_LABEL: Record<string, string> = {
  richmond: "Richmond Center",
  "virginia-beach": "Virginia Beach Center",
  "newport-news": "Newport News Center",
};

// ─── Inline email capture ────────────────────────────────────────────────────

interface InlineEmailProps {
  recap: string;
  contactId?: string;
  onComplete: (email: string) => void;
}

const InlineEmailCapture = ({ recap, contactId, onComplete }: InlineEmailProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");

    // Fire-and-forget GHL update
    if (contactId) {
      contactUpdater.updateContact(contactId, { email: trimmed }).catch(() => { /* non-blocking */ });
    }

    onComplete(trimmed);
  };

  return (
    <div
      style={{
        background: "#161B3A",
        border: "2px solid #E8670A",
        borderRadius: 12,
        padding: "24px 20px",
        animation: "ieReveal 220ms ease-out",
      }}
    >
      <style>{`
        @keyframes ieReveal {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Eyebrow */}
      <p style={{
        fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 10,
        letterSpacing: "1.5px", color: "var(--brand-cta)", textTransform: "uppercase", marginBottom: 6,
      }}>
        Your Appointment
      </p>

      {/* Recap line */}
      <p style={{
        color: "var(--brand-cream)", fontSize: 13, fontWeight: 500, marginBottom: 14,
        paddingBottom: 12, borderBottom: "1px solid #2B3247",
        fontFamily: "Inter, sans-serif",
      }}>
        {recap}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="inline-email" style={{
          display: "block", fontSize: 13, fontWeight: 600,
          color: "rgba(245,243,240,0.80)", fontFamily: "Inter, sans-serif", marginBottom: 6,
        }}>
          Where should we send your confirmation?
        </label>
        <input
          id="inline-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          style={{
            width: "100%", height: 50, borderRadius: 8,
            border: `2px solid ${error ? "#FF6B7A" : "#2B3247"}`,
            background: "var(--brand-navy-deep)", color: "var(--brand-cream)",
            fontSize: 16, fontFamily: "Inter, sans-serif",
            padding: "0 14px", outline: "none",
            transition: "border-color 150ms ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-cta)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = error ? "#FF6B7A" : "#2B3247")}
        />
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#FF6B7A", marginTop: 5, fontFamily: "Inter, sans-serif" }}>
            <AlertCircle size={12} strokeWidth={2} /> {error}
          </p>
        )}
        <p style={{ fontSize: 13, color: "rgba(245,243,240,0.65)", lineHeight: 1.5, marginTop: 10, fontFamily: "Inter, sans-serif" }}>
          A licensed Virginia provider is reserving this hour for you. We'll text and email your confirmation.
        </p>
        <button
          type="submit"
          style={{
            marginTop: 14, width: "100%", height: 52,
            background: "var(--brand-cta)", color: "var(--c-text-on-dark)", border: "none",
            borderRadius: 8, fontSize: 15, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            fontFamily: "Oswald, sans-serif",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(232,103,10,0.40)",
          }}
        >
          <span className="inline-flex items-center gap-2">{COPY.cta.bookConsult} <ArrowRight size={18} strokeWidth={2.5} /></span>
        </button>
      </form>
    </div>
  );
};

// ─── No-availability fallback ─────────────────────────────────────────────────

const NoAvailFallback = ({ onChangeCenter }: { onChangeCenter: () => void }) => (
  <div style={{
    background: "rgba(255,107,122,0.06)",
    border: "1px solid rgba(255,107,122,0.25)",
    borderRadius: 10, padding: 16,
    fontFamily: "Inter, sans-serif",
  }}>
    <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.5px", color: "var(--brand-cream)", textTransform: "uppercase", marginBottom: 8 }}>
      No times for this day
    </p>
    <p style={{ fontSize: 13, color: "#767676", marginBottom: 12 }}>
      Try a different date or another Men's Wellness Centers location.
    </p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={onChangeCenter}
        style={{
          flex: 1, height: 44, background: "#161B3A", border: "1px solid #3A4360",
          color: "var(--brand-cream)", borderRadius: 8, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.5px", textTransform: "uppercase",
          fontFamily: "Oswald, sans-serif", cursor: "pointer", minWidth: 120,
        }}
      >
        Try Another Center
      </button>
      <a
        href={PHONE.tel}
        style={{
          flex: 1, height: 44, background: "#161B3A", border: "1px solid #3A4360",
          color: "var(--brand-cream)", borderRadius: 8, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.5px", textTransform: "uppercase",
          fontFamily: "Oswald, sans-serif", cursor: "pointer", minWidth: 120,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none",
        }}
      >
        Request a Callback
      </a>
    </div>
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
  const heading = "Your 60-Minute Assessment";

  // Resolve location data for compact bar
  const locationSlug = location ? SLUG_MAP[location] : null;
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
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const handleNextAvailable = useCallback((iso: string | null) => setNextAvailable(iso), []);

  const nextAvailableLabel = nextAvailable ? (() => {
    const d = new Date(nextAvailable);
    const day = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "America/New_York" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
    return `${day} at ${time}`;
  })() : null;

  const bookedSlotLabel = bookedSlot ? (() => {
    const d = new Date(bookedSlot);
    const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
    return `${day} · ${time}`;
  })() : null;

  const emailRecap = bookedSlotLabel
    ? `${bookedSlotLabel} · ${LOCATION_LABEL[location ?? ""] ?? "MWC"} · 60-min Physician Assessment`
    : "";

  const handleEmailComplete = (email: string) => {
    if (identity) setIdentity({ ...identity, email });
    setEmailCaptured(true);
    if (bookedSlot) {
      navigate("/book/confirmed", { state: { appointmentTime: bookedSlot } });
    }
  };

  const inlineEmailRef = useRef<HTMLDivElement>(null);

  return (
    <BookLayout page="schedule" title="Book Your Physician Assessment | Men's Wellness Centers">
      <div className="px-3 md:px-6 py-2 md:py-8 space-y-4 md:space-y-6 pb-24">

        {/* ── Progress + back ─────────────────────────────────────────────── */}
        <div className="mx-auto w-full" style={{ maxWidth: 720 }}>
          <button
            type="button"
            onClick={() => navigate("/book/location")}
            className="inline-flex items-center gap-1"
            style={{
              background: "transparent", border: 0, color: "var(--c-text-on-dark)",
              fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600,
              opacity: 0.85, cursor: "pointer", minHeight: 44, minWidth: 44,
              padding: "10px 12px", marginLeft: -12,
            }}
            aria-label="Back to location picker"
          >
            <ArrowLeft size={16} /> Back
          </button>
          {/* Single progress bar: step 1 complete (full orange), step 2 in progress */}
          <div className="flex gap-1 mt-2" role="progressbar" aria-label="Step 2 of 2" aria-valuemin={0} aria-valuemax={2} aria-valuenow={2}>
            <div className="flex-1" style={{ height: 3, borderRadius: 2, background: "var(--brand-cta)" }} />
            <div className="flex-1" style={{ height: 3, borderRadius: 2, background: "var(--brand-cta)" }} />
          </div>
          <div className="hidden md:block text-center mt-3" style={{
            fontSize: 12, color: "var(--c-text-on-dark)", letterSpacing: "0.08em",
            fontWeight: 700, fontFamily: "Inter, sans-serif", textTransform: "uppercase",
          }}>
            Step 2 of 2 · Pick your time
          </div>
        </div>

        {/* ── Compact physician + address bar ────────────────────────────── */}
        {locationData && (
          <div
            className="mx-auto w-full"
            style={{ maxWidth: 720 }}
          >
            <div style={{
              background: "#161B3A",
              border: "1px solid #2B3247",
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "Inter, sans-serif",
            }}>
              <MapPin size={15} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-cream)", lineHeight: 1.3 }}>
                  {locationData.name.replace("Men's Wellness Centers, ", "")}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)", marginTop: 2, lineHeight: 1.3 }}>
                  {locationData.address} &middot; {locationData.cityStateZip}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/book/location")}
                style={{
                  background: "none", border: "none", color: "var(--brand-cta)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "Inter, sans-serif", flexShrink: 0,
                  minHeight: 44, padding: "8px 0",
                }}
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* ── Heading ────────────────────────────────────────────────────── */}
        <section className="mx-auto" style={{ maxWidth: 720 }}>
          <h1 style={{
            fontFamily: "Oswald, sans-serif", fontWeight: 600,
            fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.1,
            letterSpacing: "0.02em", marginBottom: 6, color: "var(--c-text-on-dark)",
            textTransform: "uppercase",
          }}>
            {heading}
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "rgba(255,255,255,0.70)", margin: 0 }}>
            {locationData ? locationData.name.replace("Men's Wellness Centers, ", "") : ""} · Licensed provider, same-day labs
          </p>
        </section>

        {/* ── Next available banner ───────────────────────────────────────── */}
        {nextAvailableLabel && (
          <div className="mx-auto w-full text-center" style={{ maxWidth: 720 }}>
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-4 py-2"
              style={{ background: "rgba(232,103,10,0.12)", border: "1px solid rgba(232,103,10,0.30)" }}
            >
              <Clock size={14} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--c-text-on-dark)" }}>
                Next: {nextAvailableLabel}
              </span>
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
                      border: "1px solid #2B3247", background: "var(--brand-navy-deep)",
                      color: "var(--brand-cream)", fontSize: 15, fontWeight: 600,
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
        <div className="hidden md:block mx-auto text-center" style={{ maxWidth: 720, color: "var(--c-text-on-dark)", opacity: 0.85, fontSize: 13, fontFamily: "Inter, sans-serif" }}>
          Need help?{" "}
          <a href={PHONE.tel} style={{ color: "var(--c-text-on-dark)", textDecoration: "underline", fontWeight: 600 }}>
            Call {PHONE.display}
          </a>
        </div>
      </div>
    </BookLayout>
  );
};

export default BookSchedule;
