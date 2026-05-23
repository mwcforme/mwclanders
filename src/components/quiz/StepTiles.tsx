import { Check } from "lucide-react";
import { QUIZ_TILES, type QuizTileId } from "@/data/quizContent";
import { PrimaryQuizButton } from "./PrimaryQuizButton";
import { QuizShell } from "./QuizShell";

interface StepTilesProps {
  selectedTiles: QuizTileId[];
  onChange: (tiles: QuizTileId[]) => void;
  onSubmit: () => void;
}

/**
 * Step 1 of simplified /quiz.
 * 8 large tap-friendly tiles. Multi-select. "None" is mutually exclusive.
 * Single screen, no scrolling needed on mobile.
 * Progress: 0–40%.
 */
export function StepTiles({ selectedTiles, onChange, onSubmit }: StepTilesProps) {
  const hasSelection = selectedTiles.length > 0;
  const isNone = selectedTiles.length === 1 && selectedTiles[0] === "none";
  const canAdvance = hasSelection;

  // Progress 0 → 40% as user makes selection
  const progress = hasSelection ? 40 : 5;

  function toggle(id: QuizTileId) {
    if (id === "none") {
      // "None" clears everything else and toggles itself
      onChange(isNone ? [] : ["none"]);
      return;
    }
    // Any real symptom clears "none"
    const without = selectedTiles.filter((t) => t !== "none" && t !== id);
    if (selectedTiles.includes(id)) {
      onChange(without);
    } else {
      onChange([...without, id]);
    }
  }

  return (
    <QuizShell
      progress={progress}
      cta={
        <PrimaryQuizButton disabled={!canAdvance} onClick={onSubmit}>
          See what my results mean &rarr;
        </PrimaryQuizButton>
      }
    >
      <header className="mb-8 md:mb-10">
        <p
          className="text-xs uppercase tracking-[0.18em] mb-3 font-semibold"
          style={{ color: "var(--brand-cta-accessible)" }}
        >
          Step 1 of 3
        </p>
        <h1
          className="font-bold uppercase leading-[1.05]"
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(28px, 5vw, 46px)",
            letterSpacing: "0.01em",
          }}
        >
          Which of these{" "}
          <span style={{ color: "var(--brand-cta)" }}>sound familiar?</span>
        </h1>
        {/* hardcoded-color-allow-next-line */}
        <p className="mt-4 text-base md:text-lg max-w-[600px]" style={{ color: "rgba(245,240,235,0.85)" }}>
          Select all that apply — takes about 10 seconds.
        </p>
      </header>

      {/* Tile grid: 2-col mobile, 4-col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUIZ_TILES.map((tile) => {
          const selected = selectedTiles.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(tile.id)}
              className="relative flex flex-col items-center justify-center gap-2 rounded-xl p-4 md:p-5 text-center transition-colors active:scale-[0.98]"
              style={{
                // hardcoded-color-allow-next-line
                background: selected ? "var(--brand-cta)" : "rgba(255,255,255,0.06)",
                // hardcoded-color-allow-next-line
                border: `1.5px solid ${selected ? "var(--brand-cta)" : "rgba(255,255,255,0.25)"}`,
                minHeight: 96,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {selected ? (
                <span
                  className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full"
                  // hardcoded-color-allow-next-line
                  style={{ background: "rgba(0,0,0,0.20)" }}
                  aria-hidden="true"
                >
                  <Check size={11} strokeWidth={3} color="white" />
                </span>
              ) : null}
              <span
                className="text-3xl leading-none"
                aria-hidden="true"
                style={{ fontSize: 32 }}
              >
                {tile.emoji}
              </span>
              <span
                className="text-[13px] md:text-sm font-semibold leading-snug"
                style={{ color: selected ? "white" : "rgba(245,240,235,0.92)" }}
              >
                {tile.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* hardcoded-color-allow-next-line */}
      <p className="mt-8 text-xs text-center" style={{ color: "rgba(245,240,235,0.55)" }}>
        {hasSelection
          ? `${isNone ? "None selected" : `${selectedTiles.length} selected`} — tap Continue when ready`
          : "Tap everything that applies to you"}
      </p>
    </QuizShell>
  );
}
