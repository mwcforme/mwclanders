/**
 * AffordabilityMemberTerms — 2x2 membership term cards + financing strip.
 */
import { useNavigate } from "react-router-dom";
import { eyebrow, MEMBERSHIP_TERMS } from "@/data/affordabilityContent";
import { PricingCard } from "./PricingCard";

export const AffordabilityMemberTerms = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 md:py-20" style={{ background: "var(--bg-white)" }}>
      <div className="max-w-[1100px] mx-auto px-6">
        <p style={eyebrow}>Membership Terms</p>
        <h2 className="font-bold uppercase" style={{
          fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 3.5vw, 40px)",
          color: "var(--c-text-on-light)", fontWeight: 700, lineHeight: 1.1, marginTop: 0, marginBottom: 8,
        }}>
          CHOOSE YOUR TERM AT YOUR VISIT.
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "var(--c-text-on-light-muted)", lineHeight: 1.6, marginTop: 0, marginBottom: 40 }}>
          All terms reviewed in writing. No pressure to decide on the spot.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {MEMBERSHIP_TERMS.map((t) => <PricingCard key={t.term} {...t} />)}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "var(--brand-cream)", borderRadius: "var(--radius-md)", padding: "20px 24px" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "var(--c-text-on-light)", margin: 0, lineHeight: 1.5 }}>
            As little as <strong>$179/month</strong> with financing, subject to credit approval.
          </p>
          <button type="button" onClick={() => navigate("/book/location")}
            className="inline-flex items-center justify-center rounded-lg px-7 font-bold cursor-pointer border-none"
            style={{ height: 48, background: "var(--brand-cta)", color: "var(--c-text-on-dark)", fontSize: 14, letterSpacing: "0.05em", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}>
            Book in-person visit online
          </button>
        </div>
      </div>
    </section>
  );
};
