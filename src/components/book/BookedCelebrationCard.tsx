import { useEffect, useRef, useState } from "react";
import { Calendar, Check, MapPin, Clock } from "lucide-react";
import confetti from "canvas-confetti";

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
    const t5 = window.setTimeout(() => {
      try {
        confetti({ particleCount: 120, spread: 80, startVelocity: 44, gravity: 1.0, decay: 0.91,
          ticks: 220, origin: { x: 0.5, y: 0.15 },
          colors: ["#E8670A", "#F97316", "#FCD9B4", "#FFFFFF", "#0B1029"],
          disableForReducedMotion: true, scalar: 1.0 });
      } catch { /* no-op */ }
    }, 260);

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
        background: "#FFFFFF",
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 380ms ease, transform 380ms ease",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Brand orange top stripe */}
      <div style={{ height: 4, background: "#E8670A" }} />

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
              background: "rgba(34,197,94,0.10)",
              border: "2px solid rgba(34,197,94,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: glow
                ? "0 0 0 8px rgba(34,197,94,0.07), 0 0 36px 6px rgba(34,197,94,0.28)"
                : "none",
              transition: "box-shadow 1400ms ease-out",
              marginTop: 4,
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5L10 17.5L19 7.5"
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
              textTransform: "uppercase", color: "#16A34A", marginBottom: 6,
            }}>
              Appointment Confirmed
            </p>
            <h1 style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(26px, 4.5vw, 38px)",
              color: "#0B1029",
              letterSpacing: "0.01em",
              lineHeight: 1.05,
              marginBottom: 8,
              textTransform: "none",
            }}>
              {first ? `This is your moment, ${first}.` : "This is your moment."}
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", fontWeight: 400, lineHeight: 1.5 }}>
              You took the step. We'll take it from here. Your consultation is locked in.
            </p>
          </div>
        </div>

        {/* Appointment card — calendar style */}
        <div style={{
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 20,
          display: "flex",
        }}>
          {/* Left: date badge */}
          <div style={{
            background: "#0B1029",
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
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#E8670A", textTransform: "uppercase", lineHeight: 1 }}>
                  {apptParts.month}
                </span>
                <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 36, color: "#FFFFFF", lineHeight: 1.05, marginTop: 2 }}>
                  {apptParts.day}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: "0.06em", marginTop: 2, textTransform: "uppercase" }}>
                  {apptParts.dayOfWeek.slice(0, 3)}
                </span>
              </>
            ) : (
              <Calendar size={28} style={{ color: "#FFFFFF" }} />
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
              <Clock size={13} strokeWidth={2} style={{ color: "#E8670A", flexShrink: 0 }} />
              <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 18, color: "#0B1029", letterSpacing: "0.01em" }}>
                {apptParts ? apptParts.time : apptTime}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={13} strokeWidth={2} style={{ color: "#E8670A", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#5B6478", fontWeight: 500 }}>
                {locationCity} clinic · In-person · 60 min
              </span>
            </div>
          </div>
        </div>

        {/* Status chips — always horizontal, wrap if needed */}
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
          {["Confirmation sent", "No-cost, no obligation", "Bring photo ID"].map((label) => (
            <span key={label} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(22,163,74,0.07)",
              border: "1px solid rgba(22,163,74,0.20)",
              color: "#15803D",
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.07em", textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              <Check size={10} strokeWidth={3} style={{ color: "#22C55E", flexShrink: 0 }} />
              {label}
            </span>
          ))}
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
                background: "#E8670A", color: "#FFFFFF",
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
                background: "#FFFFFF", color: "#0B1029",
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
