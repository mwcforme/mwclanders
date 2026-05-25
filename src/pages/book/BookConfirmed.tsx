/**
 * /book/confirmed — Post-booking confirmation page.
 * CRO-optimised: check → ticket → calendar → outcomes → video → prep → location → email → reschedule
 * Senior-mobile: 16px body, 56px touch targets, 28px section gaps, #111827/#374151 on light bg.
 */
import { useEffect, useState, useRef } from "react";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { MapPin, Navigation, ExternalLink, Clock, Calendar, ClipboardList, FlaskConical, Stethoscope } from "lucide-react";
import { useLocation } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { LOCATIONS, getMapsSearchUrl, type Location } from "@/data/locations";
import { CelebrationBurst } from "@/components/book/CelebrationBurst";
import { EmailCapture } from "@/components/book/EmailCapture";

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

const SLUG_MAP: Record<string, string> = {
  "newport-news": "newport-news-va",
  "virginia-beach": "virginia-beach-va",
  "richmond": "richmond-va",
};

const DEFAULT_CENTER = LOCATIONS[1];

function formatDate(raw?: string) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const tz = "America/New_York";
  return {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: tz }).format(d),
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: tz }).format(d).toUpperCase(),
    day: new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: tz }).format(d),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }).format(d),
    iso: raw,
  };
}

function buildCalendarLinks(iso: string, location: string, address: string) {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = "Men's Wellness Centers Appointment";
  const desc = "Your no-cost testosterone consultation. Bring photo ID.";
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(address)}&details=${encodeURIComponent(desc)}`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${title}`, `LOCATION:${address}`, `DESCRIPTION:${desc}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return { google, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookConfirmed() {
  const appointmentTime = useBookingStore((s) => s.appointmentTime);
  const routerLocation = useLocation();
  const navState = (routerLocation.state || {}) as { appointmentTime?: string };
  const effectiveAppt = appointmentTime || navState.appointmentTime;
  const location = useBookingStore((s) => s.location);
  const identity = useBookingStore((s) => s.identity);
  const patchAction = useBookingStore((s) => s.patch);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [checkDrawn, setCheckDrawn] = useState(false);

  const slug = location ? SLUG_MAP[location] : null;
  const center: Location = (slug && LOCATIONS.find((l) => l.slug === slug)) || DEFAULT_CENTER;
  const mapsSearchUrl = getMapsSearchUrl(center);
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(center.mapsQuery)}&output=embed`;

  const firstName = (identity?.firstName ?? "").trim().split(/\s+/)[0] || "";
  const apptDate = formatDate(effectiveAppt);
  const calLinks = apptDate ? buildCalendarLinks(apptDate.iso, center.city, center.fullAddress) : null;

  useEffect(() => {
    if (identity && !identity.phone && !identity.email) patchAction({ identity: undefined });
    const t = setTimeout(() => setCheckDrawn(true), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map: always rendered directly — no IntersectionObserver lazy-load (eliminates blank map bug)
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    // Only autoplay when video is actually in view — prevents audio starting while user reads ticket above
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.play().catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <BookLayout page="confirmed" variant="confirmation" title="You're booked | Men's Wellness Centers">
      {/* 1. HERO */}
      <div style={{ background: "linear-gradient(180deg, #0B1029 0%, #0D1535 100%)", padding: "48px 20px 56px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(22,163,74,0.20)", border: "2px solid rgba(22,163,74,0.60)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5L10 17.5L19 7.5" stroke="var(--c-success-on-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ strokeDasharray: 28, strokeDashoffset: checkDrawn ? 0 : 28, transition: "stroke-dashoffset 600ms ease-out" }} />
                </svg>
              </div>
              <CelebrationBurst active={checkDrawn} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--c-success-on-dark)", marginBottom: 10 }}>Appointment Confirmed</p>
            <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 44px)", color: "var(--brand-cream)", lineHeight: 1.1, marginBottom: 8 }}>
              {firstName ? `This is your moment, ${firstName}.` : "This is your moment."}
            </h1>
            <p style={{ fontSize: 16, fontWeight: 500, color: "rgba(245,243,240,0.85)", lineHeight: 1.6 }}>
              Your provider will be ready.
            </p>
          </div>

          {/* Appointment ticket */}
          {apptDate && (
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
              <div style={{ display: "flex" }}>
                <div style={{ background: "var(--brand-cta)", padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 88, flexShrink: 0 }}>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.80)", letterSpacing: "0.12em" }}>{apptDate.month}</span>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 48, color: "var(--c-text-on-dark)", lineHeight: 1 }}>{apptDate.day}</span>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 11, color: "rgba(255,255,255,0.80)", letterSpacing: "0.10em" }}>{apptDate.weekday.slice(0, 3).toUpperCase()}</span>
                </div>
                <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={15} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--brand-cream)" }}>{apptDate.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight: 500, color: "rgba(245,243,240,0.85)" }}>{center.city} · In-person · 60 min</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    {/* WCAG AA: all badge colors meet 4.5:1 on navy bg */}
                    {[["No-cost consultation", "var(--c-success-on-dark)"], ["Provider reserved", "var(--brand-cta)"], ["Bring photo ID", "rgba(245,243,240,0.85)"]].map(([label, color]) => (
                      <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color, letterSpacing: "0.04em" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: color as string, flexShrink: 0 }} />{label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Calendar buttons */}
          {calLinks && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
              {/* WCAG 3.2.2: external links announce new tab via aria-label */}
              <a href={calLinks.google} target="_blank" rel="noopener noreferrer"
                aria-label="Add to Google Calendar (opens in new tab)"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 56, background: "var(--brand-cta)", color: "#FFF", borderRadius: 10, textDecoration: "none", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, boxShadow: "0 4px 16px rgba(232,103,10,0.35)" }}>
                <Calendar size={18} strokeWidth={2} aria-hidden /> Add to Google Calendar
              </a>
              <a href={calLinks.ics} download="mwc-appointment.ics"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 56, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.35)", color: "var(--brand-cream)", borderRadius: 10, textDecoration: "none", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16 }}>
                <Calendar size={18} strokeWidth={2} aria-hidden /> Apple / Outlook (.ics)
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Content sections — dark navy bg matching schedule page */}
      <div style={{ background: "var(--brand-navy-deep)", padding: "0 20px 48px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, paddingTop: 24, fontFamily: "Inter, sans-serif" }}>

          {/* 3. Outcome cards */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #E5E7EB" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-cta)", margin: 0 }}>You leave with</p>
            </div>
            {[
              { icon: <FlaskConical size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "Your bloodwork results, explained in plain English" },
              { icon: <Stethoscope size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "A clear answer on whether treatment fits your situation" },
              { icon: <ClipboardList size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} aria-hidden />, text: "A personalized protocol you can start the same day, when medically appropriate" },
            ].map(({ icon, text }, idx, arr) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: idx < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(232,103,10,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#111827", lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* 4. Video */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000" }}>
              <video ref={videoRef} src={EXPECT_VIDEO_SRC} poster="/images/video-poster.webp" muted loop={false} playsInline controls preload="none"
                aria-label="What to expect at your visit — 2 minute overview"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", border: 0 }} />
            </div>
            <div style={{ padding: "16px 24px 20px" }}>
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--brand-navy-deep)", marginBottom: 0 }}>What happens when you walk in. 2 min.</h3>
            </div>
          </div>

          {/* 5. Prep steps — trimmed to essentials only */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 14 }}>Before you arrive</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { n: "1", text: "Bring photo ID." },
                { n: "2", text: "Drink water. No need to fast." },
                { n: "3", text: "Plan for 60 minutes." },
              ].map(({ n, text }) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--brand-cta)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{n}</div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", lineHeight: 1.4, margin: 0 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Location tile */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
            <div style={{ padding: "22px 24px 18px" }}>
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--brand-navy-deep)", textTransform: "uppercase", marginBottom: 4 }}>{center.city}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {/* Drive time row — Navigation icon replaces MapPin to avoid duplicate MapPin icons */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Navigation size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-cta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{center.driveTime}</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <MapPin size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
                  <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 600, color: "var(--brand-navy-deep)", textDecoration: "underline", textUnderlineOffset: 3, lineHeight: 1.5 }}>
                    {center.address}<br />{center.cityStateZip}
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>{center.hours}</span>
                </div>
              </div>
            </div>
            {/* Map — always rendered; IntersectionObserver lazy-load removed (blank map fix) */}
            <div style={{ position: "relative", height: 220, borderTop: "1px solid #F3F4F6" }}>
              <iframe
                title={`Map showing directions to ${center.name}`}
                aria-label={`Map to ${center.name} at ${center.address}`}
                src={mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, width: "100%", height: "100%", display: "block" }} allowFullScreen />
            </div>
            <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
              aria-label={`Get directions to ${center.name} (opens in new tab)`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "16px 20px", minHeight: 56,
                background: "var(--brand-navy-deep)",
                color: "var(--brand-cream)",
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16,
                textDecoration: "none",
                borderTop: "1px solid #E5E7EB",
              }}>
              <MapPin size={15} strokeWidth={2} style={{ color: "var(--brand-cta)" }} aria-hidden />
              Get Directions
              <ExternalLink size={13} strokeWidth={2} style={{ marginLeft: 2 }} aria-hidden />
            </a>
          </div>

          {/* 7. Email capture */}
          {!emailCaptured && (
            <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
              {/* WCAG AA: #374151 on white = 9.7:1 — passes. Was #6B7280 = 3.0:1 — failed */}
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                Send my confirmation
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#374151", marginBottom: 12 }}>
                We'll email your appointment details and a reminder.
              </p>
              <BookingErrorBoundary>
                <EmailCapture contactId={identity?.ghlContactId} onComplete={() => setEmailCaptured(true)} />
              </BookingErrorBoundary>
            </div>
          )}

          {/* 8. Reschedule */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="/book/schedule" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: "var(--brand-cta)", border: "none", color: "#FFFFFF", fontWeight: 700, fontSize: 16, padding: "12px 20px", borderRadius: 8, textDecoration: "none", minHeight: 56, width: "100%" }}>
              Pick a Different Time
            </a>
            {/* WCAG AA: #374151 on white = 9.7:1. Was #6B7280 = 3.0:1 — failed */}
            <p style={{ color: "rgba(245,240,235,0.70)", fontSize: 14, marginTop: 2 }}>
              Or call us: <a href={center.phoneHref} style={{ color: "var(--brand-cream)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>{center.phone}</a>
              {" · 24-hour notice appreciated"}
            </p>
          </div>
        </div>
      </div>
    </BookLayout>
  );
}
