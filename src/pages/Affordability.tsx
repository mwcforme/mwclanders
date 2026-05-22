/**
 * /pricing — Affordability page for Men's Wellness Centers.
 * Orchestrator only — all sections are extracted components.
 */

import { TRTHeader }              from "@/components/landing/trt/TRTHeader";
import { TRTFooter }              from "@/components/landing/trt/TRTFooter";
import { TRTEverythingIncluded }  from "@/components/landing/trt/TRTEverythingIncluded";
import { StickyMobileCTA }        from "@/components/landing/trt/StickyMobileCTA";

import { AffordabilityHero }         from "@/components/landing/shared/AffordabilityHero";
import { AffordabilityTrustStrip }   from "@/components/landing/shared/AffordabilityTrustStrip";
import { AffordabilityHowPricing }   from "@/components/landing/shared/AffordabilityHowPricing";
import { AffordabilityMemberTerms }  from "@/components/landing/shared/AffordabilityMemberTerms";
import { AffordabilityTestimonials } from "@/components/landing/shared/AffordabilityTestimonials";
import { AffordabilityFaq }          from "@/components/landing/shared/AffordabilityFaq";
import { AffordabilityClosingCTA }   from "@/components/landing/shared/AffordabilityClosingCTA";

export default function Affordability() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <TRTHeader minimal />
      <AffordabilityHero />
      <AffordabilityTrustStrip />
      <AffordabilityHowPricing />
      <TRTEverythingIncluded />
      <AffordabilityMemberTerms />
      <AffordabilityTestimonials />
      <AffordabilityFaq />
      <AffordabilityClosingCTA />
      <TRTFooter />
      <StickyMobileCTA />
    </div>
  );
}
