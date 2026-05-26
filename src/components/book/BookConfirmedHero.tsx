import { Calendar, Clock, MapPin } from "lucide-react";
import { CelebrationBurst } from "@/components/book/CelebrationBurst";
import type { Location } from "@/data/locations";
import { FONT_OSWALD } from "@/lib/styles";
import { COLORS, FONTS, CAL_BUTTON_BASE } from "@/lib/bookingTokens";

// Teal for success states — matches mockup source exactly
// hardcoded-color-allow-next-line
const TEAL      = "#2EC4A5";
// hardcoded-color-allow-next-line
const TEAL_TINT = "rgba(46,196,165,0.12)";

interface ApptDate {
  weekday: string;
  month: string;
  day: string;
  time: string;
  iso: string;
}

interface CalLinks {
  google: string;
  ics: string;
}

interface Props {
  firstName: string;
  apptDate: ApptDate | null;
  calLinks: CalLinks | null;
  center: Location;
  checkDrawn: boolean;
}

const CHECKLIST_ITEMS = ["No-cost consultation", "Your provider reserved", "Bring photo ID"] as const;

function CheckIcon() {
  // Mockup: background:rgba(46,196,165,0.12) border:1.5px solid rgb(46,196,165) — teal
  return (
    <div style={{
      width: 22, height: 22, borderRadius: "50%",
      background: TEAL_TINT,
      border: `1.5px solid ${TEAL}`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.5L5 9.5L10 3.5" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function AnimatedCheck({ drawn }: { drawn: boolean }) {
  // Mockup: background:rgba(46,196,165,0.12) border:2px solid rgb(46,196,165) — teal
  return (
    <div style={{
      width: 80, height: 80, borderRadius: "50%",
      background: TEAL_TINT,
      border: `2px solid ${TEAL}`,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.5L10 17.5L19 7.5"
          stroke={TEAL}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 28, strokeDashoffset: drawn ? 0 : 28, transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
    </div>
  );
}

function AppointmentTicket({ apptDate, center }: { apptDate: ApptDate; center: Location }) {
  return (
    <div style={{
      background: COLORS.cardBg, borderRadius: 20, overflow: "hidden",
      marginBottom: 20, boxShadow: COLORS.cardShadow,
    }}>
      <div style={{ padding: "8px 20px 0" }}>
        <p style={{ fontFamily: FONTS.ui, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.navyInkMid, margin: 0 }}>
          Your Appointment
        </p>
      </div>

      <div style={{ padding: "8px 20px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <DateBlock apptDate={apptDate} />
        <AppointmentDetails apptDate={apptDate} center={center} />
      </div>

      <div style={{ margin: "16px 20px 0", borderTop: `1px solid ${COLORS.cardDivider}` }} />

      {/* Horizontal 3-across row matching desktop mockup */}
      <div style={{ padding: "14px 20px 20px", display: "flex", flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {CHECKLIST_ITEMS.map((label) => (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 6, flex: "1 1 auto", minWidth: 100 }}>
            <CheckIcon />
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navyInkMid, fontFamily: FONTS.ui, lineHeight: 1.3 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
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
      <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: "0.10em" }}>
        {apptDate.month}
      </span>
      <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 52, color: "#FFFFFF", lineHeight: 1 }}>
        {apptDate.day}
      </span>
      <span style={{ fontFamily: FONT_OSWALD, fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: "0.10em" }}>
        {apptDate.weekday.slice(0, 3).toUpperCase()}
      </span>
    </div>
  );
}

function AppointmentDetails({ apptDate, center }: { apptDate: ApptDate; center: Location }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, paddingTop: 4 }}>
      {/* Time - large Oswald with clock icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <Clock size={16} strokeWidth={2} style={{ color: COLORS.orange, flexShrink: 0 }} />
        <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 26, color: COLORS.navyInkMid, lineHeight: 1 }}>
          {apptDate.time}
        </span>
      </div>
      {/* Duration + type on its own line */}
      <span style={{ fontSize: 15, fontWeight: 500, color: COLORS.navyInkMid, paddingLeft: 23 }}>
        60 minutes · In-person
      </span>
      {/* Location */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <MapPin size={15} strokeWidth={2} style={{ color: COLORS.orange, flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.navyInkMid }}>
          {center.city}
        </span>
      </div>
    </div>
  );
}

function CalendarButtons({ calLinks }: { calLinks: CalLinks }) {
  return (
    // Side-by-side on desktop, stacked on mobile
    <div style={{ display: "flex", flexDirection: "row", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
      <a
        href={calLinks.google}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Add to Google Calendar (opens in new tab)"
        style={{ ...CAL_BUTTON_BASE, flex: 1, minWidth: 160, background: COLORS.orange, boxShadow: COLORS.orangeShadow, color: "#FFFFFF" }}
      >
        <Calendar size={16} strokeWidth={2} aria-hidden /> Add to Google Calendar
      </a>
      <a
        href={calLinks.ics}
        download="mwc-appointment.ics"
        style={{ ...CAL_BUTTON_BASE, flex: 1, minWidth: 140, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.90)" }}
      >
        <Calendar size={16} strokeWidth={2} aria-hidden /> Apple or Outlook
      </a>
    </div>
  );
}

export function BookConfirmedHero({ firstName, apptDate, calLinks, center, checkDrawn }: Props) {
  return (
    <div style={{ background: COLORS.pageBg, padding: "64px 20px 56px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: FONTS.body }}>

        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <AnimatedCheck drawn={checkDrawn} />
            <CelebrationBurst active={checkDrawn} />
          </div>
          {/* Mockup: color:rgb(46,196,165) — teal */}
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            Appointment Confirmed
          </p>
          <h1 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(28px, 6vw, 42px)", color: "#FFFFFF", lineHeight: 1.05, marginBottom: 10, textTransform: "uppercase" }}>
            {firstName ? `You're booked, ${firstName}.` : "You're booked."}
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: COLORS.textMuted, lineHeight: 1.6 }}>
            Your provider is reserved. Here's everything you need.
          </p>
        </div>

        {apptDate && <AppointmentTicket apptDate={apptDate} center={center} />}
        {calLinks  && <CalendarButtons calLinks={calLinks} />}
      </div>
    </div>
  );
}
