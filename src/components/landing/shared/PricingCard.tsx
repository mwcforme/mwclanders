/**
 * PricingCard — membership term card (12/24/30/36-month) for the Affordability page.
 */
import type { MembershipTerm } from "@/data/affordabilityContent";

export const PricingCard = ({ term, badge, desc, featured }: MembershipTerm) => (
  <div style={{
    background: featured ? "var(--brand-navy-deep)" : "var(--bg-white)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    border: featured ? "none" : "1px solid var(--c-border-on-light)",
    borderTop: featured ? "4px solid var(--brand-cta)" : undefined,
    padding: "24px 28px",
  }}>
    <p style={{
      borderLeft: "3px solid var(--brand-cta)", paddingLeft: 10,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
      color: featured ? "var(--brand-cream)" : "var(--brand-cta)",
      fontFamily: "Inter, sans-serif", lineHeight: 1, marginTop: 0, marginBottom: 12,
    }}>
      {badge}
    </p>
    <h3 style={{
      fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 22,
      color: featured ? "var(--brand-cream)" : "var(--c-text-on-light)",
      marginTop: 0, marginBottom: 8,
    }}>
      {term}
    </h3>
    <p style={{
      fontFamily: "Inter, sans-serif", fontSize: 16,
      color: featured ? "var(--c-text-on-dark-muted)" : "var(--c-text-on-light-muted)",
      lineHeight: 1.5, margin: 0,
    }}>
      {desc}
    </p>
  </div>
);
