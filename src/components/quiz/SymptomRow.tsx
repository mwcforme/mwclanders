import { useEffect, useRef } from "react";
import type { QuizAnswer } from "@/lib/quizState";

interface SymptomRowProps {
  label: string;
  value: QuizAnswer | null;
  disabled: boolean;
  showError: boolean;
  autoFocus?: boolean;
  onChange: (value: QuizAnswer) => void;
}

const SCALE: QuizAnswer[] = [0, 1, 2, 3];

/**
 * One symptom row. Label on the left, 0 / 1 / 2 / 3 segmented control on the right.
 * Locked rows fade to 40% and ignore pointer events.
 * On mobile the label sits above the control; on desktop they are side by side.
 */
export function SymptomRow({ label, value, disabled, showError, autoFocus, onChange }: SymptomRowProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoFocus && ref.current && !disabled) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [autoFocus, disabled]);

  return (
    <div
      ref={ref}
      className="rounded-xl p-4 md:p-5 transition-opacity"
      style={{
        // hardcoded-color-allow-next-line
        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)",
        // hardcoded-color-allow-next-line
        border: `1px solid ${showError ? "#F97316" : disabled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.16)"}`,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
      aria-disabled={disabled}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
        <span
          className="text-[15px] md:text-base font-medium"
          // hardcoded-color-allow-next-line
          style={{ color: "rgba(245,240,235,0.95)" }}
        >
          {label}
        </span>
        <div className="grid grid-cols-4 gap-2 md:gap-2.5 w-full md:w-[260px]">
          {SCALE.map((n) => {
            const active = value === n;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={active}
                aria-label={`Score ${n}`}
                onClick={() => onChange(n)}
                className="h-12 md:h-12 rounded-lg text-base font-bold transition-colors active:scale-95"
                style={{
                  // hardcoded-color-allow-next-line
                  background: active ? "var(--brand-cta)" : "rgba(255,255,255,0.06)",
                  // hardcoded-color-allow-next-line
                  color: active ? "var(--c-text-on-dark)" : "rgba(245,240,235,0.92)",
                  // hardcoded-color-allow-next-line
                  border: `1.5px solid ${active ? "var(--brand-cta)" : "rgba(255,255,255,0.22)"}`,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
      {showError ? (
        // hardcoded-color-allow-next-line
        <p className="mt-2 text-xs font-semibold" style={{ color: "#F97316" }}>
          Please select an option.
        </p>
      ) : null}
    </div>
  );
}
