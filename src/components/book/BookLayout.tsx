import { ReactNode, lazy, Suspense } from "react";
import { useEffect } from "react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { SEO } from "@/components/SEO";
import { PHONE } from "@/lib/constants";

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

/** Minimal footer for funnel steps — phone + required LegitScript badge */
const FunnelFooter = () => (
  <footer style={{ background: "#000814", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
    <a
      href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Verify LegitScript Certification"
      style={{ display: "inline-block", marginBottom: 12 }}
    >
      <img
        src="/images/badges/legitscript.png"
        alt="LegitScript Certified"
        style={{ height: 40, width: "auto", opacity: 0.8 }}
        loading="lazy"
      />
    </a>
    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", margin: 0 }}>
      Need help?{" "}
      <a href={PHONE.tel} style={{ color: "#E8670A", fontWeight: 600, textDecoration: "none" }}>
        {PHONE.display}
      </a>
      {" · "}
      <span>Men's Wellness Centers</span>
    </p>
  </footer>
);

const BookLayout = ({ page, title, description, variant = "default", children }: BookLayoutProps) => {
  useEffect(() => {
    document.body.dataset.page = page;
    return () => {
      delete document.body.dataset.page;
    };
  }, [page]);

  // Only show full footer on confirmation page — funnel steps get minimal footer
  const isConfirmation = page === "confirmed";

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif", background: "#0B1029" }}>
      <SEO title={title} description={description || DEFAULT_DESC[page]} />
      <TRTHeader minimal={variant === "confirmation"} />
      <main className="flex-1 pt-16 animate-in fade-in duration-200">{children}</main>
      {isConfirmation ? (
        <Suspense fallback={null}>
          <TRTFooter />
        </Suspense>
      ) : (
        <FunnelFooter />
      )}
    </div>
  );
};

export default BookLayout;
