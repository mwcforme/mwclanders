/**
 * WLSolution — /wl-solution
 * Problem/Solution CRO lander for medical weight loss.
 */
import { useState } from "react";
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


const NAVY   = "var(--brand-navy-deep)";
const CREAM  = "var(--brand-cream)";
const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const WHITE  = "#FFFFFF";
// hardcoded-color-allow-next-line
const INK    = "#0B1029";

const PROBLEMS = [
  { label: "You've done the discipline. The weight doesn't care." },
  { label: "You lose it. Six months later it's back with extra." },
  { label: "Your metabolism has slowed. Harder to lose, easier to gain." },
  { label: "Your doctor told you to eat less and move more. You're already doing that." },
  { label: "The mail-order programs skip the part where they figure out why." },
];

const OLD_WAY = [
  "Generic diet plan with no medical evaluation.",
  "Mail-order medication, no labs, no physician.",
  "Rotating support staff who don't know your history.",
  "Subscriptions that auto-renew whether you improve or not.",
  "No metabolic or hormonal workup before prescribing.",
];
const MWC_WAY = [
  "In-person evaluation with a Virginia-licensed physician.",
  "Labs drawn on-site, metabolic markers reviewed same visit.",
  "Same provider every visit, every time.",
  "No-cost first visit, transparent pricing before you commit.",
  "Protocol adjusted based on your actual lab progress.",
];

const STEPS = [
  { n: "1", title: "Labs drawn. Metabolic picture built.", body: "Blood panels that matter for weight and metabolism are drawn on-site. Your physician reviews what's actually going on before recommending anything." },
  { n: "2", title: "The real driver is identified", body: "Hormones, thyroid, metabolic markers. Your provider looks at what's causing your body to resist change, not just at the number on the scale." },
  { n: "3", title: "A plan built around your biology", body: "If treatment is appropriate, your provider builds a protocol around your specific labs and history, not a starting template or a pre-packaged program." },
];

const FAQS = [
  { q: "What makes medical weight loss different from a diet program?", a: "A diet program manages calories. Medical weight loss starts with understanding what your body is actually doing. Hormonal imbalances, thyroid function, and metabolic resistance all affect how your body manages weight. A physician-led evaluation identifies what's actually in the way." },
  { q: "What does the no-cost visit include?", a: "The first visit is at no charge: a full provider evaluation, in-center labs, and a results review with your physician. We don't bill insurance for the first visit. FSA and HSA cards are accepted." },
  { q: "What happens at the first visit?", a: "Your provider reviews your history and symptoms, draws labs on-site, and reviews the results with you face to face before you leave. You walk out knowing what your labs show and whether treatment makes sense for your case." },
  { q: "Is this covered by insurance or HSA/FSA?", a: "We don't bill insurance, but FSA and HSA cards are accepted. Many members find the transparent cash pricing much simpler than dealing with prior authorizations." },
  { q: "How quickly will I see results?", a: "Individual results vary and depend on your baseline labs, protocol, and lifestyle. Your provider will discuss realistic expectations based on your actual numbers at the consultation." },
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

const WLSolution = () => {
  useScrollDepth();
  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <SEO
        title="Medical Weight Loss Virginia | Physician-Led | Men's Wellness Centers"
        description="The diet worked for six weeks. Then your body fought back. A Virginia physician evaluates what's actually driving your weight and builds a real plan. 3 centers."
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
                Medical Weight Loss · Virginia · Physician-Led
              </p>
              <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(36px,6vw,68px)", lineHeight: 1.02, color: CREAM, textTransform: "uppercase", marginBottom: 20, letterSpacing: "-0.01em" }}>
                The Diet Worked<br />For Six Weeks.<br />
                <span style={{ color: ORANGE }}>Then Your Body Fought Back.</span>
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 18, lineHeight: 1.65,
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.82)", maxWidth: 520, marginBottom: 28 }}>
                Medical weight loss isn't about willpower. At Men's Wellness Centers, a Virginia physician reviews your labs, identifies what's actually driving your weight, and builds a plan around your body, not a generic protocol.
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
              <TRTHeroForm service="wl" formId="wl-sol-hero"
                heading="Book in-person visit"
                subheading="Labs drawn same day. Your physician reviews the results with you." />
            </div>
          </div>
        </section>

        <CredibilityBand />

        {/* PROBLEM */}
        <section style={{ background: CREAM, padding: "72px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>Sound familiar?</p>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(26px,4vw,44px)", color: INK, textTransform: "uppercase", marginBottom: 40, lineHeight: 1.08 }}>
              It's Not Willpower.<br />It's Biology. And Biology Can Be Addressed.
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
              Why Generic Programs Don't Work
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
                      color: "var(--c-error-on-light, #A7211C)", flexShrink: 0, marginTop: 2 }} />
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
              A Virginia Physician Reviews<br />Your Labs. Then Builds Your Plan.
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
                { name: "Brian T.", city: "Richmond, VA", quote: "I'd been on three different programs over four years. All of them worked for a month or two. At Men's Wellness Centers they actually ran labs first. Turns out my testosterone was suppressing my metabolism. That's something none of the diet programs had ever checked." },
                { name: "Clarke M.", city: "Virginia Beach, VA", quote: "What I needed was someone to actually look at my numbers before telling me what to do. That's what they did. Same-day labs, results reviewed before I left. A plan that made sense for where my body actually was." },
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
                Find Out What's<br />Actually In The Way.
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.65,
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.75)", marginBottom: 32 }}>
                {COPY.offer.finalSubhead}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                {[
                  { city: "Richmond", drive: "5 min from I-64", href: "tel:8043464636", phone: "(804) 346-4636" },
                  { city: "Newport News", drive: "3 min from I-64, Exit 258A", href: "tel:7578066263", phone: "(757) 806-6263" },
                  { city: "Virginia Beach", drive: "5 min from I-264", href: "tel:7576124428", phone: "(757) 612-4428" },
                ].map(loc => (
                  <div key={loc.city} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <div>
                      <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 15, textTransform: "uppercase", color: CREAM, margin: "0 0 2px" }}>{loc.city}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(245,240,235,0.50)", margin: 0 }}>{loc.drive}</p>
                    </div>
                    <a href={loc.href} style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, color: ORANGE, textDecoration: "none", whiteSpace: "nowrap" }}>{loc.phone}</a>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <TRTHeroForm service="wl" formId="wl-sol-cta"
                heading="Book in-person visit"
                subheading="Labs drawn same day. Virginia locations. No insurance needed." />
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

export default WLSolution;
