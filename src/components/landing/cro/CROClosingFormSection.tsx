/**
 * CROClosingFormSection — bottom repeat of the hero form with CTA copy.
 */
import { CROHeroForm } from "./CROHeroForm";

export const CROClosingFormSection = () => (
  <section id="final-cta" style={{ background: "var(--brand-navy-deep)", scrollMarginTop: 64 }}>
    <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
      <p style={{
        fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "var(--brand-cta)",
        borderLeft: "3px solid var(--brand-cta)", paddingLeft: 10, lineHeight: 1, marginBottom: 16,
      }}>
        Ready to Start
      </p>
      <h2 className="font-bold uppercase text-center" style={{
        fontFamily: "Oswald, sans-serif", fontSize: "clamp(26px, 3.5vw, 42px)",
        color: "var(--c-text-on-dark)", fontWeight: 700, lineHeight: 1.1, marginBottom: 8,
      }}>
        Claim Your No-Cost Visit Today
      </h2>
      {/* hardcoded-color-allow-next-line */}
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: "rgba(255,255,255,0.75)", marginBottom: 32, textAlign: "center" }}>
        Same-day availability. Labs and evaluation on-site. No obligation to proceed.
      </p>
      <CROHeroForm
        formId="cro-cf"
        source="cro-op-closing"
        heading="Claim Your No-Cost Consultation"
        subheading="Labs drawn on-site. Results reviewed same visit. Leave with a plan."
      />
    </div>
  </section>
);
