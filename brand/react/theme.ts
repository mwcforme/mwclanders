/**
 * Men's Wellness Centers — Design Tokens (React/TypeScript)
 * Version 1.2.1 · Generated from tokens.json (the source of truth).
 *
 * USAGE
 *   import { tokens, mwc } from "@/brand/theme";
 *   <button style={{ background: tokens.color.action.primaryBg, color: tokens.color.action.primaryFg }} />
 *
 * RULE: Never hard-code a raw hex/px in a component. Reference these tokens,
 * or the Tailwind classes mapped from them in tailwind.config (e.g. bg-action,
 * text-on-action, rounded-md, p-6). To change a value, edit tokens.json and
 * regenerate this file, tokens.css, and theme.json.
 *
 * PRIMARY button + selected chip = deep #CA4A0E fill + WHITE text (4.67:1).
 * Basic site orange #E8732A is the ACCENT only (icons/links/eyebrows/glow/focus).
 */

/* ---------- PRIMITIVE: color ---------- */
const primitive = {
  navy900: "#0B1029", // canonical Midnight Navy + navy text
  navy800: "#161B3A", // elevated dark surface (sparingly)
  navy700: "#1E244A", // hairline border on dark
  deepNavy: "#122256", // alternate brighter dark surface / logo bg (white 15.1:1)
  nearBlack: "#0D0807", // premium max-contrast dark / logo bg (white 19.9:1)
  cream50: "#F5F0EB", // warm off-white
  white: "#FFFFFF",
  ink900: "#0B1029", // text on light (== navy for unity)
  // NO GRAY: muted/border/placeholder/disabled = navy or cream at opacity
  cream70: "rgba(245,240,235,0.70)", // muted text on dark (8.4:1)
  cream55: "rgba(245,240,235,0.55)", // subtle/caption on dark
  cream14: "rgba(245,240,235,0.14)", // hairline on dark
  cream06: "rgba(245,240,235,0.06)", // faint fill on dark
  navy70: "rgba(11,16,41,0.70)", // muted text on light (6.7:1) / disabled label
  navy55: "rgba(11,16,41,0.55)", // PLACEHOLDER HINT ONLY (4.15:1, exempt)
  navy25: "rgba(11,16,41,0.25)", // input border / hairline on light
  orange800: "#CA4A0E", // DEEP: PRIMARY button fill + selected chip + checkbox check. WHITE text 4.67:1.
  orange600: "#D35F1A", // PRIMARY hover (deepens from #CA4A0E). White text 3.87:1 large/transient.
  orange500: "#E8732A", // ACCENT only (basic site orange): icons/dots/links-on-navy/eyebrows/glow/focus. On navy 6.17:1. NOT a button fill.
  orange300: "#FFE4CC", // soft tint
  success300: "#5DD68A", // success on dark (replaces all teal)
  success700: "#0B7A4B", // success on light
  error300: "#FF8A8A", // error on dark
  error700: "#A7211C", // error on light
  warning400: "#E8A23A",
  glowOrange: "rgba(232,115,42,0.40)",
} as const;

/* ---------- PRIMITIVE: font / scale / radius / shadow / motion ---------- */
const font = {
  display: '"Oswald", "Arial Narrow", sans-serif', // headlines, UPPERCASE. No Bebas Neue.
  marketing: '"Montserrat", system-ui, sans-serif', // marketing body
  ui: '"Inter", system-ui, sans-serif', // app/form UI
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
} as const;

const space = {
  0: "0px", 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px",
  6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px", 20: "80px", 24: "96px",
} as const;

const radius = {
  none: "0px", sm: "4px", md: "8px" /* buttons/inputs/selectables */,
  lg: "16px" /* cards */, pill: "999px",
} as const;

const shadow = {
  sm: "0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04)",
  md: "0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.05)",
  lg: "0 10px 15px rgba(0,0,0,.08), 0 4px 6px rgba(0,0,0,.05)",
  xl: "0 20px 25px rgba(0,0,0,.10), 0 8px 10px rgba(0,0,0,.06)",
  cta: "0 4px 16px rgba(232,115,42,.40)", // the orange glow (accent #E8732A at 40%)
} as const;

const motion = { fast: "0.12s ease", base: "0.20s ease", slow: "0.35s ease" } as const;

/* ---------- SEMANTIC (intent) ---------- */
export const tokens = {
  color: {
    surface: {
      pageDark: primitive.navy900,
      pageLight: primitive.cream50,
      cardDark: primitive.navy900, // elevate via border + shadow, not a 2nd fill
      cardLight: primitive.white,
      input: primitive.white,
      selected: primitive.orange800, // selected chip = deep #CA4A0E (matches button); text = white
      pageDeepNavy: primitive.deepNavy,
      pageNearBlack: primitive.nearBlack,
    },
    text: {
      onDark: primitive.cream50,
      onDarkStrong: primitive.white,
      onDarkMuted: primitive.cream70,
      onDarkSubtle: primitive.cream55,
      onLight: primitive.ink900,
      onLightMuted: primitive.navy70,
      onInput: primitive.ink900,
      placeholder: primitive.navy55,
      onAction: primitive.white, // WHITE on the deep orange primary button (4.67:1)
      onActionDeep: primitive.white, // alias: WHITE on deep #CA4A0E (4.67:1)
      linkOnDark: primitive.orange500,
    },
    action: {
      primaryBg: primitive.orange800, // deep #CA4A0E WITH glow
      primaryBgHover: primitive.orange600, // hover DEEPENS to #D35F1A
      primaryFg: primitive.white, // WHITE text (4.67:1)
      primaryGlow: shadow.cta,
      primaryDeepBg: primitive.orange800, // alias of primary: #CA4A0E + white text
      primaryDeepFg: primitive.white,
      secondaryBg: primitive.white, // white secondary CTA on dark
      secondaryFg: primitive.ink900,
      ghostBg: "transparent",
      ghostFg: primitive.cream50,
      disabledBg: primitive.navy25,
      disabledFg: primitive.navy70,
    },
    border: {
      input: primitive.navy25,
      inputFocus: primitive.orange500,
      inputError: primitive.error700,
      onDark: primitive.cream14,
      cardLight: primitive.navy25,
    },
    accent: primitive.orange500, // #E8732A: icons, dots, links-on-navy, eyebrows, focus, asterisk, glow
    feedback: {
      successOnDark: primitive.success300,
      successOnLight: primitive.success700,
      errorOnDark: primitive.error300,
      errorOnLight: primitive.error700,
      warning: primitive.warning400,
    },
    focus: { ring: primitive.orange500, width: "3px", offset: "2px" },
  },
  font,
  space,
  radius,
  shadow,
  motion,
  primitive, // exposed for edge cases; prefer the semantic keys above
} as const;

/* ---------- Convenience style objects for inline use ---------- */
export const mwc = {
  /** Primary CTA: deep orange + glow + white text. */
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.space[2],
    minHeight: "52px",
    padding: "14px 24px",
    fontFamily: tokens.font.ui,
    fontWeight: tokens.font.weight.bold,
    fontSize: "16px",
    letterSpacing: "0.06em",
    color: tokens.color.action.primaryFg,
    background: tokens.color.action.primaryBg,
    border: "none",
    borderRadius: tokens.radius.md,
    boxShadow: tokens.color.action.primaryGlow,
    cursor: "pointer",
  } as const,
  /** White secondary CTA for dark/navy backgrounds. */
  btnSecondary: {
    color: tokens.color.action.secondaryFg,
    background: tokens.color.action.secondaryBg,
    border: "none",
    boxShadow: "none",
  } as const,
} as const;

export type MwcTokens = typeof tokens;
export default tokens;
