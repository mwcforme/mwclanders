/**
 * "Recognize the Signs" section for the ProductTRT page.
 * Dark navy background with symptom grid, stat callout, and schedule CTA.
 */
import { memo } from "react";
import { Zap, Heart, Smile, Moon, Dumbbell, Scale, ArrowRight } from "lucide-react";
import { Eyebrow, OrangeCTA } from "./TRTProductHelpers";

interface TRTSignsSectionProps {
  onSchedule: () => void;
}

interface SignTile {
  icon: React.ReactNode;
  label: string;
}

const SIGN_TILES: SignTile[] = [
  { icon: <Zap size={28} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Fatigue" },
  { icon: <Heart size={28} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Low Libido" },
  { icon: <Smile size={28} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Mood Changes" },
  { icon: <Moon size={28} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Poor Sleep" },
  { icon: <Dumbbell size={28} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Reduced Strength" },
  { icon: <Scale size={28} strokeWidth={1.75} color="var(--brand-cta)" />, label: "Weight Gain" },
];

/** Grid of low-T symptom tiles with stat callout and CTA. */
export const TRTSignsSection = memo(({ onSchedule }: TRTSignsSectionProps) => (
  <section
    style={{
      background: "var(--brand-navy)",
      padding: "80px 24px",
    }}
  >
    <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
      <Eyebrow>RECOGNIZE THE SIGNS</Eyebrow>
      <h2
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(28px, 4vw, 46px)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: 12,
          lineHeight: 1.12,
        }}
      >
        You Don't Have to Feel This Way
      </h2>
      <p
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 52,
          maxWidth: 480,
          margin: "0 auto 52px",
        }}
      >
        Low testosterone affects more men than you think.
      </p>

      <div
        className="signs-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 52,
          maxWidth: 820,
          margin: "0 auto 52px",
        }}
      >
        {SIGN_TILES.map(({ icon, label }) => (
          <div
            key={label}
            className="sign-tile"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
              borderRadius: 14,
              padding: "30px 16px 24px",
              border: "1px solid rgba(255,255,255,0.35)",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 12 }} aria-hidden="true">
              {icon}
            </div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Stat callout card */}
      <div
        style={{
          display: "inline-block",
          background: "rgba(255,107,44,0.10)",
          border: "1px solid rgba(255,107,44,0.30)",
          borderRadius: 16,
          padding: "24px 48px",
          marginBottom: 44,
        }}
      >
        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.85)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Around{" "}
          <span
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 52,
              fontWeight: 800,
              color: "var(--brand-cta)",
              display: "block",
              lineHeight: 1,
              margin: "4px 0",
            }}
          >
            40%
          </span>{" "}
          of men over 45 experience low testosterone symptoms
        </p>
      </div>

      {/* Full-width CTA */}
      <div>
        <OrangeCTA
          onClick={onSchedule}
          style={{
            fontSize: 18,
            padding: "17px 64px",
            width: "100%",
            maxWidth: 500,
            justifyContent: "center",
            boxShadow: "0 8px 36px rgba(255,107,44,0.50)",
          }}
        >
          Get Started Now <ArrowRight size={18} strokeWidth={2.5} />
        </OrangeCTA>
      </div>
    </div>
  </section>
));
TRTSignsSection.displayName = "TRTSignsSection";
