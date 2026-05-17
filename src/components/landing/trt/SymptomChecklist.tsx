/**
 * SymptomChecklist — self-identification block used in the hero.
 *
 * Desktop: shown in left column to fill space alongside the form.
 * Mobile: shown below the trust checks.
 *
 * Bullets: specific, no AI slop, no em dashes, Google Ads healthcare compliant.
 * Bridge copy leads to our services, not a generic CTA.
 * Anchor CTA hidden on desktop (form is right there); visible on mobile only.
 */

import { CheckCircle } from "lucide-react";

const HEADING = "IF THIS SOUNDS LIKE THE LAST 12 MONTHS";

const SYMPTOMS = [
  "Tired by noon. Coffee stopped working.",
  "Gym three times a week. Nothing to show for it.",
  "Sex drive is down. You've noticed. So has she.",
  "Sharp at 35. Not at 45. The gap is real.",
  "Same diet. Same routine. Still gaining.",
  "Labs came back normal. You don't feel normal.",
] as const;

const BRIDGE =
  "Most of our patients were told the same thing. " +
  "Bloodwork reviewed by a provider who specializes in men's health tells a different story. " +
  "We offer testosterone therapy, ED care, and medical weight loss with same-day labs.";

interface SymptomChecklistProps {
  formId?: string;
}

export const SymptomChecklist = ({ formId = "hero-form" }: SymptomChecklistProps) => {
  return (
    <div
      style={{
        // hardcoded-color-allow-next-line
        background: "#161B3A",
        // hardcoded-color-allow-next-line
        border: "1px solid #2B3247",
        borderRadius: 16,
        padding: "24px 20px 20px",
      }}
    >
      <h2
        style={{
          fontFamily: "Oswald, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--brand-cta)",
          marginBottom: 16,
          lineHeight: 1.2,
        }}
      >
        {HEADING}
      </h2>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
        aria-label="Symptom self-identification list"
      >
        {SYMPTOMS.map((symptom) => (
          <li
            key={symptom}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "8px 0",
              // hardcoded-color-allow-next-line
              borderBottom: "1px solid rgba(43,50,71,0.60)",
              fontSize: 14,
              // hardcoded-color-allow-next-line
              color: "#F5F3F0",
              lineHeight: 1.4,
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
            }}
          >
            <CheckCircle
              size={16}
              strokeWidth={2}
              aria-hidden
              style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }}
            />
            {symptom}
          </li>
        ))}
      </ul>

      {/* Bridge copy — leads to services, no generic CTA */}
      <p
        style={{
          fontSize: 13,
          // hardcoded-color-allow-next-line
          color: "#B0ADA8",
          lineHeight: 1.55,
          marginTop: 14,
          paddingTop: 14,
          // hardcoded-color-allow-next-line
          borderTop: "1px solid #2B3247",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {BRIDGE}
      </p>

      {/* Anchor CTA — mobile only. On desktop the form is right there. */}
      <a
        href={`#${formId}`}
        className="lg:hidden"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "Oswald, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--brand-cta)",
          padding: "12px 0 2px",
          marginTop: 6,
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          // hardcoded-color-allow-next-line
          e.currentTarget.style.color = "#F5F3F0";
        }}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--brand-cta)")}
      >
        Book My Physician Assessment
      </a>
    </div>
  );
};
