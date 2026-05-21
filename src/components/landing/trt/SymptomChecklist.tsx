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

const HEADING = "The signs we hear most.";

const SYMPTOMS = [
  "Tired by noon. Coffee stopped working.",
  "Workouts stopped producing results.",
  "Sex drive is down. You've noticed. So has she.",
  "Labs came back normal. You don't feel normal.",
] as const;

interface SymptomChecklistProps {
  formId?: string;
}

export const SymptomChecklist = ({ formId: _formId = "hero-form" }: SymptomChecklistProps) => {
  return (
    <div
      style={{
        // hardcoded-color-allow-next-line
        background: "rgba(255,255,255,0.07)",
        // hardcoded-color-allow-next-line
        border: "1px solid rgba(255,255,255,0.11)",
        borderRadius: 16,
        padding: "28px 28px 24px",
      }}
    >
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.02em",
          color: "var(--brand-cta)",
          marginBottom: 12,
          lineHeight: 1.2,
          textTransform: "none",
        }}
      >
        {HEADING}
      </p>

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
              alignItems: "center",
              gap: 12,
              padding: "6px 0",
              fontSize: 16,
              // hardcoded-color-allow-next-line
              color: "#F5F3F0",
              lineHeight: 1.35,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
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


    </div>
  );
};
