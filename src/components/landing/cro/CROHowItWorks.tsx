/**
 * CROHowItWorks — lazy wrapper around TRTHowItWorks for /cro-op.
 */
import { lazy, Suspense } from "react";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";

const TRTHowItWorks = lazy(() =>
  import("@/components/landing/trt/TRTHowItWorks").then((m) => ({ default: m.TRTHowItWorks }))
);

const Skeleton = () => (
  <div style={{ background: "var(--brand-cream)", minHeight: 480 }} aria-hidden="true" />
);

export const CROHowItWorks = () => (
  <Suspense fallback={<Skeleton />}>
    <SectionReveal>
      <TRTHowItWorks />
    </SectionReveal>
  </Suspense>
);
