/**
 * CROFaq — FAQ section for /cro-op, injecting two extra CRO-specific questions.
 */
import { lazy, Suspense } from "react";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";
import { CRO_EXTRA_FAQS } from "@/data/croContent";

const TRTFAQ = lazy(() =>
  import("@/components/landing/trt/TRTFAQ").then((m) => ({ default: m.TRTFAQ }))
);

const Skeleton = () => (
  <div style={{ background: "var(--brand-cream)", minHeight: 480 }} aria-hidden="true" />
);

export const CROFaq = () => (
  <Suspense fallback={<Skeleton />}>
    <SectionReveal>
      <TRTFAQ extraFaqs={CRO_EXTRA_FAQS} />
    </SectionReveal>
  </Suspense>
);
