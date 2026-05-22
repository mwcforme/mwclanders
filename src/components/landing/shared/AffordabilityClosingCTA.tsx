/**
 * AffordabilityClosingCTA — dark navy closing section with booking CTA and disclaimers.
 */
import { useNavigate } from "react-router-dom";
import { eyebrow } from "@/data/affordabilityContent";

const DISCLAIMER = "Treatment requires a clinical evaluation and is provided only when medically appropriate. Actual treatment plan, pricing, and medication type are determined by a licensed provider at your no-cost consultation. Financing is provided by third-party lenders, not Men's Wellness Centers. The $179/month example reflects a representative 36-month financed term; actual payment depends on creditworthiness, loan amount, APR, and repayment term. APR varies by lender. Not all applicants will qualify. This is not a credit offer or commitment to lend. FSA/HSA eligibility depends on your plan administrator. Membership terms and inclusions are reviewed in writing at your consultation prior to any commitment.";

export const AffordabilityClosingCTA = () => {
  const navigate = useNavigate();
  return (
    <section id="final-cta" className="py-14 md:py-20" style={{ background: "var(--brand-navy-deep)" }}>
      <div className="max-w-[1100px] mx-auto px-6 text-center">
        <p style={{ ...eyebrow, display: "inline-block", marginBottom: 20 }}>Ready?</p>
        <h2 className="font-bold uppercase" style={{
          fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 48px)",
          color: "var(--brand-cream)", fontWeight: 700, lineHeight: 1.1, marginTop: 0, marginBottom: 16,
        }}>
          YOUR PRICING IS REVIEWED AT THE CONSULTATION.
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: "var(--c-text-on-dark-muted)", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 32px" }}>
          Your provider walks every number with you in writing at your visit. You decide what to do with that information.
        </p>
        <button type="button" onClick={() => navigate("/book/location")}
          className="inline-flex items-center justify-center rounded-lg px-10 font-bold cursor-pointer border-none"
          style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "var(--c-text-on-dark)", fontSize: "clamp(15px, 3.5vw, 19px)", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}>
          Book My No-Cost Visit
        </button>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "var(--c-text-on-dark-muted)", lineHeight: 1.6, maxWidth: 760, margin: "40px auto 0", textAlign: "center" }}>
          {DISCLAIMER}
        </p>
      </div>
    </section>
  );
};
