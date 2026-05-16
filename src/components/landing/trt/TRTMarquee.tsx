/**
 * Trust / certification band — single row, images only on mobile, labels on desktop.
 * Order: LegitScript → CLIA → HIPAA
 */
export const TRTMarquee = () => (
  <section
    aria-label="Certifications and credentials"
    style={{
      background: "#111827",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}
  >
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "52px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
      }}
    >
      <img
        src="/images/badges/legitscript.png"
        alt="LegitScript Certified"
        style={{ height: 96, width: "auto", maxWidth: 220, objectFit: "contain" }}
        loading="lazy"
      />

      <div aria-hidden="true" style={{ width: 1, height: 72, background: "rgba(255,255,255,0.20)", flexShrink: 0 }} />

      <img
        src="/images/badges/clia.webp"
        alt="CLIA Certified Laboratory"
        style={{ height: 96, width: "auto", maxWidth: 220, objectFit: "contain", mixBlendMode: "screen" }}
        loading="lazy"
      />

      <div aria-hidden="true" style={{ width: 1, height: 72, background: "rgba(255,255,255,0.20)", flexShrink: 0 }} />

      <img
        src="/images/badges/hipaa.webp"
        alt="HIPAA Compliant"
        style={{ height: 96, width: "auto", maxWidth: 220, objectFit: "contain", mixBlendMode: "screen" }}
        loading="lazy"
      />
    </div>
  </section>
);
