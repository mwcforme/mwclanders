import { SEO } from "@/components/SEO";

const NotFound = () => (
  <div style={{
    minHeight: "100dvh",
    background: "var(--brand-navy-deep)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center",
    fontFamily: "Inter, sans-serif",
  }}>
    <SEO title="Page not found | Men's Wellness Centers" description="The page you're looking for doesn't exist." />
    <p style={{
      fontFamily: "Oswald, sans-serif",
      fontWeight: 700,
      fontSize: "clamp(96px, 25vw, 140px)",
      color: "var(--brand-cta)",
      lineHeight: 1,
      marginBottom: 16,
      letterSpacing: "-0.02em",
    }}>
      404
    </p>
    <h1 style={{
      fontFamily: "Oswald, sans-serif",
      fontWeight: 700,
      fontSize: "clamp(22px, 5vw, 32px)",
      color: "var(--brand-cream)",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      marginBottom: 12,
    }}>
      This page doesn't exist.
    </h1>
    <p style={{
      fontSize: 15,
      color: "rgba(255,255,255,0.50)",
      lineHeight: 1.6,
      maxWidth: 300,
      marginBottom: 36,
    }}>
      The link may be broken or the page may have moved.
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 280 }}>
      <a href="/" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 56, background: "var(--brand-cta)", color: "#fff",
        borderRadius: 12, textDecoration: "none",
        fontWeight: 700, fontSize: 16, fontFamily: "Inter, sans-serif",
      }}>
        Back to home
      </a>
      <a href="/trt" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 56,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "var(--brand-cream)",
        borderRadius: 12, textDecoration: "none",
        fontWeight: 600, fontSize: 15, fontFamily: "Inter, sans-serif",
      }}>
        Book a visit
      </a>
    </div>
  </div>
);

export default NotFound;
