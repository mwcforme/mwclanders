/**
 * Shared primitive components used across ProductTRT page sections.
 * Kept small and stateless so they can be tree-shaken per section.
 */
import { Check } from "lucide-react";

/** Orange gradient CTA button used throughout the TRT product page. */
export const OrangeCTA = ({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 999,
      padding: "14px 36px",
      fontSize: 16,
      fontWeight: 700,
      fontFamily: "Inter, sans-serif",
      letterSpacing: "0.04em",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 6px 28px rgba(232,103,10,0.45)",
      transition: "box-shadow 0.2s, transform 0.15s",
      ...style,
    }}
    onMouseEnter={(e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      btn.style.boxShadow = "0 10px 36px rgba(232,103,10,0.60)";
      btn.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={(e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      btn.style.boxShadow = "0 6px 28px rgba(232,103,10,0.45)";
      btn.style.transform = "translateY(0)";
    }}
  >
    {children}
  </button>
);

/** Orange circle check bullet — used in benefits and treatment cards. */
export const OrangeBullet = ({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) => (
  <li
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 14,
      fontSize: 16,
      color: light ? "rgba(255,255,255,0.88)" : "var(--c-text-on-light)",
      lineHeight: 1.55,
    }}
  >
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #E8670A 0%, #F07820 100%)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 1,
        boxShadow: "0 2px 8px rgba(232,103,10,0.30)",
      }}
    >
      <Check size={13} strokeWidth={3} color="#fff" aria-hidden />
    </span>
    {children}
  </li>
);

/**
 * Section eyebrow label.
 * Agency treatment: left border line, no pill, no background tint.
 * pill prop retained for API compatibility but both variants now use the same clean style.
 */
export const Eyebrow = ({
  children,
  pill = false,
  onLight = false,
}: {
  children: React.ReactNode;
  pill?: boolean;
  onLight?: boolean;
}) => (
  <p
    style={{
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase" as const,
      /* a11y: onLight=true → accessible orange on light bg (5.22:1 white / 4.61:1 cream ✅)
             onLight=false → brand orange on dark bg (5.69:1 navy ✅) */
      color: onLight ? "var(--brand-cta-accessible)" : "var(--brand-cta)",
      borderLeft: "3px solid var(--brand-cta)",
      paddingLeft: 10,
      lineHeight: 1,
      marginBottom: pill ? 16 : 12,
    }}
  >
    {children}
  </p>
);
