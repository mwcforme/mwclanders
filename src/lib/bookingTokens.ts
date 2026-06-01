/**
 * Design tokens shared across /book/schedule and /book/confirmed.
 * Single source of truth — no magic numbers scattered across components.
 */
import type { CSSProperties } from "react";

// ─── Colors ──────────────────────────────────────────────────────────────────

export const COLORS = {
  // Green accent — exact computed color from mockup: rgb(16,183,127)
  // hardcoded-color-allow-next-line
  teal:      "#5DD68A"  /* spec v1.2.1: success replaces teal */,
  // hardcoded-color-allow-next-line
  tealTint:  "rgba(93,214,138,0.15)",
  // hardcoded-color-allow-next-line
  tealBorder: "#5DD68A",
  // Section label gray from mockup: rgb(72,86,106)
  // hardcoded-color-allow-next-line
  sectionGray: "#485666",
  // Dark navy for Apple button + reschedule card: rgb(26,32,61)
  // hardcoded-color-allow-next-line
  darkCard: "#1A203D",
  // Muted blue-gray for reschedule copy: rgb(203,213,225)
  // hardcoded-color-allow-next-line
  mutedBlue: "#CBD5E1",

  // Backgrounds
  pageBg:        "#0B1029",  // Midnight Navy
  cardBg:        "#FFFFFF",
  glassBg:       "rgba(255,255,255,0.05)",
  // hardcoded-color-allow-next-line — matches mwclocked banner card rgb(26,32,61)
  bannerBg:      "#1A203D",

  // Brand
  orange:        "var(--brand-cta)",        // #FF6B2C
  orangeHex:     "#FF6B2C",
  orangeTint:    "rgba(232,103,10,0.10)",
  orangeGlow:    "rgba(232,103,10,0.55)",
  orangeIconBg:  "rgba(232,103,10,0.12)",

  // Navy (card interiors)
  navyInk:       "#0B1029",
  navyInkMid:    "#1A1A2E",

  // Text on dark
  textPrimary:   "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.55)",
  textMuted:     "rgba(255,255,255,0.65)",
  textSubtle:    "rgba(255,255,255,0.75)",

  // Borders
  glassBorder:   "rgba(255,255,255,0.10)",
  glassDivider:  "rgba(255,255,255,0.08)",
  cardDivider:   "#EBEBEB",

  // Shadows
  cardShadow:    "0 20px 60px -10px rgba(0,0,0,0.50)",
  panelShadow:   "0 20px 60px -10px rgba(0,0,0,0.40)",
  orangeShadow:  "0 10px 28px -8px rgba(232,103,10,0.55)",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONTS = {
  display: "Oswald, sans-serif",
  body:    "Inter, sans-serif",
  ui:      "Inter, sans-serif",
} as const;

// ─── Reusable style objects ───────────────────────────────────────────────────

export const GLASS_CARD: CSSProperties = {
  background:   COLORS.glassBg,
  border:       `1px solid ${COLORS.glassBorder}`,
  borderRadius: 16,
  overflow:     "hidden",
};

export const GLASS_CARD_PAD: CSSProperties = {
  ...GLASS_CARD,
  padding: "20px",
};

export const CAL_BUTTON_BASE: CSSProperties = {
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  gap:            10,
  height:         56,
  borderRadius:   12,
  textDecoration: "none",
  fontFamily:     FONTS.ui,
  fontWeight:     700,
  fontSize:       15,
  letterSpacing:  "0.06em",
  textTransform:  "uppercase" as const,
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const ET_OPTIONS = { timeZone: "America/New_York" } as const;

export function formatSlotLabel(iso: string): string {
  const d = new Date(iso);
  const day  = d.toLocaleDateString ("en-US", { weekday: "short", month: "short", day: "numeric", ...ET_OPTIONS });
  const time = d.toLocaleTimeString ("en-US", { hour: "numeric", minute: "2-digit", hour12: true,  ...ET_OPTIONS });
  return `${day} · ${time}`;
}
