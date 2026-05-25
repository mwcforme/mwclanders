import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BookLayout from "@/components/book/BookLayout";
import GHLAccordionView from "@/components/book/GHLAccordionView";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { CENTER_CALENDARS, type LocationKey } from "@/lib/ghlCalendars";

const LOCATION_LABEL: Record<string, string> = {
  richmond: "Richmond clinic",
  "virginia-beach": "Virginia Beach clinic",
  "newport-news": "Newport News clinic",
};

const BookSchedule2 = () => {
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

  const heading = firstName ? `${firstName}, pick a time.` : `Pick a time.`;

  const locationLine = location ? LOCATION_LABEL[location] : null;
  const metaLine = [locationLine, "60-min consult", "No charge today"].filter(Boolean).join(" · ");

  const customFields = {
    ...(symptom ? { mwc_symptom: symptom } : {}),
    ...(duration ? { mwc_symptom_duration: duration } : {}),
    ...(urgencyTier ? { mwc_urgency_tier: urgencyTier } : {}),
    ...(note ? { mwc_clinical_note: note.slice(0, 500) } : {}),
    ...(service ? { mwc_funnel_service: service } : {}),
    ...(lpSlug ? { mwc_lp_slug: lpSlug } : {}),
  };

  return (
    <BookLayout page="schedule" title="Pick your consult time | Men's Wellness Centers">
      <div className="px-3 md:px-6 py-2 md:py-8 space-y-2 md:space-y-6 pb-12">
        <div className="mx-auto w-full" style={{ maxWidth: 720 }}>
          <button
            type="button"
            onClick={() => navigate("/book/duration")}
            className="flex items-center gap-1"
            style={{
              background: "transparent", border: 0, color: "var(--c-text-on-dark)",
              fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
              opacity: 0.85, cursor: "pointer", padding: "4px 0",
            }}
            aria-label="Back to previous step"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex gap-1 mt-2" role="progressbar" aria-label="Step 3 of 3" aria-valuemin={0} aria-valuemax={3} aria-valuenow={3}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1" style={{ height: 3, borderRadius: 2, background: "var(--brand-cta)" }} />
            ))}
          </div>
        </div>

        <section className="mx-auto text-center" style={{ maxWidth: 720, color: "var(--c-text-on-dark)" }}>
          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(18px, 2.6vw, 26px)",
              lineHeight: 1.2,
              marginBottom: 4,
              color: "var(--c-text-on-dark)",
            }}
          >
            {heading}
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "var(--c-text-on-dark-muted)", margin: 0 }}>
            {metaLine}
          </p>
        </section>

        <section className="mx-auto" aria-label="Pick a date and time" style={{ maxWidth: 480 }}>
          {location && location in CENTER_CALENDARS ? (
            <GHLAccordionView
              location={location as LocationKey}
              firstName={firstName}
              lastName={lastName}
              email={identity?.email}
              phone={identity?.phone}
              source={source || "mwc-book-funnel"}
              customFields={customFields}
              onBooked={(slotIso) => {
                setAppointmentTime(slotIso);
                navigate("/book/confirmed");
              }}
            />
          ) : (
            <div style={{ background: "var(--c-text-on-dark)", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20, fontFamily: "Inter, sans-serif" }}>
              <div style={{ fontSize: 14, color: "var(--c-text-on-light-muted-2)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700, marginBottom: 10 }}>
                Choose your center
              </div>
              <div className="grid gap-2">
                {Object.values(CENTER_CALENDARS).map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setLocation(c.key)}
                    style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid #D1D5DB", background: "var(--c-text-on-dark)", color: "var(--brand-navy-deep)", fontSize: 16, fontWeight: 600, textAlign: "left", cursor: "pointer" }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </BookLayout>
  );
};

export default BookSchedule2;
