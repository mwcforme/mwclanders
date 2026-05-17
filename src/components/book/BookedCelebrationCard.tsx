import { useEffect, useRef, useState } from "react";
import { Calendar, Check, MapPin, Clock } from "lucide-react";

// Lazy-load confetti so it doesn't block the confirmation card render
const fireConfetti = async () => {
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 120, spread: 80, startVelocity: 44, gravity: 1.0, decay: 0.91,
    ticks: 220, origin: { x: 0.5, y: 0.15 },
    // hardcoded-color-allow-next-line
    colors: ["var(--brand-cta)", "#F97316", "#FCD9B4", "var(--c-text-on-dark)", "var(--brand-navy-deep)"],
    disableForReducedMotion: true, scalar: 1.0,
  });
};

interface Props {
  firstName: string;
  apptTime: string;
  apptIso?: string;
  locationCity: string;
  locationAddress?: string;
}

const STORAGE_KEY = "mwc_booking_celebrated";

const buildCalendarLinks = (iso: string, title: string, location: string) => {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(location)}&details=${encodeURIComponent("Your no-cost consultation at Men's Wellness Centers.")}`;
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`, `LOCATION:${location}`,
    "DESCRIPTION:Your no-cost consultation at Men's Wellness Centers.",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return { google, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
};

const BookedCelebrationCard = ({ firstName, apptTime, apptIso, locationCity, locationAddress }: Props) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [drawCheck, setDrawCheck] = useState(false);
  const [glow, setGlow] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setAnimateIn(true); setDrawCheck(true); return; }

    const t1 = window.setTimeout(() => setAnimateIn(true), 20);
    const alreadyCelebrated = sessionStorage.getItem(STORAGE_KEY) === "1";
    if (alreadyCelebrated) { setDrawCheck(true); return () => clearTimeout(t1); }
    if (firedRef.current) return;
    firedRef.current = true;
    sessionStorage.setItem(STORAGE_KEY, "1");

    const t2 = window.setTimeout(() => setDrawCheck(true), 220);
    const t3 = window.setTimeout(() => setGlow(true), 800);
    const t4 = window.setTimeout(() => setGlow(false), 2400);
    const t5 = window.setTimeout(() => void fireConfetti().catch(() => {}), 260);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  const first = firstName && firstName.length >= 2 ? firstName : null;

  // Parse ISO into structured parts for the calendar-style block
  const apptParts = apptIso ? (() => {
    const d = new Date(apptIso);
    const tz = "America/New_York";
    return {
      dayOfWeek: d.toLocaleDateString("en-US", { weekday: "long", timeZone: tz }),
      month:     d.toLocaleDateString("en-US", { month: "short", timeZone: tz }).toUpperCase(),
      day:       d.toLocaleDateString("en-US", { day: "numeric", timeZone: tz }),
      time:      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }),
    };
  })() : null;

  const calLinks = apptIso
    ? buildCalendarLinks(apptIso, "MWC Consultation", locationAddress || `${locationCity} clinic`)
    : null;

  return (
    <div
      style={{
        background: "var(--bg-white)",
        borderRadius: 16,
        // hardcoded-color-allow-next-line
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        // hardcoded-color-allow-next-line
        boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 380ms ease, transform 380ms ease",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Brand orange top stripe */}
      <div style={{ height: 4, background: "var(--brand-cta)" }} />

      <div style={{ padding: "40px 32px 36px" }}>

        {/* Animated check + headline row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
          {/* Check circle */}
          <div
            aria-hidden
            style={{
              flexShrink: 0,
              width: 72,
              height: 72,
              borderRadius: "50%",
              // hardcoded-color-allow-next-line
              background: "rgba(34,197,94,0.10)",
              // hardcoded-color-allow-next-line
              border: "2px solid rgba(34,197,94,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: glow
                // hardcoded-color-allow-next-line
                ? "0 0 0 8px rgba(34,197,94,0.07), 0 0 36px 6px rgba(34,197,94,0.28)"
                : "none",
              transition: "box-shadow 1400ms ease-out",
              marginTop: 4,
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5L10 17.5L19 7.5"
                // hardcoded-color-allow-next-line
                stroke="#22C55E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 28,
                  strokeDashoffset: drawCheck ? 0 : 28,
                  transition: "stroke-dashoffset 580ms ease-out",
                }}
              />
            </svg>
          </div>

          {/* Text */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              // hardcoded-color-allow-next-line
              // hardcoded-color-allow-next-line
              textTransform: "uppercase", color: "#16A34A", marginBottom: 6,
            }}>
              Appointment Confirmed
            </p>
            <h1 style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(26px, 4.5vw, 38px)",
              color: "var(--brand-navy-deep)",
              letterSpacing: "0.01em",
              lineHeight: 1.05,
              marginBottom: 8,
              textTransform: "none",
            }}>
              {first ? `This is your moment, ${first}.` : "This is your moment."}
            </h1>
            {/* hardcoded-color-allow-next-line */}
            <p style={{ fontSize: 15, color: "#6B7280", fontWeight: 400, lineHeight: 1.5 }}>
              Your provider has reserved this hour for your labs, exam, and consultation. No waiting rooms. No rushed visits. Just real answers.
            </p>
          </div>
        </div>

        {/* Appointment card — calendar style */}
        <div style={{
          // hardcoded-color-allow-next-line
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 20,
          display: "flex",
        }}>
          {/* Left: date badge */}
          <div style={{
            background: "var(--brand-navy-deep)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 18px",
            minWidth: 72,
            flexShrink: 0,
          }}>
            {apptParts ? (
              <>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--brand-cta)", textTransform: "uppercase", lineHeight: 1 }}>
                  {apptParts.month}
                </span>
                <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 36, color: "var(--c-text-on-dark)", lineHeight: 1.05, marginTop: 2 }}>
                  {apptParts.day}
                </span>
                {/* hardcoded-color-allow-next-line */}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: "0.06em", marginTop: 2, textTransform: "uppercase" }}>
                  {apptParts.dayOfWeek.slice(0, 3)}
                </span>
              </>
            ) : (
              <Calendar size={28} style={{ color: "var(--c-text-on-dark)" }} />
            )}
          </div>

          {/* Right: details */}
          <div style={{
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={13} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
              <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--brand-navy-deep)", letterSpacing: "0.01em" }}>
                {apptParts ? apptParts.time : apptTime}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={13} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
              // hardcoded-color-allow-next-line
              <span style={{ fontSize: 13, color: "#5B6478", fontWeight: 500 }}>
                {locationCity} clinic · In-person · 60 min
              </span>
            </div>
          </div>
        </div>



        {/* Calendar buttons — orange primary, outlined secondary */}
        {calLinks && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href={calLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "var(--brand-cta)", color: "var(--c-text-on-dark)",
                borderRadius: 10, padding: "14px 20px",
                fontSize: 14, fontWeight: 700, letterSpacing: "0.02em",
                textDecoration: "none", fontFamily: "Inter, sans-serif",
                minHeight: 52,
              }}
            >
              <Calendar size={16} strokeWidth={2.2} />
              Add to Google Calendar
            </a>
            <a
              href={calLinks.ics}
              download="mwc-appointment.ics"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "var(--bg-white)", color: "var(--brand-navy-deep)",
                // hardcoded-color-allow-next-line
                border: "1.5px solid #D1D5DB",
                borderRadius: 10, padding: "14px 20px",
                fontSize: 14, fontWeight: 700, letterSpacing: "0.02em",
                textDecoration: "none", fontFamily: "Inter, sans-serif",
                minHeight: 52, whiteSpace: "nowrap",
              }}
            >
              <Calendar size={16} strokeWidth={2.2} />
              Apple / Outlook (.ics)
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookedCelebrationCard;
