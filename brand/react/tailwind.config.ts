/**
 * Men's Wellness Centers — Tailwind config (v1.2.1)
 *
 * Maps the brand tokens to Tailwind utilities so OpenClaw can write
 * `bg-action text-on-action shadow-cta rounded-md` instead of raw hex.
 *
 * Pairs with theme.ts (the canonical token object) and tokens.css.
 * If you load tokens.css globally, the color values below resolve to the same
 * hex; you may alternatively point these at the CSS variables (see note at bottom)
 * so a single edit to tokens.css updates Tailwind too.
 *
 * KEY UTILITY NAMES TO USE IN COMPONENTS
 *   bg-action            -> deep #CA4A0E primary button fill
 *   hover:bg-action-hover-> deepens to #D35F1A
 *   text-on-action       -> WHITE text for on-orange (4.67:1)
 *   bg-action-deep / text-on-action-deep -> alias of the #CA4A0E + white pair
 *   bg-surface-selected  -> deep #CA4A0E selected chip
 *   text-accent / bg-accent -> #E8732A accent (basic site orange)
 *   font-display / font-marketing / font-ui
 *   shadow-cta           -> the orange glow
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      colors: {
        // primitives (use semantic aliases below in components when possible)
        navy: {
          900: "#0B1029",
          800: "#161B3A",
          700: "#1E244A",
          deep: "#122256",
        },
        "near-black": "#0D0807",
        cream: { 50: "#F5F0EB" },
        orange: {
          500: "#E8732A", // ACCENT only (basic site orange): icons/links/eyebrows/glow/focus
          600: "#D35F1A", // primary hover (deepens from #CA4A0E)
          800: "#CA4A0E", // PRIMARY button + selected chip + checkbox (white text)
          300: "#FFE4CC",
        },
        success: { 300: "#5DD68A", 700: "#0B7A4B" },
        error: { 300: "#FF8A8A", 700: "#A7211C" },
        warning: { 400: "#E8A23A" },

        // ---- semantic aliases (PREFER THESE in components) ----
        "surface-dark": "#0B1029",
        "surface-light": "#F5F0EB",
        "surface-deep-navy": "#122256",
        "surface-near-black": "#0D0807",
        "surface-selected": "#CA4A0E", // selected chip = deep orange
        accent: "#E8732A", // basic site orange
        action: { DEFAULT: "#CA4A0E", hover: "#D35F1A", deep: "#CA4A0E" },
        "on-action": "#FFFFFF", // WHITE text on deep orange (4.67:1)
        "on-action-deep": "#FFFFFF", // alias: white text on deep orange
        "on-dark": "#F5F0EB",
        "on-dark-muted": "rgba(245,240,235,0.70)",
        "on-light": "#0B1029",
        "on-light-muted": "rgba(11,16,41,0.70)",
        "border-input": "rgba(11,16,41,0.25)",
        "border-on-dark": "rgba(245,240,235,0.14)",
      },
      fontFamily: {
        display: ['"Oswald"', '"Arial Narrow"', "sans-serif"],
        marketing: ['"Montserrat"', "system-ui", "sans-serif"],
        ui: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px", // buttons/inputs/selectables
        lg: "16px", // cards
        pill: "999px",
      },
      boxShadow: {
        cta: "0 4px 16px rgba(232,115,42,.40)", // the orange glow (accent #E8732A)
        sm: "0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04)",
        md: "0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.05)",
        lg: "0 10px 15px rgba(0,0,0,.08), 0 4px 6px rgba(0,0,0,.05)",
        xl: "0 20px 25px rgba(0,0,0,.10), 0 8px 10px rgba(0,0,0,.06)",
      },
      // 4px spacing scale already matches Tailwind defaults (p-4 = 16px, p-6 = 24px)
      transitionTimingFunction: { brand: "ease" },
      transitionDuration: { fast: "120ms", base: "200ms", slow: "350ms" },
      outlineColor: { focus: "#E8732A" },
    },
  },
  plugins: [],
};

export default config;

/*
 * OPTION: drive Tailwind from the CSS variables so tokens.css stays the single
 * source. Load tokens.css globally, then replace the literal hex above with
 * var() references, e.g.:
 *   action: { DEFAULT: "var(--c-action-primary-bg)", hover: "var(--c-action-primary-bg-hover)" },
 *   "on-action": "var(--c-text-on-action)",
 * Tailwind supports arbitrary var() values in the theme. This is the recommended
 * setup for a project that already ships tokens.css.
 */
