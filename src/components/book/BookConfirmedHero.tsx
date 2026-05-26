/**
 * BookConfirmedHero — dark navy hero section for the confirmation page.
 * Renders the check icon, appointment ticket, and calendar add buttons.
 */
import { Calendar, Clock, MapPin } from "lucide-react";
import { CelebrationBurst } from "@/components/book/CelebrationBurst";
import type { Location } from "@/data/locations";
import { CTA_BUTTON_BASE, FONT_INTER, FONT_OSWALD } from "@/lib/styles";

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

interface BookConfirmedHeroProps {
  firstName: string;
  apptDate: ApptDate | null;
  calLinks: CalLinks | null;
  center: Location;
  checkDrawn: boolean;
}

export function BookConfirmedHero({ firstName, apptDate, calLinks, center, checkDrawn }: BookConfirmedHeroProps) {
  // Brand accent: MWC Accent Orange. Replaces previous teal to align with
  // mwclocked design language and brand standards (no teal anywhere).
  // hardcoded-color-allow-next-line
  const ACCENT = "#E8670A";
  // Soft tinted fill at 10% used behind check circles.
  const ACCENT_TINT = "rgba(232,103,10,0.10)";

  return (
    <div style={{
      // hardcoded-color-allow-next-line — Midnight Navy per MWC brand
      background: "#0B1029",
      padding: "48px 20px 56px",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: FONT_INTER }}>

        {/* ── Check icon + headline ── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: ACCENT_TINT,
              border: `2px solid ${ACCENT}`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5L10 17.5L19 7.5" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 28, strokeDashoffset: checkDrawn ? 0 : 28, transition: "stroke-dashoffset 600ms ease-out" }} />
              </svg>
            </div>
            <CelebrationBurst active={checkDrawn} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>
            Appointment Confirmed
          </p>
          <h1 style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: "clamp(28px, 6vw, 42px)", color: "#FFFFFF", lineHeight: 1.05, marginBottom: 10, textTransform: "uppercase" }}>
            {firstName ? `You're booked, ${firstName}.` : "You're booked."}
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
            Your provider is reserved. Here's everything you need.
          </p>
        </div>

        {/* ── Appointment ticket card ── */}
        {apptDate && (
          <div style={{
            background: "#FFFFFF",
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 20,
            // hardcoded-color-allow-next-line
            boxShadow: "0 20px 60px -10px rgba(0,0,0,0.50)",
          }}>
            {/* Card header label */}
            <div style={{ padding: "16px 20px 0" }}>
              <p style={{ fontFamily: "Montserrat, Inter, sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                // hardcoded-color-allow-next-line
                color: "#1A1A2E", margin: 0 }}>
                Your Appointment
              </p>
            </div>

            {/* Date block + details row */}
            <div style={{ padding: "14px 20px 0", display: "flex", gap: 16, alignItems: "flex-start" }}>
              {/* Orange date square */}
              <div style={{
                background: "var(--brand-cta)", borderRadius: 14,
                minWidth: 80, padding: "14px 10px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: "0.10em" }}>{apptDate.month}</span>
                <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 52, color: "#FFFFFF", lineHeight: 1 }}>{apptDate.day}</span>
                <span style={{ fontFamily: FONT_OSWALD, fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: "0.10em" }}>{apptDate.weekday.slice(0, 3).toUpperCase()}</span>
              </div>

              {/* Time + location details */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, paddingTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Clock size={16} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT_OSWALD, fontWeight: 700, fontSize: 26,
                    // hardcoded-color-allow-next-line
                    color: "#1A1A2E", lineHeight: 1 }}>{apptDate.time}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <MapPin size={15} strokeWidth={2} style={{ color: "var(--brand-cta)", flexShrink: 0 }} />
                  {/* hardcoded-color-allow-next-line */}
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>
                    {center.city} · 60 min · In-person
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ margin: "16px 20px 0",
              // hardcoded-color-allow-next-line
              borderTop: "1px solid #EBEBEB" }} />

            {/* 3-item checklist row */}
            <div style={{ padding: "14px 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "No-cost consultation",
                "Your provider reserved",
                "Bring photo ID",
              ].map((label) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Brand accent check circle */}
                  <div style={{ width: 22, height: 22, borderRadius: "50%",
                    background: ACCENT_TINT,
                    border: `1.5px solid ${ACCENT}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6.5L5 9.5L10 3.5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {/* hardcoded-color-allow-next-line */}
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", fontFamily: "Montserrat, Inter, sans-serif" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Calendar CTA buttons ── */}
        {calLinks && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
            <a href={calLinks.google} target="_blank" rel="noopener noreferrer"
              aria-label="Add to Google Calendar (opens in new tab)"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                height: 56, background: "var(--brand-cta)",
                // hardcoded-color-allow-next-line
                boxShadow: "0 10px 28px -8px rgba(232,103,10,0.55)",
                borderRadius: 12, textDecoration: "none",
                fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 700, fontSize: 15,
                color: "#FFFFFF", letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
              <Calendar size={18} strokeWidth={2} aria-hidden /> Add to Google Calendar
            </a>
            <a href={calLinks.ics} download="mwc-appointment.ics"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                height: 56,
                // hardcoded-color-allow-next-line
                background: "rgba(255,255,255,0.08)",
                // hardcoded-color-allow-next-line
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.90)", borderRadius: 12, textDecoration: "none",
                fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 700, fontSize: 15,
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
              <Calendar size={18} strokeWidth={2} aria-hidden /> Apple or Outlook
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
