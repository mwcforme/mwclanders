/**
 * /product/trt — Testosterone Replacement Therapy landing page
 *
 * CRO-first funnel page. No header nav (eliminates exit paths on paid traffic).
 * Hero: dark navy split — left copy + right lead-capture form.
 * Sections ordered for maximum conversion from paid media visitors.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

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
import { TRTIncludedCard }           from "@/components/landing/trt/TRTIncludedCard";
import { SEO }                       from "@/components/SEO";
import { PRODUCT_TRT_STYLES }        from "@/components/landing/trt/TRTProductStyles";


/* ─── CSS keyframe animations (shared constant) ──────────────────────── */
const GLOBAL_STYLES = PRODUCT_TRT_STYLES;

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
/* ─── Main component ─────────────────────────────────────────────────────── */
const ProductTRT = () => {
  const navigate = useNavigate();
  const goSchedule = useCallback(() => navigate("/product/trt/schedule"), [navigate]);

  return (
    <div style={{
      background: "var(--bg-white)",
      fontFamily: "Inter, sans-serif",
      overflowX: "hidden",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <SEO
        title="Testosterone Replacement Therapy | Men's Wellness Centers"
        description="In-person TRT at Virginia's physician-led men's health practice. On-site labs, same-day lab results, and personalized protocols. No-cost consultation."
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
            /* hardcoded-color-allow-next-line — gradient needs intermediate stops */
            background: "linear-gradient(135deg, var(--brand-navy-deep) 0%, #0D1535 40%, #111B3A 100%)",
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
                <span style={{ color: "var(--c-text-on-dark)", display: "block" }}>Your Labs.</span>
                <span style={{ color: "var(--c-text-on-dark)", display: "block" }}>Your Plan.</span>
                <span style={{ color: "var(--brand-cta)", display: "block" }}>In One Visit.</span>
              </h1>

              {/* 3-line value prop */}
              <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "On-site labs drawn at your appointment -- no outside visits",
                  "Lab results reviewed same day by a licensed Virginia provider",
                  "Personalized protocol built for your numbers, not a template",
                ].map((line) => (
                  <li key={line} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={16} strokeWidth={2.5} style={{ color: "var(--brand-cta)", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 16, color: "rgba(255,255,255,0.80)", lineHeight: 1.5 }}>{line}</span>
                  </li>
                ))}
              </ul>

              {/* Trust badges inline */}
              <TrustBadgesInline />

              {/* CTA */}
              <div style={{ marginTop: 28 }}>
                <OrangeCTA onClick={goSchedule} style={{ borderRadius: 999, height: 56, fontSize: 17, justifyContent: "center", width: "100%" }}>
                  Book in-person visit online <ArrowRight size={18} strokeWidth={2.5} />
                </OrangeCTA>
              </div>
            </div>

            {/* RIGHT — form */}
            <div style={{ paddingTop: 8 }}>
              <TRTIncludedCard />
              <TRTHeroForm
                service="trt"
                heading="Reserve Your Visit"
                ctaLabel="Book in-person visit online"
                formId="product-trt"
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
          /* hardcoded-color-allow-next-line — gradient needs intermediate stop */
          background: "linear-gradient(135deg, var(--brand-navy-deep) 0%, #111B3A 100%)",
          padding: "80px 24px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "var(--c-text-on-dark)",
              marginBottom: 12,
              lineHeight: 1.15,
            }}>
              Ready to Know Your Numbers?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", marginBottom: 32, lineHeight: 1.6 }}>
              Your first visit is no-cost. Labs are drawn on-site. Results reviewed the same day.
            </p>
            <OrangeCTA onClick={goSchedule} style={{ borderRadius: 999, height: 56, fontSize: 17, margin: "0 auto" }}>
              Book in-person visit online <ArrowRight size={18} strokeWidth={2.5} />
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
