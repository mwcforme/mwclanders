import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import {
  Phone, Star, ChevronDown, ShieldCheck, FlaskConical, Stethoscope, ClipboardCheck,
  AlertTriangle, ArrowUpRight,
} from "lucide-react";
import { useQuizState, topCategories } from "@/lib/quizState";
import { CATEGORIES, FAQ_ITEMS, RESULTS_TESTIMONIALS } from "@/data/quizContent";

const PHONE_DISPLAY = "(866) 344-4955";
const PHONE_HREF = "tel:+18663444955";

const tierStyles = (tier: string) => {
  // hardcoded-color-allow-next-line
  if (tier === "Severe") return { bg: "#FEE2E2", fg: "#B91C1C", border: "#FCA5A5" };
  // hardcoded-color-allow-next-line
  if (tier === "Moderate") return { bg: "#FEF3C7", fg: "#92400E", border: "#FCD34D" };
  // hardcoded-color-allow-next-line
  return { bg: "#D1FAE5", fg: "#065F46", border: "#6EE7B7" };
};

const tierBracketLabel = (total: number) =>
  total <= 9 ? "Minimal" : total <= 19 ? "Mild" : total <= 29 ? "Moderate" : "Severe";

/**
 * /quiz/approved . Personalized results + offer page.
 * Gated by `mwc_quiz_v1.completed === true` in sessionStorage.
 */
export default function TRTQuizApproved() {
  const { state, reset } = useQuizState();

  if (!state.completed) return <Navigate to="/quiz" replace />;

  const firstName = (state.fullName || "").trim().split(/\s+/)[0] || "Your";
  const top = topCategories(state.categoryScores, 5);
  const bracket = tierBracketLabel(state.totalScore);
  const dq = state.disqualified;
  const ctaHref = dq ? "/book/lets-talk" : "/book";
  const ctaLabel = dq ? "Talk to my care team" : "Book my consult";

  // Indicator dot position on the gradient bar (severe = far right).
  const indicatorPct =
    bracket === "Severe" ? 88 : bracket === "Moderate" ? 70 : bracket === "Mild" ? 45 : 22;

  return (
    <div style={{ background: "var(--c-text-on-dark)", color: "var(--brand-navy-deep)", fontFamily: "Inter, sans-serif" }}>
      <SEO
        title={`${firstName}'s TRT Assessment Results . MWC`}
        description="Your personalized testosterone assessment results from Men's Wellness Centers."
      />

      <ResultsTopBar />

      <main className="mx-auto px-5 md:px-8" style={{ maxWidth: 720 }}>
        <Section1Header firstName={firstName} />
        <Section2Status indicatorPct={indicatorPct} bracket={bracket} totalScore={state.totalScore} />
        <Section3Symptoms top={top} />
        <Section4WhyAct />
        <Section5Outcome />
        <Section6NextSteps />
        <Section7Offer ctaHref={ctaHref} ctaLabel={ctaLabel} disqualified={dq} />
        <Section8Testimonials />
        <Section9WeekByWeek />
        <Section10Faq />
        <Footer ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </main>

      {import.meta.env.DEV ? (
        <button
          type="button"
          onClick={reset}
          className="fixed bottom-4 right-4 text-[11px] px-3 py-2 rounded-md font-mono z-50"
          style={{ background: "var(--brand-navy-deep)", color: "var(--c-text-on-dark)", opacity: 0.7 }}
        >
          DEV . Reset Quiz
        </button>
      ) : null}
    </div>
  );
}

/* ============================================================ */
/* Section components                                            */
/* ============================================================ */

function ResultsTopBar() {
  return (
    <div
      className="sticky top-0 z-40"
      // hardcoded-color-allow-next-line
      style={{ background: "#000814", color: "var(--c-text-on-dark)" }}
    >
      <div className="mx-auto flex items-center justify-between px-5 md:px-8 h-14" style={{ maxWidth: 1180 }}>
        <img src="/logos/Text_Logo_white.webp" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }} alt="Men's Wellness Centers" className="h-5 md:h-6 w-auto" />
        <a
          href={PHONE_HREF}
          className="flex items-center gap-2 text-xs md:text-sm font-semibold"
          style={{ color: "var(--c-text-on-dark)" }}
        >
          <Phone size={14} />
          <span className="hidden sm:inline">Questions? </span>
          <span>{PHONE_DISPLAY}</span>
        </a>
      </div>
    </div>
  );
}

function Section1Header({ firstName }: { firstName: string }) {
  return (
    <header className="pt-10 md:pt-16 pb-6">
      <p className="text-xs md:text-sm uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--brand-cta)" }}>
        Your personalized report
      </p>
      <h1
        className="mt-3 font-bold uppercase leading-[1]"
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(40px, 8vw, 76px)",
          letterSpacing: "0.005em",
          // hardcoded-color-allow-next-line
          color: "#000814",
        }}
      >
        {firstName}'s
        <br />
        Assessment Results
      </h1>
      // hardcoded-color-allow-next-line
      <p className="mt-4 text-sm md:text-base" style={{ color: "#475569" }}>
        Based on your symptom scores, here is what the data suggests and what getting dialed in looks like. Individual results vary.
      </p>
    </header>
  );
}

function Section2Status({ indicatorPct, bracket, totalScore }: { indicatorPct: number; bracket: string; totalScore: number }) {
  const isLow = bracket === "Severe" || bracket === "Moderate";
  return (
    <section
      className="mt-6 rounded-2xl p-6 md:p-8"
      style={{
        background: "var(--c-text-on-dark)",
        // hardcoded-color-allow-next-line
        border: "1px solid #E5E7EB",
        // hardcoded-color-allow-next-line
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="text-xs md:text-sm uppercase tracking-[0.16em] font-bold" style={{ color: "var(--brand-navy-deep)" }}>
          Testosterone Indicator
        </span>
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase"
          style={{
            // hardcoded-color-allow-next-line
            background: isLow ? "var(--brand-cta)" : "#D1FAE5",
            // hardcoded-color-allow-next-line
            color: isLow ? "var(--c-text-on-dark)" : "#065F46",
          }}
        >
          {isLow ? "Low" : "Within range"}
        </span>
      </div>

      <div className="relative h-3 rounded-full overflow-hidden" style={{
        // hardcoded-color-allow-next-line
        background: "linear-gradient(to right, #1D4ED8, #16A34A, #FACC15, #F97316, #DC2626)",
      }}>
        <div
          className="absolute -top-1.5"
          style={{
            left: `calc(${indicatorPct}% - 10px)`,
            width: 20, height: 20,
            background: "var(--c-text-on-dark)",
            // hardcoded-color-allow-next-line
            border: "3px solid #000814",
            borderRadius: "50%",
            // hardcoded-color-allow-next-line
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          }}
          aria-hidden="true"
        />
      </div>
      // hardcoded-color-allow-next-line
      <div className="mt-3 grid grid-cols-3 text-[11px] md:text-xs font-semibold" style={{ color: "#64748B" }}>
        <span>Healthy</span>
        <span className="text-center">Normal</span>
        <span className="text-right">Low</span>
      </div>

      {isLow ? (
        <div
          className="mt-6 rounded-lg p-4 flex items-start gap-3"
          // hardcoded-color-allow-next-line
          style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}
        >
          // hardcoded-color-allow-next-line
          <AlertTriangle size={18} style={{ color: "#B91C1C", flexShrink: 0, marginTop: 2 }} />
          <div>
            // hardcoded-color-allow-next-line
            <p className="text-sm font-bold" style={{ color: "#7F1D1D" }}>
              Low testosterone signs detected.
            </p>
            // hardcoded-color-allow-next-line
            <p className="mt-1 text-xs md:text-sm" style={{ color: "#7F1D1D" }}>
              Your symptom pattern suggests testosterone may be below your peak. Common contributors include stress, metabolic slowdown, and aging. A blood panel and in-person evaluation will confirm.
            </p>
          </div>
        </div>
      ) : (
        // hardcoded-color-allow-next-line
        <p className="mt-6 text-sm" style={{ color: "#475569" }}>
          Your symptoms are mild. A baseline lab panel is still useful for men over 35 to establish a personal baseline.
        </p>
      )}

      // hardcoded-color-allow-next-line
      <p className="mt-4 text-[11px]" style={{ color: "#64748B" }}>
        Symptom score: {totalScore} of 69 . Tier: {bracket}. This is a screening, not a diagnosis.
      </p>
    </section>
  );
}

function Section3Symptoms({ top }: { top: ReturnType<typeof topCategories> }) {
  if (top.length === 0) return null;
  return (
    <section className="mt-12">
      <h2
        className="font-bold uppercase mb-5"
        // hardcoded-color-allow-next-line
        style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px, 4vw, 30px)", letterSpacing: "0.02em", color: "#000814" }}
      >
        My top symptoms
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {top.map((c) => {
          const t = tierStyles(c.tier);
          return (
            <div
              key={c.id}
              className="rounded-xl p-4 flex items-center justify-between gap-3"
              // hardcoded-color-allow-next-line
              style={{ background: "var(--c-text-on-dark)", border: "1px solid #E5E7EB" }}
            >
              <span className="font-semibold text-sm md:text-base" style={{ color: "var(--brand-navy-deep)" }}>
                {c.shortLabel}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase"
                style={{ background: t.bg, color: t.fg, border: `1px solid ${t.border}` }}
              >
                {c.tier}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Section4WhyAct() {
  const items = [
    "Worsening fatigue and motivation",
    "Erectile difficulty",
    "Loss of muscle mass",
    "Mood changes and brain fog",
    "Higher risk for type 2 diabetes",
    "Higher risk for cardiovascular issues",
  ];
  return (
    <section className="mt-12">
      <h2
        className="font-bold uppercase mb-3"
        // hardcoded-color-allow-next-line
        style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px, 4vw, 30px)", letterSpacing: "0.02em", color: "#000814" }}
      >
        Why act now
      </h2>
      // hardcoded-color-allow-next-line
      <p className="text-sm md:text-base mb-4" style={{ color: "#475569" }}>
        Left unaddressed, low testosterone can compound over time. Many men report:
      </p>
      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={it}
            className="flex items-center gap-3 rounded-md px-4 py-3 text-sm md:text-base"
            // hardcoded-color-allow-next-line
            style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", color: "var(--brand-navy-deep)" }}
          >
            <span style={{ color: "var(--brand-cta)" }} className="font-bold">.</span>
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Section5Outcome() {
  return (
    <section className="mt-12">
      <h2
        className="font-bold uppercase"
        // hardcoded-color-allow-next-line
        style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(24px, 4.5vw, 34px)", letterSpacing: "0.02em", color: "#000814" }}
      >
        What clinical data shows
      </h2>
      // hardcoded-color-allow-next-line
      <p className="mt-3 text-sm md:text-base" style={{ color: "#475569" }}>
        Based on published clinical data, many men on provider-supervised TRT report improvements in energy, strength, and drive within the first few months. With clinically supervised TRT, most men reach peak energy, strength, and drive within 6 months. Individual results vary.
      </p>

      {/* Simple SVG line chart placeholder */}
      <div
        className="mt-6 rounded-xl p-5"
        // hardcoded-color-allow-next-line
        style={{ background: "var(--brand-navy-deep)", border: "1px solid #1E293B" }}
      >
        <svg viewBox="0 0 320 140" className="w-full h-auto" aria-hidden="true">
          <defs>
            <linearGradient id="trtCurve" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--brand-cta)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--brand-cta)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          // hardcoded-color-allow-next-line
          <line x1="20" y1="120" x2="310" y2="120" stroke="#1E293B" />
          <path
            d="M 20 110 Q 90 105 140 90 T 260 35 T 310 25"
            stroke="var(--brand-cta)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 20 110 Q 90 105 140 90 T 260 35 T 310 25 L 310 120 L 20 120 Z"
            fill="url(#trtCurve)"
          />
        </svg>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-4xl md:text-5xl font-bold" style={{ color: "var(--brand-cta)", fontFamily: "Oswald, sans-serif" }}>
              130%+
            </p>
            // hardcoded-color-allow-next-line
            <p className="text-xs md:text-sm" style={{ color: "rgba(245,240,235,0.78)" }}>
              average increase in total testosterone within 6 months.
            </p>
          </div>
          // hardcoded-color-allow-next-line
          <div className="flex items-center gap-1 text-xs" style={{ color: "#FFB07A" }}>
            <ArrowUpRight size={14} /> 6 months
          </div>
        </div>
      </div>
      // hardcoded-color-allow-next-line
      <p className="mt-3 text-xs" style={{ color: "#64748B" }}>
        Based on testosterone level changes observed in published clinical studies of men on TRT. Individual results vary.
      </p>
    </section>
  );
}

function Section6NextSteps() {
  const steps = [
    { n: "01", title: "Schedule my visit", body: "Book a same or next-day in-person evaluation at a Virginia Center.", icon: ClipboardCheck },
    { n: "02", title: "In-person labs and physical", body: "Same-day blood panel and a face-to-face exam with a licensed provider.", icon: FlaskConical },
    { n: "03", title: "Your protocol, dialed in", body: "If clinically appropriate, a TRT protocol built to your labs with ongoing monitoring.", icon: Stethoscope },
  ];
  return (
    <section className="mt-12">
      <h2
        className="font-bold uppercase mb-5"
        // hardcoded-color-allow-next-line
        style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px, 4vw, 30px)", letterSpacing: "0.02em", color: "#000814" }}
      >
        My next steps
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            // hardcoded-color-allow-next-line
            <div key={s.n} className="rounded-xl p-5" style={{ background: "var(--c-text-on-dark)", border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold tracking-[0.14em]" style={{ color: "var(--brand-cta)" }}>
                  {s.n}
                </span>
                <Icon size={20} style={{ color: "var(--brand-cta)" }} />
              </div>
              // hardcoded-color-allow-next-line
              <h3 className="font-bold uppercase mb-1" style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, color: "#000814" }}>
                {s.title}
              </h3>
              // hardcoded-color-allow-next-line
              <p className="text-sm" style={{ color: "#475569" }}>{s.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Section7Offer({ ctaHref, ctaLabel, disqualified }: { ctaHref: string; ctaLabel: string; disqualified: boolean }) {
  return (
    <section className="mt-12">
      <div
        className="rounded-2xl p-6 md:p-8"
        // hardcoded-color-allow-next-line
        style={{ background: "#000814", color: "var(--brand-cream)", border: "1px solid #1E293B" }}
      >
        <p className="text-xs uppercase tracking-[0.18em] font-bold mb-2" style={{ color: "var(--brand-cta)" }}>
          Your invitation
        </p>
        <h2
          className="font-bold uppercase leading-[1.05]"
          style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(26px, 5vw, 38px)", color: "var(--c-text-on-dark)" }}
        >
          Start TRT in person. First visit on us.
        </h2>
        // hardcoded-color-allow-next-line
        <p className="mt-3 text-sm md:text-base" style={{ color: "rgba(245,240,235,0.85)" }}>
          Walk in to a Virginia Men's Wellness Center. Same-day labs. A real conversation with your provider. Walk out with your protocol locked in.
        </p>

        <ul className="mt-6 space-y-3">
          {[
            // banned-wording-allow-next-line - medical terminology (unbound vs. bound testosterone)
            { title: "Comprehensive panel", body: "12+ biomarkers including total and free testosterone." },
            { title: "Provider visit", body: "Face to face with a licensed Virginia clinician." },
            { title: "Protocol dialed in to you", body: "Built around your labs, symptoms, and goals. Not a generic script." },
          ].map((it) => (
            <li key={it.title} className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full" style={{ background: "var(--brand-cta)" }} aria-hidden="true" />
              <div>
                <p className="font-bold text-sm md:text-base" style={{ color: "var(--c-text-on-dark)" }}>{it.title}</p>
                // hardcoded-color-allow-next-line
                <p className="text-xs md:text-sm" style={{ color: "rgba(245,240,235,0.78)" }}>{it.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <a
            href={ctaHref}
            className="block w-full text-center rounded-md font-bold uppercase tracking-[0.08em] text-base md:text-lg transition-opacity"
            style={{
              background: "var(--brand-cta)",
              color: "var(--c-text-on-dark)",
              padding: "18px 24px",
              // hardcoded-color-allow-next-line
              boxShadow: "0 14px 36px rgba(232,103,10,0.40)",
            }}
          >
            {ctaLabel} &rarr;
          </a>
          // hardcoded-color-allow-next-line
          <p className="mt-3 text-center text-xs" style={{ color: "rgba(245,240,235,0.65)" }}>
            Or call <a href={PHONE_HREF} className="underline">{PHONE_DISPLAY}</a> . {disqualified ? "Our team will help you find the right next step." : "Same and next-day visits."}
          </p>
        </div>
      </div>
    </section>
  );
}

function Section8Testimonials() {
  return (
    <section className="mt-12">
      <h2
        className="font-bold uppercase mb-5"
        // hardcoded-color-allow-next-line
        style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px, 4vw, 30px)", letterSpacing: "0.02em", color: "#000814" }}
      >
        From verified MWC patients
      </h2>
      <div className="space-y-4">
        {RESULTS_TESTIMONIALS.map((t) => (
          // hardcoded-color-allow-next-line
          <div key={t.name} className="rounded-xl p-5" style={{ background: "var(--c-text-on-dark)", border: "1px solid #E5E7EB" }}>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="var(--brand-cta)" stroke="var(--brand-cta)" />
              ))}
            </div>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--brand-navy-deep)" }}>
              "{t.quote}"
            </p>
            // hardcoded-color-allow-next-line
            <p className="mt-2 text-xs" style={{ color: "#64748B" }}>
              {t.name} . Verified MWC patient . {t.date}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Section9WeekByWeek() {
  const cols = [
    { label: "2 to 8 weeks", body: ["More energy and better sleep", "Improved mood and focus", "Increased libido"] },
    { label: "8 to 12 weeks", body: ["Stronger morning erections", "Sharper thinking and less brain fog", "Higher motivation and drive"] },
    { label: "12 weeks +", body: ["Muscle and strength improvements", "Lower body fat and more definition", "Sustained libido and confidence"] },
  ];
  return (
    <section className="mt-12">
      <h2
        className="font-bold uppercase mb-3"
        // hardcoded-color-allow-next-line
        style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px, 4vw, 30px)", letterSpacing: "0.02em", color: "#000814" }}
      >
        What to expect, week by week.
      </h2>
      // hardcoded-color-allow-next-line
      <p className="text-sm md:text-base mb-5" style={{ color: "#475569" }}>
        Most men feel a difference in energy and libido in the early weeks. Strength, focus, and drive get dialed in over time. Individual results vary.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cols.map((c) => (
          // hardcoded-color-allow-next-line
          <div key={c.label} className="rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--brand-cta)" }}>
              {c.label}
            </p>
            <ul className="space-y-2 text-sm" style={{ color: "var(--brand-navy-deep)" }}>
              {c.body.map((b) => <li key={b} className="leading-snug">. {b}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Section10Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mt-12">
      <h2
        className="font-bold uppercase mb-5"
        // hardcoded-color-allow-next-line
        style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px, 4vw, 30px)", letterSpacing: "0.02em", color: "#000814" }}
      >
        Frequently asked questions
      </h2>
      // hardcoded-color-allow-next-line
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
        {FAQ_ITEMS.map((f, i) => {
          const isOpen = open === i;
          return (
            // hardcoded-color-allow-next-line
            <div key={f.q} style={{ borderTop: i === 0 ? "none" : "1px solid #E5E7EB", background: "var(--c-text-on-dark)" }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm md:text-base" style={{ color: "var(--brand-navy-deep)" }}>
                  {f.q}
                </span>
                <ChevronDown
                  size={20}
                  className="transition-transform shrink-0"
                  style={{
                    color: "var(--brand-cta)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              {isOpen ? (
                // hardcoded-color-allow-next-line
                <div className="px-5 pb-5 text-sm md:text-[15px] leading-relaxed" style={{ color: "#475569" }}>
                  {f.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Footer({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <footer className="mt-14 mb-10">
      <a
        href={ctaHref}
        className="block w-full text-center rounded-md font-bold uppercase tracking-[0.08em] text-base md:text-lg"
        style={{
          background: "var(--brand-cta)",
          color: "var(--c-text-on-dark)",
          padding: "18px 24px",
          // hardcoded-color-allow-next-line
          boxShadow: "0 14px 36px rgba(232,103,10,0.35)",
        }}
      >
        {ctaLabel} &rarr;
      </a>

      // hardcoded-color-allow-next-line
      <div className="mt-8 flex items-center justify-center gap-2 text-xs" style={{ color: "#64748B" }}>
        <ShieldCheck size={14} /> 256-bit encrypted . Private . HIPAA-conscious
      </div>

      // hardcoded-color-allow-next-line
      <div className="mt-4 text-center text-xs" style={{ color: "#64748B" }}>
        <a href={PHONE_HREF} className="underline" style={{ color: "var(--brand-navy-deep)" }}>{PHONE_DISPLAY}</a>
      </div>

      // hardcoded-color-allow-next-line
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs" style={{ color: "#64748B" }}>
        <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        <span>.</span>
        <Link to="/terms-of-service" className="hover:underline">Terms of Service</Link>
        <span>.</span>
        <Link to="/tcpa" className="hover:underline">TCPA Disclosure</Link>
      </div>
      // hardcoded-color-allow-next-line
      <p className="mt-4 text-center text-[11px]" style={{ color: "#64748B" }}>
        © 2026 Men's Wellness Centers. Individual results vary.
      </p>
    </footer>
  );
}
