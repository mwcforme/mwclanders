import { Check } from "lucide-react";
import { SAFETY_CONDITIONS, SAFETY_NONE_ID } from "@/data/quizContent";
import { PrimaryQuizButton } from "./PrimaryQuizButton";
import { QuizShell } from "./QuizShell";

interface StepSafetyProps {
  selected: string[];
  onChange: (next: string[]) => void;
  onSubmit: () => void;
}

/**
 * Step 2 of /quiz. Multi-select tiles. "None of the below" is mutually
 * exclusive with the medical conditions. Progress maps 60–85%.
 */
export function StepSafety({ selected, onChange, onSubmit }: StepSafetyProps) {
  const hasSelection = selected.length > 0;
  const isNone = selected.length === 1 && selected[0] === SAFETY_NONE_ID;
  // Smooth ramp: 60% on entry, +25% as user makes any selection.
  const progress = 60 + (hasSelection ? 25 : 10);

  function toggle(id: string) {
    if (id === SAFETY_NONE_ID) {
      // Selecting "none" clears everything else.
      onChange(isNone ? [] : [SAFETY_NONE_ID]);
      return;
    }
    // Selecting any condition clears "none".
    const without = selected.filter((s) => s !== SAFETY_NONE_ID && s !== id);
    if (selected.includes(id)) onChange(without);
    else onChange([...without, id]);
  }

  function Tile({ id, label }: { id: string; label: string }) {
    const checked = selected.includes(id);
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => toggle(id)}
        className="w-full text-left rounded-xl p-4 md:p-5 flex items-start gap-3 md:gap-4 transition-colors active:scale-[0.99]"
        style={{
          background: checked ? "rgba(232,103,10,0.10)" : "rgba(255,255,255,0.06)",
          border: `1.5px solid ${checked ? "#E8670A" : "rgba(255,255,255,0.18)"}`,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span
          className="flex items-center justify-center shrink-0 w-6 h-6 rounded-md mt-0.5"
          style={{
            background: checked ? "#E8670A" : "transparent",
            border: `1.5px solid ${checked ? "#E8670A" : "rgba(255,255,255,0.40)"}`,
          }}
          aria-hidden="true"
        >
          {checked ? <Check size={14} strokeWidth={3} color="#FFFFFF" /> : null}
        </span>
        <span
          className="text-[15px] md:text-base font-medium leading-snug"
          style={{ color: "rgba(245,240,235,0.95)" }}
        >
          {label}
        </span>
      </button>
    );
  }

  return (
    <QuizShell
      progress={progress}
      cta={
        <PrimaryQuizButton disabled={!hasSelection} onClick={onSubmit}>
          Next &rarr;
        </PrimaryQuizButton>
      }
    >
      <header className="mb-8 md:mb-10">
        <h1
          className="font-bold uppercase leading-[1.05]"
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(28px, 5vw, 44px)",
            letterSpacing: "0.01em",
          }}
        >
          Quick safety check.{" "}
          <span style={{ color: "#E8670A" }}>Do any of these apply to you?</span>
        </h1>
        <p className="mt-4 text-base md:text-lg max-w-[600px]" style={{ color: "rgba(245,240,235,0.85)" }}>
          This helps your provider confirm whether TRT is safe and appropriate for you.
        </p>
      </header>

      <div className="space-y-3">
        <Tile id={SAFETY_NONE_ID} label="None of the below" />
        <div className="my-4" style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />
        {SAFETY_CONDITIONS.map((opt) => (
          <Tile key={opt.id} id={opt.id} label={opt.label} />
        ))}
      </div>

      <p className="mt-8 text-xs" style={{ color: "rgba(245,240,235,0.65)" }}>
        Your answers are private. If anything here applies, you can still continue. A licensed Virginia provider will review your information in person before any prescription is written.
      </p>
    </QuizShell>
  );
}
