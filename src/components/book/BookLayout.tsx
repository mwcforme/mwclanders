import { ReactNode } from "react";
import { useEffect } from "react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";

interface BookLayoutProps {
  page: "symptom" | "duration" | "schedule" | "confirmed" | "lets-talk";
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
};

const BookLayout = ({ page, title, description, variant = "default", children }: BookLayoutProps) => {
  useEffect(() => {
    document.body.dataset.page = page;
    return () => {
      delete document.body.dataset.page;
    };
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif", background: "#0B1029" }}>
      <SEO title={title} description={description || DEFAULT_DESC[page]} />
      <TRTHeader minimal={variant === "confirmation"} />
      <main className="flex-1 pt-16 animate-in fade-in duration-200">{children}</main>
      <TRTFooter />
    </div>
  );
};

export default BookLayout;
