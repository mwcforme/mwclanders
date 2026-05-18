/**
 * Final CTA banner section for the ProductTRT page.
 * Dark gradient background with orange glow and a single schedule CTA.
 */
import { ArrowRight } from "lucide-react";
import { OrangeCTA } from "./TRTProductHelpers";

interface TRTFinalCTASectionProps {
  onSchedule: () => void;
}

/** Full-width dark CTA banner that closes the TRT product page. */
export const TRTFinalCTASection = ({ onSchedule }: TRTFinalCTASectionProps) => (
  <section
    style={{
      background:
        "linear-gradient(135deg, #0B1029 0%, #1a1040 50%, #0B1029 100%)",
      padding: "96px 24px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Subtle star/dot noise texture */}
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        pointerEvents: "none",
      }}
    />
    {/* Orange corner glows */}
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 40% 35% at 10% 100%, rgba(232,103,10,0.14) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 90% 0%, rgba(232,103,10,0.14) 0%, transparent 60%)",
        pointerEvents: "none",
      }}
    />

    <div
      style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}
    >
      <h2
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(40px, 6vw, 64px)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: 18,
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
        }}
      >
        Start Your Assessment Today
      </h2>
      <p
        style={{
          fontSize: 19,
          color: "rgba(255,255,255,0.72)",
          marginBottom: 44,
          lineHeight: 1.6,
          maxWidth: 520,
          margin: "0 auto 44px",
        }}
      >
        Virginia's physician-led men's health practice. Same-day labs.
        No-cost consultation.
      </p>
      <OrangeCTA
        onClick={onSchedule}
        style={{
          fontSize: 19,
          padding: "18px 56px",
          boxShadow: "0 8px 40px rgba(232,103,10,0.55)",
        }}
      >
        Get Started Now <ArrowRight size={19} strokeWidth={2.5} />
      </OrangeCTA>
    </div>
  </section>
);
