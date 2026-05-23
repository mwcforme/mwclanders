import { Phone } from "lucide-react";
import { QuizShell } from "./QuizShell";

const PHONE_DISPLAY = "(866) 344-4955";
const PHONE_HREF = "tel:+18663444955";

interface StepSafetyProps {
  /**
   * Called when the user answers the disqualifier question.
   * true  → history of prostate/breast cancer (disqualified)
   * false → no contraindication (advance to lead form)
   */
  onAnswer: (hasContraindication: boolean) => void;
}

/**
 * Step 2 of simplified /quiz. Single yes/no cancer history disqualifier.
 * Selecting Yes or No advances automatically — no separate Continue button.
 * Progress: 40–75%.
 */
export function StepSafety({ onAnswer }: StepSafetyProps) {
  const progress = 60;

  return (
    <QuizShell progress={progress}>
      <header className="mb-10 md:mb-12">
        <p
          className="text-xs uppercase tracking-[0.18em] mb-3 font-semibold"
          style={{ color: "var(--brand-cta-accessible)" }}
        >
          Step 2 of 3
        </p>
        <h1
          className="font-bold uppercase leading-[1.05]"
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(28px, 5vw, 44px)",
            letterSpacing: "0.01em",
          }}
        >
          One quick{" "}
          <span style={{ color: "var(--brand-cta)" }}>medical question.</span>
        </h1>
        {/* hardcoded-color-allow-next-line */}
        <p className="mt-4 text-base md:text-lg max-w-[560px]" style={{ color: "rgba(245,240,235,0.85)" }}>
          This helps us match you with the right care.
        </p>
      </header>

      <div className="max-w-[560px]">
        {/* hardcoded-color-allow-next-line */}
        <p className="text-lg md:text-xl font-semibold leading-snug mb-8" style={{ color: "rgba(245,240,235,0.95)" }}>
          Have you ever been diagnosed with prostate cancer or breast cancer?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onAnswer(true)}
            className="rounded-xl py-5 px-6 font-bold uppercase tracking-[0.06em] text-base transition-colors active:scale-[0.98]"
            style={{
              // hardcoded-color-allow-next-line
              background: "rgba(255,255,255,0.06)",
              // hardcoded-color-allow-next-line
              border: "1.5px solid rgba(255,255,255,0.25)",
              // hardcoded-color-allow-next-line
              color: "rgba(245,240,235,0.92)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onAnswer(false)}
            className="rounded-xl py-5 px-6 font-bold uppercase tracking-[0.06em] text-base transition-colors active:scale-[0.98]"
            style={{
              background: "var(--brand-cta)",
              border: "1.5px solid var(--brand-cta)",
              color: "white",
              // hardcoded-color-allow-next-line
              boxShadow: "0 8px 24px rgba(232,103,10,0.35)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            No
          </button>
        </div>

        {/* hardcoded-color-allow-next-line */}
        <p className="mt-8 text-xs" style={{ color: "rgba(245,240,235,0.55)" }}>
          Your answer is private. A licensed provider reviews all information before any treatment is prescribed.
        </p>

        {/* Phone link for users who want to speak with someone */}
        <div
          className="mt-6 rounded-xl p-4 flex items-center gap-3"
          style={{
            // hardcoded-color-allow-next-line
            background: "rgba(255,255,255,0.04)",
            // hardcoded-color-allow-next-line
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Phone size={16} style={{ color: "var(--brand-cta)", flexShrink: 0 }} aria-hidden="true" />
          {/* hardcoded-color-allow-next-line */}
          <p className="text-sm" style={{ color: "rgba(245,240,235,0.75)" }}>
            Prefer to speak with someone first?{" "}
            <a
              href={PHONE_HREF}
              className="font-semibold underline"
              style={{ color: "var(--brand-cta-accessible)" }}
            >
              Call {PHONE_DISPLAY}
            </a>
          </p>
        </div>
      </div>
    </QuizShell>
  );
}
