/**
 * CROTestimonials — lazy wrapper around TRTResults for /cro-op testimonials section.
 */
import { lazy, Suspense } from "react";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";

const TRTResults = lazy(() =>
  import("@/components/landing/trt/TRTResults").then((m) => ({ default: m.TRTResults }))
);

const Skeleton = () => (
  <div style={{ background: "var(--brand-cream)", minHeight: 400 }} aria-hidden="true" />
);

export const CROTestimonials = () => (
  <Suspense fallback={<Skeleton />}>
    <SectionReveal>
      <TRTResults />
    </SectionReveal>
  </Suspense>
);
