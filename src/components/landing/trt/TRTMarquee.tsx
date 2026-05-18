/**
 * Trust / certification band.
 * Dark background matches the WordPress site badge display context.
 * CLIA + HIPAA = black-bg official webp images from menswellnesscenters.com
 * LegitScript = official certified badge
 */
export const TRTMarquee = () => (
  <section
    aria-label="Certifications and credentials"
    style={{
      // hardcoded-color-allow-next-line
      background: "#111827",
      // hardcoded-color-allow-next-line
      borderTop: "1px solid rgba(255,255,255,0.07)",
      // hardcoded-color-allow-next-line
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}
  >
    <div
      className="flex flex-row flex-wrap items-center justify-center"
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "28px 24px",
        gap: "24px 56px",
      }}
    >
      {/* CLIA — official black-bg webp from WordPress site */}
      <img
        src="/images/badges/clia-color.webp"
        alt="Clinical Laboratory Improvements Amendments"
        style={{ height: 56, width: "auto", objectFit: "contain" }}
        loading="lazy"
        decoding="async"
        width="120"
        height="56"
      />

      {/* LegitScript — verified certified badge */}
      <a
        href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Verify LegitScript Certification for menswellnesscenters.com"
        style={{ display: "inline-block" }}
      >
        <img
          src="/images/badges/legitscript-color.png"
          alt="LegitScript Certified Healthcare Website"
          style={{ height: 72, width: "auto", objectFit: "contain" }}
          loading="lazy"
          decoding="async"
          width="110"
          height="72"
        />
      </a>

      {/* HIPAA — official black-bg webp from WordPress site */}
      <img
        src="/images/badges/hipaa-color.webp"
        alt="Health Insurance Portability and Accountability Act"
        style={{ height: 56, width: "auto", objectFit: "contain" }}
        loading="lazy"
        decoding="async"
        width="120"
        height="56"
      />
    </div>
  </section>
);
