import { Calendar, Clock, MapPin } from "lucide-react";
import { CelebrationBurst } from "@/components/book/CelebrationBurst";
import type { Location } from "@/data/locations";
import { FONT_OSWALD } from "@/lib/styles";
import { COLORS, FONTS, CAL_BUTTON_BASE } from "@/lib/bookingTokens";

// Exact computed values from mwclocked.pplx.app/#/confirmed
// hardcoded-color-allow-next-line
const GREEN      = "#10B77F";          // rgb(16,183,127) — "Appointment Confirmed" label
// hardcoded-color-allow-next-line
const GREEN_TINT = "rgba(16,183,127,0.15)"; // check circle bg
// hardcoded-color-allow-next-line
const INK        = "#0A0F29";          // rgb(10,15,41) — body text on white cards
// hardcoded-color-allow-next-line
const APPLE_BTN  = "#1A203D";          // rgb(26,32,61) — Apple/Outlook button bg
// hardcoded-color-allow-next-line
const SUBTITLE   = "#CBD5E1";          // rgb(203,213,225) — subtitle text

const CHECKLIST_ITEMS = ["No-cost consultation", "Your provider reserved", "Bring photo ID"] as const;

interface ApptDate { weekday: string; month: string; day: string; time: string; iso: string; }
interface CalLinks  { google: string; ics: string; }
interface Props {
  firstName: string;
  apptDate: ApptDate | null;
  calLinks: CalLinks | null;
  center: Location;
  checkDrawn: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedCheck({ drawn }: { drawn: boolean }) {
  return (
    <div style={{
      width: 80, height: 80, borderRadius: "50%",
      background: GREEN_TINT,
      border: `2px solid ${GREEN}`,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M5 12.5L10 17.5L19 7.5" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 28, strokeDashoffset: drawn ? 0 : 28, transition: "stroke-dashoffset 600ms ease-out" }} />
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: "50%",
      border: `1.5px solid ${GREEN}`,
      background: "transparent",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M1.5 5.5L4 8L8.5 2.5" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function DateBlock({ apptDate }: { apptDate: ApptDate }) {
  return (
    <div style={{
      background: COLORS.orange, borderRadius: 14,
      minWidth: 80, padding: "14px 10px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: "0.10em", textTransform: "uppercase" }}>
        {apptDate.month}
      </span>
      <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 52, color: "#FFFFFF", lineHeight: 1 }}>
        {apptDate.day}
      </span>
      <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: "0.10em", textTransform: "uppercase" }}>
        {apptDate.weekday.slice(0, 3).toUpperCase()}
      </span>
    </div>
  );
}

function AppointmentDetails({ apptDate, center }: { apptDate: ApptDate; center: Location }) {
  // Exact layout from mockup computed styles:
  // time: 31.875px weight 700 — "8:00 AM"
  // "60 minutes" + "In-person": 19.125px weight 600, separate spans
  // "Glen Allen": 19.125px weight 600
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, paddingTop: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Clock size={16} strokeWidth={2} style={{ color: COLORS.orangeHex, flexShrink: 0 }} />
        <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 32, color: INK, lineHeight: 1 }}>
          {apptDate.time}
        </span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: INK, paddingLeft: 24 }}>
        60 minutes · In-person
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <MapPin size={15} strokeWidth={2} style={{ color: COLORS.orangeHex, flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>{center.city}</span>
      </div>
    </div>
  );
}

function AppointmentTicket({ apptDate, center }: { apptDate: ApptDate; center: Location }) {
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 20, overflow: "hidden",
      marginBottom: 20, boxShadow: COLORS.cardShadow,
    }}>
      {/* "YOUR APPOINTMENT" label — gray, uppercase */}
      <div style={{ padding: "16px 20px 0" }}>
        <p style={{ fontFamily: FONTS.ui, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.sectionGray, margin: 0 }}>
          Your Appointment
        </p>
      </div>

      <div style={{ padding: "12px 20px 0", display: "flex", gap: 16, alignItems: "flex-start" }}>
        <DateBlock apptDate={apptDate} />
        <AppointmentDetails apptDate={apptDate} center={center} />
      </div>

      <div style={{ margin: "16px 20px 0", borderTop: "1px solid #EBEBEB" }} />

      {/* Checklist — 3-column grid with green check circles */}
      <div style={{ padding: "14px 20px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 6px" }}>
        {CHECKLIST_ITEMS.map((label) => (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <CheckIcon />
            <span style={{ fontSize: 13, fontWeight: 600, color: INK, fontFamily: FONTS.body, lineHeight: 1.35 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarButtons({ calLinks }: { calLinks: CalLinks }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 12, marginBottom: 8 }}>
      <a
        href={calLinks.google} target="_blank" rel="noopener noreferrer"
        aria-label="Add to Google Calendar (opens in new tab)"
        style={{ ...CAL_BUTTON_BASE, flex: 1, background: COLORS.orange, boxShadow: COLORS.orangeShadow, color: "#FFFFFF", fontSize: 13 }}
      >
        <Calendar size={16} strokeWidth={2} aria-hidden /> Add to Google Calendar
      </a>
      <a
        href={calLinks.ics} download="mwc-appointment.ics"
        style={{ ...CAL_BUTTON_BASE, flex: 1, background: APPLE_BTN, color: "#FFFFFF", fontSize: 13 }}
      >
        <Calendar size={16} strokeWidth={2} aria-hidden /> Apple or Outlook
      </a>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BookConfirmedHero({ firstName, apptDate, calLinks, center, checkDrawn }: Props) {
  return (
    <div style={{ background: COLORS.pageBg, padding: "64px 20px 56px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: FONTS.body }}>

        {/* Check + headline */}
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <AnimatedCheck drawn={checkDrawn} />
            <CelebrationBurst active={checkDrawn} />
          </div>
          {/* "APPOINTMENT CONFIRMED" — green rgb(16,183,127) */}
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GREEN, marginBottom: 12 }}>
            Appointment Confirmed
          </p>
          <h1 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(28px, 6vw, 42px)", color: "#FFFFFF", lineHeight: 1.05, marginBottom: 10, textTransform: "uppercase" }}>
            {firstName ? `You're booked, ${firstName}.` : "You're booked."}
          </h1>
          {/* Subtitle — rgb(203,213,225) */}
          <p style={{ fontSize: 16, fontWeight: 400, color: SUBTITLE, lineHeight: 1.6 }}>
            Your provider is reserved. Here's everything you need.
          </p>
        </div>

        {apptDate && <AppointmentTicket apptDate={apptDate} center={center} />}
        {calLinks  && <CalendarButtons calLinks={calLinks} />}
      </div>
    </div>
  );
}
