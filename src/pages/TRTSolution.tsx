/**
 * TRTSolution — /trt-solution
 * Problem/Solution CRO lander. Dark navy hero, cream/white sections.
 * No SectionReveal (removed for instant render on PPC traffic).
 */
import { lazy, Suspense } from "react";
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
import { useState }         from "react";

const TRTLocations = lazy(() => import("@/components/landing/trt/TRTLocations").then(m => ({ default: m.TRTLocations })));

const NAVY   = "var(--brand-navy-deep)";
const CREAM  = "var(--brand-cream)";
const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const WHITE  = "#FFFFFF";
// hardcoded-color-allow-next-line
const INK    = "#0B1029";

const PROBLEMS = [
  { label: "Still tired at 10am after a full night of sleep." },
  { label: "Training just as hard. Your body stopped responding six months ago." },
  { label: "Your drive, for work, the gym, her, has gone quiet." },
  { label: "Doctor ran labs. Said everything is fine. You don't feel fine." },
  { label: "You looked at online options. Mail-order isn't a protocol." },
];

const OLD_WAY = [
  "Questionnaire only. No physician sees you.",
  "Medication shipped, no labs drawn first.",
  "Different provider every time. Nobody knows your case.",
  "Auto-renews whether you improve or not.",
  "No follow-up, no adjustment.",
];
const MWC_WAY = [
  "In-person evaluation with a Virginia-licensed physician.",
  "Labs drawn on-site and reviewed before you leave.",
  "Same provider every visit.",
  "No-cost first visit. Transparent pricing before you commit.",
  "Built-in follow-up and protocol adjustment.",
];

const STEPS = [
  { n: "1", title: "Labs drawn on-site", body: "No referrals. No separate lab visit. Blood draw happens at your first appointment." },
  { n: "2", title: "Results reviewed same visit", body: "Your physician goes through every number with you before you leave. Face to face, not a portal message." },
  { n: "3", title: "A real protocol, built around your results", body: "If treatment is appropriate, your provider builds a plan around your actual labs, not a starting template." },
];

const FAQS = [
  { q: "How is this different from Hims or an online TRT provider?", a: "Online services are questionnaire-based. A physician never sees you in person and labs are often drawn after prescribing, not before. At Men's Wellness Centers, a Virginia-licensed physician evaluates you face to face, orders labs the same visit, and reviews results with you before any protocol is discussed." },
  { q: "What happens at my first visit?", a: "Your provider reviews your symptoms and history, draws labs on-site, and reviews results with you before you leave. No waiting for a callback. Typically 60 minutes start to finish." },
  { q: "What does the no-cost consultation include?", a: "The first visit is at no charge: provider evaluation, in-center labs, and a full results review. We don't bill insurance for the first visit. FSA and HSA cards are accepted." },
  { q: "When will I notice a difference?", a: "Individual results vary and depend on your baseline labs, lifestyle, and protocol. Your provider will set realistic expectations at your consultation based on your actual numbers." },
  { q: "Is this covered by insurance?", a: "We don't bill insurance, but FSA and HSA cards are accepted. Many members find the straightforward cash pricing simpler than navigating prior authorizations and coverage limits." },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: WHITE, borderRadius: 12, marginBottom: 8,
      // hardcoded-color-allow-next-line
      border: "1px solid rgba(11,16,41,0.10)", overflow: "hidden",
    }}>
      <button type="button" onClick={() => setOpen(v => !v)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, padding: "18px 22px", textAlign: "left",
        background: "none", border: "none", cursor: "pointer", minHeight: 56,
      }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16,
          // hardcoded-color-allow-next-line
          color: INK, lineHeight: 1.3 }}>{q}</span>
        <ChevronDown size={18} style={{ color: ORANGE, flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
      </button>
      {open && (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.7,
          // hardcoded-color-allow-next-line
          color: "rgba(11,16,41,0.70)", padding: "0 22px 18px", margin: 0 }}>{a}</p>
      )}
    </div>
  );
}

const TRTSolution = () => {
  useScrollDepth();
  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <SEO
        title="TRT Virginia | In-Person Testosterone Therapy | Men's Wellness Centers"
        description="Your labs say normal. You don't feel normal. In-person physician evaluation, same-day labs, real answers before you leave. 3 Virginia centers."
      />
      <TRTHeader />
      <main>

        {/* HERO */}
        <section style={{ background: NAVY, paddingTop: 100, paddingBottom: 72, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05,
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: "220px 220px" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}
            className="solution-hero-grid">
            <div className="solution-hero-left">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 18 }}>
                Testosterone Therapy · Virginia
              </p>
              <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(36px,6vw,68px)", lineHeight: 1.02, color: CREAM, textTransform: "uppercase", marginBottom: 20, letterSpacing: "-0.01em" }}>
                Your Doctor Says<br />Your Labs Are Normal.<br />
                <span style={{ color: ORANGE }}>You Don't Feel Normal.</span>
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 18, lineHeight: 1.65,
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.82)", maxWidth: 520, marginBottom: 28 }}>
                Men's Wellness Centers evaluates the full picture. Not just a number on a chart. An in-person physician visit, labs drawn the same day, real answers before you leave.
              </p>
              <a href="#hero-form" style={{ display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600,
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.65)", textDecoration: "none", marginBottom: 24 }}>
                <span>Skip to schedule a visit</span>
                <ChevronDown size={14} />
              </a>
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
              <TRTHeroForm service="trt" formId="trt-sol-hero"
                heading="Reserve Your No-Cost Visit."
                subheading="60 minutes. Labs on-site. Results reviewed before you leave." />
            </div>
          </div>
        </section>

        {/* CREDIBILITY */}
        <CredibilityBand />

        {/* PROBLEM */}
        <section style={{ background: CREAM, padding: "72px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>Sound familiar?</p>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(26px,4vw,44px)", color: INK, textTransform: "uppercase", marginBottom: 40, lineHeight: 1.08 }}>
              If Any Of This Sounds Familiar,<br />You're Not Imagining It.
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
              Why Online-Only TRT Falls Short
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
              One Visit. Real Labs.<br />A Physician Who Actually Reads Them.
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
              10,000+ Virginia Members Since 2015
            </h2>
            <div className="solution-reviews-grid">
              {[
                { name: "Mark B.", city: "Richmond, VA", quote: "I'd been brushed off by two doctors who said my levels were in range. Men's Wellness Centers actually sat down with me, reviewed every marker, and explained what was happening. Six weeks in and the difference is real." },
                { name: "Clarke M.", city: "Virginia Beach, VA", quote: "Same-day labs were a game changer. Had results in hand before I left the building. My provider laid out a plan based on where I actually was, not a generic starting point." },
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
            <p style={{ textAlign: "center", marginTop: 24 }}>
              <a href={GBP_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                  // hardcoded-color-allow-next-line
                  color: "rgba(245,240,235,0.55)", textDecoration: "underline" }}>
                View all 191 verified Google reviews
              </a>
            </p>
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
                Ready To Get<br />Real Answers?
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.65,
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.75)", marginBottom: 32 }}>
                {COPY.offer.finalSubhead}
              </p>
              <Suspense fallback={null}>
                <TRTLocations />
              </Suspense>
            </div>
            <div>
              <TRTHeroForm service="trt" formId="trt-sol-cta"
                heading="Book Your In-Person Visit."
                subheading="Labs drawn same day. Results reviewed before you leave." />
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

export default TRTSolution;
