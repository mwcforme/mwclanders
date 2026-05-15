/**
 * Shared inline style constants — keeps repeated declarations DRY
 * and makes global font/color changes a one-liner.
 */

export const FONT = {
  oswald: "Oswald, sans-serif",
  inter: "Inter, sans-serif",
} as const;

export const COLOR = {
  navy:        "#0B1029",
  orange:      "#E8670A",
  offwhite:    "#F5F0EB",
  cream:       "#F8F9FC",
  muted:       "#5B6478",
  mutedDark:   "#3A4258",
  borderLight: "rgba(11,16,41,0.09)",
  borderDark:  "rgba(255,255,255,0.12)",
  success:     "#22C55E",
  error:       "#DC2626",
} as const;

/** Heading style presets */
export const TYPE = {
  hero: {
    fontFamily: FONT.oswald,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    lineHeight: 1.05,
  },
  sectionHead: {
    fontFamily: FONT.oswald,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.02em",
    lineHeight: 1.1,
  },
  eyebrow: {
    fontFamily: FONT.inter,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  body: {
    fontFamily: FONT.inter,
    fontWeight: 400,
    lineHeight: 1.55,
  },
  bodyMedium: {
    fontFamily: FONT.inter,
    fontWeight: 500,
    lineHeight: 1.5,
  },
} as const;
