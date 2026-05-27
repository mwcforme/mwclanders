import { Clock, MapPin } from "lucide-react";
import { CelebrationBurst } from "@/components/book/CelebrationBurst";
import type { Location } from "@/data/locations";
import { FONT_OSWALD } from "@/lib/styles";
import { COLORS, FONTS } from "@/lib/bookingTokens";

// Exact computed values from mwclocked.pplx.app/#/confirmed
// hardcoded-color-allow-next-line
const GREEN      = "#10B77F";          // rgb(16,183,127) — "Appointment Confirmed" label
// hardcoded-color-allow-next-line
const GREEN_TINT = "rgba(16,183,127,0.15)"; // check circle bg
// hardcoded-color-allow-next-line
const INK        = "#0A0F29";          // rgb(10,15,41) — body text on white cards
// hardcoded-color-allow-next-line
const SUBTITLE   = "#CBD5E1";          // rgb(203,213,225) — subtitle text

const CHECKLIST_ITEMS = ["No-cost consultation", "Your provider reserved", "Bring photo ID"] as const;

interface ApptDate { weekday: string; month: string; day: string; time: string; iso: string; }
interface Props {
  firstName: string;
  apptDate: ApptDate | null;
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
  // Simple check mark (no circle border) matching reference
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M3 8.5L6.5 12L13 5" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DateBlock({ apptDate }: { apptDate: ApptDate }) {
  const textStyle = { fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.85)" as const, letterSpacing: "0.10em", textTransform: "uppercase" as const };
  return (
    <>
      {/* Pill (mobile) */}
      <div className="mwc-appt-date-pill">
        <span style={{ ...textStyle, fontSize: 13 }}>{apptDate.month}</span>
        <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 64, color: "#FFFFFF", lineHeight: 1, margin: "2px 0" }}>{apptDate.day}</span>
        <span style={{ ...textStyle, fontSize: 13 }}>{apptDate.weekday.slice(0, 3).toUpperCase()}</span>
      </div>
      {/* Square (desktop) */}
      <div className="mwc-appt-date-square">
        <span style={textStyle}>{apptDate.month}</span>
        <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 52, color: "#FFFFFF", lineHeight: 1 }}>{apptDate.day}</span>
        <span style={textStyle}>{apptDate.weekday.slice(0, 3).toUpperCase()}</span>
      </div>
    </>
  );
}

function AppointmentDetailsInner({ apptDate, center, centered }: { apptDate: ApptDate; center: Location; centered: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: centered ? 10 : 4, alignItems: centered ? "center" : "flex-start", justifyContent: "center", paddingTop: centered ? 0 : 2, marginTop: centered ? 20 : 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Clock size={16} strokeWidth={2} style={{ color: COLORS.orangeHex, flexShrink: 0 }} />
        <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: centered ? 32 : 31.875, color: INK, lineHeight: 1 }}>{apptDate.time}</span>
      </div>
      <span style={{ fontSize: centered ? 15 : 19.125, fontWeight: 600, color: INK, paddingLeft: centered ? 0 : 24 }}>60 minutes · In-person</span>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <MapPin size={centered ? 15 : 16} strokeWidth={2} style={{ color: COLORS.orangeHex, flexShrink: 0 }} />
        <span style={{ fontSize: centered ? 15 : 19.125, fontWeight: 600, color: INK }}>{center.city}</span>
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
      <div style={{ padding: "33px 20px 0" }}>
        <p style={{ fontFamily: FONTS.ui, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.sectionGray, margin: 0 }}>
          Your Appointment
        </p>
      </div>

      {/* Responsive body: vertical on mobile, horizontal on desktop */}
      <div className="mwc-appt-body" style={{ padding: "24px 0px 0" }}>
        <DateBlock apptDate={apptDate} />
        {/* Mobile centered details */}
        <div className="mwc-appt-details-center">
          <AppointmentDetailsInner apptDate={apptDate} center={center} centered />
        </div>
        {/* Desktop side details */}
        <div className="mwc-appt-details-side">
          <AppointmentDetailsInner apptDate={apptDate} center={center} centered={false} />
        </div>
      </div>

      <div style={{ margin: "20px 20px 0", borderTop: "1px solid #EBEBEB" }} />

      {/* Mobile: vertical checklist */}
      <div className="mwc-appt-checklist-v" style={{ padding: "16px 20px 72px" }}>
        {CHECKLIST_ITEMS.map((label) => (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <CheckIcon />
            <span style={{ fontSize: 15, fontWeight: 600, color: INK, fontFamily: FONTS.body, lineHeight: 1.35 }}>{label}</span>
          </div>
        ))}
      </div>
      {/* Desktop: 3-column horizontal checklist */}
      <div className="mwc-appt-checklist-h" style={{ padding: "14px 20px 20px" }}>
        {CHECKLIST_ITEMS.map((label) => (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <CheckIcon />
            <span style={{ fontSize: 14.875, fontWeight: 600, color: INK, fontFamily: FONTS.body, lineHeight: 1.35 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BookConfirmedHero({ firstName, apptDate, center, checkDrawn }: Props) {
  return (
    <div className="mwc-hero-section" style={{ background: COLORS.pageBg, padding: "40px 20px 56px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: FONTS.body }}>

        {/* Check + headline */}
        <div className="mwc-hero-intro" style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <AnimatedCheck drawn={checkDrawn} />
            <CelebrationBurst active={checkDrawn} />
          </div>
          {/* "APPOINTMENT CONFIRMED" — green rgb(16,183,127) */}
          {/* Mockup: 17px weight 700 */}
          <p style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GREEN, marginBottom: 12 }}>
            Appointment Confirmed
          </p>
          {/* Mockup: 34px weight 700 */}
          <h1 className="mwc-hero-headline" style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 34, color: "#FFFFFF", lineHeight: 1.05, marginBottom: 10, textTransform: "uppercase" }}>
            {firstName ? `You're booked, ${firstName}.` : "You're booked."}
          </h1>
          {/* Subtitle — rgb(203,213,225) */}
          {/* Mockup: 19.125px weight 400 */}
          <p style={{ fontSize: 19, fontWeight: 400, color: SUBTITLE, lineHeight: 1.6 }}>
            Your provider is reserved. Here's everything you need.
          </p>
        </div>

        {apptDate && <AppointmentTicket apptDate={apptDate} center={center} />}
      </div>
    </div>
  );
}
