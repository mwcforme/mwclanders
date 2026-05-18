/**
 * /book/confirmed — Post-booking confirmation page.
 *
 * Visual hierarchy (CRO-optimised rebuild):
 * 1. HERO — full-width dark navy, large animated check, appointment as a ticket
 * 2. Calendar add buttons — immediate, prominent
 * 3. Outcome cards — 3 results they'll walk away with
 * 4. Video — 2-min watch, above prep
 * 5. Prep steps — 3 numbered cards, not bullets
 * 6. Location tile — professional, with map
 * 7. Email capture — small optional "want a copy?"
 * 8. Reschedule — footer
 */
import { useEffect, useState, useRef } from "react";
import { contactUpdater } from "@/services/contactUpdater";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { MapPin, ExternalLink, Clock, Send, Check, Calendar, ClipboardList, FlaskConical, Stethoscope } from "lucide-react";
import { useLocation } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { LOCATIONS, getMapsSearchUrl, type Location } from "@/data/locations";

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPECT_VIDEO_SRC = "/videos/what-to-expect.mp4";

const SLUG_MAP: Record<string, string> = {
  "newport-news": "newport-news-va",
  "virginia-beach": "virginia-beach-va",
  "richmond": "richmond-va",
};

const DEFAULT_CENTER = LOCATIONS[1];

const formatDate = (raw?: string) => {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "America/New_York" }).format(d),
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "America/New_York" }).format(d).toUpperCase(),
    day: new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "America/New_York" }).format(d),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" }).format(d),
    iso: raw,
  };
};

const buildCalendarLinks = (iso: string, location: string, address: string) => {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = "Men's Wellness Centers Appointment";
  const desc = "Your no-cost testosterone consultation. Bring photo ID.";
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(address)}&details=${encodeURIComponent(desc)}`;
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`, `LOCATION:${address}`, `DESCRIPTION:${desc}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return { google, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
};

// ─── Email capture ────────────────────────────────────────────────────────────

const EmailCapture = ({ contactId, onComplete }: { contactId?: string; onComplete: () => void }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setIdentity = useBookingStore((s) => s.setIdentity);
  const identity = useBookingStore((s) => s.identity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError("Valid email required"); return; }
    setError(""); setLoading(true);
    if (identity) setIdentity({ ...identity, email: trimmed });
    if (contactId) contactUpdater.updateContact(contactId, { email: trimmed }).catch(() => {});
    setLoading(false);
    onComplete();
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: "20px 20px" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(245,243,240,0.80)", marginBottom: 4 }}>
        Want a copy of your confirmation?
      </p>
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", gap: 8 }}>
        <input
          type="email" placeholder="your@email.com" value={email} autoComplete="email" inputMode="email"
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          style={{ flex: 1, height: 44, borderRadius: 8, border: `1.5px solid ${error ? "#FF6B7A" : "rgba(255,255,255,0.15)"}`, background: "rgba(255,255,255,0.07)", color: "var(--brand-cream)", fontSize: 15, fontFamily: "Inter, sans-serif", padding: "0 14px", outline: "none" }}
        />
        <button type="submit" disabled={loading} style={{ height: 44, padding: "0 18px", background: "var(--brand-cta)", color: "#FFF", border: "none", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Send size={14} strokeWidth={2} /> Send
        </button>
      </form>
      {error && <p style={{ color: "#FF6B7A", fontSize: 12, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{error}</p>}
    </div>
  );
};

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
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);
  const [mapVisible, setMapVisible] = useState(false);
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setMapVisible(true); obs.disconnect(); } }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => videoRef.current?.play().catch(() => {}), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <BookLayout page="confirmed" variant="confirmation" title="You're booked | Men's Wellness Centers">
      {/* ── 1. HERO — Full-width dark, appointment ticket ──────────────── */}
      <div style={{ background: "linear-gradient(180deg, #0B1029 0%, #0D1535 100%)", padding: "48px 20px 56px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>

          {/* Animated check + headline */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            {/* Check circle */}
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(22,163,74,0.15)", border: "2px solid rgba(22,163,74,0.40)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5L10 17.5L19 7.5" stroke="var(--c-success-on-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 28, strokeDashoffset: checkDrawn ? 0 : 28, transition: "stroke-dashoffset 600ms ease-out" }} />
              </svg>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-success-on-dark)", marginBottom: 10 }}>Appointment Confirmed</p>
            <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 44px)", color: "var(--brand-cream)", lineHeight: 1.1, marginBottom: 8 }}>
              {firstName ? `This is your moment, ${firstName}.` : "This is your moment."}
            </h1>
            <p style={{ fontSize: 16, color: "rgba(245,243,240,0.65)", lineHeight: 1.5 }}>
              Your provider has reserved this hour for your labs, exam, and consultation.
            </p>
          </div>

          {/* Appointment ticket */}
          {apptDate && (
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ display: "flex" }}>
                {/* Date badge */}
                <div style={{ background: "var(--brand-cta)", padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 88, flexShrink: 0 }}>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.80)", letterSpacing: "0.12em" }}>{apptDate.month}</span>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 48, color: "var(--c-text-on-dark)", lineHeight: 1 }}>{apptDate.day}</span>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 11, color: "rgba(255,255,255,0.80)", letterSpacing: "0.10em" }}>{apptDate.weekday.slice(0, 3).toUpperCase()}</span>
                </div>
                {/* Details */}
                <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={15} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--brand-cream)" }}>{apptDate.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "rgba(245,243,240,0.70)" }}>{center.city} · In-person · 60 min</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    {[["No-cost visit", "#16a34a"], ["Provider reserved", "var(--brand-cta)"], ["Bring photo ID", "#6B7280"]].map(([label, color]) => (
                      <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: color as string, flexShrink: 0 }} />{label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2. Calendar buttons */}
          {calLinks && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
              <a href={calLinks.google} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, background: "var(--brand-cta)", color: "#FFF", borderRadius: 10, textDecoration: "none", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(232,103,10,0.35)" }}>
                <Calendar size={18} strokeWidth={2} /> Add to Google Calendar
              </a>
              <a href={calLinks.ics} download="mwc-appointment.ics"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "var(--brand-cream)", borderRadius: 10, textDecoration: "none", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 15 }}>
                <Calendar size={18} strokeWidth={2} /> Apple / Outlook (.ics)
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Light bg sections ──────────────────────────────────────────────── */}
      <div style={{ background: "#F4F6FA", padding: "0 20px 48px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, paddingTop: 24, fontFamily: "Inter, sans-serif" }}>

          {/* ── 3. Outcome cards */}
          <div style={{ background: "var(--c-text-on-dark)", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "20px 24px 0", borderBottom: "1px solid #F3F4F6" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 6 }}>What you'll walk away with</p>
            </div>
            {[
              { icon: <FlaskConical size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, text: "Your bloodwork results, explained in plain English" },
              { icon: <Stethoscope size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, text: "A clear answer on whether treatment fits your situation" },
              { icon: <ClipboardList size={18} strokeWidth={1.75} style={{ color: "var(--brand-cta)" }} />, text: "A personalized protocol you can start the same day, when medically appropriate" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 24px", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(232,103,10,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {icon}
                </div>
                <span style={{ fontSize: 15, color: "#111", lineHeight: 1.5, paddingTop: 8 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* ── 4. Video */}
          <div style={{ background: "var(--c-text-on-dark)", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "52%", background: "#000" }}>
              <video ref={videoRef} src={EXPECT_VIDEO_SRC} poster="/images/video-poster.webp" muted loop={false} playsInline controls preload="none"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", border: 0 }} />
            </div>
            <div style={{ padding: "18px 22px 22px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-cta)", marginBottom: 6 }}>2-min watch · Before you arrive</p>
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--brand-navy-deep)", marginBottom: 6 }}>Here's exactly what happens when you walk in.</h3>
              <p style={{ fontSize: 14, color: "#5B6478", lineHeight: 1.5 }}>No waiting room anxiety. Labs, a quick exam, and a real conversation with your provider.</p>
            </div>
          </div>

          {/* ── 5. Prep steps */}
          <div style={{ background: "var(--c-text-on-dark)", borderRadius: 16, padding: "22px 24px", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#6B7280", marginBottom: 16 }}>Before you arrive</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { n: "1", text: "Bring photo ID and your insurance card if you have one — we don't bill insurance, but it helps your provider understand your history." },
                { n: "2", text: "Drink water before labs. No need to fast unless your provider says so." },
                { n: "3", text: "Plan for 60 minutes from check-in to leaving with your results." },
              ].map(({ n, text }) => (
                <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--brand-cta)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{n}</div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.55, margin: 0, paddingTop: 4 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 6. Location tile */}
          <div style={{ background: "var(--c-text-on-dark)", borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "22px 24px 18px" }}>
              <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--brand-navy-deep)", textTransform: "uppercase", marginBottom: 4 }}>{center.city}</h3>
              <p style={{ fontSize: 13, color: "#5B6478", marginBottom: 14 }}>{center.name}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-cta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{center.driveTime}</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <MapPin size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
                  <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "var(--brand-navy-deep)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
                    {center.address}<br />{center.cityStateZip}
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#374151" }}>{center.hours}</span>
                </div>
              </div>
            </div>
            {/* Map */}
            <div ref={mapRef} style={{ position: "relative", height: 260, borderTop: "1px solid #F3F4F6" }}>
              {mapVisible && (
                <iframe title={`Map to ${center.name}`} src={mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0, width: "100%", height: "100%", display: "block" }} allowFullScreen />
              )}
              <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
                style={{ position: "absolute", top: 12, left: 12, background: "#FFF", color: "var(--brand-navy-deep)", padding: "8px 14px", borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.18)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                Open in Maps <ExternalLink size={13} strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* ── 7. Email capture */}
          {!emailCaptured && (
            <BookingErrorBoundary>
              <EmailCapture contactId={identity?.ghlContactId} onComplete={() => setEmailCaptured(true)} />
            </BookingErrorBoundary>
          )}

          {/* ── 8. Reschedule */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ color: "#6B7280", fontSize: 13 }}>Need to reschedule? Just give us a heads up.</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
              <a href={center.phoneHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F3F4F6", border: "1px solid #E5E7EB", color: "#374151", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 8, textDecoration: "none", minHeight: 44 }}>
                Call or text {center.phone}
              </a>
              <a href="/book/location" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,103,10,0.08)", border: "1px solid rgba(232,103,10,0.25)", color: "var(--brand-cta)", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 8, textDecoration: "none", minHeight: 44 }}>
                Book a different time
              </a>
            </div>
            <p style={{ color: "#9AA0AC", fontSize: 11, marginTop: 4 }}>Please cancel or reschedule at least 24 hours in advance.</p>
          </div>

        </div>
      </div>
    </BookLayout>
  );
}
