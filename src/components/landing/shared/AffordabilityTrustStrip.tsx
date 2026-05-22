/**
 * AffordabilityTrustStrip — 4-stat credibility band for /pricing.
 */
import { TRUST_STATS } from "@/data/affordabilityContent";

export const AffordabilityTrustStrip = () => (
  <section style={{ background: "var(--brand-navy-deep)", borderTop: "1px solid var(--c-border-on-dark)" }}>
    <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 text-center">
      {TRUST_STATS.map((stat) => (
        <div key={stat.value} className="flex flex-col items-center gap-2 px-2 py-5 md:py-7">
          <div className="font-bold uppercase" style={{
            fontFamily: "Oswald, sans-serif", color: "var(--c-text-on-dark)",
            fontSize: "clamp(18px, 3vw, 30px)", lineHeight: 1, letterSpacing: "-0.01em",
          }}>
            {stat.value}
          </div>
          <div className="uppercase" style={{
            fontFamily: "Inter, sans-serif",
            // hardcoded-color-allow-next-line
            color: "rgba(255,255,255,0.70)",
            fontSize: 11, letterSpacing: "0.10em", fontWeight: 700, lineHeight: 1.45,
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </section>
);
