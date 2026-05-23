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
    const t = window.setTimeout(() => videoRef.current?.play().catch(() => {}), 1200);
    return () => clearTimeout(t);
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
            <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#4ADE80", marginBottom: 10 }}>Appointment Confirmed</p>
            <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 44px)", color: "var(--brand-cream)", lineHeight: 1.1, marginBottom: 8 }}>
              {firstName ? `This is your moment, ${firstName}.` : "This is your moment."}
            </h1>
            <p style={{ fontSize: 16, fontWeight: 500, color: "rgba(245,243,240,0.85)", lineHeight: 1.6 }}>
              Your provider has reserved this hour for your labs, exam, and consultation.
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
                    {[["No-cost consultation", "#16a34a"], ["Provider reserved", "var(--brand-cta)"], ["Bring photo ID", "rgba(245,243,240,0.55)"]].map(([label, color]) => (
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
              <a href={calLinks.google} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 56, background: "var(--brand-cta)", color: "#FFF", borderRadius: 10, textDecoration: "none", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, boxShadow: "0 4px 16px rgba(232,103,10,0.35)" }}>
                <Calendar size={18} strokeWidth={2} /> Add to Google Calendar
              </a>
              <a href={calLinks.ics} download="mwc-appointment.ics"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 56, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.35)", color: "var(--brand-cream)", borderRadius: 10, textDecoration: "none", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16 }}>
                <Calendar size={18} strokeWidth={2} /> Apple / Outlook (.ics)
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Light bg sections */}
      <div style={{ background: "#F4F6FA", padding: "0 20px 48px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28, paddingTop: 28, fontFamily: "Inter, sans-serif" }}>

          {/* 3. Outcome cards */}
          <div style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #F3F4F6" }}>
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 6 }}>What you'll walk away with</p>
            </div>
            {[
              { icon: <FlaskConical size={20} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, text: "Your bloodwork results, explained in plain English" },
              { icon: <Stethoscope size={20} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, text: "A clear answer on whether treatment fits your situation" },
              { icon: <ClipboardList size={20} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, text: "A personalized protocol you can start the same day, when medically appropriate" },
            ].map(({ icon, text }, idx, arr) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px", borderBottom: idx < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(232,103,10,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                <span style={{ fontSize: 16, fontWeight: 500, color: "#111827", lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* 4. Video */}
          <div style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000" }}>
              <video ref={videoRef} src={EXPECT_VIDEO_SRC} poster="/images/video-poster.webp" muted loop={false} playsInline controls preload="none"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", border: 0 }} />
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 8 }}>2-min watch · Before you arrive</p>
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--brand-navy-deep)", marginBottom: 8 }}>Here's exactly what happens when you walk in.</h3>
              <p style={{ fontSize: 16, fontWeight: 500, color: "#374151", lineHeight: 1.6 }}>No waiting room anxiety. Labs, a quick exam, and a real conversation with your provider.</p>
            </div>
          </div>

          {/* 5. Prep steps */}
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "22px 24px", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#374151", marginBottom: 18 }}>Before you arrive</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { n: "1", text: "Bring photo ID and your insurance card if you have one. We don't bill insurance, but it helps your provider understand your history." },
                { n: "2", text: "Drink water before labs. No need to fast unless your provider says so." },
                { n: "3", text: "Plan for 60 minutes from check-in to leaving with your results." },
              ].map(({ n, text }) => (
                <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand-cta)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 2 }}>{n}</div>
                  <p style={{ fontSize: 16, fontWeight: 500, color: "#111827", lineHeight: 1.7, margin: 0, paddingTop: 4 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Location tile */}
          <div style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
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
              <iframe title={`Map to ${center.name}`} src={mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, width: "100%", height: "100%", display: "block" }} allowFullScreen />
            </div>
            <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "16px 20px", minHeight: 56,
                background: "var(--brand-navy-deep)",
                color: "var(--brand-cream)",
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16,
                textDecoration: "none",
                borderTop: "1px solid #E5E7EB",
              }}>
              <MapPin size={15} strokeWidth={2} style={{ color: "var(--brand-cta)" }} />
              Get Directions
              <ExternalLink size={13} strokeWidth={2} style={{ marginLeft: 2 }} />
            </a>
          </div>

          {/* 7. Email capture */}
          {!emailCaptured && (
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "22px 24px", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 12 }}>
                Send My Appointment Details
              </p>
              <BookingErrorBoundary>
                <EmailCapture contactId={identity?.ghlContactId} onComplete={() => setEmailCaptured(true)} />
              </BookingErrorBoundary>
            </div>
          )}

          {/* 8. Reschedule */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ color: "#374151", fontSize: 16, fontWeight: 500 }}>Need to reschedule?</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
              <a href={center.phoneHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1.5px solid #D1D5DB", color: "#111827", fontWeight: 700, fontSize: 18, padding: "12px 20px", borderRadius: 8, textDecoration: "none", minHeight: 56 }}>
                {center.phone}
              </a>
              <a href="/book/schedule" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--brand-cta)", border: "none", color: "#FFFFFF", fontWeight: 700, fontSize: 16, padding: "12px 20px", borderRadius: 8, textDecoration: "none", minHeight: 56 }}>
                Pick a Different Time
              </a>
            </div>
            <p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>Please cancel or reschedule at least 24 hours in advance.</p>
          </div>
        </div>
      </div>
    </BookLayout>
  );
}
