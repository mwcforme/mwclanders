import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export const LegalPage = ({ title, updated, children }: LegalPageProps) => {
  return (
    <>
      <SEO
        title={`${title} | Men's Wellness Centers`}
        description={`${title} for Men's Wellness Centers booking site.`}
      />
      <TRTHeader minimal />
      <main className="bg-background min-h-screen">
        <div className="max-w-[820px] mx-auto px-6 pt-28 pb-20" style={{ fontFamily: "Inter, sans-serif" }}>
          <Link to="/" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-primary hover:underline">
            <ChevronLeft size={14} /> Back to Men's Wellness Centers
          </Link>
          <h1 className="mt-6 text-4xl md:text-5xl font-display text-panel-foreground" style={{ letterSpacing: "0.02em" }}>
            {title}
          </h1>
          <p className="mt-3 text-sm text-panel-muted">Last updated: {updated}</p>
          <div className="mt-10 space-y-6 text-[15px] leading-[1.75] text-panel-foreground">
            {children}
          </div>
          <div className="mt-16 pt-8 border-t border-panel-divider flex gap-6 text-xs uppercase tracking-[0.14em] text-panel-muted">
            <Link to="/privacy-policy" className="hover:text-panel-foreground transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-panel-foreground transition-colors">Terms</Link>
            <Link to="/tcpa" className="hover:text-panel-foreground transition-colors">TCPA</Link>
            <Link to="/prescribing-policy" className="hover:text-panel-foreground transition-colors">Safety Policy</Link>
          </div>
        </div>
      </main>
      <TRTFooter />
    </>
  );
};

export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-10 text-2xl text-panel-foreground font-display" style={{ letterSpacing: "0.02em" }}>{children}</h2>
);
