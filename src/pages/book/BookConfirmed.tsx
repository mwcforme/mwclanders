import { useEffect, useState, useRef } from "react";
import { MapPin, ExternalLink, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import BookedCelebrationCard from "@/components/book/BookedCelebrationCard";
import { LOCATIONS, getMapsSearchUrl, type Location } from "@/data/locations";

const ATTRIBUTION_OPTIONS = [
  "Google Search",
  "Google Maps",
  "Facebook / Instagram",
  "Friend or Family",
  "Doctor Referral",
  "TV / Radio",
  "Billboard",
  "Other",
];

/** Post-booking email + attribution + commitment capture — shown once, updates GHL. */
const PostBookingCapture = ({ contactId, onComplete }: { contactId?: string; onComplete: () => void }) => {
  const [email, setEmail] = useState("");
  const [attribution, setAttribution] = useState("");
  const [committed, setCommitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [commitError, setCommitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const patchStore = useBookingStore((s) => s.patch);
  const setIdentity = useBookingStore((s) => s.setIdentity);
  const identity = useBookingStore((s) => s.identity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const emailTrimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!committed) {
      setCommitError(true);
      valid = false;
    } else {
      setCommitError(false);
    }
    if (!valid) return;
    setLoading(true);

    // Update store
    if (identity) setIdentity({ ...identity, email: emailTrimmed });
    if (attribution) patchStore({ attribution });

    // Fire-and-forget GHL update
    if (contactId) {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        supabase.functions.invoke("ghl-proxy", {
          body: {
            path: `/contacts/${contactId}`,
            method: "PUT",
            body: {
              email: emailTrimmed,
              customFields: {
                ...(attribution ? { mwc_attribution_source: attribution } : {}),
                mwc_commitment_given: "true",
              },
            },
            __env: import.meta.env.VITE_APP_ENV ?? "stage",
          },
        }).catch(() => { /* non-blocking */ });
      } catch { /* never block UX */ }
    }

    setSubmitted(true);
    setLoading(false);
    onComplete();
  };

  if (submitted) return null;

  const inp: React.CSSProperties = {
    width: "100%", height: 50, borderRadius: 8, border: "1px solid #D1D5DB",
    background: "#FFFFFF", color: "#0B1029", fontSize: 16,
    fontFamily: "Inter, sans-serif", padding: "0 14px", outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        padding: "28px 24px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 30px rgba(0,0,0,0.14)",
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E8670A", marginBottom: 8 }}>
        Almost done
      </p>
      <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "#0B1029", marginBottom: 6 }}>
        Where should we send your confirmation?
      </h2>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20, lineHeight: 1.5 }}>
        We'll email your appointment details and prep instructions.
      </p>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {/* Commitment checkbox — behavioral anchor */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 10,
            border: `2px solid ${commitError ? "#DC2626" : committed ? "#16A34A" : "#E5E7EB"}`,
            background: committed ? "rgba(22,163,74,0.05)" : commitError ? "rgba(220,38,38,0.04)" : "#F9FAFB",
            cursor: "pointer",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <input
            type="checkbox"
            checked={committed}
            onChange={(e) => { setCommitted(e.target.checked); if (e.target.checked) setCommitError(false); }}
            style={{ marginTop: 2, accentColor: "#16A34A", width: 18, height: 18, flexShrink: 0 }}
          />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#374151", lineHeight: 1.5, fontWeight: 500 }}>
            I understand a provider is setting aside time specifically for me. I commit to attending or canceling at least 24 hours in advance.
          </span>
        </label>
        {commitError && (
          <p style={{ color: "#DC2626", fontSize: 13, marginTop: -8, fontFamily: "Inter, sans-serif" }}>
            Please confirm your commitment to attend.
          </p>
        )}

        <div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            autoComplete="email"
            inputMode="email"
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#E8670A")}
            onBlur={(e) => (e.currentTarget.style.borderColor = emailError ? "#DC2626" : "#D1D5DB")}
            style={{ ...inp, borderColor: emailError ? "#DC2626" : "#D1D5DB" }}
          />
          {emailError && <p style={{ color: "#DC2626", fontSize: 13, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{emailError}</p>}
        </div>
        <div>
          <select
            value={attribution}
            onChange={(e) => setAttribution(e.target.value)}
            style={{ ...inp, color: attribution ? "#0B1029" : "#636B80", appearance: "none", WebkitAppearance: "none" }} /* #636B80 = 5.32:1 on white PASS */
          >
            <option value="">How did you hear about us? (optional)</option>
            {ATTRIBUTION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", height: 52, background: loading ? "rgba(232,103,10,0.6)" : "#E8670A",
            color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 17, fontWeight: 700,
            letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 14px rgba(232,103,10,0.40)",
          }}
        >
          {loading ? "Saving…" : "Complete My Booking"}
        </button>
      </form>
    </div>
  );
};

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

/** Map booking store location keys to locations.ts slugs */
const SLUG_MAP: Record<string, string> = {
  "newport-news": "newport-news-va",
  "virginia-beach": "virginia-beach-va",
  "richmond": "richmond-va",
};

const DEFAULT_CENTER = LOCATIONS[1]; // Newport News


const formatAppointment = (raw?: string): string => {
  if (!raw) return "Time to be confirmed";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "Time to be confirmed";
  const datePart = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(d);
  return `${datePart}  ·  ${timePart}`;
};

const BookConfirmed = () => {
  const appointmentTime = useBookingStore((s) => s.appointmentTime);
  const routerLocation = useLocation();
  const navState = (routerLocation.state || {}) as { appointmentTime?: string };
  const effectiveAppt = appointmentTime || navState.appointmentTime;
  const location = useBookingStore((s) => s.location);
  const identity = useBookingStore((s) => s.identity);
  const apptTime = formatAppointment(effectiveAppt);
  const slug = location ? SLUG_MAP[location] : null;
  const center: Location = (slug && LOCATIONS.find((l) => l.slug === slug)) || DEFAULT_CENTER;
  const mapsSearchUrl = getMapsSearchUrl(center);
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(center.mapsQuery)}&output=embed`;
  const PHONE_DISPLAY = center.phone;
  const PHONE_TEL = center.phoneHref;
  const rawFirst = (identity?.firstName ?? "").trim();
  const rawLast = (identity?.lastName ?? "").trim();
  const firstName = rawFirst.split(/\s+/)[0] || "";
  void rawLast;
  const [captureComplete, setCaptureComplete] = useState(false);

  // One-time cleanup: clear corrupt persisted identity (no phone AND no email).
  useEffect(() => {
    if (identity && !identity.phone && !identity.email) {
      useBookingStore.setState({ identity: undefined });
    }
  }, [identity]);

  // Defer map iframe until user scrolls near it — saves ~500ms on initial load
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapVisible, setMapVisible] = useState(false);
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMapVisible(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Defer video autoplay by 800ms — let celebration card render first
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      videoRef.current?.play().catch(() => { /* user gesture required on some browsers */ });
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <BookLayout page="confirmed" variant="confirmation" title="You're booked | Men's Wellness Centers">
      <div
        className="px-4 md:px-8 py-6 md:py-10 pb-12"
        style={{ background: "#000814" }}
      >
        <div className="mx-auto flex flex-col gap-8 md:gap-10" style={{ maxWidth: 1100, fontFamily: "Inter, sans-serif" }}>

          {/* Celebration Hero Card */}
          <BookedCelebrationCard
            firstName={firstName}
            apptTime={apptTime}
            apptIso={effectiveAppt}
            locationCity={center.city}
            locationAddress={`${center.address}, ${center.cityStateZip}`}
          />

          {/* What you'll walk away with */}
          <div style={{
            background: "#FFFFFF", borderRadius: 14, padding: "28px 24px",
            border: "1px solid #E5E7EB", boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#E8670A", marginBottom: 10,
              fontFamily: "Inter, sans-serif",
            }}>
              What you’ll walk away with
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Your bloodwork results, explained in plain English",
                "A clear answer on whether treatment fits your situation",
                "If yes, a personalized protocol you can start the same day, when medically appropriate",
              ].map((item) => (
                <li key={item} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "8px 0", borderBottom: "1px solid #F3F4F6",
                  fontSize: 15, color: "#0B1029", lineHeight: 1.5,
                  fontFamily: "Inter, sans-serif", fontWeight: 400,
                }}>
                  <span style={{
                    color: "#E8670A", fontWeight: 800, fontSize: 15, flexShrink: 0, marginTop: 1,
                  }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Video — full-width, directly below celebration card for max emotional impact */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #E5E7EB",
              boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
            }}
          >
            {/* Video: no autoPlay attr — deferred 800ms via ref to let card render first */}
            <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000" }}>
              <video
                ref={videoRef}
                src={EXPECT_VIDEO_SRC}
                poster="/images/video-poster.webp"
                muted
                loop={false}
                playsInline
                controls
                preload="none"
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover", border: 0,
                }}
              />
            </div>
            <div style={{ padding: "24px 28px 28px" }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "#E8670A", marginBottom: 8,
              }}>
                2-min watch · Before you arrive
              </p>
              <h2 style={{
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: "clamp(20px, 2.8vw, 26px)", color: "#0B1029",
                letterSpacing: "0.01em", marginBottom: 8, textTransform: "none",
              }}>
                Here's exactly what happens when you walk in.
              </h2>
              <p style={{ fontSize: 15, color: "#5B6478", lineHeight: 1.55, fontWeight: 400 }}>
                No waiting room anxiety. Labs, a quick exam, and a real conversation with your provider. All in under an hour.
              </p>
            </div>
          </div>

          {/* Location Tile — full width */}
          <div
            className="relative flex flex-col overflow-hidden"
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "32px 28px",
              border: "1px solid rgba(11,16,41,0.10)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          >
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(26px, 3vw, 34px)",
                  color: "#0B1029",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  lineHeight: 1.05,
                  marginBottom: 8,
                }}
              >
                {center.city}
              </h2>
              <p
                style={{
                  color: "#5B6478",
                  fontSize: 15,
                  fontWeight: 500,
                  marginBottom: 18,
                }}
              >
                {center.name}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} strokeWidth={2.5} style={{ color: "#E8670A", flexShrink: 0, marginTop: 2 }} />
                  <span
                    style={{
                      color: "#E8670A",
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {center.driveTime}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} strokeWidth={2.5} style={{ color: "#E8670A", flexShrink: 0, marginTop: 3 }} />
                  <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#0B1029",
                      fontWeight: 600,
                      fontSize: 16,
                      lineHeight: 1.4,
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {center.address}<br />
                    {center.cityStateZip}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} strokeWidth={2.5} style={{ color: "#E8670A", flexShrink: 0, marginTop: 3 }} />
                  <span style={{ color: "#0B1029", fontSize: 16, fontWeight: 500 }}>
                    {center.hours}
                  </span>
                </div>
              </div>

              <div
                ref={mapRef}
                className="relative mt-6 w-full overflow-hidden"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(11,16,41,0.12)",
                  height: 320,
                }}
              >
                {mapVisible && (
                  <iframe
                    title={`Map to ${center.name}`}
                    src={mapsEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ border: 0, width: "100%", height: "100%", display: "block" }}
                    allowFullScreen
                  />
                )}
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inline-flex items-center gap-2"
                  style={{
                    top: 12,
                    left: 12,
                    background: "#FFFFFF",
                    color: "#0B1029",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                  }}
                >
                  Open in Maps
                  <ExternalLink size={14} strokeWidth={2.5} />
                </a>
              </div>
          </div>

          {/* Footer */}
          <div className="text-center flex flex-col gap-3" style={{ fontFamily: "Inter, sans-serif" }}>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14 }}>
              Need to reschedule? Life happens — just give us a heads up.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={PHONE_TEL}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#FFFFFF", fontWeight: 600, fontSize: 14,
                  padding: "10px 20px", borderRadius: 8,
                  textDecoration: "none", minHeight: 44,
                }}
              >
                📞 Call or text {PHONE_DISPLAY}
              </a>
              <a
                href="/book/location"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(232,103,10,0.15)",
                  border: "1px solid rgba(232,103,10,0.35)",
                  color: "#E8670A", fontWeight: 600, fontSize: 14,
                  padding: "10px 20px", borderRadius: 8,
                  textDecoration: "none", minHeight: 44,
                }}
              >
                🗓️ Book a different time
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 12, marginTop: 4 }}>
              Please cancel or reschedule at least 24 hours in advance so we can offer your slot to someone else.
            </p>
          </div>
        </div>
      </div>

    </BookLayout>
  );
};

export default BookConfirmed;
