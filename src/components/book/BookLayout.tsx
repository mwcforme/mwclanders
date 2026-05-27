import { ReactNode, lazy, Suspense, useEffect } from "react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { SEO } from "@/components/SEO";

// Footer is heavy — lazy load it so funnel pages don't pay the cost upfront
const TRTFooter = lazy(() =>
  import("@/components/landing/trt/TRTFooter").then((m) => ({ default: m.TRTFooter }))
);

interface BookLayoutProps {
  page: "symptom" | "duration" | "schedule" | "confirmed" | "lets-talk" | "contact" | "location";
  title: string;
  description?: string;
  variant?: "default" | "confirmation";
  children: ReactNode;
}

const DEFAULT_DESC: Record<BookLayoutProps["page"], string> = {
  symptom: "Tell us what brought you in. Quick, two-question intake before scheduling at a Virginia center.",
  duration: "How long has this been going on? Helps your provider personalize your visit.",
  schedule: "Pick a consultation time at a Men's Wellness Centers location in Virginia.",
  confirmed: "Your consultation is booked. Center details and what to expect.",
  "lets-talk": "Talk to a Men's Wellness Centers care team member to figure out the right next step.",
  contact: "Enter your contact details to book your consultation at a Virginia center.",
  location: "Choose a Men's Wellness Centers location in Virginia for your consultation.",
};


const BookLayout = ({ page, title, description, variant = "default", children }: BookLayoutProps) => {
  const isConfirmation = variant === "confirmation";
  useEffect(() => {
    document.body.dataset.page = page;
    return () => {
      delete document.body.dataset.page;
    };
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif", background: "var(--brand-navy-deep)", overflowX: "hidden" }}>
      <SEO title={title} description={description || DEFAULT_DESC[page]} />
      {!isConfirmation && <TRTHeader minimal={false} hideCta={false} />}
      <main className={`flex-1 ${isConfirmation ? "" : "pt-16"} animate-in fade-in duration-200`}>{children}</main>
      <Suspense fallback={null}>
        <TRTFooter />
      </Suspense>
    </div>
  );
};

export default BookLayout;
