/**
 * Trust / certification band — compact white strip.
 * Uses black-transparent badge variants on white background.
 * No CSS filters needed — proper transparent PNGs.
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
          style={{ height: 48, width: "auto", objectFit: "contain" }}
          loading="lazy"
          decoding="async"
          width="160"
          height="48"
        />
      </picture>
      <picture>
        <source srcSet="/images/badges/clia-black.webp" type="image/webp" />
        <img
          src="/images/badges/clia-black.png"
          alt="CLIA Certified Laboratory"
          style={{ height: 48, width: "auto", objectFit: "contain" }}
          loading="lazy"
          decoding="async"
          width="160"
          height="48"
        />
      </picture>
      <picture>
        <source srcSet="/images/badges/hipaa-black.webp" type="image/webp" />
        <img
          src="/images/badges/hipaa-black.png"
          alt="HIPAA Compliant"
          style={{ height: 48, width: "auto", objectFit: "contain" }}
          loading="lazy"
          decoding="async"
          width="160"
          height="48"
        />
      </picture>
    </div>
  </section>
);
