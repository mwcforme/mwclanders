/**
 * CROOptimized — /cro-op route
 *
 * Conversion-optimized landing page for paid media.
 * No header nav (eliminates exit paths).
 * 15 CRO improvements applied over the root LP.
 *
 * Orchestrator only — all sections are extracted components.
 */

import { lazy, Suspense } from "react";

import { SEO }                   from "@/components/SEO";
import { TRTManifesto }          from "@/components/landing/trt/TRTManifesto";
import { TRTThreeProblems }      from "@/components/landing/trt/TRTThreeProblems";
import { TRTEverythingIncluded } from "@/components/landing/trt/TRTEverythingIncluded";
import { SectionReveal }         from "@/components/landing/trt/SectionReveal";
import { StickyMobileCTA }       from "@/components/landing/trt/StickyMobileCTA";

import { CROHeader }              from "@/components/landing/cro/CROHeader";
import { CROHeroSection }         from "@/components/landing/cro/CROHeroSection";
import { CROSocialProof }         from "@/components/landing/cro/CROSocialProof";
import { CROHowItWorks }          from "@/components/landing/cro/CROHowItWorks";
import { CROTestimonials }        from "@/components/landing/cro/CROTestimonials";
import { CROFaq }                 from "@/components/landing/cro/CROFaq";
import { CROClosingFormSection }  from "@/components/landing/cro/CROClosingFormSection";
import { CROFooter }              from "@/components/landing/cro/CROFooter";
import { CRODesktopStickyBar }    from "@/components/landing/cro/CRODesktopStickyBar";

const TRTPillars = lazy(() =>
  import("@/components/landing/trt/TRTPillars").then((m) => ({ default: m.TRTPillars }))
);
const TRTMarquee = lazy(() =>
  import("@/components/landing/trt/TRTMarquee").then((m) => ({ default: m.TRTMarquee }))
);
const TRTLocations = lazy(() =>
  import("@/components/landing/trt/TRTLocations").then((m) => ({ default: m.TRTLocations }))
);

const Skeleton = ({ bg = "var(--brand-cream)", height = 200 }: { bg?: string; height?: number }) => (
  <div style={{ background: bg, minHeight: height }} aria-hidden="true" />
);

const CROOptimized = () => (
  <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
    <SEO
      title="TRT in Virginia | No-Cost Consultation | Men's Wellness Centers"
      description="Claim your no-cost men's health consultation. Labs drawn on-site, results reviewed same visit. 3 Virginia locations. Same-day availability."
    />
    <CROHeader />
    <main className="flex-1">
      <CROHeroSection />
      <SectionReveal><CROSocialProof /></SectionReveal>
      <SectionReveal><TRTManifesto ctaScrollTarget="hero-form" /></SectionReveal>
      <TRTThreeProblems headlineOverride={{ line1: "THREE REASONS MEN COME TO US." }} />
      <TRTEverythingIncluded />
      <CROHowItWorks />
      <CROTestimonials />
      <Suspense fallback={<Skeleton bg="var(--brand-navy)" height={360} />}>
        <SectionReveal><TRTPillars /></SectionReveal>
      </Suspense>
      <Suspense fallback={<Skeleton bg="#111827" height={160} />}>
        <TRTMarquee />
      </Suspense>
      <Suspense fallback={<Skeleton height={400} />}>
        <SectionReveal><TRTLocations /></SectionReveal>
      </Suspense>
      <CROFaq />
      <CROClosingFormSection />
    </main>
    <CROFooter />
    <StickyMobileCTA />
    <CRODesktopStickyBar />
  </div>
);

export default CROOptimized;
