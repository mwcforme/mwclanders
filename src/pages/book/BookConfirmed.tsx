/**
 * /book/confirmed — Post-booking confirmation page.
 *
 * Section order (CRO-optimised):
 * 1. Confirmed hero card  — unambiguous "You're booked" signal
 * 2. What you'll walk away with — reinforce the decision immediately
 * 3. Email capture — framed as delivery, not a gate
 * 4. What to expect — prep instructions
 * 5. Video — optional, below the fold
 * 6. Location + map
 * 7. Reschedule footer
 */
import { useEffect, useState, useRef } from "react";
import { contactUpdater } from "@/services/contactUpdater";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { MapPin, ExternalLink, Clock, Send } from "lucide-react";
import { useLocation } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import BookedCelebrationCard from "@/components/book/BookedCelebrationCard";
import { LOCATIONS, getMapsSearchUrl, type Location } from "@/data/locations";

// ─── Email capture ────────────────────────────────────────────────────────────

const EmailCapture = ({ contactId, onComplete }: { contactId?: string; onComplete: () => void }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const setIdentity = useBookingStore((s) => s.setIdentity);
  const identity = useBookingStore((s) => s.identity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setLoading(true);

    if (identity) setIdentity({ ...identity, email: trimmed });

    if (contactId) {
      contactUpdater.updateContact(contactId, { email: trimmed }).catch(() => {});
    }

    setLoading(false);
    onComplete();
  };

  return (
    <div style={{
      background: "var(--c-text-on-dark)", borderRadius: 12, padding: "24px",
      border: "1px solid #E5E7EB",
    }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: "var(--brand-navy-deep)", marginBottom: 4 }}>
        Where should we send your appointment details?
      </p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B7280", marginBottom: 16, lineHeight: 1.5 }}>
        We'll email your confirmation and prep instructions. Takes 2 seconds.
      </p>
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            autoComplete="email"
            inputMode="email"
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-cta)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = emailError ? "var(--c-error-on-light)" : "#D1D5DB")}
            style={{
              width: "100%", height: 48, borderRadius: 8,
              border: `1.5px solid ${emailError ? "var(--c-error-on-light)" : "#D1D5DB"}`,
              background: "var(--c-text-on-dark)", color: "var(--brand-navy-deep)", fontSize: 16,
              fontFamily: "Inter, sans-serif", padding: "0 14px", outline: "none",
            }}
          />
          {emailError && <p role="alert" style={{ color: "var(--c-error-on-light)", fontSize: 12, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{emailError}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 48, padding: "0 18px",
            background: loading ? "rgba(232,103,10,0.6)" : "var(--brand-cta)",
            color: "var(--c-text-on-dark)", border: "none", borderRadius: 8,
            fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            boxShadow: "0 4px 12px rgba(232,103,10,0.35)",
          }}
        >
          <Send size={15} strokeWidth={2} />
          Send
        </button>
      </form>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

const SLUG_MAP: Record<string, string> = {
  "newport-news": "newport-news-va",
  "virginia-beach": "virginia-beach-va",
  "richmond": "richmond-va",
};

const DEFAULT_CENTER = LOCATIONS[1];

const formatAppointment = (raw?: string): string => {
  if (!raw) return "Time to be confirmed";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "Time to be confirmed";
  const datePart = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York",
  }).format(d);
  return `${datePart}  ·  ${timePart}`;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const BookConfirmed = () => {
  const appointmentTime = useBookingStore((s) => s.appointmentTime);
  const routerLocation = useLocation();
  const navState = (routerLocation.state || {}) as { appointmentTime?: string };
  const effectiveAppt = appointmentTime || navState.appointmentTime;
  const location = useBookingStore((s) => s.location);
  const identity = useBookingStore((s) => s.identity);
  const patchAction = useBookingStore((s) => s.patch);
  const apptTime = formatAppointment(effectiveAppt);
  const slug = location ? SLUG_MAP[location] : null;
  const center: Location = (slug && LOCATIONS.find((l) => l.slug === slug)) || DEFAULT_CENTER;
  const mapsSearchUrl = getMapsSearchUrl(center);
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(center.mapsQuery)}&output=embed`;
  const firstName = (identity?.firstName ?? "").trim().split(/\s+/)[0] || "";
  const [emailCaptured, setEmailCaptured] = useState(false);

  // Clean up corrupt persisted identity
  useEffect(() => {
    if (identity && !identity.phone && !identity.email) {
      patchAction({ identity: undefined });
    }
  }, [identity, patchAction]);

  // Lazy map iframe
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

  // Deferred video autoplay
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <BookLayout page="confirmed" variant="confirmation" title="You're booked | Men's Wellness Centers">
      <div className="px-4 md:px-8 py-6 md:py-10 pb-12" style={{ background: "#000814" }}>
        <div className="mx-auto flex flex-col gap-6 md:gap-8" style={{ maxWidth: 800, fontFamily: "Inter, sans-serif" }}>

          {/* 1 ── Confirmed hero — unambiguous booking signal */}
          <BookedCelebrationCard
            firstName={firstName}
            apptTime={apptTime}
            apptIso={effectiveAppt}
            locationCity={center.city}
            locationAddress={`${center.address}, ${center.cityStateZip}`}
          />

          {/* 2 ── What you'll walk away with — reinforce the decision */}
          <div style={{
            background: "var(--c-text-on-dark)", borderRadius: 12, padding: "24px",
            border: "1px solid #E5E7EB",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.10em",
              textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 12,
              fontFamily: "Inter, sans-serif",
            }}>
              What you'll walk away with
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                "Your bloodwork results, explained in plain English",
                "A clear answer on whether treatment fits your situation",
                "A personalized protocol you can start the same day, when medically appropriate",
              ].map((item) => (
                <li key={item} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 0", borderBottom: "1px solid #F3F4F6",
                  fontSize: 15, color: "var(--brand-navy-deep)", lineHeight: 1.5,
                  fontFamily: "Inter, sans-serif",
                }}>
                  <span style={{ color: "var(--brand-cta)", fontWeight: 800, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 3 ── Email capture — delivery framing, not a gate */}
          {!emailCaptured && (
            <BookingErrorBoundary>
              <EmailCapture
                contactId={identity?.ghlContactId}
                onComplete={() => setEmailCaptured(true)}
              />
            </BookingErrorBoundary>
          )}

          {/* 4 ── What to expect — prep instructions */}
          <div style={{
            background: "var(--c-text-on-dark)", borderRadius: 12, padding: "24px",
            border: "1px solid #E5E7EB",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.10em",
              textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 12,
              fontFamily: "Inter, sans-serif",
            }}>
              Before you arrive
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Bring photo ID and your insurance card if you have one (we don't bill insurance, but it helps your provider understand your history).",
                "Drink water before labs. No need to fast unless your provider says so.",
                "Plan for 60 minutes from check-in to leaving with your results.",
              ].map((item) => (
                <li key={item} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  fontSize: 14, color: "#374151", lineHeight: 1.55,
                  fontFamily: "Inter, sans-serif",
                }}>
                  <span style={{ color: "var(--brand-cta)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 5 ── Video — optional, below the fold */}
          <div style={{
            background: "var(--c-text-on-dark)", borderRadius: 12,
            overflow: "hidden", border: "1px solid #E5E7EB",
          }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000" }}>
              <video
                ref={videoRef}
                src={EXPECT_VIDEO_SRC}
                poster="/images/video-poster.webp"
                muted loop={false} playsInline controls preload="none"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", border: 0 }}
              />
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 6 }}>
                2-min watch
              </p>
              <h2 style={{
                fontFamily: "Oswald, sans-serif", fontWeight: 700,
                fontSize: "clamp(18px, 2.5vw, 24px)", color: "var(--brand-navy-deep)",
                marginBottom: 6, textTransform: "none",
              }}>
                Here's exactly what happens when you walk in.
              </h2>
              <p style={{ fontSize: 14, color: "#5B6478", lineHeight: 1.55 }}>
                No waiting room anxiety. Labs, a quick exam, and a real conversation with your provider. All in under an hour.
              </p>
            </div>
          </div>

          {/* 6 ── Location + map */}
          <div style={{
            background: "var(--c-text-on-dark)", borderRadius: 12, padding: "24px 24px 0",
            border: "1px solid #E5E7EB", overflow: "hidden",
          }}>
            <h2 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 700,
              fontSize: "clamp(20px, 2.5vw, 26px)", color: "var(--brand-navy-deep)",
              textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 4,
            }}>
              {center.city}
            </h2>
            <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 16 }}>{center.name}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                <span style={{ color: "var(--brand-cta)", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {center.driveTime}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <MapPin size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
                <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--brand-navy-deep)", fontWeight: 500, fontSize: 14, lineHeight: 1.4, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {center.address}<br />{center.cityStateZip}
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                <span style={{ color: "var(--brand-navy-deep)", fontSize: 14, fontWeight: 500 }}>{center.hours}</span>
              </div>
            </div>

            <div ref={mapRef} style={{ position: "relative", height: 280, overflow: "hidden" }}>
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
              <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  position: "absolute", top: 12, left: 12,
                  background: "var(--c-text-on-dark)", color: "var(--brand-navy-deep)",
                  padding: "8px 14px", borderRadius: 8,
                  fontWeight: 600, fontSize: 13, textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                Open in Maps <ExternalLink size={13} strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* 7 ── Reschedule footer */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
              Need to reschedule? Just give us a heads up.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
              <a href={center.phoneHref} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--c-text-on-dark)", fontWeight: 600, fontSize: 13, padding: "10px 18px",
                borderRadius: 8, textDecoration: "none", minHeight: 44, fontFamily: "Inter, sans-serif",
              }}>
                Call or text {center.phone}
              </a>
              <a href="/book/location" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(232,103,10,0.12)", border: "1px solid rgba(232,103,10,0.30)",
                color: "var(--brand-cta)", fontWeight: 600, fontSize: 13, padding: "10px 18px",
                borderRadius: 8, textDecoration: "none", minHeight: 44, fontFamily: "Inter, sans-serif",
              }}>
                Book a different time
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 11, fontFamily: "Inter, sans-serif" }}>
              Please cancel or reschedule at least 24 hours in advance.
            </p>
          </div>

        </div>
      </div>
    </BookLayout>
  );
};

export default BookConfirmed;
