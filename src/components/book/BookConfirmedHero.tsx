/**
 * BookConfirmedHero — dark navy hero section for the confirmation page.
 * Renders the check icon, appointment ticket, and calendar add buttons.
 */
import { Calendar, Clock, MapPin } from "lucide-react";
import { CelebrationBurst } from "@/components/book/CelebrationBurst";
import type { Location } from "@/data/locations";

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
  return (
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
                  <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(245,243,240,0.85)" }}>{center.city} · In-person · 60 min</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
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

        {/* Calendar buttons */}
        {calLinks && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
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
  );
}
