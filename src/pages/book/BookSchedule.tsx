import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import GHLDayView from "@/components/book/GHLDayView";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { CENTER_CALENDARS, type LocationKey } from "@/lib/ghlCalendars";

const LOCATION_LABEL: Record<string, string> = {
  richmond: "Richmond clinic",
  "virginia-beach": "Virginia Beach clinic",
  "newport-news": "Newport News clinic",
};

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

  const firstName = identity?.firstName || "";
  const lastName = identity?.lastName || "";
  const heading = firstName ? `${firstName}, pick a time.` : "Pick a time.";

  const locationLine = location ? LOCATION_LABEL[location] : null;
  // metaLine removed — replaced by inline header row on schedule page

  const customFields = {
    ...(symptom ? { mwc_symptom: symptom } : {}),
    ...(duration ? { mwc_symptom_duration: duration } : {}),
    ...(urgencyTier ? { mwc_urgency_tier: urgencyTier } : {}),
    ...(note ? { mwc_clinical_note: note.slice(0, 500) } : {}),
    ...(service ? { mwc_funnel_service: service } : {}),
    ...(lpSlug ? { mwc_lp_slug: lpSlug } : {}),
  };

  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const handleNextAvailable = useCallback((iso: string | null) => setNextAvailable(iso), []);

  // Format next-available slot for display
  const nextAvailableLabel = nextAvailable ? (() => {
    const d = new Date(nextAvailable);
    const day = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "America/New_York" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
    return `${day} at ${time}`;
  })() : null;

  return (
    <BookLayout page="schedule" title="Pick your consult time | Men's Wellness Centers">
      <div className="px-3 md:px-6 py-2 md:py-8 space-y-4 md:space-y-6 pb-12">

        <div className="mx-auto w-full" style={{ maxWidth: 720 }}>
          <button
            type="button"
            onClick={() => navigate("/book/location")}
            className="inline-flex items-center gap-1"
            style={{
              background: "transparent", border: 0, color: "#FFFFFF",
              fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600,
              opacity: 0.85, cursor: "pointer", minHeight: 44, minWidth: 44,
              padding: "10px 12px", marginLeft: -12,
            }}
            aria-label="Back to previous step"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex gap-1 mt-2" role="progressbar" aria-label="Step 3 of 3" aria-valuemin={0} aria-valuemax={3} aria-valuenow={3}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1" style={{ height: 3, borderRadius: 2, background: "#E8670A" }} />
            ))}
          </div>
          <div className="hidden md:block text-center mt-3" style={{ fontSize: 12, color: "#FFFFFF", letterSpacing: "0.08em", fontWeight: 700, fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>
            Step 3 of 3 · Pick your time
          </div>
        </div>

          <>
            <section className="mx-auto text-center" style={{ maxWidth: 720, color: "#FFFFFF" }}>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "clamp(20px, 2.6vw, 28px)", lineHeight: 1.15, letterSpacing: "-0.01em", marginBottom: 6, color: "#FFFFFF" }}>
                {heading}
              </h1>
              {locationLine && (
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                  {locationLine} &middot; 60-min consult
                </p>
              )}
            </section>

            {/* Next available slot banner */}
            {nextAvailableLabel && (
              <div
                className="mx-auto w-full text-center"
                style={{ maxWidth: 720 }}
              >
                <div
                  className="inline-flex items-center gap-2.5 rounded-full px-4 py-2"
                  style={{
                    background: "rgba(46,204,113,0.12)",
                    border: "1px solid rgba(46,204,113,0.30)",
                  }}
                >
                  <Clock size={14} style={{ color: "#2ECC71", flexShrink: 0 }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>
                    Next available: <span style={{ color: "#2ECC71" }}>{nextAvailableLabel}</span>
                  </span>
                </div>
              </div>
            )}

            <section className="mx-auto" aria-label="Pick a date and time" style={{ maxWidth: 720 }}>
              {location && location in CENTER_CALENDARS ? (
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
              ) : (
                <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20, fontFamily: "Inter, sans-serif" }}>
                  <div style={{ fontSize: 13, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700, marginBottom: 10 }}>Choose your center</div>
                  <div className="grid gap-2">
                    {Object.values(CENTER_CALENDARS).map((c) => (
                      <button key={c.key} type="button" onClick={() => setLocation(c.key)}
                        style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid #8B92A0", background: "#FFFFFF", color: "#0B1029", fontSize: 16, fontWeight: 600, textAlign: "left", cursor: "pointer" }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="hidden md:block mx-auto text-center" style={{ maxWidth: 720, color: "#FFFFFF", opacity: 0.85, fontSize: 13, fontFamily: "Inter, sans-serif" }}>
              Need help?{" "}
              <a href="tel:8663444955" style={{ color: "#FFFFFF", textDecoration: "underline", fontWeight: 600 }}>
                Call (866) 344-4955
              </a>
            </div>
          </>
      </div>
    </BookLayout>
  );
};

export default BookSchedule;
