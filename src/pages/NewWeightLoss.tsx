import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { CredibilityBand } from "@/components/landing/trt/CredibilityBand";
import { TRTPillars } from "@/components/landing/trt/TRTPillars";
import { TRTMarquee } from "@/components/landing/trt/TRTMarquee";
import { TRTLocations } from "@/components/landing/trt/TRTLocations";
import { TRTResults } from "@/components/landing/trt/TRTResults";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";
import { SEO } from "@/components/SEO";
import { useScrollDepth } from "@/hooks/useAnalytics";
import { WLHero } from "@/components/landing/wl/WLHero";
import { WLHowItWorks } from "@/components/landing/wl/WLHowItWorks";
import { WLManifesto } from "@/components/landing/wl/WLManifesto";
import { WLFAQ } from "@/components/landing/wl/WLFAQ";
import { ServiceFinalCTA } from "@/components/landing/shared/ServiceFinalCTA";
import { COPY } from "@/data/copy";

const NewWeightLoss = () => { useScrollDepth();
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <SEO
        title="Medical Weight Loss for Men in Virginia | Men's Wellness Centers"
        description="Physician-supervised GLP-1 weight loss in Virginia. Semaglutide, tirzepatide, and a real provider you actually meet. FSA and HSA accepted."
      />
      <TRTHeader />
      <main className="flex-1">
        <WLHero />
        <SectionReveal><CredibilityBand /></SectionReveal>
        <SectionReveal><WLManifesto /></SectionReveal>
        <SectionReveal><WLHowItWorks /></SectionReveal>
        <SectionReveal><TRTResults /></SectionReveal>
        <SectionReveal><TRTPillars /></SectionReveal>
        <SectionReveal><TRTMarquee /></SectionReveal>
        <SectionReveal><TRTLocations /></SectionReveal>
        <SectionReveal><WLFAQ /></SectionReveal>
        <SectionReveal>
          <ServiceFinalCTA
            service="wl"
            headline="READY TO START LOSING THE WEIGHT?"
            subhead={COPY.offer.finalSubhead}
            cardTitle={COPY.cta.seeIfIQualify}
            ctaLabel={COPY.cta.seeIfIQualify}
            intro="No more cycles of strict diets and bounce-back. A Virginia physician, real labs, and the right medication for your body."
            bullets={[
              "100% private. Your employer or insurance is never notified.",
              COPY.offer.cancelReschedule,
              "If GLP-1 treatment isn't right for you, our providers will tell you. Treatment is only prescribed when clinically appropriate.",
            ]}
          />
        </SectionReveal>
      </main>
      <TRTFooter />
      <StickyMobileCTA />
      <div className="md:hidden" style={{ height: 80 }} aria-hidden="true" />
    </div>
  );
};

export default NewWeightLoss;
