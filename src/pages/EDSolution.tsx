/**
 * EDSolution — /ed-solution
 * Problem/Solution CRO lander for ED treatment.
 */
import { lazy, Suspense, useState } from "react";
import { Star, Check, X, ChevronDown } from "lucide-react";
import { TRTHeader }        from "@/components/landing/trt/TRTHeader";
import { TRTHeroForm }      from "@/components/landing/trt/TRTHeroForm";
import { CredibilityBand }  from "@/components/landing/trt/CredibilityBand";
import { TRTFooter }        from "@/components/landing/trt/TRTFooter";
import { StickyMobileCTA }  from "@/components/landing/trt/StickyMobileCTA";
import { COPY }             from "@/data/copy";
import { GBP_REVIEWS_URL }  from "@/data/testimonials";
import { SEO }              from "@/components/SEO";
import { useScrollDepth }   from "@/hooks/useAnalytics";

const TRTLocations = lazy(() => import("@/components/landing/trt/TRTLocations").then(m => ({ default: m.TRTLocations })));

const NAVY   = "var(--brand-navy-deep)";
const CREAM  = "var(--brand-cream)";
const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const WHITE  = "#FFFFFF";
// hardcoded-color-allow-next-line
const INK    = "#0B1029";

const PROBLEMS = [
  { label: "You tried what was available online. It worked once, then it didn't." },
  { label: "You don't know why it's happening. That's the real problem." },
  { label: "Your GP wasn't trained for this. It's not what they focus on." },
  { label: "You're avoiding conversations you don't want to have." },
  { label: "You want a real answer, not a 30-day auto-renewal." },
];

const OLD_WAY = [
  "Online intake form. No physician sees you in person.",
  "Medication shipped. No labs drawn first.",
  "One-size prescription, no evaluation of the cause.",
  "Subscriptions that renew whether you improve or not.",
  "No follow-up if it stops working.",
];
const MWC_WAY = [
  "In-person evaluation with a Virginia-licensed physician.",
  "Labs drawn on-site and reviewed before you leave.",
  "Treatment only when clinically appropriate for your case.",
  "No-cost first visit. Transparent pricing before you commit.",
  "Built-in follow-up and protocol adjustment.",
];

const STEPS = [
  { n: "1", title: "In-person evaluation. Private.", body: "A Virginia-licensed physician sits with you face to face. No judgment. You explain what's happening. They listen and evaluate." },
  { n: "2", title: "Labs drawn, results same visit", body: "Bloodwork relevant to your case is drawn on-site. Your provider reviews the results with you before you leave. No portal. No callback." },
  { n: "3", title: "A protocol built for your case", body: "If treatment is appropriate, your provider builds a plan around your specific physiology and what your labs show, not a standard starting point." },
];

const FAQS = [
  { q: "Is this 100% private? Will my insurance or employer find out?", a: "We don't bill insurance for your first visit, so there's no claim filed, no EOB sent to your employer, nothing. Your visit is completely private. HIPAA protects all your information." },
  { q: "What causes ED and how does Men's Wellness Centers evaluate it?", a: "ED commonly has vascular, hormonal, or neurological components. Your provider evaluates contributing factors through an in-person exam and same-day labs. You'll have a real picture before you leave." },
  { q: "What treatment options are available?", a: "Treatment depends on what your evaluation shows. Your provider will discuss options that are clinically appropriate for your case. Treatment is only prescribed when appropriate." },
  { q: "How is this different from an online ED service?", a: "Online services skip the evaluation. They prescribe based on a form, not labs, not an in-person exam, not an understanding of what's actually causing the issue. At Men's Wellness Centers, the evaluation comes first." },
  { q: "What happens at the first visit?", a: "Your provider reviews your symptoms and history, draws labs on-site, and reviews results with you face to face before you leave. The first visit is at no charge." },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: WHITE, borderRadius: 12, marginBottom: 8,
      // hardcoded-color-allow-next-line
      border: "1px solid rgba(11,16,41,0.10)", overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen(v => !v)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, padding: "18px 22px", textAlign: "left",
        background: "none", border: "none", cursor: "pointer", minHeight: 56 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, color: INK, lineHeight: 1.3 }}>{q}</span>
        <ChevronDown size={18} style={{ color: ORANGE, flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
      </button>
      {open && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.7,
        // hardcoded-color-allow-next-line
        color: "rgba(11,16,41,0.70)", padding: "0 22px 18px", margin: 0 }}>{a}</p>}
    </div>
  );
}

const EDSolution = () => {
  useScrollDepth();
  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <SEO
        title="ED Treatment Virginia | In-Person Evaluation | Men's Wellness Centers"
        description="Online pills didn't fix it because a pill isn't an evaluation. In-person ED care with a Virginia physician. Same-day labs. 100% private. 3 centers."
      />
      <TRTHeader />
      <main>

        {/* HERO */}
        <section style={{ background: NAVY, paddingTop: 100, paddingBottom: 72, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05,
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: "220px 220px" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }} className="solution-hero-grid">
            <div className="solution-hero-left">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 18 }}>
                ED Treatment · Virginia · 100% Private
              </p>
              <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(36px,6vw,68px)", lineHeight: 1.02, color: CREAM, textTransform: "uppercase", marginBottom: 20, letterSpacing: "-0.01em" }}>
                Online ED Pills<br />Didn't Fix It.<br />
                <span style={{ color: ORANGE }}>Because A Pill Isn't An Evaluation.</span>
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 18, lineHeight: 1.65,
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.82)", maxWidth: 520, marginBottom: 28 }}>
                ED has a physiological cause. At Men's Wellness Centers, a licensed Virginia provider evaluates the cause in person, draws labs the same day, and builds a real protocol around your case.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#C9A961" stroke="#C9A961" />)}
                </span>
                <a href={GBP_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                    // hardcoded-color-allow-next-line
                    color: "rgba(245,240,235,0.70)", textDecoration: "none" }}>
                  4.9 · 191 verified Google reviews
                </a>
              </div>
            </div>
            <div id="hero-form" className="solution-hero-right">
              <TRTHeroForm service="ed" formId="ed-sol-hero"
                heading="Book Your Private In-Person Visit."
                subheading="No insurance filed. No employer notification. 100% confidential." />
            </div>
          </div>
        </section>

        <CredibilityBand />

        {/* PROBLEM */}
        <section style={{ background: CREAM, padding: "72px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>Sound familiar?</p>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(26px,4vw,44px)", color: INK, textTransform: "uppercase", marginBottom: 40, lineHeight: 1.08 }}>
              The Pill Isn't The Problem.<br />The Cause Is.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0,
              // hardcoded-color-allow-next-line
              borderTop: "1px solid rgba(11,16,41,0.10)" }}>
              {PROBLEMS.map(({ label }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 0",
                  // hardcoded-color-allow-next-line
                  borderBottom: "1px solid rgba(11,16,41,0.10)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: ORANGE, flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.5, color: INK, margin: 0, fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section style={{ background: NAVY, padding: "72px 24px" }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(24px,3.5vw,40px)", color: CREAM, textTransform: "uppercase", textAlign: "center", marginBottom: 40, lineHeight: 1.08 }}>
              Why Online-Only ED Services Fall Short
            </h2>
            <div className="solution-compare-grid">
              <div style={{
                // hardcoded-color-allow-next-line
                background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "28px 24px" }}>
                <p style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  // hardcoded-color-allow-next-line
                  color: "rgba(245,240,235,0.40)", marginBottom: 20 }}>The old way</p>
                {OLD_WAY.map(item => (
                  <div key={item} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                    <X size={15} style={{
                      // hardcoded-color-allow-next-line
                      color: "#EF4444", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.5,
                      // hardcoded-color-allow-next-line
                      color: "rgba(245,240,235,0.60)" }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{
                // hardcoded-color-allow-next-line
                background: "rgba(232,103,10,0.10)", border: "1px solid rgba(232,103,10,0.30)", borderRadius: 14, padding: "28px 24px" }}>
                <p style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 20 }}>Men's Wellness Centers</p>
                {MWC_WAY.map(item => (
                  <div key={item} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                    <Check size={15} style={{ color: ORANGE, flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.5, color: CREAM }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ background: CREAM, padding: "72px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>The solution</p>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(24px,4vw,42px)", color: INK, textTransform: "uppercase", marginBottom: 48, lineHeight: 1.08 }}>
              In-Person. Private.<br />A Provider Who Specializes In This.
            </h2>
            <div className="solution-steps-grid">
              {STEPS.map(s => (
                <div key={s.n} style={{ borderTop: `3px solid ${ORANGE}`, paddingTop: 22 }}>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 42, fontWeight: 700, color: ORANGE, display: "block", lineHeight: 1, marginBottom: 10 }}>{s.n}</span>
                  <h3 style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, fontWeight: 700, color: INK, textTransform: "uppercase", marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.65, color: INK, margin: 0 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section style={{ background: NAVY, padding: "72px 24px" }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(22px,3vw,36px)", color: CREAM, textTransform: "uppercase", textAlign: "center", marginBottom: 40 }}>
              What Members Say
            </h2>
            <div className="solution-reviews-grid">
              {[
                { name: "Mark B.", city: "Richmond, VA", quote: "I'd tried two online services. Neither one asked about anything beyond a few questions. At Men's Wellness Centers they actually drew blood, reviewed it the same visit, and explained exactly what was contributing. That's a different kind of care." },
                { name: "James R.", city: "Newport News, VA", quote: "The discretion was the thing for me. No insurance claim, no one found out. I walked in, had a real conversation with a physician, left with a real answer. It was exactly what I needed." },
              ].map(t => (
                <figure key={t.name} style={{
                  // hardcoded-color-allow-next-line
                  background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 22px",
                  // hardcoded-color-allow-next-line
                  border: "1px solid rgba(255,255,255,0.09)", margin: 0 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#C9A961" stroke="#C9A961" />)}
                  </div>
                  <blockquote style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.65,
                    // hardcoded-color-allow-next-line
                    color: "rgba(245,240,235,0.85)", margin: "0 0 16px", fontStyle: "normal" }}>"{t.quote}"</blockquote>
                  <figcaption>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: ORANGE, margin: 0 }}>{t.name}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12,
                      // hardcoded-color-allow-next-line
                      color: "rgba(245,240,235,0.50)", marginTop: 2 }}>{t.city} · Verified Google Review</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: CREAM, padding: "72px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(24px,3.5vw,38px)", color: INK, textTransform: "uppercase", textAlign: "center", marginBottom: 36 }}>
              Common Questions
            </h2>
            {FAQS.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: NAVY, padding: "72px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }} className="solution-cta-grid">
            <div>
              <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", color: CREAM, textTransform: "uppercase", lineHeight: 1.05, marginBottom: 16 }}>
                Get A Real Answer.<br />Not Another Subscription.
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.65,
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.75)", marginBottom: 32 }}>
                {COPY.offer.finalSubhead}
              </p>
              <Suspense fallback={null}><TRTLocations /></Suspense>
            </div>
            <div>
              <TRTHeroForm service="ed" formId="ed-sol-cta"
                heading="Book Your Private Visit."
                subheading="100% confidential. No insurance filed. Virginia locations." />
            </div>
          </div>
        </section>
      </main>
      <TRTFooter />
      <StickyMobileCTA />
      <style>{`
        .solution-hero-grid { display:grid; grid-template-columns:1fr; gap:48px; }
        .solution-hero-right { width:100%; }
        .solution-compare-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        .solution-steps-grid { display:grid; grid-template-columns:1fr; gap:32px; }
        .solution-reviews-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        .solution-cta-grid { display:grid; grid-template-columns:1fr; gap:48px; }
        @media (min-width:900px) {
          .solution-hero-grid { grid-template-columns:1fr 460px; }
          .solution-compare-grid { grid-template-columns:1fr 1fr; }
          .solution-steps-grid { grid-template-columns:repeat(3,1fr); }
          .solution-reviews-grid { grid-template-columns:1fr 1fr; }
          .solution-cta-grid { grid-template-columns:1fr 1fr; align-items:start; }
        }
      `}</style>
    </div>
  );
};

export default EDSolution;
