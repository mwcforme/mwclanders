import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { SEO } from "@/components/SEO";
import { useScrollDepth } from "@/hooks/useAnalytics";
import { TRTEduHero } from "@/components/landing/edu/TRTEduHero";
import { TRTEduSymptomSlider } from "@/components/landing/edu/TRTEduSymptomSlider";
import { TRTEduScienceSection } from "@/components/landing/edu/TRTEduScienceSection";
import { TRTEduWhatIsLowT } from "@/components/landing/edu/TRTEduWhatIsLowT";
import { TRTEduHowTRTWorks } from "@/components/landing/edu/TRTEduHowTRTWorks";
import { TRTEduCTA } from "@/components/landing/edu/TRTEduCTA";

const TRTEducation = () => {
  useScrollDepth();
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden", background: "#0A0A0A" }}>
      <SEO
        title="Low Testosterone: Signs, Symptoms & How TRT Works | Men's Wellness Centers"
        description="Low T doesn't announce itself — it slowly changes you. Learn what's really happening inside your body, and how testosterone replacement therapy helps men in Virginia reclaim energy, strength, and drive."
      />
      <TRTHeader minimal />
      <main className="flex-1">
        <TRTEduHero />
        <TRTEduSymptomSlider />
        <TRTEduWhatIsLowT />
        <TRTEduScienceSection />
        <TRTEduHowTRTWorks />
        <TRTEduCTA />
      </main>
      <TRTFooter />
      <StickyMobileCTA />
      <div className="md:hidden" style={{ height: 72 }} aria-hidden="true" />
    </div>
  );
};

export default TRTEducation;
