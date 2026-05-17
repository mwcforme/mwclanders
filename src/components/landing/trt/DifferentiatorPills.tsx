/**
 * DifferentiatorPills — horizontal scrollable strip of brand moat claims.
 *
 * Used on the TRT hero (Screen 1) and compact on the schedule screen.
 * Pills are display-only — not interactive.
 * Horizontal scroll masked on the right edge to hint at more content.
 */

const PILLS = [
  "60-MIN VISIT",
  "PHYSICIAN-LED",
  "SAME-DAY LABS",
  "IN-PERSON, VIRGINIA",
] as const;

interface DifferentiatorPillsProps {
  compact?: boolean;
}

export const DifferentiatorPills = ({ compact = false }: DifferentiatorPillsProps) => {
  return (
    <div
      style={{
        display: "flex",
        gap: compact ? 6 : 8,
        overflowX: "auto",
        scrollbarWidth: "none",
        WebkitMaskImage: "linear-gradient(90deg, #000 88%, transparent 100%)",
        maskImage: "linear-gradient(90deg, #000 88%, transparent 100%)",
        paddingBottom: 2,
      }}
      aria-label="Practice differentiators"
    >
      {PILLS.map((label) => (
        <span
          key={label}
          style={{
            flexShrink: 0,
            fontFamily: "Oswald, sans-serif",
            fontWeight: 600,
            fontSize: compact ? 10 : 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            // hardcoded-color-allow-next-line
            color: "#F5F3F0",
            // hardcoded-color-allow-next-line
            background: "#161B3A",
            // hardcoded-color-allow-next-line
            border: "1px solid #2B3247",
            padding: compact ? "5px 10px" : "6px 12px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {/* Orange dot prefix */}
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--brand-cta)",
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          {label}
        </span>
      ))}
    </div>
  );
};
