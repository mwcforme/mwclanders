import { useMemo, useState } from "react";
import { CATEGORIES } from "@/data/quizContent";
import { SymptomRow } from "./SymptomRow";
import { PrimaryQuizButton } from "./PrimaryQuizButton";
import { QuizShell } from "./QuizShell";
import type { QuizAnswer } from "@/lib/quizState";

interface StepSymptomsProps {
  symptoms: Record<string, QuizAnswer | null>;
  onChange: (id: string, value: QuizAnswer) => void;
  onSubmit: () => void;
}

/**
 * Step 1 of /quiz. Sequential unlock per category (last category unlocks all),
 * inline error state on submit, sticky CTA.
 * Progress maps 0–60% based on answered count.
 */
export function StepSymptoms({ symptoms, onChange, onSubmit }: StepSymptomsProps) {
  const [showErrors, setShowErrors] = useState(false);
  const [lastAnswered, setLastAnswered] = useState<string | null>(null);

  const totalCount = useMemo(
    () => CATEGORIES.reduce((n, c) => n + c.symptoms.length, 0),
    [],
  );
  const answeredCount = useMemo(
    () => Object.values(symptoms).filter((v) => v !== null).length,
    [symptoms],
  );
  const progress = (answeredCount / totalCount) * 60;

  const allAnswered = answeredCount === totalCount;

  function handleChange(id: string, value: QuizAnswer) {
    onChange(id, value);
    setLastAnswered(id);
  }

  function handleSubmit() {
    if (!allAnswered) {
      setShowErrors(true);
      // Scroll to first unanswered row.
      window.requestAnimationFrame(() => {
        const firstUnanswered = Object.keys(symptoms).find((k) => symptoms[k] === null);
        if (firstUnanswered) {
          document
            .querySelector(`[data-symptom-id="${firstUnanswered}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      return;
    }
    onSubmit();
  }

  return (
    <QuizShell
      progress={progress}
      cta={
        <PrimaryQuizButton onClick={handleSubmit}>
          Get my results &rarr;
        </PrimaryQuizButton>
      }
    >
      <header className="mb-8 md:mb-12">
        <h1
          className="font-bold uppercase leading-[1.05]"
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(28px, 5vw, 48px)",
            letterSpacing: "0.01em",
          }}
        >
          Answer 5 questions.
          <br />
          <span style={{ color: "var(--brand-cta)" }}>
            Find out if low T is behind it.
          </span>
        </h1>
        <p
          className="mt-5 text-base md:text-lg max-w-[600px]"
          style={{ color: "rgba(245,240,235,0.85)" }}
        >
          Score your symptoms below. We map your results to a clinical severity tier and tell you whether an in-person evaluation makes sense.
        </p>
        <p
          className="mt-4 italic text-sm md:text-[15px] font-medium"
          style={{ color: "#FFB07A" }}
        >
          Score each symptom: 0 = none, 1 = mild, 2 = moderate, 3 = severe.
        </p>
      </header>

      <div className="space-y-7 md:space-y-9">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <section key={cat.id}>
              <div className="flex items-start gap-3 md:gap-4 mb-2">
                <span
                  className="flex items-center justify-center shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-lg"
                  style={{ background: "rgba(232,103,10,0.18)", border: "1px solid rgba(232,103,10,0.35)" }}
                  aria-hidden="true"
                >
                  <Icon size={20} strokeWidth={2.25} style={{ color: "var(--brand-cta)" }} />
                </span>
                <h2
                  className="font-bold uppercase leading-[1.15] pt-1"
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: "clamp(18px, 2.6vw, 22px)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {cat.title}
                </h2>
              </div>
              <p className="text-sm mb-4 ml-[52px] md:ml-[60px]" style={{ color: "rgba(245,240,235,0.75)" }}>
                {cat.description}
              </p>

              <div className="space-y-3">
                {cat.symptoms.map((sym, idx) => {
                  const value = symptoms[sym.id];
                  const previousAnswered =
                    cat.unlockAll || idx === 0 ||
                    typeof symptoms[cat.symptoms[idx - 1].id] === "number";
                  const disabled = !previousAnswered;
                  const showError = showErrors && value === null && !disabled;
                  return (
                    <div key={sym.id} data-symptom-id={sym.id}>
                      <SymptomRow
                        label={sym.label}
                        value={value}
                        disabled={disabled}
                        showError={showError}
                        autoFocus={lastAnswered === cat.symptoms[idx - 1]?.id}
                        onChange={(v) => handleChange(sym.id, v)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-xs text-center" style={{ color: "rgba(245,240,235,0.55)" }}>
        {answeredCount} of {totalCount} answered.
      </p>
    </QuizShell>
  );
}
