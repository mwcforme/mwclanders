/**
 * /product/trt — Testosterone Replacement Therapy landing page
 *
 * CRO-first funnel page. No header nav (eliminates exit paths on paid traffic).
 * Hero: dark navy split — left copy + right lead-capture form.
 * Sections ordered for maximum conversion from paid media visitors.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, FlaskConical, Stethoscope, ClipboardList,
  ArrowRight,
} from "lucide-react";

import { TRTHeroForm }               from "@/components/landing/trt/TRTHeroForm";
import { TRTFooter }                 from "@/components/landing/trt/TRTFooter";
import { TRTBenefitsSection }        from "@/components/landing/trt/TRTBenefitsSection";
import { TRTSignsSection }           from "@/components/landing/trt/TRTSignsSection";
import { TRTTreatmentOptionsSection }from "@/components/landing/trt/TRTTreatmentOptionsSection";
import { TRTProductFAQ }             from "@/components/landing/trt/TRTProductFAQ";
import { TRTPricing }                from "@/components/landing/trt/TRTPricing";
import { OrangeCTA, Eyebrow }        from "@/components/landing/trt/TRTProductHelpers";
import { TRTProductHeader }          from "@/components/landing/trt/TRTProductHeader";
import { TRTComparisonTable }        from "@/components/landing/trt/TRTComparisonTable";
import { TRTCandidateQuiz }          from "@/components/landing/trt/TRTCandidateQuiz";
import { TRTVisualTimeline }         from "@/components/landing/trt/TRTVisualTimeline";
import { TRTStatStrip }              from "@/components/landing/trt/TRTStatStrip";
import { SEO }                       from "@/components/SEO";


/* ─── CSS keyframe animations ────────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes shimmerLR {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .ann-shimmer {
    background: linear-gradient(
      90deg,
      #0B1029 0%, #0B1029 30%, #1e2f5e 50%, #0B1029 70%, #0B1029 100%
    );
    background-size: 200% auto;
    animation: shimmerLR 3.5s linear infinite;
  }

  /* Timeline step entrance animation */
  .tl-step {
    opacity: 0;
    transform: translateX(-18px);
    transition: none;
  }
  .tl-step.tl-visible {
    animation: slideInLeft 400ms ease forwards;
  }
  .tl-step.tl-visible:nth-child(1) { animation-delay:   0ms; }
  .tl-step.tl-visible:nth-child(2) { animation-delay: 100ms; }
  .tl-step.tl-visible:nth-child(3) { animation-delay: 200ms; }
  .tl-step.tl-visible:nth-child(4) { animation-delay: 300ms; }

  /* Comparison table row hover */
  .compare-row {
    transition: transform var(--transition-fast, 120ms ease), box-shadow var(--transition-fast, 120ms ease);
  }
  .compare-row:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    position: relative;
    z-index: 1;
  }

  /* Quiz answer ripple on click */
  .quiz-answer {
    transition: border-color 150ms, background 150ms, transform 150ms;
  }
  .quiz-answer:active {
    transform: scale(0.97);
  }
  .quiz-answer.quiz-selected {
    transform: scale(1.00);
  }

  /* Stats count-up ready */
  .stat-value { will-change: contents; }

  /* Quiz answer grid — single-col on very small screens */
  @media (max-width: 520px) {
    .quiz-grid { grid-template-columns: 1fr !important; }
  }

  /* Mobile overrides */
  @media (max-width: 768px) {
    .hero-grid      { grid-template-columns: 1fr !important; gap: 28px !important; }
    .timeline-grid  { flex-direction: column !important; }
    .tl-connector   { display: none !important; }
    .compare-scroll { overflow-x: auto !important; }
  }
`;

/* ─── CRO Header (no nav, logo + phone only) ─────────────────────────────── */
const TrustBadgesInline = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
    <a
      href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Verify LegitScript Certification"
    >
      <img
        src="/images/badges/legitscript-color.webp"
        alt="LegitScript Certified"
        width={292}
        height={316}
        style={{ height: 40, width: "auto", opacity: 0.85 }}
        loading="lazy"
        decoding="async"
      />
    </a>
    <img
      src="/images/badges/hipaa-color.webp"
      alt="HIPAA Compliant"
      width={510}
      height={242}
      style={{ height: 32, width: "auto", opacity: 0.80 }}
      loading="lazy"
      decoding="async"
    />
    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontWeight: 600, letterSpacing: "0.05em" }}>
      HIPAA Compliant
    </span>
  </div>
);

/* ─── Stat strip ─────────────────────────────────────────────────────────── */
/* ─── What's Included card (tightened) ──────────────────────────────────── */
const IncludedCard = () => (
  <div style={{
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  }}>
    <div style={{
      padding: "12px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(11,16,41,0.60)",
    }}>
      <span style={{
        fontFamily: "Oswald, sans-serif",
        fontWeight: 700,
        fontSize: 13,
        color: "#fff",
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
      }}>
        What Is Included
      </span>
    </div>
    {([
      { icon: <FlaskConical size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Full Hormone Lab Panel" },
      { icon: <Stethoscope  size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Provider Consultation" },
      { icon: <ClipboardList size={16} strokeWidth={1.75} color="var(--brand-cta)" />, title: "Personalized Treatment Plan" },
    ] as const).map(({ icon, title }) => (
      <div key={title} style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {icon}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#fff" }}>{title}</span>
        <span style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--c-success-on-dark)",
        }}>
          <Check size={12} strokeWidth={3} color="var(--c-success-on-dark)" />
          Included
        </span>
      </div>
    ))}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 20px",
      background: "rgba(11,16,41,0.80)",
    }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>Total</span>
      <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--brand-cta)" }}>
        $0 No-cost consultation
      </span>
    </div>
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
const ProductTRT = () => {
  const navigate = useNavigate();
  const goSchedule = useCallback(() => navigate("/product/trt/schedule"), [navigate]);

  return (
    <div style={{
      background: "#fff",
      fontFamily: "Inter, sans-serif",
      overflowX: "hidden",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <SEO
        title="Testosterone Replacement Therapy | Men's Wellness Centers"
        description="In-person TRT at Virginia's physician-led men's health practice. On-site labs, same-day results, and personalized protocols. No-cost consultation."
      />
      <style>{GLOBAL_STYLES}</style>

      {/* 1. ANNOUNCEMENT BAR */}
      <div className="ann-shimmer" style={{ padding: "10px 16px", textAlign: "center" }}>
        <p style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: 12,
          fontWeight: 400,
          letterSpacing: "0.06em",
          color: "var(--brand-cream)",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          <span style={{ color: "var(--brand-cta)", fontSize: 10 }}>●</span>
          No-cost provider visits for new members · Same-day labs
        </p>
      </div>

      {/* 2. CRO HEADER — logo + phone, no nav */}
      <TRTProductHeader />

      <main style={{ flex: 1, paddingTop: 64 /* offset fixed header */ }}>

        {/* 3. HERO — dark navy split */}
        <section
          id="hero"
          style={{
            background: "linear-gradient(135deg, #0B1029 0%, #0D1535 40%, #111B3A 100%)",
            paddingTop: 72,
            paddingBottom: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dot-pattern texture */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px", pointerEvents: "none",
          }} />
          {/* Orange glow top-right */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 40% at 90% 0%, rgba(232,103,10,0.16) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          <div
            className="hero-grid"
            style={{
              maxWidth: 1140,
              margin: "0 auto",
              padding: "0 24px 64px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 56,
              alignItems: "start",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* LEFT — copy */}
            <div style={{ paddingTop: 16 }}>
              <Eyebrow>TESTOSTERONE THERAPY</Eyebrow>
              <h1 style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(38px, 5vw, 64px)",
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                marginBottom: 24,
                marginTop: 16,
              }}>
                <span style={{ color: "#fff", display: "block" }}>Your Labs.</span>
                <span style={{ color: "#fff", display: "block" }}>Your Plan.</span>
                <span style={{ color: "var(--brand-cta)", display: "block" }}>In One Visit.</span>
              </h1>

              {/* 3-line value prop */}
              <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "On-site labs drawn at your appointment -- no outside visits",
                  "Results reviewed same day by a licensed Virginia provider",
                  "Personalized protocol built for your numbers, not a template",
                ].map((line) => (
                  <li key={line} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 15, color: "rgba(255,255,255,0.80)", lineHeight: 1.5 }}>{line}</span>
                  </li>
                ))}
              </ul>

              {/* Trust badges inline */}
              <TrustBadgesInline />

              {/* CTA */}
              <div style={{ marginTop: 28 }}>
                <OrangeCTA onClick={goSchedule} style={{ borderRadius: 999, height: 56, fontSize: 17, justifyContent: "center", width: "100%" }}>
                  Book My No-Cost Lab Visit <ArrowRight size={18} strokeWidth={2.5} />
                </OrangeCTA>
              </div>
            </div>

            {/* RIGHT — form */}
            <div style={{ paddingTop: 8 }}>
              <IncludedCard />
              <TRTHeroForm
                service="trt"
                heading="Reserve Your Consultation"
                ctaLabel="Book My No-Cost Lab Visit"
              />
            </div>
          </div>

          {/* Stat strip — anchored to bottom of hero */}
          <TRTStatStrip />
        </section>

        {/* 4. COMPARISON TABLE */}
        <TRTComparisonTable />

        {/* 5. CANDIDATE QUIZ */}
        <TRTCandidateQuiz onNavigateSchedule={goSchedule} />

        {/* 6. VISUAL TIMELINE */}
        <TRTVisualTimeline onSchedule={goSchedule} />

        {/* 7. BENEFITS */}
        <TRTBenefitsSection />

        {/* 8. TREATMENT OPTIONS */}
        <TRTTreatmentOptionsSection onSchedule={goSchedule} />

        {/* 9. SIGNS */}
        <TRTSignsSection onSchedule={goSchedule} />

        {/* 10. PRICING */}
        <TRTPricing />

        {/* 11. FAQ */}
        <div id="faq">
          <TRTProductFAQ />
        </div>

        {/* 12. CLOSING CTA */}
        <section style={{
          background: "linear-gradient(135deg, #0B1029 0%, #111B3A 100%)",
          padding: "80px 24px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#fff",
              marginBottom: 12,
              lineHeight: 1.15,
            }}>
              Ready to Know Your Numbers?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", marginBottom: 32, lineHeight: 1.6 }}>
              Your first visit is no-cost. Labs are drawn on-site. Results reviewed the same day.
            </p>
            <OrangeCTA onClick={goSchedule} style={{ borderRadius: 999, height: 56, fontSize: 17, margin: "0 auto" }}>
              Book My No-Cost Lab Visit <ArrowRight size={18} strokeWidth={2.5} />
            </OrangeCTA>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 16 }}>
              Virginia-licensed providers · LegitScript Certified · HIPAA Compliant
            </p>
          </div>
        </section>
      </main>

      <TRTFooter />
    </div>
  );
};

export default ProductTRT;
