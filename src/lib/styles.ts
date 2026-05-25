/**
 * Shared style constants for inline-style patterns used across components.
 * Use these instead of repeating font family strings or card style objects.
 */
import type { CSSProperties } from "react";

/** Primary body font — Inter. */
export const FONT_INTER = "Inter, sans-serif";

/** Heading / display font — Oswald. */
export const FONT_OSWALD = "Oswald, sans-serif";

/**
 * White card — used for content sections on dark backgrounds.
 * background: white, 14px radius, subtle border, drop shadow.
 */
export const CARD_WHITE: CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.15)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
};

/**
 * White card — padded variant (no overflow:hidden so padding shows).
 */
export const CARD_WHITE_PAD: CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 14,
  padding: "18px 20px",
  border: "1px solid rgba(255,255,255,0.15)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
};

/**
 * Full-width orange CTA button (display: flex, 56px height).
 * Use as base; add gap / justifyContent as needed.
 */
export const CTA_BUTTON_BASE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 56,
  background: "var(--brand-cta)",
  color: "#FFF",
  borderRadius: 10,
  textDecoration: "none",
  fontFamily: FONT_INTER,
  fontWeight: 700,
  fontSize: 16,
  boxShadow: "0 4px 16px rgba(232,103,10,0.35)",
};
