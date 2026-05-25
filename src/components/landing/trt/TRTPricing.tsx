/**
 * TRTPricing — Transparent $179/month pricing block for /product/trt.
 *
 * Replaces the "pricing explained at consultation" block with an explicit price.
 * Tokens only (no hardcoded hex outside allowed gradient/brand vars).
 */

import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const INCLUDED = [
  "Physician-supervised TRT protocol",
  "All medication & supplies shipped to you",
  "Quarterly lab work & monitoring",
  "Unlimited provider messaging",
  "Dose adjustments at no extra cost",
  "Cancel anytime. No long-term contract.",
] as const;

interface TRTPricingProps {
  className?: string;
}

export const TRTPricing = ({ className }: TRTPricingProps) => {
  const navigate = useNavigate();

  return (
    <section
      className={className}
      style={{
        background: "var(--brand-cream)",
        padding: "72px 24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <p
          style={{
            display: "inline-block",
            borderLeft: "3px solid var(--brand-cta)",
            paddingLeft: 10,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--brand-cta-accessible)",
            marginBottom: 16,
          }}
        >
          Transparent Membership Pricing
        </p>

        <h2
          style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "var(--brand-navy-deep)",
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          One Flat Price. Everything Included.
        </h2>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--c-text-on-light-muted)",
            maxWidth: 560,
            margin: "0 auto 32px",
          }}
        >
          No hidden fees. No surprise lab bills. No insurance hoops.
        </p>

        {/* Price card */}
        <div
          style={{
            background: "var(--bg-white)",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: "36px 28px",
            boxShadow: "0 8px 32px rgba(11,16,41,0.08)",
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: 64,
                color: "var(--brand-navy-deep)",
                lineHeight: 1,
              }}
            >
              $179
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--c-text-on-light-muted)",
              }}
            >
              /month
            </span>
          </div>

          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--brand-cta)",
              marginBottom: 24,
            }}
          >
            All-Inclusive TRT Membership
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 28px",
              textAlign: "left",
              display: "grid",
              gap: 12,
            }}
          >
            {INCLUDED.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontSize: 16,
                  color: "var(--c-text-on-light)",
                  lineHeight: 1.45,
                }}
              >
                <Check
                  size={18}
                  strokeWidth={2.5}
                  style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }}
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => navigate("/product/trt/schedule")}
            style={{
              width: "100%",
              height: 54,
              padding: "0 28px",
              background: "var(--brand-cta)",
              color: "var(--c-text-on-dark)",
              border: "none",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.05em",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--brand-cta-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--brand-cta)";
            }}
          >
            Start With a No-Cost Consultation
          </button>

          <p
            style={{
              marginTop: 14,
              fontSize: 12,
              color: "var(--c-text-on-light-muted)",
              lineHeight: 1.5,
            }}
          >
            Membership begins only if you're clinically approved and choose to enroll.
            Financing available.
          </p>
        </div>
      </div>
    </section>
  );
};


