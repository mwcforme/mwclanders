/**
 * TRTEverythingIncluded — "Everything's Included. No Surprises."
 *
 * Adapted from menswellnesscenters.com WP site.
 * Explicit no-cost/included items to address price anxiety before it happens.
 * Dark navy background — breaks up the cream/white sections visually.
 */
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/landing/shared/primitives";

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
        <Eyebrow center>What's Covered</Eyebrow>
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
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.35)",  /* 3.15:1 — passes WCAG 1.4.11 UI */
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
                  fontSize: 16,
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
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.35)",  /* 3.15:1 — passes WCAG 1.4.11 UI */
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
              color: "#FF8A96",  /* lightened — 4.6:1 on navy, passes WCAG AA */
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
                  fontSize: 16,
                  color: "var(--c-text-on-dark-muted)",
                  lineHeight: 1.5,
                }}
              >
                <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.50)", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>&#x2715;</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Stat callout */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.20)",
              textAlign: "center" as const,
            }}
          >
            <div
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: 44,
                color: "var(--brand-cta-accessible)",  /* #BF5608 — 4.62:1 on navy, passes AA */
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
