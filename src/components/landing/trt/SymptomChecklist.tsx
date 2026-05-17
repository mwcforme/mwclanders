/**
 * SymptomChecklist — scannable self-identification block.
 *
 * Non-interactive display list. 6 items. Orange circle check prefix.
 * Followed by bridge copy and an anchor CTA scrolling to the form.
 *
 * Based on: Defy Medical "Why do I feel this way?" pattern + Ideal Image
 * symptom self-id, adapted to scannable-not-interactive per brief constraint.
 *
 * NOT a quiz. Does not collect answers. Does not navigate.
 */

import { CheckCircle, ChevronDown } from "lucide-react";
import { COPY } from "@/data/copy";

const SYMPTOMS = [
  "Energy drops by 2pm no matter how much you sleep",
  "Workouts stopped producing results",
  "Sex drive is down. You've noticed. So has she.",
  "You can't focus the way you used to",
  "Gaining weight doing the same things that used to work",
  "Your doctor says your bloodwork looks fine",
] as const;

interface SymptomChecklistProps {
  formId?: string; // id of the form to scroll to on anchor click
}

export const SymptomChecklist = ({ formId = "hero-form" }: SymptomChecklistProps) => {
  return (
    <div
      style={{
        background: "#161B3A",
        border: "1px solid #2B3247",
        borderRadius: 16,
        padding: "24px 20px 20px",
      }}
    >
      <h2
        style={{
          fontFamily: "Oswald, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: "#E8670A",
          marginBottom: 16,
          lineHeight: 1.15,
        }}
      >
        Men come to us when this sounds familiar
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
        aria-label="Symptom self-identification checklist"
      >
        {SYMPTOMS.map((symptom) => (
          <li
            key={symptom}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "9px 0",
              borderBottom: "1px solid rgba(43,50,71,0.60)",
              fontSize: 14,
              color: "#F5F3F0",
              lineHeight: 1.45,
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
            }}
          >
            <CheckCircle
              size={18}
              strokeWidth={2}
              aria-hidden
              style={{ color: "#E8670A", flexShrink: 0, marginTop: 1 }}
            />
            {symptom}
          </li>
        ))}
      </ul>

      {/* Bridge copy */}
      <p
        style={{
          fontSize: 13,
          color: "#B0ADA8",
          lineHeight: 1.55,
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid #2B3247",
          fontFamily: "Inter, sans-serif",
        }}
      >
        If any of these sound like you, your{" "}
        <strong style={{ color: "#F5F3F0", fontWeight: 600 }}>
          60-Minute Physician Assessment
        </strong>{" "}
        is a no-cost consultation.
      </p>

      {/* Anchor CTA */}
      <a
        href={`#${formId}`}
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
          color: "#E8670A",
          padding: "10px 0 2px",
          marginTop: 6,
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F3F0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#E8670A")}
      >
          <ChevronDown size={14} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        {COPY.cta.bookConsult}
      </a>
    </div>
  );
};
