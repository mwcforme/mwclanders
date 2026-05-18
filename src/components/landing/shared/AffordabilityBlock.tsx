/**
 * AffordabilityBlock — drop-in pricing section for TRT, ED, WL landing pages.
 * Addresses "we don't publish prices" objection by routing to consultation CTA.
 *
 * Design rules:
 * - Left-border eyebrow only (no pill)
 * - Icons standalone — no colored circles
 * - CTA: orange pill, height 52–56px
 * - No hardcoded hex — CSS custom properties only
 * - No emojis
 */

import { Calendar, FlaskConical, Tag, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TILES = [
  {
    Icon: Calendar,
    label: "Membership Term",
    desc: "Monthly, 6-month, or 12-month options",
  },
  {
    Icon: FlaskConical,
    label: "Therapy Type",
    desc: "Injectable TRT, oral TRT, or HRT add-ons",
  },
  {
    Icon: Tag,
    label: "Onboarding Offers",
    desc: "Limited promotions for new members",
  },
] as const;

const TRUST_ITEMS = [
  "No hidden fees",
  "Labs & refills included",
  "Financing available",
  "LegitScript certified",
] as const;

interface AffordabilityBlockProps {
  className?: string;
}

export const AffordabilityBlock = ({ className }: AffordabilityBlockProps) => {
  const navigate = useNavigate();

  return (
    <section
      className={className}
      style={{
        background: "var(--brand-cream)",
        padding: "64px 24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Eyebrow — left-border style */}
        <p
          style={{
            borderLeft: "3px solid var(--brand-cta)",
            paddingLeft: 10,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--brand-cta)",
            marginBottom: 16,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Transparent Pricing
        </p>

        {/* H2 */}
        <h2
          style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "var(--brand-navy-deep)",
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          Your Pricing, Explained at the Consultation.
        </h2>

        {/* Sub */}
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.65,
            color: "var(--c-text-on-light-muted)",
            maxWidth: 680,
            marginBottom: 40,
          }}
        >
          Men's Wellness Centers does not publish prices online because your plan
          depends on labs and your physician's recommendation. At your no-cost
          60-minute in-person consultation, your provider walks through every
          number with you in writing, before you decide.
        </p>

        {/* 3 compact tiles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 36,
          }}
        >
          {TILES.map(({ Icon, label, desc }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-white)",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: "20px 20px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <Icon
                size={22}
                strokeWidth={1.75}
                style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }}
                aria-hidden
              />
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--brand-navy-deep)",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--c-text-on-light-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 24px",
            marginBottom: 36,
          }}
        >
          {TRUST_ITEMS.map((item) => (
            <span
              key={item}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--brand-navy-deep)",
              }}
            >
              <Check size={15} strokeWidth={2.5} style={{ color: "var(--brand-cta)" }} aria-hidden />
              {item}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => navigate("/book/location")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 54,
            padding: "0 32px",
            background: "var(--brand-cta)",
            color: "var(--c-text-on-dark)",
            border: "none",
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.05em",
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
        >
          Get My Pricing at the Consultation
        </button>

        {/* Micro-disclaimer */}
        <p
          style={{
            marginTop: 12,
            fontSize: 11,
            color: "var(--c-text-on-light-muted)",
            lineHeight: 1.5,
          }}
        >
          Financing subject to credit approval. Treatment provided only when clinically appropriate.
        </p>
      </div>
    </section>
  );
};

export default AffordabilityBlock;
