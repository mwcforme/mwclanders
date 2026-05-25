/**
 * CRODesktopStickyBar — scroll-triggered bottom CTA bar, desktop only.
 */
import { useState, useEffect } from "react";

export const CRODesktopStickyBar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="hidden md:flex" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 49, height: 64,
      background: "var(--brand-navy-deep)",
      // hardcoded-color-allow-next-line
      borderTop: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 -8px 32px rgba(0,0,0,0.40)",
      alignItems: "center", justifyContent: "space-between", padding: "0 32px",
      fontFamily: "Inter, sans-serif",
      opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none",
      transition: "opacity 300ms ease",
    }} aria-hidden={!visible}>
      {/* hardcoded-color-allow-next-line */}
      <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(245,240,235,0.90)", letterSpacing: "0.01em" }}>
        Virginia&rsquo;s #1 Men&rsquo;s Health Clinic
        <span style={{ margin: "0 12px", color: "var(--brand-cta)" }}>&middot;</span>
        Same-Day Availability
      </span>
      <button type="button" onClick={scrollToForm}
        className="font-bold cursor-pointer border-none"
        style={{
          height: 44, padding: "0 28px", background: "var(--brand-cta)", color: "var(--c-text-on-dark)",
          borderRadius: 8, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em",
          fontFamily: "Inter, sans-serif",
          // hardcoded-color-allow-next-line
          boxShadow: "0 4px 16px rgba(232,103,10,0.35)", transition: "background 150ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}>
        Claim My Visit
      </button>
    </div>
  );
};
