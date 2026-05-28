import { lazy, Suspense } from "react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { CredibilityBand } from "@/components/landing/trt/CredibilityBand";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";
import { SEO } from "@/components/SEO";
import { useScrollDepth } from "@/hooks/useAnalytics";
import { WLHero } from "@/components/landing/wl/WLHero";
import { WLManifesto } from "@/components/landing/wl/WLManifesto";
import { TRTEverythingIncluded } from "@/components/landing/trt/TRTEverythingIncluded";
import { COPY } from "@/data/copy";

const WLHowItWorks  = lazy(() => import("@/components/landing/wl/WLHowItWorks").then(m => ({ default: m.WLHowItWorks })));
const TRTResults    = lazy(() => import("@/components/landing/trt/TRTResults").then(m => ({ default: m.TRTResults })));
const TRTPillars    = lazy(() => import("@/components/landing/trt/TRTPillars").then(m => ({ default: m.TRTPillars })));
const TRTMarquee    = lazy(() => import("@/components/landing/trt/TRTMarquee").then(m => ({ default: m.TRTMarquee })));
const TRTLocations  = lazy(() => import("@/components/landing/trt/TRTLocations").then(m => ({ default: m.TRTLocations })));
const WLFAQ         = lazy(() => import("@/components/landing/wl/WLFAQ").then(m => ({ default: m.WLFAQ })));
const ServiceFinalCTA = lazy(() => import("@/components/landing/shared/ServiceFinalCTA").then(m => ({ default: m.ServiceFinalCTA })));
const TRTFooter     = lazy(() => import("@/components/landing/trt/TRTFooter").then(m => ({ default: m.TRTFooter })));

const S = ({ bg = "var(--brand-cream)", h = 200 }: { bg?: string; h?: number }) => (
  <div style={{ background: bg, minHeight: h }} aria-hidden="true" />
);

const NewWeightLoss = () => {
  useScrollDepth();
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <SEO
        title="Medical Weight Loss for Men in Virginia | Men's Wellness Centers"
        description="Provider-supervised medical weight loss in Virginia. GLP-1 medications and a real provider you actually meet. FSA and HSA accepted."
      />
      <TRTHeader />
      <main className="flex-1">
        <WLHero />
        <SectionReveal><CredibilityBand /></SectionReveal>
        <TRTEverythingIncluded />
        <SectionReveal><WLManifesto /></SectionReveal>
        <Suspense fallback={<S bg="var(--brand-cream)" h={480} />}>
          <SectionReveal><WLHowItWorks /></SectionReveal>
        </Suspense>
        <Suspense fallback={<S bg="var(--brand-cream)" h={400} />}>
          <SectionReveal><TRTResults /></SectionReveal>
        </Suspense>
        <Suspense fallback={<S bg="var(--brand-navy)" h={360} />}>
          <SectionReveal><TRTPillars /></SectionReveal>
        </Suspense>
        <Suspense fallback={<S bg="#111827" h={160} />}>
          <SectionReveal><TRTMarquee /></SectionReveal>
        </Suspense>
        <Suspense fallback={<S bg="var(--c-text-on-dark)" h={400} />}>
          <SectionReveal><TRTLocations /></SectionReveal>
        </Suspense>
        <Suspense fallback={<S bg="var(--brand-cream)" h={480} />}>
          <SectionReveal><WLFAQ /></SectionReveal>
        </Suspense>
        <Suspense fallback={<S bg="var(--brand-navy)" h={400} />}>
          <SectionReveal>
            <ServiceFinalCTA
              service="wl"
              headline="READY TO START LOSING THE WEIGHT?"
              subhead={COPY.offer.finalSubhead}
              cardTitle={COPY.cta.seeIfIQualify}
              ctaLabel={COPY.cta.seeIfIQualify}
              intro="No more cycles of strict diets and bounce-back. A licensed Virginia provider, real labs, and the right medication for your body."
              bullets={[
                "100% private. Your employer or insurance is never notified.",
                COPY.offer.cancelReschedule,
                "If GLP-1 treatment isn't right for you, our providers will tell you. Treatment is only prescribed when clinically appropriate.",
              ]}
            />
          </SectionReveal>
        </Suspense>
      </main>
      <Suspense fallback={null}><TRTFooter /></Suspense>
      <StickyMobileCTA />
      <div className="md:hidden" style={{ height: 80 }} aria-hidden="true" />
    </div>
  );
};

export default NewWeightLoss;
