/**
 * Trust / certification band.
 * Text-based badges — always readable, no image quality issues.
 * LegitScript uses its actual badge image (solid dark bg, works on white).
 */

const CERTS = [
  { label: "CLIA Certified", sub: "Clinical Laboratory" },
  { label: "HIPAA Compliant", sub: "Patient Privacy Protected" },
  { label: "Operating Since 2015", sub: "Virginia's Men's Health Practice" },
];

export const TRTMarquee = () => (
  <section
    aria-label="Certifications and credentials"
    style={{
      background: "#FFFFFF",
      borderTop: "1px solid #E5E7EB",
      borderBottom: "1px solid #E5E7EB",
    }}
  >
    <div
      className="flex flex-row flex-wrap items-center justify-center"
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "20px 24px",
        gap: "16px 48px",
      }}
    >
      {/* LegitScript — image works because it has its own solid dark background */}
      <a
        href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Verify LegitScript Certification"
      >
        <picture>
          <source srcSet="/images/badges/legitscript.webp" type="image/webp" />
          <img
            src="/images/badges/legitscript.png"
            alt="LegitScript Certified"
            style={{ height: 48, width: "auto", objectFit: "contain" }}
            loading="lazy"
            decoding="async"
            width="120"
            height="48"
          />
        </picture>
      </a>

      {/* Text-based cert badges — always readable */}
      {CERTS.map(({ label, sub }) => (
        <div
          key={label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#0B1029",
            lineHeight: 1.2,
          }}>
            {label}
          </span>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 11,
            color: "#6B7280",
            letterSpacing: "0.02em",
          }}>
            {sub}
          </span>
        </div>
      ))}
    </div>
  </section>
);
