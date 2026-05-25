/**
 * AffordabilityHowPricing — 3-col "what determines your rate" cards section.
 */
import { eyebrow, HOW_PRICING_CARDS } from "@/data/affordabilityContent";

export const AffordabilityHowPricing = () => (
  <section className="py-16 md:py-20" style={{ background: "var(--brand-cream)" }}>
    <div className="max-w-[1100px] mx-auto px-6">
      <p style={eyebrow}>How Pricing Works</p>
      <h2 className="font-bold uppercase" style={{
        fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 3.5vw, 40px)",
        color: "var(--c-text-on-light)", fontWeight: 700, lineHeight: 1.1, marginTop: 0, marginBottom: 40,
      }}>
        THREE THINGS DETERMINE YOUR RATE.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HOW_PRICING_CARDS.map(({ Icon, title, body }) => (
          <div key={title} style={{
            background: "var(--bg-white)", borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)", padding: "28px 24px",
            border: "1px solid var(--c-border-on-light)",
          }}>
            <Icon size={28} strokeWidth={1.75}
              style={{ color: "var(--brand-cta)", marginBottom: 16, display: "block" }} aria-hidden />
            <h3 style={{
              fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20,
              color: "var(--c-text-on-light)", marginTop: 0, marginBottom: 10,
            }}>
              {title}
            </h3>
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 16,
              color: "var(--c-text-on-light-muted)", lineHeight: 1.6, margin: 0,
            }}>
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
