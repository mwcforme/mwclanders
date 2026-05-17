import { Link } from "react-router-dom";
import { PHONE } from "@/lib/constants";

/**
 * Footer — mirrors menswellnesscenters.com layout exactly.
 * No external links except LegitScript (required by certification) and
 * internal legal pages (privacy, terms, safety, TCPA).
 */
export const TRTFooter = () => {
  const year = new Date().getFullYear();

  const col = (label: string) => (
    <div
      className="text-xs font-bold uppercase mb-5"
      style={{ color: "var(--c-text-on-dark)", letterSpacing: "0.14em" }}
    >
      {label}
    </div>
  );

  const li = (content: React.ReactNode) => (
    <li style={{ marginBottom: 14, fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
      {content}
    </li>
  );

  return (
    <footer style={{
      background: "var(--brand-navy)",
      color: "rgba(255,255,255,0.75)",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 0" }}>

        {/* ── Row 1: Logo + 3 columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand column */}
          <div>
            <img
              src="/logos/Text_Logo_white.webp" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
              alt="Men's Wellness Centers"
              style={{ height: 44, width: "auto" }}
              width={220}
              height={44}
              loading="lazy"
              decoding="async"
            />
            <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              Copyright © {year}
            </p>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <a href={PHONE.tel} style={{ fontSize: 14, color: "rgba(255,255,255,0.80)", textDecoration: "none" }}>
                ☎ {PHONE.display}
              </a>
            </div>
          </div>

          {/* Locations */}
          <div>
            {col("Locations")}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {li(<span style={{ color: "rgba(255,255,255,0.75)" }}>Richmond</span>)}
              {li(<span style={{ color: "rgba(255,255,255,0.75)" }}>Newport News</span>)}
              {li(<span style={{ color: "rgba(255,255,255,0.75)" }}>Virginia Beach</span>)}
            </ul>
          </div>

          {/* Company */}
          <div>
            {col("Company")}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {li(<span style={{ color: "rgba(255,255,255,0.75)" }}>How It Works</span>)}
              {li(<span style={{ color: "rgba(255,255,255,0.75)" }}>About Us</span>)}
              {li(<span style={{ color: "rgba(255,255,255,0.75)" }}>Careers</span>)}
              {li(<span style={{ color: "rgba(255,255,255,0.75)" }}>FAQ</span>)}
            </ul>
          </div>

          {/* Contact */}
          <div>
            {col("Contact")}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {li(<span>Richmond: <a href="tel:8043464636" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>804-346-4636</a></span>)}
              {li(<span>Newport News: <a href={PHONE.tel} style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>757-806-6263</a></span>)}
              {li(<span>Virginia Beach: <a href={PHONE.tel} style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>757-806-6263</a></span>)}
              {li(<a href="mailto:info@menswellnesscenters.com" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>info@menswellnesscenters.com</a>)}
            </ul>
          </div>
        </div>

        {/* ── Row 2: Trust badges ── */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 40,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          {/* CLIA — same official webp as WordPress site */}
          <img
            src="/images/badges/clia-color.webp"
            alt="Clinical Laboratory Improvements Amendments"
            style={{ height: 64, width: "auto" }}
            width={140}
            height={64}
            loading="lazy"
            decoding="async"
          />
          {/* LegitScript — official certified badge, links to verification */}
          <a
            href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Verify LegitScript Certification"
            style={{ display: "inline-block" }}
          >
            <img
              src="/images/badges/legitscript-color.png"
              alt="LegitScript Certified Healthcare Website"
              style={{ height: 80, width: "auto" }}
              width={110}
              height={80}
              loading="lazy"
              decoding="async"
            />
          </a>
          {/* HIPAA — same official webp as WordPress site */}
          <img
            src="/images/badges/hipaa-color.webp"
            alt="Health Insurance Portability and Accountability Act"
            style={{ height: 64, width: "auto" }}
            width={140}
            height={64}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* ── Row 3: Disclaimers ── */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {[
            "The information presented on this website is provided for general informational purposes only and is not intended to constitute medical advice, diagnosis, or treatment. Men's Wellness Centers does not provide medical advice through this website, and nothing on this website should be relied upon as a substitute for an in-person evaluation, diagnosis, or consultation with a licensed healthcare professional. All content on this website, including text, images, graphics, testimonials, educational materials, and other information, is informational in nature only and is not intended to influence medical decision-making. Any reliance on information contained on this website is solely at the discretion and risk of the reader.",
            "Men's Wellness Centers provides care through in-center visits at its Virginia locations and telehealth consultations. Medical services are provided following an individualized evaluation and are rendered by licensed medical professionals exercising independent clinical judgment. All ED care and men's health services at Men's Wellness Centers are provided by licensed medical professionals exercising independent clinical judgment following individualized patient evaluations. Care protocols are selected based on each patient's health profile, lab results, and medical history. Men's Wellness Centers makes no representations, guarantees, or warranties regarding outcomes, effectiveness, or suitability of any ED care for any individual. Individual results and responses vary.",
            "Testimonials and reviews on this website reflect individual experiences only and are not intended to represent typical outcomes. Testimonials are not intended to make medical claims or to suggest that any service provided by Men's Wellness Centers diagnoses, treats, cures, mitigates, or prevents any disease or medical condition.",
          ].map((text, i) => (
            <p key={i} style={{ fontSize: 12, lineHeight: 1.65, color: "rgba(255,255,255,0.50)", margin: 0, overflowWrap: "break-word", wordBreak: "break-word", maxWidth: "100%" }}>
              {text}
            </p>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 20,
            paddingBottom: 28,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px 16px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.50)",
          }}
        >
          <span>© {year} Men's Wellness Centers</span>
          <span>|</span>
          <Link to="/prescribing-policy" style={{ color: "rgba(255,255,255,0.50)", textDecoration: "none" }}>Safety Policy</Link>
          <span>|</span>
          <Link to="/terms-of-service" style={{ color: "rgba(255,255,255,0.50)", textDecoration: "none" }}>Terms &amp; Agreement</Link>
          <span>|</span>
          <Link to="/privacy-policy" style={{ color: "rgba(255,255,255,0.50)", textDecoration: "none" }}>Notice of Privacy Practices</Link>
        </div>
      </div>
    </footer>
  );
};
