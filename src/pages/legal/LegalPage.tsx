import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

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
      <main style={{ background: "#000814", minHeight: "100vh", color: "rgba(255,255,255,0.92)" }}>
        <div className="max-w-[820px] mx-auto px-6 py-20" style={{ fontFamily: "Inter, sans-serif" }}>
          <Link to="/" className="text-xs uppercase tracking-[0.18em]" style={{ color: "#F97316" }}>
            ← Back to Men's Wellness Centers
          </Link>
          <h1 className="mt-6 text-4xl md:text-5xl" style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.02em" }}>
            {title}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>Last updated: {updated}</p>
          <div className="mt-10 space-y-6 text-[15px] leading-[1.75]" style={{ color: "rgba(255,255,255,0.82)" }}>
            {children}
          </div>
          <div className="mt-16 pt-8 border-t flex gap-6 text-xs uppercase tracking-[0.14em]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
            <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-white">Terms</Link>
            <Link to="/tcpa" className="hover:text-white">TCPA</Link>
            <Link to="/prescribing-policy" className="hover:text-white">Safety Policy</Link>
          </div>
        </div>
      </main>
    </>
  );
};

export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-10 text-2xl text-white" style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.02em" }}>{children}</h2>
);
