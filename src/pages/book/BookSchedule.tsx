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

/** Inline name+email capture shown when short hero form was used (firstName === "Guest"). */
const IdentityCapture = ({ onComplete }: { onComplete: (first: string, last: string, email: string) => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!name.trim()) fe.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) fe.email = "Valid email required";
    if (Object.keys(fe).length) { setErrors(fe); return; }
    const [first, ...rest] = name.trim().split(/\s+/);
    onComplete(first || name.trim(), rest.join(" "), email.trim());
  };

  const inp: React.CSSProperties = {
    width: "100%", height: 50, borderRadius: 8, border: "1px solid #3A4258",
    background: "rgba(255,255,255,0.05)", color: "#FFFFFF", fontSize: 16,
    fontFamily: "Inter, sans-serif", padding: "0 14px", outline: "none",
  };

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 720 }}>
      <div
        className="rounded-xl p-6"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        <p style={{ color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
          One more thing: who are we booking for?
        </p>
        <p style={{ color: "#9CA3AF", fontFamily: "Inter, sans-serif", fontSize: 14, marginBottom: 20 }}>
          So we can send your confirmation and remind you before your visit.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <input
              type="text" placeholder="Your full name" value={name} autoComplete="name"
              onChange={(e) => { setName(e.target.value); setErrors((p) => { const { name: _, ...r } = p; return r; }); }}
              style={{ ...inp, borderColor: errors.name ? "#DC2626" : "#3A4258" }}
            />
            {errors.name && <p style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
          </div>
          <div>
            <input
              type="email" placeholder="Email address" value={email} autoComplete="email" inputMode="email"
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => { const { email: _, ...r } = p; return r; }); }}
              style={{ ...inp, borderColor: errors.email ? "#DC2626" : "#3A4258" }}
            />
            {errors.email && <p style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
          </div>
          <button
            type="submit"
            style={{
              width: "100%", height: 52, background: "#E8670A", color: "#FFFFFF",
              border: "none", borderRadius: 8, fontSize: 17, fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
              cursor: "pointer", marginTop: 4,
            }}
          >
            Continue to Pick a Time →
          </button>
        </form>
      </div>
    </div>
  );
};

const BookSchedule = () => {
  const navigate = useNavigate();
  const identity = useBookingStore((s) => s.identity);
  const setIdentity = useBookingStore((s) => s.setIdentity);
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

  // Short form sends firstName="Guest" and empty email — trigger identity capture
  const needsIdentity = !identity?.firstName || identity.firstName === "Guest" || !identity?.email;

  const firstName = identity?.firstName || "";
  const lastName = identity?.lastName || "";
  const heading = (firstName && firstName !== "Guest") ? `${firstName}, pick a time.` : "Pick a time.";

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

  const handleIdentityComplete = (first: string, last: string, email: string) => {
    if (identity) {
      setIdentity({ ...identity, firstName: first, lastName: last, email });
    }
  };

  return (
    <BookLayout page="schedule" title="Pick your consult time | Men's Wellness Centers">
      <div className="px-3 md:px-6 py-2 md:py-8 space-y-4 md:space-y-6 pb-12">

        <div className="mx-auto w-full" style={{ maxWidth: 720 }}>
          <button
            type="button"
            onClick={() => navigate("/book/duration")}
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

        {/* Identity capture for short-form users */}
        {needsIdentity ? (
          <IdentityCapture onComplete={handleIdentityComplete} />
        ) : (
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
        )}
      </div>
    </BookLayout>
  );
};

export default BookSchedule;
