import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface SurveyCardProps {
  /** Optional override label, e.g. "Almost done. 2 quick questions" */
  progressLabel?: string;
  /** Number of segments filled (orange). Defaults derived from step/total. */
  filledSegments?: number;
  /** Total segments in the bar. Defaults to 3. */
  totalSegments?: number;
  /** Legacy: 1-indexed step (used when progressLabel/filledSegments not provided). */
  step?: number;
  total?: number;
  title: string;
  subtitle: string;
  /** Optional small muted helper line under the subtitle. */
  helperText?: string;
  children: ReactNode;
  prevLabel?: string;
  onPrev: () => void;
}

const SurveyCard = ({
  progressLabel: _progressLabel,
  filledSegments: _filledSegments,
  totalSegments: _totalSegments = 3,
  step: _step,
  total: _total,
  title,
  subtitle,
  helperText,
  children,
  prevLabel = "Back",
  onPrev,
}: SurveyCardProps) => {
  return (
    <div className="px-3 md:px-6 py-4 md:py-12 pb-8 md:pb-12 flex justify-center">
      <div
        className="w-full"
        style={{
          maxWidth: 680,
          background: "var(--bg-white)",
          // hardcoded-color-allow-next-line
          border: "3px solid #5A6478",
          borderRadius: 16,
          // hardcoded-color-allow-next-line
          boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="p-4 md:p-10">

          {/* Title */}
          <h1
            className="text-center"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 36px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "var(--brand-navy-deep)",
              textTransform: "none",
              textWrap: "balance",
              marginBottom: 8,
            } as React.CSSProperties}
          >
            {title}
          </h1>
          <p
            className="text-center text-base md:text-xl"
            style={{
              fontWeight: 500,
              // hardcoded-color-allow-next-line
              color: "#3A4258",
              lineHeight: 1.4,
              marginBottom: helperText ? 4 : 18,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {subtitle}
          </p>
          {helperText && (
            <p
              className="text-center text-sm"
              style={{
                color: "var(--c-text-on-light-muted-2)",
                fontFamily: "Inter, sans-serif",
                marginBottom: 18,
              }}
            >
              {helperText}
            </p>
          )}

          {/* Options / content */}
          <div className="space-y-2 md:space-y-3">{children}</div>

          {/* Back link */}
          <div className="flex justify-center mt-3 md:mt-6">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-2 focus:outline-none focus-visible:underline"
              style={{
                background: "transparent",
                border: 0,
                // hardcoded-color-allow-next-line
                color: "#5A6478",
                fontFamily: "Inter, sans-serif",
                fontSize: 18,
                fontWeight: 600,
                padding: "12px 16px",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              <ArrowLeft size={20} />
              <span>{prevLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyCard;

