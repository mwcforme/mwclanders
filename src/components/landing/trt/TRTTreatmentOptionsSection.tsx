/**
 * Treatment options section for the ProductTRT page.
 * Two cards: Testosterone Therapy (dark) and ED Therapy (white).
 */
import { OrangeBullet, OrangeCTA } from "./TRTProductHelpers";

interface TRTTreatmentOptionsSectionProps {
  onSchedule: () => void;
}

const TRT_BULLETS = [
  "Clinician-prescribed, monitored with regular labs",
  "Multiple delivery options available",
  "Many members report improvements within the first weeks of treatment",
  "Protocol adjusted based on ongoing labs",
] as const;

const ED_BULLETS = [
  "FDA-approved oral and injectable options",
  "Personalized based on labs and history",
  "Options beyond what online clinics offer",
  "Private, in-person visit at Virginia locations",
] as const;

/** Two-card treatment options grid (TRT + ED). */
export const TRTTreatmentOptionsSection = ({ onSchedule }: TRTTreatmentOptionsSectionProps) => (
  <section style={{ background: "#F4F6FA", padding: "80px 24px" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <h2
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(26px, 4vw, 44px)",
            fontWeight: 700,
            color: "var(--brand-navy)",
            marginBottom: 12,
          }}
        >
          Your Treatment, Personalized
        </h2>
        <p style={{ fontSize: 16, color: "var(--c-text-on-light-muted)", maxWidth: 540, margin: "0 auto" }}>
          Our providers prescribe based on your labs and symptoms — not a
          one-size protocol.
        </p>
      </div>

      <div
        className="treatment-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 28,
        }}
      >
        {/* Card 1: Most Popular — dark navy */}
        <div
          className="treatment-card"
          style={{
            background:
              "linear-gradient(145deg, #0B1029 0%, #0e1840 60%, #111B3A 100%)",
            borderRadius: 20,
            padding: "36px 32px",
            borderTop: "3px solid var(--brand-cta)",
            position: "relative",
            boxShadow: "0 8px 40px rgba(11,16,41,0.28)",
          }}
        >
          {/* Most Popular badge */}
          <span
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "var(--brand-cta)",  /* was gradient var(--brand-cta)→#F07820; white/10px on #F07820=2.83:1 FAIL → #B84A08 5.22:1 ✅ */
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              borderRadius: 999,
              padding: "5px 14px",
              boxShadow: "0 3px 10px rgba(255,107,44,0.40)",
            }}
          >
            MOST POPULAR
          </span>
          <h3
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 24,
            }}
          >
            Testosterone Therapy
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
            {TRT_BULLETS.map((item) => (
              <OrangeBullet key={item} light>{item}</OrangeBullet>
            ))}
          </ul>
          <OrangeCTA
            onClick={onSchedule}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Get Started
          </OrangeCTA>
        </div>

        {/* Card 2: ED Therapy — white */}
        <div
          className="treatment-card"
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "36px 32px",
            border: "1px solid #dde3ef",
            boxShadow: "0 4px 20px rgba(11,16,41,0.06)",
          }}
        >
          <h3
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--brand-navy)",
              marginBottom: 24,
            }}
          >
            ED Therapy
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
            {ED_BULLETS.map((item) => (
              <OrangeBullet key={item}>{item}</OrangeBullet>
            ))}
          </ul>
          <OrangeCTA
            onClick={onSchedule}
            style={{
              width: "100%",
              justifyContent: "center",
              background: "var(--brand-navy)",
              boxShadow: "0 6px 24px rgba(11,16,41,0.28)",
            }}
          >
            Get Started
          </OrangeCTA>
        </div>
      </div>
    </div>
  </section>
);
