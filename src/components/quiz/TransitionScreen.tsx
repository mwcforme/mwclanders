import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";

interface TransitionScreenProps {
  /** Headline. Will render in Oswald uppercase. */
  headline: string;
  /** Optional small subtext under the headline. */
  subtext?: string;
  /** Total time in ms before `onDone` fires. */
  durationMs: number;
  /** Tick-off checklist items. Distribute evenly across `durationMs`. */
  checklist?: string[];
  /** Show a 0-100% progress bar synced to durationMs. */
  withProgressBar?: boolean;
  onDone: () => void;
}

/**
 * Full-screen Navy transition shown between quiz steps.
 * Used for "Analyzing..." and "Finalizing your results...".
 */
export function TransitionScreen({
  headline, subtext, durationMs, checklist = [], withProgressBar, onDone,
}: TransitionScreenProps) {
  const [progress, setProgress] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (checklist.length > 0) {
        const slot = durationMs / checklist.length;
        setDoneCount(Math.min(checklist.length, Math.floor(elapsed / slot) + 1));
      }
      if (elapsed >= durationMs) {
        window.clearInterval(interval);
        onDone();
      }
    }, 80);
    return () => window.clearInterval(interval);
  }, [durationMs, checklist.length, onDone]);

  return (
    <div
      // hardcoded-color-allow-next-line
      style={{ background: "#000814", color: "var(--brand-cream)", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center px-6 py-10"
    >
      <img
        src="/logos/Text_Logo_white.webp" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
        alt="Men's Wellness Centers"
        className="h-7 md:h-8 w-auto mb-10"
      />

      <h1
        className="font-bold uppercase text-center leading-[1.05]"
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(28px, 6vw, 48px)",
          letterSpacing: "0.01em",
          color: "var(--c-text-on-dark)",
          maxWidth: 560,
        }}
      >
        {headline}
      </h1>

      {subtext ? (
        // hardcoded-color-allow-next-line
        <p className="mt-4 text-center text-sm md:text-base" style={{ color: "rgba(245,240,235,0.78)" }}>
          {subtext}
        </p>
      ) : null}

      <div className="mt-10">
        <Loader2
          size={48}
          className="animate-spin"
          style={{ color: "var(--brand-cta)" }}
          aria-hidden="true"
        />
      </div>

      {withProgressBar ? (
        <div className="mt-10 w-full max-w-[420px]">
          <div className="flex items-center justify-between mb-2 text-xs font-semibold tracking-wider">
            // hardcoded-color-allow-next-line
            <span style={{ color: "rgba(245,240,235,0.65)" }}>Progress</span>
            <span style={{ color: "var(--brand-cta)" }} className="tabular-nums">{progress}%</span>
          </div>
          // hardcoded-color-allow-next-line
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.10)" }}>
            <div
              className="h-full transition-all duration-150 ease-linear"
              style={{ width: `${progress}%`, background: "var(--brand-cta)" }}
            />
          </div>
        </div>
      ) : null}

      {checklist.length > 0 ? (
        <ul className="mt-8 space-y-3 w-full max-w-[420px]">
          {checklist.map((item, i) => {
            const done = i < doneCount;
            return (
              <li
                key={item}
                className="flex items-center gap-3 text-sm transition-opacity"
                style={{
                  // hardcoded-color-allow-next-line
                  color: done ? "var(--brand-cream)" : "rgba(245,240,235,0.45)",
                  opacity: done ? 1 : 0.7,
                }}
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-colors"
                  style={{
                    // hardcoded-color-allow-next-line
                    background: done ? "var(--brand-cta)" : "rgba(255,255,255,0.10)",
                  }}
                >
                  {done ? <Check size={14} strokeWidth={3} color="var(--c-text-on-dark)" /> : null}
                </span>
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
