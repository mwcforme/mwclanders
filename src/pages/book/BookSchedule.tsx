import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock as LockIcon } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import GHLDayView from "@/components/book/GHLDayView";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { CENTER_CALENDARS, type LocationKey } from "@/lib/ghlCalendars";
import { LOCATIONS, LOCATION_KEY_TO_SLUG } from "@/data/locations";
import { PHONE } from "@/lib/constants";
import { COLORS, FONTS, formatSlotLabel } from "@/lib/bookingTokens";

// ─── Sub-components ───────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      style={{
        background: "transparent", border: 0, cursor: "pointer",
        padding: "8px 0", display: "inline-flex", alignItems: "center",
        gap: 6, fontFamily: FONTS.body, fontSize: 16, fontWeight: 600,
        color: "var(--c-text-on-dark)",
      }}
    >
      <ArrowLeft size={18} /> Back
    </button>
  );
}

function ScheduleHeading({
  heading,
  locationName,
  onChangeLocation,
}: {
  heading: string;
  locationName: string | null;
  onChangeLocation: () => void;
}) {
  return (
    <section style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
      <h1 style={{
        fontFamily: FONTS.display, fontWeight: 700,
        fontSize: 34, lineHeight: 1.05,
        letterSpacing: "0.02em", marginBottom: 8,
        color: "#FFFFFF", textTransform: "uppercase",
      }}>
        {heading}
      </h1>

      {locationName && (
        <p style={{ fontFamily: FONTS.body, fontSize: 19.125, fontWeight: 400, color: "#FFFFFF", marginBottom: 2, lineHeight: 1.5 }}>
          {locationName}.
        </p>
      )}

      <p style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 400, color: "#CBD5E1", marginBottom: 0 }}>
        60-minute consult. No charge today.
      </p>
    </section>
  );
}

function NextAvailableBanner({ label, onLockIn }: { label: string; onLockIn: () => void }) {
  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
      {/* Mockup: stacked layout, banner is fully clickable, ~119px tall */}
      <button
        type="button"
        onClick={onLockIn}
        style={{
          width: "100%",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          gap: 14,
          background: COLORS.bannerBg, border: `1px solid ${COLORS.glassBorder}`,
          borderRadius: 12, padding: "20px 20px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.30)",
          cursor: "pointer", textAlign: "left",
        }}
      >
        {/* Top row: dot + next available text */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: COLORS.orange, flexShrink: 0,
            animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
          }} />
          <span style={{ fontFamily: FONTS.ui, fontSize: 17, color: "#fff", fontWeight: 600 }}>
            <strong>Next available:</strong> {label}
          </span>
        </div>
        {/* Bottom row: LOCK IN → with lock icon — matches mockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <LockIcon size={15} strokeWidth={2.5} style={{ color: "#C34A09" }} aria-hidden />
          <span style={{
            fontFamily: FONTS.ui, fontSize: 17, fontWeight: 700,
            // hardcoded-color-allow-next-line — mockup: rgb(195,74,9)
            color: "#C34A09", letterSpacing: "0.06em",
          }}>
            LOCK IN →
          </span>
        </div>
      </button>
    </div>
  );
}

function LocationPicker({ onSelect, onNoAvail }: { onSelect: (key: string) => void; onNoAvail: () => void }) {
  return (
    <div style={{
      background: COLORS.cardBg, border: "1px solid #E5E7EB",
      borderRadius: 16, padding: 20, fontFamily: FONTS.body,
      boxShadow: COLORS.panelShadow,
    }}>
      <p style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 12 }}>
        Choose your center
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.values(CENTER_CALENDARS).map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onSelect(c.key)}
            style={{
              padding: "14px 16px", borderRadius: 10,
              border: "1.5px solid #D1D5DB",
              background: COLORS.cardBg,
              color: COLORS.navyInk, fontSize: 16, fontWeight: 600,
              textAlign: "left", cursor: "pointer", fontFamily: FONTS.body,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <NoAvailFallback onChangeCenter={onNoAvail} />
      </div>
    </div>
  );
}

function NoAvailFallback({ onChangeCenter }: { onChangeCenter: () => void }) {
  return (
    <div style={{
      background: "rgba(255,107,122,0.06)",
      border: "1px solid rgba(255,107,122,0.25)",
      borderRadius: 10, padding: 16, fontFamily: FONTS.body,
    }}>
      <p style={{ fontWeight: 700, fontSize: 16, color: "var(--brand-cream)", marginBottom: 8 }}>
        No times for this day
      </p>
      <p style={{ fontSize: 16, color: "rgba(245,243,240,0.85)", marginBottom: 16, fontWeight: 500, lineHeight: 1.6 }}>
        Try a different date or another Men's Wellness Centers location.
      </p>
      <button
        type="button"
        onClick={onChangeCenter}
        style={{
          display: "block", width: "100%", minHeight: 56,
          background: COLORS.orange, border: "none",
          color: "#FFFFFF", borderRadius: 8, fontSize: 16, fontWeight: 700,
          fontFamily: FONTS.body, cursor: "pointer", padding: "12px 16px", marginBottom: 12,
          boxShadow: "0 4px 16px rgba(232,103,10,0.35)",
        }}
      >
        Try Another Center
      </button>
      <p style={{ textAlign: "center", margin: 0 }}>
        <a href={PHONE.tel} style={{ color: "rgba(245,243,240,0.70)", fontSize: 14, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
          Or call us: {PHONE.display}
        </a>
      </p>
    </div>
  );
}

function HelpBar() {
  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
      <a
        href={PHONE.tel}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          minHeight: 52, borderRadius: 12,
          background: COLORS.glassBg, border: `1px solid ${COLORS.glassBorder}`,
          fontFamily: FONTS.body, fontSize: 19.125, fontWeight: 600,
          color: "#FFFFFF", textDecoration: "none",
        }}
      >
        Need help? Call {PHONE.display}
      </a>
    </div>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScheduleState() {
  const location    = useBookingStore((s) => s.location);
  const identity    = useBookingStore((s) => s.identity);
  const symptom     = useBookingStore((s) => s.symptom);
  const note        = useBookingStore((s) => s.note);
  const duration    = useBookingStore((s) => s.duration);
  const urgencyTier = useBookingStore((s) => s.urgencyTier);
  const service     = useBookingStore((s) => s.service);
  const lpSlug      = useBookingStore((s) => s.lpSlug);
  const source      = useBookingStore((s) => s.source);
  const setLocation        = useBookingStore((s) => s.setLocation);
  const setAppointmentTime = useBookingStore((s) => s.setAppointmentTime);

  const firstName = identity?.firstName ?? "";
  const lastName  = identity?.lastName  ?? "";

  const heading = firstName ? `${firstName}, LOCK IN A TIME.` : "LOCK IN A TIME.";

  const locationSlug = location ? LOCATION_KEY_TO_SLUG[location] : null;
  const locationData = locationSlug ? LOCATIONS.find((l) => l.slug === locationSlug) : null;
  const locationName = locationData?.name.replace("Men's Wellness Centers, ", "") ?? null;

  const customFields = {
    ...(symptom     ? { mwc_symptom:          symptom              } : {}),
    ...(duration    ? { mwc_symptom_duration:  duration             } : {}),
    ...(urgencyTier ? { mwc_urgency_tier:      urgencyTier          } : {}),
    ...(note        ? { mwc_clinical_note:     note.slice(0, 500)   } : {}),
    ...(service     ? { mwc_funnel_service:    service              } : {}),
    ...(lpSlug      ? { mwc_lp_slug:           lpSlug               } : {}),
  };

  return {
    location, identity, source, urgencyTier,
    firstName, lastName, heading, locationName,
    customFields, setLocation, setAppointmentTime,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const BookSchedule = () => {
  const navigate = useNavigate();
  const store = useScheduleState();

  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const handleNextAvailable = useCallback((iso: string | null) => setNextAvailable(iso), []);
  const nextAvailableLabel  = nextAvailable ? formatSlotLabel(nextAvailable) : null;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scrollToCalendar = () =>
    document.querySelector<HTMLElement>('[aria-label="Pick a date and time"]')
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const { location, identity, source, urgencyTier, firstName, lastName, heading, locationName, customFields, setLocation, setAppointmentTime } = store;
  const hasCalendar = Boolean(location && location in CENTER_CALENDARS);

  return (
    <>
      <BookLayout page="schedule" variant="confirmation" title="Book Your Physician Assessment | Men's Wellness Centers">
        <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "20px 16px 96px" }}>

          <div style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
            <BackButton onClick={() => navigate(-1)} />
          </div>

          <ScheduleHeading
            heading={heading}
            locationName={locationName}
            onChangeLocation={() => navigate("/book/location")}
          />

          {nextAvailableLabel && (
            <NextAvailableBanner label={nextAvailableLabel} onLockIn={scrollToCalendar} />
          )}

          <section
            aria-label="Pick a date and time"
            style={{ maxWidth: 720, width: "100%", margin: "0 auto", marginTop: 8 }}
          >
            {hasCalendar ? (
              <BookingErrorBoundary>
                <GHLDayView
                  location={location as LocationKey}
                  firstName={firstName}
                  lastName={lastName}
                  email={identity?.email}
                  phone={identity?.phone}
                  source={source ?? "mwc-book-funnel"}
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
              <LocationPicker
                onSelect={(key) => setLocation(key)}
                onNoAvail={() => navigate("/book/location")}
              />
            )}
          </section>

          <HelpBar />
        </div>
      </BookLayout>
      <style>{`@keyframes pulse { 50% { opacity: .5; } }`}</style>
    </>
  );
};

export default BookSchedule;
