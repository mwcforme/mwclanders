/**
 * Trust / certification band — responsive flex row.
 * Mobile: badges wrap, dividers hidden. Desktop: full row with dividers.
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
      className="flex flex-row flex-wrap items-center justify-center"
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "32px 24px",
        gap: "20px 36px",
      }}
    >
      <img
        src="/images/badges/legitscript.png"
        alt="LegitScript Certified"
        className="h-14 md:h-20 w-auto"
        style={{ maxWidth: 160, objectFit: "contain" }}
        loading="lazy"
        decoding="async"
      />

      <div
        aria-hidden="true"
        className="hidden sm:block"
        style={{ width: 1, height: 52, background: "rgba(255,255,255,0.20)", flexShrink: 0 }}
      />

      <img
        src="/images/badges/clia.png"
        alt="CLIA Certified Laboratory"
        className="h-14 md:h-20 w-auto"
        style={{ maxWidth: 160, objectFit: "contain" }}
        loading="lazy"
        decoding="async"
      />

      <div
        aria-hidden="true"
        className="hidden sm:block"
        style={{ width: 1, height: 52, background: "rgba(255,255,255,0.20)", flexShrink: 0 }}
      />

      <img
        src="/images/badges/hipaa.png"
        alt="HIPAA Compliant"
        className="h-14 md:h-20 w-auto"
        style={{ maxWidth: 160, objectFit: "contain" }}
        loading="lazy"
        decoding="async"
      />
    </div>
  </section>
);
