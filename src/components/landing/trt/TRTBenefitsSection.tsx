/**
 * Benefits section for the ProductTRT page.
 * Shows an image alongside a benefits checklist on a dark gradient background.
 */
import { memo } from "react";
import { Check } from "lucide-react";
import { Eyebrow } from "./TRTProductHelpers";

/** The six key benefits of TRT displayed in the benefits section. */
const BENEFITS = [
  "Increased energy and vitality throughout the day",
  "Improved body composition and muscle retention",
  "Enhanced sexual health and performance",
  "Sharper mental clarity and focus",
  "Better quality sleep",
  "Improved mood and motivation",
] as const;

/** Dark-background benefits section with image + checklist layout. */
export const TRTBenefitsSection = memo(() => (
  <section
    style={{
      background:
        "linear-gradient(135deg, #0B1029 0%, #0D1535 40%, #111B3A 100%)",
      padding: "80px 24px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Dot texture */}
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }}
    />
    <div
      className="benefits-grid"
      style={{
        maxWidth: 1140,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 60,
        alignItems: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Left: image with orange glow ring */}
      <div
        style={{
          borderRadius: 20,
          overflow: "hidden",
          minHeight: 460,
          position: "relative",
          boxShadow:
            "0 0 0 6px rgba(232,103,10,0.20), 0 0 60px rgba(232,103,10,0.15), 0 24px 60px rgba(0,0,0,0.40)",
        }}
      >
        <img
          src="/assets/lp/patient-bp-exam-smiling.webp"
          alt="Athletic man smiling, energetic"
          width={1066}
          height={1600}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            minHeight: 460,
            display: "block",
          }}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent) {
              parent.style.background =
                "linear-gradient(135deg, #1a2448 0%, #0d1535 100%)";
            }
          }}
        />
      </div>

      {/* Right: benefits */}
      <div>
        <Eyebrow>WHY TRT</Eyebrow>
        <h2
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(28px, 4vw, 46px)",
            fontWeight: 700,
            lineHeight: 1.08,
            marginBottom: 36,
          }}
        >
          <span style={{ color: "#fff", display: "block" }}>
            Benefits of
          </span>
          <span style={{ color: "#E8670A", display: "block" }}>
            Testosterone Therapy
          </span>
        </h2>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: 10,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(232,103,10,0.35)",
                  }}
                >
                  <Check size={12} strokeWidth={3} color="#fff" aria-hidden />
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.88)",
                    lineHeight: 1.45,
                  }}
                >
                  {benefit}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
));
TRTBenefitsSection.displayName = "TRTBenefitsSection";


