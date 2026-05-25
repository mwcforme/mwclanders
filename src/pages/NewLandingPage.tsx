import { lazy, Suspense } from "react";
import { useJsonLd } from "@/lib/useSEO";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTHero } from "@/components/landing/trt/TRTHero";
import { CredibilityBand } from "@/components/landing/trt/CredibilityBand";
import { TRTManifesto } from "@/components/landing/trt/TRTManifesto";
import { TRTThreeProblems } from "@/components/landing/trt/TRTThreeProblems";
import { TRTEverythingIncluded } from "@/components/landing/trt/TRTEverythingIncluded";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { SEO } from "@/components/SEO";
import { useScrollDepth } from "@/hooks/useAnalytics";
import { buildFaqJsonLd } from "@/lib/schema";

// ── Below-fold sections: lazy-loaded after hero renders ───────────────────
// Each becomes its own chunk, loaded in parallel as user scrolls.
const TRTHowItWorks  = lazy(() => import("@/components/landing/trt/TRTHowItWorks").then(m => ({ default: m.TRTHowItWorks })));
const TRTResults     = lazy(() => import("@/components/landing/trt/TRTResults").then(m => ({ default: m.TRTResults })));
const TRTPillars     = lazy(() => import("@/components/landing/trt/TRTPillars").then(m => ({ default: m.TRTPillars })));
const TRTMarquee     = lazy(() => import("@/components/landing/trt/TRTMarquee").then(m => ({ default: m.TRTMarquee })));
const TRTLocations   = lazy(() => import("@/components/landing/trt/TRTLocations").then(m => ({ default: m.TRTLocations })));
const TRTFAQ         = lazy(() => import("@/components/landing/trt/TRTFAQ").then(m => ({ default: m.TRTFAQ })));
const TRTFinalCTA    = lazy(() => import("@/components/landing/trt/TRTFinalCTA").then(m => ({ default: m.TRTFinalCTA })));
const TRTFooter      = lazy(() => import("@/components/landing/trt/TRTFooter").then(m => ({ default: m.TRTFooter })));

// Minimal fallback — matches section bg colors so no layout shift
const SectionSkeleton = ({ bg = "var(--brand-cream)", height = 200 }: { bg?: string; height?: number }) => (
  <div style={{ background: bg, minHeight: height }} aria-hidden="true" />
);

const faqSchema = JSON.stringify(buildFaqJsonLd());

const NewLandingPage = () => {
  useScrollDepth();
  useJsonLd(faqSchema);
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <SEO
        title="Men's Wellness Centers | Low Testosterone Therapy in Virginia"
        description="Provider-supervised testosterone replacement therapy at 3 Virginia locations. Testing and results reviewed in-visit. Walk in today."
      />
      <TRTHeader />
      <main className="flex-1">
        {/* Above fold — eager */}
        <TRTHero />
        <SectionReveal><CredibilityBand /></SectionReveal>

        {/* Three Problems. One Clinic. — service cards with lifestyle imagery */}
        <TRTThreeProblems />

        <SectionReveal><TRTManifesto /></SectionReveal>

        {/* Below fold — lazy */}
        <Suspense fallback={<SectionSkeleton bg="var(--brand-cream)" height={480} />}>
          <SectionReveal><TRTHowItWorks /></SectionReveal>
        </Suspense>

        {/* Everything's Included. No Surprises. — pricing clarity */}
        <TRTEverythingIncluded />

        <Suspense fallback={<SectionSkeleton bg="var(--brand-cream)" height={400} />}>
          <SectionReveal><TRTResults /></SectionReveal>
        </Suspense>
        <Suspense fallback={<SectionSkeleton bg="var(--brand-navy)" height={360} />}>
          <SectionReveal><TRTPillars /></SectionReveal>
        </Suspense>
        <Suspense fallback={<SectionSkeleton bg="#111827" height={160} />}>
          <SectionReveal><TRTMarquee /></SectionReveal>
        </Suspense>
        <Suspense fallback={<SectionSkeleton bg="var(--c-text-on-dark)" height={400} />}>
          <SectionReveal><TRTLocations /></SectionReveal>
        </Suspense>
        <Suspense fallback={<SectionSkeleton bg="var(--brand-cream)" height={480} />}>
          <SectionReveal><TRTFAQ /></SectionReveal>
        </Suspense>
        <Suspense fallback={<SectionSkeleton bg="var(--brand-navy)" height={400} />}>
          <SectionReveal><TRTFinalCTA /></SectionReveal>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <TRTFooter />
      </Suspense>
      <StickyMobileCTA />
    </div>
  );
};

export default NewLandingPage;
