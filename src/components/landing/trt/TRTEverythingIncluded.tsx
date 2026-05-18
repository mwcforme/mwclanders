/**
 * TRTEverythingIncluded — "Everything's Included. No Surprises."
 *
 * Adapted from menswellnesscenters.com WP site.
 * Explicit no-cost/included items to address price anxiety before it happens.
 * Dark navy background — breaks up the cream/white sections visually.
 */
import { Check, X } from "lucide-react";

const INCLUDED = [
  "Labs drawn and reviewed on-site",
  "60-minute face-to-face provider visit",
  "Personalized treatment protocol (if appropriate)",
  "No insurance required",
  "No phone tag or waiting rooms",
  "Virginia-licensed providers, every visit",
];

const NOT_INCLUDED = [
  "Hidden fees",
  "Automatic subscriptions",
  "Pressure to commit",
  "Routed to a call center",
];

export const TRTEverythingIncluded = () => (
  <section
    style={{ background: "var(--brand-navy-deep)", scrollMarginTop: 64 }}
  >
    <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2
          style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(26px, 3.5vw, 40px)",
            color: "var(--brand-cream)",
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          EVERYTHING'S INCLUDED.
          <br />
          <span style={{ color: "var(--brand-cta)" }}>NO SURPRISES.</span>
        </h2>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 17,
            color: "var(--c-text-on-dark-muted)",
            lineHeight: 1.6,
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Your first visit is no-cost. Here's exactly what that means.
        </p>
      </div>

      {/* Two-column: included / not included */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Included */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            padding: "28px 28px",
          }}
        >
          <p
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.10em",
              textTransform: "uppercase" as const,
              color: "var(--c-success-on-dark)",
              marginBottom: 20,
            }}
          >
            ✓ What's included
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" as const, gap: 14 }}>
            {INCLUDED.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  color: "var(--c-text-on-dark)",
                  lineHeight: 1.5,
                }}
              >
                <Check size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Not included */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "28px 28px",
          }}
        >
          <p
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.10em",
              textTransform: "uppercase" as const,
              color: "rgba(255,107,122,0.90)",
              marginBottom: 20,
            }}
          >
            ✗ What you won't find here
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" as const, gap: 14 }}>
            {NOT_INCLUDED.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  color: "var(--c-text-on-dark-muted)",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.30)", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>—</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Stat callout */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center" as const,
            }}
          >
            <div
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: 44,
                color: "var(--brand-cta)",
                lineHeight: 1,
              }}
            >
              10,000+
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                color: "var(--c-text-on-dark-subtle)",
                marginTop: 6,
                lineHeight: 1.4,
              }}
            >
              Virginia men treated since 2015.
              <br />
              All at no-cost for the first visit.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
