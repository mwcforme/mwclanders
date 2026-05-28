import React from "react";

// Eyebrow — small uppercase label above headings
export const Eyebrow = ({ children, center = false }: { children: React.ReactNode; center?: boolean }) => (
  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand-cta-accessible)", marginBottom: 12, textAlign: center ? "center" : undefined }}>
    {children}
  </p>
);

// SectionHeading — Oswald uppercase h2, optional orange line2
export const SectionHeading = ({ line1, line2, size = "md", id, center = false }: { line1: string; line2?: string; size?: "sm"|"md"|"lg"; id?: string; center?: boolean }) => {
  const fontSize = size === "lg" ? "clamp(30px, 4vw, 48px)" : size === "sm" ? "clamp(22px, 3vw, 32px)" : "clamp(26px, 3.5vw, 40px)";
  return (
    <h2 id={id} style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize, color: "var(--brand-navy)", lineHeight: 1.1, textTransform: "uppercase", textAlign: center ? "center" : "left" }}>
      {line1}
      {line2 && <><br /><span style={{ color: "var(--brand-cta)" }}>{line2}</span></>}
    </h2>
  );
};

// SectionSubhead
export const SectionSubhead = ({ children, center = false, maxWidth = 560 }: { children: React.ReactNode; center?: boolean; maxWidth?: number }) => (
  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: "var(--c-text-on-light-muted)", lineHeight: 1.6, maxWidth, textAlign: center ? "center" : "left", margin: center ? "0 auto" : 0 }}>
    {children}
  </p>
);

// CTAButton
export const CTAButton = ({ onClick, href, children, fullWidth = false, size = "md" }: { onClick?: () => void; href?: string; children: React.ReactNode; fullWidth?: boolean; size?: "sm"|"md"|"lg" }) => {
  const height = size === "lg" ? 60 : size === "sm" ? 44 : 56;
  const fontSize = size === "lg" ? 19 : size === "sm" ? 14 : 16;
  const style: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", height, fontSize, fontWeight: 700, fontFamily: "Inter, sans-serif", letterSpacing: "0.06em", background: "var(--brand-cta)", color: "var(--c-text-on-dark)", border: "none", borderRadius: 10, cursor: "pointer", width: fullWidth ? "100%" : "auto", padding: "0 28px", textDecoration: "none" };
  if (href) return <a href={href} style={style}>{children}</a>;
  return <button type="button" onClick={onClick} style={style}>{children}</button>;
};
