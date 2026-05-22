/**
 * AffordabilityHero — hero section for the /pricing page.
 * Two offer cards ($0 visit, $179/mo financing) + primary CTA.
 */
import { useNavigate } from "react-router-dom";
import { eyebrow } from "@/data/affordabilityContent";

const OfferCard = ({ price, priceSuffix, title, body }: { price: string; priceSuffix?: string; title: string; body: string }) => (
  <div className="flex-1 rounded-xl p-6" style={{
    // hardcoded-color-allow-next-line
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.35)",
    borderTop: "3px solid var(--brand-cta)",
  }}>
    <div style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 700, color: "var(--brand-cta)", lineHeight: 1, marginBottom: 6 }}>
      {price}{priceSuffix && <span style={{ fontSize: "0.45em", verticalAlign: "middle", fontWeight: 600 }}>{priceSuffix}</span>}
    </div>
    <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 600, color: "var(--brand-cream)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
      {title}
    </div>
    {/* hardcoded-color-allow-next-line */}
    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.55, margin: 0 }}>{body}</p>
  </div>
);

export const AffordabilityHero = () => {
  const navigate = useNavigate();
  return (
    <section id="hero" style={{ background: "var(--brand-navy-deep)", paddingTop: "calc(64px + 64px)", paddingBottom: 64 }}>
      <div className="max-w-[1100px] mx-auto px-6">
        <p style={eyebrow}>Membership Pricing</p>
        <h1 className="font-bold uppercase" style={{
          fontFamily: "Oswald, sans-serif", fontSize: "clamp(36px, 5vw, 60px)",
          color: "var(--brand-cream)", fontWeight: 700, lineHeight: 1.05, marginTop: 0, marginBottom: 24,
        }}>
          START FOR <span style={{ color: "var(--brand-cta)" }}>$0.</span><br />GET YOUR NUMBERS TODAY.
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: "var(--c-text-on-dark-muted)", maxWidth: 560, marginTop: 0, marginBottom: 40, lineHeight: 1.65 }}>
          Your first visit is no-cost. Labs drawn on-site. Provider reviews your results and your full membership pricing in writing before you decide anything.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-8" style={{ maxWidth: 680 }}>
          <OfferCard price="$0" title="First Visit, No Charge"
            body="60-minute visit. Labs drawn and results reviewed the same day. Your provider goes through pricing in writing before you decide." />
          <OfferCard price="$179" priceSuffix="/mo" title="Starting Monthly Rate"
            body="With financing on a 36-month term. Labs, provider visits, and medication included. Subject to credit approval. Not all applicants qualify." />
        </div>
        <button type="button" onClick={() => navigate("/book/location")}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-10 font-bold cursor-pointer border-none"
          style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "var(--c-text-on-dark)", fontSize: "clamp(15px, 3.5vw, 18px)", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}>
          Book My No-Cost Visit
        </button>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "var(--c-text-on-dark-muted)", marginTop: 10, marginBottom: 0 }}>
          Pricing reviewed in writing at your visit. No commitment required.
        </p>
      </div>
    </section>
  );
};
