import { Helmet } from "react-helmet-async";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTHero } from "@/components/landing/trt/TRTHero";
import { CredibilityBand } from "@/components/landing/trt/CredibilityBand";
import { TRTHowItWorks } from "@/components/landing/trt/TRTHowItWorks";
import { TRTResults } from "@/components/landing/trt/TRTResults";
import { TRTManifesto } from "@/components/landing/trt/TRTManifesto";
import { TRTMarquee } from "@/components/landing/trt/TRTMarquee";
import { TRTPillars } from "@/components/landing/trt/TRTPillars";
import { TRTFinalCTA } from "@/components/landing/trt/TRTFinalCTA";
import { TRTLocations } from "@/components/landing/trt/TRTLocations";
import { TRTFAQ } from "@/components/landing/trt/TRTFAQ";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";
import { SEO } from "@/components/SEO";
import { useScrollDepth } from "@/hooks/useAnalytics";
import { buildFaqJsonLd } from "@/lib/schema";

const faqSchema = JSON.stringify(buildFaqJsonLd());

const TRTLandingPage = () => {
  useScrollDepth();
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <SEO
        title="TRT in Virginia | Men's Wellness Centers"
        description="Provider-supervised testosterone replacement therapy at 3 Virginia locations. Testing and results reviewed in-visit. Walk in today."
      />
      <Helmet>
        <script type="application/ld+json">{faqSchema}</script>
      </Helmet>
      <TRTHeader />
      <main className="flex-1">
        <TRTHero />
        <SectionReveal><CredibilityBand /></SectionReveal>
        <SectionReveal><TRTManifesto /></SectionReveal>
        <SectionReveal><TRTHowItWorks /></SectionReveal>
        <SectionReveal><TRTResults /></SectionReveal>
        <SectionReveal><TRTPillars /></SectionReveal>
        <SectionReveal><TRTMarquee /></SectionReveal>
        <SectionReveal><TRTLocations /></SectionReveal>
        <SectionReveal><TRTFAQ /></SectionReveal>
        <SectionReveal><TRTFinalCTA /></SectionReveal>
      </main>
      <TRTFooter />
      <StickyMobileCTA />
      {/* Spacer so sticky CTA doesn't overlap last section — 72px matches StickyMobileCTA height */}
      <div className="md:hidden" style={{ height: 72 }} aria-hidden="true" />
    </div>
  );
};

export default TRTLandingPage;


