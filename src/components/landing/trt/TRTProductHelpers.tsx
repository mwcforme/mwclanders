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
      fontSize: 15,
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

/** Section eyebrow label — plain or pill variant. */
export const Eyebrow = ({
  children,
  pill = false,
}: {
  children: React.ReactNode;
  pill?: boolean;
}) =>
  pill ? (
    <span
      style={{
        display: "inline-block",
        background: "rgba(232,103,10,0.18)",
        border: "1px solid rgba(232,103,10,0.40)",
        borderRadius: 999,
        padding: "5px 16px",
        fontFamily: "Oswald, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color: "#E8670A",
        marginBottom: 16,
      }}
    >
      {children}
    </span>
  ) : (
    <p
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color: "var(--brand-cta)",
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );
