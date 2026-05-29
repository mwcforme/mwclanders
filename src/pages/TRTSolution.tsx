/**
 * TRTSolution — /trt-solution
 * High-intent PPC lander: Problem → Solution → Credibility.
 */
import { Suspense } from "react";
import { Star, CheckCircle2, XCircle } from "lucide-react";
import { TRTHeader }            from "@/components/landing/trt/TRTHeader";
import { TRTHeroForm }          from "@/components/landing/trt/TRTHeroForm";
import { CredibilityBand }      from "@/components/landing/trt/CredibilityBand";
import { TRTLocations }         from "@/components/landing/trt/TRTLocations";
import { TRTFooter }            from "@/components/landing/trt/TRTFooter";
import { StickyMobileCTA }      from "@/components/landing/trt/StickyMobileCTA";
import { SectionReveal }        from "@/components/landing/trt/SectionReveal";
import { COPY }                 from "@/data/copy";
import { GBP_REVIEWS_URL }      from "@/data/testimonials";
import { SEO }                  from "@/components/SEO";
import { useScrollDepth }       from "@/hooks/useAnalytics";

const NAVY   = "var(--brand-navy-deep)";
const CREAM  = "var(--brand-cream)";
const ORANGE = "var(--brand-cta)";

const OLD_WAY = [
  "Questionnaire-based intake, no physician",
  "Mail-order medication, no labs",
  "Rotating providers who don't know your case",
  "Subscriptions that auto-renew whether you improve or not",
  "No follow-up, no adjustment",
];
const MWC_WAY = [
  "In-person evaluation with a Virginia-licensed physician",
  "Labs drawn on-site, results reviewed same visit",
  "Same provider every visit, every time",
  "No-cost first visit, transparent pricing before you commit",
  "Built-in follow-up and protocol adjustment",
];

const PROBLEM_CARDS = [
  "Still tired at 10am no matter how much sleep you got.",
  "You're training just as hard. Your body stopped responding.",
  "Your drive, for work, the gym, and her, has gone quiet.",
  "Your doctor ran labs. Said everything looks fine. You don't feel fine.",
  "You've looked at online options. Mail-order isn't a protocol.",
];

const STEPS = [
  { n: "01", title: "Labs Drawn On-Site", body: "No referrals. No outside lab visits. Blood draw happens at your first appointment, same day." },
  { n: "02", title: "Results Reviewed Same Visit", body: "Your physician reviews the panel with you before you leave. Not a follow-up call. Not a portal notification. Face to face." },
  { n: "03", title: "A Real Protocol Built Around You", body: "If treatment is appropriate, your provider builds a plan around your results and your symptoms, not a template." },
];

const FAQS = [
  { q: "How is this different from Hims or an online TRT provider?", a: "Online services are questionnaire-based. No physician sees you in person, and no labs are drawn before prescribing. At Men's Wellness Centers, a Virginia-licensed physician evaluates you face to face, draws labs the same visit, and reviews results before any protocol is discussed." },
  { q: "What happens at my first visit?", a: "A licensed provider reviews your symptoms and history, orders labs drawn on-site, and reviews results with you before you leave. No waiting for a portal notification." },
  { q: "What does the no-cost consultation actually include?", a: "The first visit is at no charge: provider evaluation, on-site labs, and a full results review. We don't bill insurance for the first visit. FSA and HSA cards are accepted." },
  { q: "When will I notice a difference?", a: "Individual results vary and depend on your baseline labs, lifestyle, and protocol. Your provider will discuss realistic expectations at your consultation." },
  { q: "Is this covered by insurance?", a: "We don't bill insurance, but we accept FSA and HSA cards. Many members find the straightforward pricing simpler than navigating prior authorizations." },
];

const TRTSolution = () => {
  useScrollDepth();
  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <SEO
        title="TRT in Virginia | In-Person Testosterone Therapy | Men's Wellness Centers"
        description="Your labs say normal. You don't feel normal. In-person physician evaluation, same-day labs, real answers. Virginia TRT specialists."
      />
      <TRTHeader />
      <main>
        {/* ── 1. HERO ── */}
        <section style={{ background: NAVY, padding: "120px 24px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: 48, alignItems: "center" }}
            className="lg:grid-cols-[1fr_440px]">
            <div>
              <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(34px,6vw,72px)", lineHeight: 1.05, color: CREAM, textTransform: "uppercase", marginBottom: 24 }}>
                Your Doctor Says Your Labs Are Normal.<br />
                <span style={{ color: ORANGE }}>You Don't Feel Normal.</span>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.65,
                // hardcoded-color-allow-next-line
                color: "rgba(245,240,235,0.85)", maxWidth: 560 }}>
                Men's Wellness Centers evaluates the full picture. Not just a number on a chart. An in-person physician visit, labs drawn same day, real answers before you leave.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
                <span style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#C9A961" stroke="#C9A961" />)}
                </span>
                {/* hardcoded-color-allow-next-line */}
                <a href={GBP_REVIEWS_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "rgba(245,240,235,0.80)", textDecoration: "none" }}>
                  4.9 · 191 verified Google reviews
                </a>
              </div>
            </div>
            <div id="hero-form">
              <TRTHeroForm service="trt" formId="trt-sol-hero"
                heading="Start Feeling Like Yourself Again."
                subheading="No-cost 60-min visit. Same-day labs. No insurance needed." />
            </div>
          </div>
        </section>

        {/* ── 2. CREDIBILITY BAND ── */}
        <SectionReveal><CredibilityBand /></SectionReveal>

        {/* ── 3. PROBLEM AGITATION ── */}
        <SectionReveal>
          <section style={{ background: CREAM, padding: "80px 24px" }}>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
              <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>Sound Familiar?</p>
              <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(26px,4vw,44px)", color: NAVY, textTransform: "uppercase", marginBottom: 40, lineHeight: 1.1 }}>
                If Any Of This Sounds Familiar,<br />You're Not Imagining It.
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
                {PROBLEM_CARDS.map((text) => (
                  <div key={text} style={{ background:
                    // hardcoded-color-allow-next-line
                    "#FFFFFF", borderRadius: 12, padding: "20px 22px", borderLeft: `4px solid ${ORANGE}`,
                    // hardcoded-color-allow-next-line
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <p style={{ fontSize: 15, lineHeight: 1.55, color: NAVY, margin: 0 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* ── 4. COMPARISON: OLD WAY vs MWC WAY ── */}
        <SectionReveal>
          <section style={{ background: NAVY, padding: "80px 24px" }}>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
              <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(24px,4vw,40px)", color: CREAM, textTransform: "uppercase", textAlign: "center", marginBottom: 40, lineHeight: 1.1 }}>
                Why Online-Only TRT Falls Short
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="grid-cols-1 md:grid-cols-2">
                <div style={{
                  // hardcoded-color-allow-next-line
                  background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "28px 24px" }}>
                  <p style={{ fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    // hardcoded-color-allow-next-line
                    color: "rgba(245,240,235,0.50)", marginBottom: 20 }}>The Old Way</p>
                  {OLD_WAY.map((item) => (
                    <div key={item} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                      <XCircle size={16} strokeWidth={2} style={{ color:
                        // hardcoded-color-allow-next-line
                        "#EF4444", flexShrink: 0, marginTop: 2 }} />
                      {/* hardcoded-color-allow-next-line */}
                      <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(245,240,235,0.65)" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  // hardcoded-color-allow-next-line
                  background: "rgba(232,103,10,0.12)", border: `1px solid rgba(232,103,10,0.35)`, borderRadius: 12, padding: "28px 24px" }}>
                  <p style={{ fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 20 }}>The MWC Way</p>
                  {MWC_WAY.map((item) => (
                    <div key={item} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                      <CheckCircle2 size={16} strokeWidth={2} style={{ color: ORANGE, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 14, lineHeight: 1.5, color: CREAM }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* ── 5. THE SOLUTION — HOW IT WORKS ── */}
        <SectionReveal>
          <section style={{ background: CREAM, padding: "80px 24px" }}>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
              <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>The Solution</p>
              <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(24px,4vw,40px)", color: NAVY, textTransform: "uppercase", marginBottom: 40, lineHeight: 1.1 }}>
                One Visit. Real Labs. A Physician Who Actually Reads Them.
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
                {STEPS.map((s) => (
                  <div key={s.n} style={{ borderTop: `3px solid ${ORANGE}`, paddingTop: 20 }}>
                    <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 36, fontWeight: 700, color: ORANGE, display: "block", lineHeight: 1, marginBottom: 8 }}>{s.n}</span>
                    <h3 style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700, color: NAVY, textTransform: "uppercase", marginBottom: 10 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: NAVY }}>{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* ── 6. TESTIMONIALS ── */}
        <SectionReveal>
          <section style={{ background: NAVY, padding: "80px 24px" }}>
            <div style={{ maxWidth: 860, margin: "0 auto" }}>
              <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(22px,3.5vw,36px)", color: CREAM, textTransform: "uppercase", textAlign: "center", marginBottom: 36 }}>
                What Our Members Say
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
                {[
                  { name: "Mark B.", city: "Richmond, VA", quote: "I'd been brushed off by two doctors who said my levels were in range. Men's Wellness Centers actually sat down with me, reviewed every marker, and explained what was happening. Six weeks in and the difference is real." },
                  { name: "Clarke M.", city: "Virginia Beach, VA", quote: "I was skeptical about the process but the same-day labs were a game changer. Had results in hand before I left the building. My provider laid out a plan that made sense for where I actually was, not some generic starting point." },
                ].map((t) => (
                  <div key={t.name} style={{
                    // hardcoded-color-allow-next-line
                    background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 22px",
                    // hardcoded-color-allow-next-line
                    border: "1px solid rgba(255,255,255,0.10)" }}>
                    <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#C9A961" stroke="#C9A961" />)}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.65,
                      // hardcoded-color-allow-next-line
                      color: "rgba(245,240,235,0.85)", marginBottom: 14 }}>"{t.quote}"</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>{t.name}</p>
                    {/* hardcoded-color-allow-next-line */}
                    <p style={{ fontSize: 12, color: "rgba(245,240,235,0.55)", marginTop: 2 }}>{t.city} · Verified Google Review</p>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <a href={GBP_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
                  // hardcoded-color-allow-next-line
                  style={{ fontSize: 13, fontWeight: 600, color: "rgba(245,240,235,0.60)", textDecoration: "underline" }}>
                  View all 191 verified reviews
                </a>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* ── 7. FAQ ── */}
        <SectionReveal>
          <section style={{ background: CREAM, padding: "80px 24px" }}>
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(24px,4vw,38px)", color: NAVY, textTransform: "uppercase", textAlign: "center", marginBottom: 36 }}>
                Common Questions
              </h2>
              {FAQS.map((f, i) => (
                <details key={i} style={{
                  // hardcoded-color-allow-next-line
                  background: "#FFFFFF", borderRadius: 10, marginBottom: 10,
                  // hardcoded-color-allow-next-line
                  border: "1px solid rgba(11,16,41,0.10)", overflow: "hidden" }}>
                  <summary style={{ padding: "16px 20px", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: NAVY, cursor: "pointer", listStyle: "none" }}>
                    {f.q}
                  </summary>
                  <p style={{ padding: "0 20px 18px", fontSize: 14, lineHeight: 1.7, color: NAVY, margin: 0 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </SectionReveal>

        {/* ── 8. FINAL CTA ── */}
        <SectionReveal>
          <section style={{ background: NAVY, padding: "80px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 48, alignItems: "start" }} className="lg:grid-cols-2">
              <div>
                <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px,4vw,48px)", color: CREAM, textTransform: "uppercase", lineHeight: 1.05, marginBottom: 16 }}>
                  Ready To Get Real Answers?
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.65,
                  // hardcoded-color-allow-next-line
                  color: "rgba(245,240,235,0.80)", marginBottom: 8 }}>
                  {COPY.offer.finalSubhead}
                </p>
                <Suspense fallback={null}>
                  <TRTLocations />
                </Suspense>
              </div>
              <div>
                <TRTHeroForm service="trt" formId="trt-sol-footer"
                  heading="Book Your In-Person Visit."
                  subheading="No-cost first visit. Labs drawn same day. Virginia locations." />
              </div>
            </div>
          </section>
        </SectionReveal>
      </main>
      <TRTFooter />
      <StickyMobileCTA />
    </div>
  );
};

export default TRTSolution;
