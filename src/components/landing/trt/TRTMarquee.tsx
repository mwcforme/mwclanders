/**
 * Trust / certification band — compact white strip.
 * LegitScript → CLIA → HIPAA on white background.
 * Badges render with their original dark artwork on white — correct display.
 */
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
        maxWidth: 800,
        margin: "0 auto",
        padding: "20px 24px",
        gap: "16px 48px",
      }}
    >
      <picture>
        <source srcSet="/images/badges/legitscript.webp" type="image/webp" />
        <img
          src="/images/badges/legitscript.png"
          alt="LegitScript Certified"
          style={{ height: 52, width: "auto", objectFit: "contain" }}
          loading="lazy"
          decoding="async"
          width="160"
          height="52"
        />
      </picture>
      <picture>
        <source srcSet="/images/badges/clia.webp" type="image/webp" />
        <img
          src="/images/badges/clia.png"
          alt="CLIA Certified Laboratory"
          style={{ height: 52, width: "auto", objectFit: "contain" }}
          loading="lazy"
          decoding="async"
          width="160"
          height="52"
        />
      </picture>
      <picture>
        <source srcSet="/images/badges/hipaa.webp" type="image/webp" />
        <img
          src="/images/badges/hipaa.png"
          alt="HIPAA Compliant"
          style={{ height: 52, width: "auto", objectFit: "contain" }}
          loading="lazy"
          decoding="async"
          width="160"
          height="52"
        />
      </picture>
    </div>
  </section>
);
