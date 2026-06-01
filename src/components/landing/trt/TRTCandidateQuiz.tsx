import { useState } from "react";
import { Eyebrow } from "@/components/landing/trt/TRTProductHelpers";

const QUIZ_QUESTIONS: { q: string; options: string[] }[] = [
  {
    q: "Have you noticed a drop in your energy levels?",
    options: ["Yes, significantly", "Somewhat", "Only occasionally", "No, not really"],
  },
  {
    q: "Have you experienced changes in muscle mass or strength?",
    options: ["Noticeable loss", "Some decline", "Hard to tell", "No changes"],
  },
  {
    q: "How would you describe your current libido?",
    options: ["Much lower than before", "Slightly decreased", "About the same", "No changes"],
  },
  {
    q: "How is your sleep quality?",
    options: ["Poor - I struggle most nights", "Fair - some good, some bad", "Good - occasional issues", "Great - no problems"],
  },
  {
    q: "How often do you experience brain fog or difficulty concentrating?",
    options: ["Daily", "A few times a week", "Occasionally", "Rarely or never"],
  },
];

export const TRTCandidateQuiz = ({ onNavigateSchedule }: { onNavigateSchedule: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const isDone = current >= total;
  const progress = isDone ? 100 : (current / total) * 100;

  const handleAnswer = (idx: number) => {
    if (advancing) return;
    setSelected(idx);
    setAdvancing(true);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAdvancing(false);
    }, 300);
  };

  return (
    <section style={{ background: "#FDF6F0", padding: "64px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <Eyebrow onLight>SEE IF YOU ARE A CANDIDATE</Eyebrow>
          </div>
          <h2 style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(24px, 3.5vw, 36px)",
            color: "var(--brand-navy)",
            marginBottom: 8,
            lineHeight: 1.2,
          }}>
            Answer 3 Quick Questions
          </h2>
          <p style={{ fontSize: 16, color: "var(--c-text-on-light-muted)" }}>
            Takes 60 seconds. No login required.
          </p>
        </div>

        {/* Progress track */}
        <div style={{
          height: 6,
          background: "#E8D5C4",
          borderRadius: 999,
          width: 200,
          margin: "0 auto 32px",
          overflow: "hidden",
        }}>
          <div style={{
            height: 6,
            background: "var(--brand-cta)",
            borderRadius: 999,
            width: `${progress}%`,
            transition: "width 300ms ease",
          }} />
        </div>

        {!isDone ? (
          <>
            <h3 style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(18px, 3vw, 26px)",
              color: "var(--c-text-on-light)",
              textAlign: "center",
              maxWidth: 580,
              margin: "0 auto 28px",
              lineHeight: 1.3,
            }}>
              {QUIZ_QUESTIONS[current].q}
            </h3>
            <div
              className="quiz-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}
            >
              {QUIZ_QUESTIONS[current].options.map((opt, i) => {
                const isSel = selected === i;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(i)}
                    className={`quiz-answer${isSel ? " quiz-selected" : ""}`}
                    style={{
                      background: isSel ? "rgba(232,103,10,0.06)" : "#fff",
                      border: `1.5px solid ${isSel ? "var(--brand-cta)" : "#E2E4EC"}`,
                      borderRadius: 14,
                      padding: "18px 14px",
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--c-text-on-light)",
                      cursor: advancing ? "default" : "pointer",
                      minHeight: 60,
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSel && !advancing) {
                        e.currentTarget.style.borderColor = "var(--brand-cta)";
                        e.currentTarget.style.background = "rgba(232,103,10,0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSel) {
                        e.currentTarget.style.borderColor = "#E2E4EC";
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 2, background: "var(--brand-cta)", borderRadius: 999, margin: "0 auto 28px" }} />
            <h3 style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(22px, 3.5vw, 34px)",
              color: "var(--brand-navy)",
              marginBottom: 16,
            }}>
              You Are In Good Hands.
            </h3>
            <p style={{ fontSize: 16, color: "var(--c-text-on-light-muted)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 32px" }}>
              Our licensed Virginia providers review your symptoms, run labs on-site, and build a plan based on your results. Individual results vary.
            </p>
            <button
              type="button"
              onClick={onNavigateSchedule}
              style={{
                background: "var(--brand-cta)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "16px 28px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                width: "100%",
                maxWidth: 480,
                display: "block",
                margin: "0 auto 16px",
                height: 56,
                boxShadow: "0 6px 28px rgba(232,103,10,0.40)",
                letterSpacing: "0.02em",
              }}
            >
              Book in-person visit online
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
