/**
 * "How It Works" 3-step process section for the ProductTRT page.
 * White background, numbered cards with orange accent bars, connecting line.
 */
import { ArrowRight } from "lucide-react";
import { Eyebrow, OrangeCTA } from "./TRTProductHelpers";

interface TRTProcessSectionProps {
  onSchedule: () => void;
}

interface ProcessStep {
  num: string;
  title: string;
  desc: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    num: "1",
    title: "Medical Intake",
    desc: "Complete a brief health form online before your visit.",
  },
  {
    num: "2",
    title: "Meet Your Provider",
    desc: "Face-to-face with a licensed Virginia provider. Labs drawn on-site.",
  },
  {
    num: "3",
    title: "Start Treatment",
    desc: "Results reviewed the same visit. Protocol begins if appropriate.",
  },
];

/** Three-step process section explaining the TRT consultation flow. */
export const TRTProcessSection = ({ onSchedule }: TRTProcessSectionProps) => (
  <section style={{ background: "#fff", padding: "80px 24px" }}>
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <h2
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(26px, 4vw, 44px)",
            fontWeight: 700,
            color: "var(--brand-navy)",
            lineHeight: 1.15,
          }}
        >
          Simple. In-person. Same Day.
        </h2>
      </div>

      <div
        className="steps-wrapper"
        style={{ position: "relative", marginBottom: 52 }}
      >
        {/* Connecting line — desktop only */}
        <div className="steps-connector" aria-hidden />

        <div
          className="steps-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            position: "relative",
            zIndex: 1,
          }}
        >
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.num}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "32px 28px 28px",
                border: "1px solid #e4e9f4",
                boxShadow: "0 4px 24px rgba(11,16,41,0.07)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Step number */}
              <span
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 52,
                  fontWeight: 700,
                  color: "#E8670A",
                  lineHeight: 1,
                  marginBottom: 16,
                  display: "block",
                }}
              >
                {step.num}
              </span>
              <h3
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--brand-navy)",
                  marginBottom: 10,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--c-text-on-light-muted)",
                  lineHeight: 1.6,
                  margin: "0 0 auto",
                }}
              >
                {step.desc}
              </p>
              {/* Bottom orange accent bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background:
                    "linear-gradient(90deg, #E8670A 0%, #F07820 100%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <OrangeCTA onClick={onSchedule} style={{ fontSize: 17, padding: "15px 44px" }}>
          Get Started Now <ArrowRight size={17} strokeWidth={2.5} />
        </OrangeCTA>
      </div>
    </div>
  </section>
);
