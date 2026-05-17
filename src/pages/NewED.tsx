import { lazy, Suspense } from "react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { CredibilityBand } from "@/components/landing/trt/CredibilityBand";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";
import { SEO } from "@/components/SEO";
import { useScrollDepth } from "@/hooks/useAnalytics";
import { EDHero } from "@/components/landing/ed/EDHero";
import { EDManifesto } from "@/components/landing/ed/EDManifesto";
import { COPY } from "@/data/copy";

const EDHowItWorks  = lazy(() => import("@/components/landing/ed/EDHowItWorks").then(m => ({ default: m.EDHowItWorks })));
const TRTResults    = lazy(() => import("@/components/landing/trt/TRTResults").then(m => ({ default: m.TRTResults })));
const TRTPillars    = lazy(() => import("@/components/landing/trt/TRTPillars").then(m => ({ default: m.TRTPillars })));
const TRTMarquee    = lazy(() => import("@/components/landing/trt/TRTMarquee").then(m => ({ default: m.TRTMarquee })));
const TRTLocations  = lazy(() => import("@/components/landing/trt/TRTLocations").then(m => ({ default: m.TRTLocations })));
const EDFAQ         = lazy(() => import("@/components/landing/ed/EDFAQ").then(m => ({ default: m.EDFAQ })));
const ServiceFinalCTA = lazy(() => import("@/components/landing/shared/ServiceFinalCTA").then(m => ({ default: m.ServiceFinalCTA })));
const TRTFooter     = lazy(() => import("@/components/landing/trt/TRTFooter").then(m => ({ default: m.TRTFooter })));

const S = ({ bg = "var(--brand-cream)", h = 200 }: { bg?: string; h?: number }) => (
  <div style={{ background: bg, minHeight: h }} aria-hidden="true" />
);

const NewED = () => {
  useScrollDepth();
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <SEO
        title="ED Treatment in Virginia | Discreet, In-Person | Men's Wellness Centers"
        description="In-person ED treatment with a licensed Virginia provider. Sildenafil, Tadalafil, TriMix, and PT-141 when clinically appropriate. 100% confidential."
      />
      <TRTHeader />
      <main className="flex-1">
        <EDHero />
        <SectionReveal><CredibilityBand /></SectionReveal>
        <SectionReveal><EDManifesto /></SectionReveal>
        <Suspense fallback={<S bg="var(--brand-cream)" h={480} />}>
          <SectionReveal><EDHowItWorks /></SectionReveal>
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
          <SectionReveal><EDFAQ /></SectionReveal>
        </Suspense>
        <Suspense fallback={<S bg="var(--brand-navy)" h={400} />}>
          <SectionReveal>
            <ServiceFinalCTA
              service="ed"
              headline="READY TO HANDLE THIS THE RIGHT WAY?"
              subhead={COPY.offer.finalSubhead}
              cardTitle={COPY.cta.bookDiscreetVisit}
              ctaLabel={COPY.cta.bookDiscreetVisit}
              intro="No mail-order pills. No rotating clinicians. A licensed Virginia provider who diagnoses the cause and prescribes what actually works for your case."
              bullets={[
                "100% private. Your employer or insurance is never notified.",
                COPY.offer.cancelReschedule,
                "If ED treatment isn't right for you, our providers will tell you. Treatment is only prescribed when clinically appropriate.",
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

export default NewED;
