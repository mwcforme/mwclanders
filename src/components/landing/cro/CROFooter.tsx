/**
 * CROFooter — minimal compliance footer for /cro-op.
 */
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { PHONE } from "@/lib/constants";

const ORANGE = "var(--brand-cta)";

const DISCLAIMERS = [
  "The information presented on this website is for general informational purposes only and is not intended to constitute medical advice, diagnosis, or treatment. Nothing on this website should be relied upon as a substitute for an in-person evaluation with a licensed healthcare professional.",
  "Testimonials reflect individual experiences only and are not intended to represent typical outcomes or make medical claims.",
];

export const CROFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "var(--brand-navy)", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
          <img src="/logos/Text_Logo_white.webp"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
            alt="Men's Wellness Centers" style={{ height: 36, width: "auto" }} width={180} height={36} loading="lazy" decoding="async" />
          <a href={PHONE.tel} style={{ fontSize: 16, fontWeight: 600, color: "var(--c-text-on-dark)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <Phone size={15} strokeWidth={1.75} style={{ color: ORANGE }} />{PHONE.display}
          </a>
        </div>
        <div style={{
          // hardcoded-color-allow-next-line
          borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 32,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap",
        }}>
          <img src="/images/badges/clia-color.webp" alt="CLIA Certified" style={{ height: 52, width: "auto" }} loading="lazy" decoding="async" />
          <a href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com" target="_blank" rel="noopener noreferrer">
            <img src="/images/badges/legitscript-color.webp" alt="LegitScript Certified" style={{ height: 64, width: "auto" }} loading="lazy" decoding="async" />
          </a>
          <img src="/images/badges/hipaa-color.webp" alt="HIPAA Compliant" style={{ height: 52, width: "auto" }} loading="lazy" decoding="async" />
        </div>
        <div style={{
          marginTop: 32, paddingTop: 24,
          // hardcoded-color-allow-next-line
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {DISCLAIMERS.map((text, i) => (
            <p key={i} style={{ fontSize: 11, lineHeight: 1.65, color: "rgba(255,255,255,0.50)", margin: 0, overflowWrap: "break-word" }}>{text}</p>
          ))}
        </div>
        <div style={{
          marginTop: 24, paddingTop: 16, paddingBottom: 24,
          // hardcoded-color-allow-next-line
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
          gap: "6px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.09em",
          // hardcoded-color-allow-next-line
          textTransform: "uppercase", color: "rgba(255,255,255,0.50)",
        }}>
          <span>&copy; {year} Men&rsquo;s Wellness Centers</span>
          <span>|</span>
          {/* hardcoded-color-allow-next-line */}
          <Link to="/prescribing-policy" style={{ color: "rgba(255,255,255,0.50)", textDecoration: "none" }}>Safety Policy</Link>
          <span>|</span>
          {/* hardcoded-color-allow-next-line */}
          <Link to="/terms-of-service" style={{ color: "rgba(255,255,255,0.50)", textDecoration: "none" }}>Terms</Link>
          <span>|</span>
          {/* hardcoded-color-allow-next-line */}
          <Link to="/privacy-policy" style={{ color: "rgba(255,255,255,0.50)", textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};
