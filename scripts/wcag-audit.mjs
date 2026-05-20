/**
 * WCAG AA contrast audit for MWC funnel.
 * Checks all known color pairs used across the codebase.
 * Run: node scripts/wcag-audit.mjs
 */

// Relative luminance per WCAG 2.1
function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function contrastRatio(fg, bg) {
  const fgL = luminance(fg.r, fg.g, fg.b);
  const bgL = luminance(bg.r, bg.g, bg.b);
  const [l1, l2] = [Math.max(fgL, bgL), Math.min(fgL, bgL)];
  return (l1 + 0.05) / (l2 + 0.05);
}

function hexContrast(fgHex, bgHex) {
  return contrastRatio(hexToRgb(fgHex), hexToRgb(bgHex));
}

// Blend rgba over a background (approximation for opacity values)
function blendRgba(r, g, b, a, bgR, bgG, bgB) {
  return {
    r: Math.round(a * r + (1 - a) * bgR),
    g: Math.round(a * g + (1 - a) * bgG),
    b: Math.round(a * b + (1 - a) * bgB),
  };
}

const PAIRS = [
  // ── Landing page hero (dark navy bg) ──────────────────────────────────
  { name: "Hero H1 cream on navy-deep", fg: "#F5F0EB", bg: "#0B1029", size: "large" },
  { name: "Hero H1 orange span on navy-deep", fg: "#E8670A", bg: "#0B1029", size: "large" },
  { name: "Hero body text on navy-deep", fg: "rgba(245,240,235,0.85)", bg: "#0B1029", size: "normal" },
  { name: "Hero star rating text on navy-deep", fg: "#F5F0EB", bg: "#0B1029", size: "normal" },
  { name: "Hero trust checks on navy-deep", fg: "#F5F0EB", bg: "#0B1029", size: "normal" },
  { name: "Hero disclaimer on navy-deep", fg: "rgba(245,240,235,0.65)", bg: "#0B1029", size: "normal" },
  { name: "Hero medical disclaimer on navy-deep", fg: "rgba(245,240,235,0.60)", bg: "#0B1029", size: "small" },
  { name: "Hero reviews link text on navy-deep", fg: "rgba(245,240,235,0.75)", bg: "#0B1029", size: "normal" },

  // ── Form card (glass on navy-deep) ────────────────────────────────────
  { name: "Form heading on glass card (~0B1633)", fg: "#F5F0EB", bg: "#131B3A", size: "large" },
  { name: "Form subheading on glass card", fg: "rgba(245,240,235,0.70)", bg: "#131B3A", size: "small" },
  { name: "Form input text on white", fg: "#0B1029", bg: "#FFFFFF", size: "normal" },
  { name: "Form placeholder on white", fg: "rgba(11,16,41,0.60)", bg: "#FFFFFF", size: "normal" },
  { name: "HIPAA line on glass card", fg: "rgba(245,240,235,0.60)", bg: "#131B3A", size: "small" },
  { name: "TCPA text on glass card", fg: "rgba(245,240,235,0.65)", bg: "#131B3A", size: "small" },

  // ── Credibility band (bg #0A1628) ─────────────────────────────────────
  { name: "Cred band value on #0A1628", fg: "#FFFFFF", bg: "#0A1628", size: "large" },
  { name: "Cred band label on #0A1628", fg: "rgba(255,255,255,0.70)", bg: "#0A1628", size: "small" },

  // ── Manifesto (bg #000033) ────────────────────────────────────────────
  { name: "Manifesto H2 on #000033", fg: "#FFFFFF", bg: "#000033", size: "large" },
  { name: "Manifesto body on #000033", fg: "rgba(255,255,255,0.85)", bg: "#000033", size: "normal" },
  { name: "Manifesto quote on #000033", fg: "rgba(255,255,255,0.92)", bg: "#000033", size: "normal" },
  { name: "Manifesto figcaption on #000033", fg: "rgba(255,255,255,0.65)", bg: "#000033", size: "small" },
  { name: "Manifesto results tag on #000033", fg: "rgba(255,255,255,0.55)", bg: "#000033", size: "small" },
  { name: "Manifesto eyebrow orange on #000033", fg: "#E8670A", bg: "#000033", size: "large-bold" },

  // ── HowItWorks (bg #F5F0EB) ───────────────────────────────────────────
  { name: "HowItWorks H2 on cream", fg: "#000033", bg: "#F5F0EB", size: "large" },
  { name: "HowItWorks body on cream", fg: "#4A4A4A", bg: "#F5F0EB", size: "normal" },
  { name: "HowItWorks symptom text on cream", fg: "#1A1A1A", bg: "#F5F0EB", size: "normal" },
  { name: "HowItWorks eyebrow on cream", fg: "#000033", bg: "#F5F0EB", size: "small-bold" },
  { name: "HowItWorks step title on cream", fg: "#000033", bg: "#F5F0EB", size: "normal-bold" },
  { name: "HowItWorks step desc on cream", fg: "#4A4A4A", bg: "#F5F0EB", size: "normal" },

  // ── Results (bg #F5F0EB) ──────────────────────────────────────────────
  { name: "Results H2 on cream", fg: "#000033", bg: "#F5F0EB", size: "large" },
  { name: "Results link on cream", fg: "#000033", bg: "#F5F0EB", size: "normal" },
  { name: "Results muted text on cream", fg: "#5A6072", bg: "#F5F0EB", size: "normal" },
  { name: "Results disclaimer italic on cream", fg: "#5A6072", bg: "#F5F0EB", size: "small" },
  { name: "Results join CTA text on cream", fg: "#1a1a2e", bg: "#F5F0EB", size: "normal" },

  // ── Testimonial cards (bg #FFFFFF) ────────────────────────────────────
  { name: "Testimonial quote on white", fg: "#1a1a2e", bg: "#FFFFFF", size: "small" },
  { name: "Testimonial name on white", fg: "#000033", bg: "#FFFFFF", size: "small-bold" },
  { name: "Testimonial city on white", fg: "#424857", bg: "#FFFFFF", size: "small" },
  { name: "Testimonial date on white", fg: "#424857", bg: "#FFFFFF", size: "small" },

  // ── Pillars (bg #000033) ──────────────────────────────────────────────
  { name: "Pillars H2 on #000033", fg: "#FFFFFF", bg: "#000033", size: "large" },
  { name: "Pillars card title on translucent", fg: "#FFFFFF", bg: "#000033", size: "normal-bold" },
  { name: "Pillars card desc on translucent", fg: "rgba(255,255,255,0.85)", bg: "#000033", size: "small" },

  // ── FAQ (bg #F5F0EB) ──────────────────────────────────────────────────
  { name: "FAQ H2 on cream", fg: "#000033", bg: "#F5F0EB", size: "large" },
  { name: "FAQ question on white card", fg: "#000033", bg: "#FFFFFF", size: "normal-bold" },
  { name: "FAQ answer on white card", fg: "#1a1a2e", bg: "#FFFFFF", size: "normal" },

  // ── Locations (bg #FFFFFF) ────────────────────────────────────────────
  { name: "Locations city name on white", fg: "#000033", bg: "#FFFFFF", size: "large-bold" },
  { name: "Locations muted name on white", fg: "#424857", bg: "#FFFFFF", size: "small" },
  { name: "Locations drive time on white", fg: "#000033", bg: "#FFFFFF", size: "small-bold" },
  { name: "Locations address on white", fg: "#1a1a2e", bg: "#FFFFFF", size: "small" },
  { name: "Locations hours on white", fg: "#1a1a2e", bg: "#FFFFFF", size: "small" },
  { name: "Locations address label on white (muted)", fg: "#424857", bg: "#FFFFFF", size: "small" },

  // ── FinalCTA (bg #000033) ─────────────────────────────────────────────
  { name: "FinalCTA H2 on #000033", fg: "#FFFFFF", bg: "#000033", size: "large" },
  { name: "FinalCTA subhead on #000033", fg: "rgba(255,255,255,0.85)", bg: "#000033", size: "normal" },
  { name: "FinalCTA bullets on #000033", fg: "rgba(255,255,255,0.92)", bg: "#000033", size: "normal" },
  { name: "FinalCTA location link on #000033", fg: "rgba(255,255,255,0.92)", bg: "#000033", size: "normal" },
  { name: "FinalCTA location label on #000033", fg: "rgba(255,255,255,0.55)", bg: "#000033", size: "small-bold" },

  // ── Header (bg rgba(11,16,41,0.95) ≈ #0B1029) ────────────────────────
  { name: "Header phone on nav bg", fg: "#FFFFFF", bg: "#0C1130", size: "normal" },
  { name: "Header CTA orange bg / white text", fg: "#FFFFFF", bg: "#BF5608", size: "small-bold" },

  // ── Sticky mobile bar (bg rgba(11,16,41,0.96)) ────────────────────────
  { name: "Sticky bar Call text on navy", fg: "#F5F0EB", bg: "#0B1029", size: "small-bold" },
  { name: "Sticky bar Book text on orange", fg: "#FFFFFF", bg: "#BF5608", size: "normal-bold" },

  // ── Footer (bg #000033) ───────────────────────────────────────────────
  { name: "Footer col labels on #000033", fg: "#FFFFFF", bg: "#000033", size: "small-bold" },
  { name: "Footer links on #000033", fg: "rgba(255,255,255,0.75)", bg: "#000033", size: "small" },
  { name: "Footer disclaimer on #000033", fg: "rgba(255,255,255,0.50)", bg: "#000033", size: "small" },
  { name: "Footer phone on #000033", fg: "rgba(255,255,255,0.80)", bg: "#000033", size: "normal" },
  { name: "Footer copyright on #000033", fg: "rgba(255,255,255,0.55)", bg: "#000033", size: "small" },

  // ── Booking funnel cards (bg #FFFFFF on #0B1029 page) ────────────────
  { name: "SurveyCard title on white", fg: "#0B1029", bg: "#FFFFFF", size: "large" },
  { name: "SurveyCard subtitle on white", fg: "#3A4258", bg: "#FFFFFF", size: "normal-bold" },
  { name: "SurveyCard helperText on white", fg: "#6B7280", bg: "#FFFFFF", size: "small" },
  { name: "SurveyCard back button on white", fg: "#5A6478", bg: "#FFFFFF", size: "normal-bold" },
  { name: "SurveyCard progress label on white", fg: "#3A4258", bg: "#FFFFFF", size: "small-bold" },
  { name: "OptionRow label on white", fg: "#0B1029", bg: "#FFFFFF", size: "normal-bold" },
  { name: "OptionRow label on selected cream", fg: "#0B1029", bg: "#FFF7F0", size: "normal-bold" },
  { name: "OptionRow chevron on white", fg: "#6B7280", bg: "#FFFFFF", size: "ui" },
  { name: "OptionRow icon on white chip", fg: "#E8670A", bg: "#FFE4CC", size: "ui" },

  // ── BookLetsTalk ──────────────────────────────────────────────────────
  { name: "LetsTalk H1 on #000814", fg: "#FFFFFF", bg: "#000814", size: "large" },
  { name: "LetsTalk body on #000814", fg: "rgba(255,255,255,0.72)", bg: "#000814", size: "normal" },
  { name: "LetsTalk 'team available' badge text on orange-tinted bg", fg: "#FFB07A", bg: "#1A1008", size: "small" },
  { name: "LetsTalk card title on white", fg: "#0B1029", bg: "#FFFFFF", size: "normal-bold" },
  { name: "LetsTalk card subtitle on white", fg: "#5A6478", bg: "#FFFFFF", size: "small" },
  { name: "LetsTalk SMS reply note on white", fg: "#9CA3AF", bg: "#FFFFFF", size: "small" },
  { name: "LetsTalk back link on #000814", fg: "rgba(255,255,255,0.55)", bg: "#000814", size: "small" },

  // ── BookSymptom ───────────────────────────────────────────────────────
  { name: "BookSymptom other panel title on #FFF7F0", fg: "#0B1029", bg: "#FFF7F0", size: "normal-bold" },
  { name: "BookSymptom other panel label on #FFF7F0", fg: "#3A4258", bg: "#FFF7F0", size: "small" },
  { name: "BookSymptom textarea on white", fg: "#0B1029", bg: "#FFFFFF", size: "normal" },
  { name: "BookSymptom disabled btn text on #D1D5DB", fg: "#6B7280", bg: "#D1D5DB", size: "normal-bold" },

  // ── TRTQuizApproved ───────────────────────────────────────────────────
  { name: "QuizApproved muted text on white", fg: "#475569", bg: "#FFFFFF", size: "small" },
  { name: "QuizApproved success badge text on green-bg", fg: "#065F46", bg: "#D1FAE5", size: "small-bold" },

  // ── BookLetsTalk - FunnelFooter ───────────────────────────────────────
  { name: "FunnelFooter text on #000814", fg: "rgba(255,255,255,0.50)", bg: "#000814", size: "small" },
  { name: "FunnelFooter phone link on #000814", fg: "#E8670A", bg: "#000814", size: "small-bold" },
];

// Parse rgba/hex to effective hex
function parseColor(colorStr, bgHex = "#FFFFFF") {
  colorStr = colorStr.trim();
  if (colorStr.startsWith("#")) return colorStr;

  // Parse rgba
  const rgbaMatch = colorStr.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    const r = parseFloat(rgbaMatch[1]);
    const g = parseFloat(rgbaMatch[2]);
    const b = parseFloat(rgbaMatch[3]);
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    const bgRgb = hexToRgb(bgHex);
    if (a < 1) {
      const blended = blendRgba(r, g, b, a, bgRgb.r, bgRgb.g, bgRgb.b);
      return `#${blended.r.toString(16).padStart(2,'0')}${blended.g.toString(16).padStart(2,'0')}${blended.b.toString(16).padStart(2,'0')}`;
    }
    return `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`;
  }
  return colorStr;
}

const MIN_RATIO = {
  "large": 3.0,        // 18px+  or 14px+ bold
  "large-bold": 3.0,
  "normal": 4.5,
  "normal-bold": 4.5,
  "small": 4.5,
  "small-bold": 4.5,
  "ui": 3.0,           // icons, borders
};

let pass = 0, fail = 0;
const failures = [];

for (const p of PAIRS) {
  const effectiveFg = parseColor(p.fg, p.bg.startsWith("#") ? p.bg : "#0B1029");
  const effectiveBg = parseColor(p.bg);
  const ratio = hexContrast(effectiveFg, effectiveBg);
  const required = MIN_RATIO[p.size] || 4.5;
  const ok = ratio >= required;
  if (ok) {
    pass++;
  } else {
    fail++;
    failures.push({ name: p.name, fg: p.fg, effectiveFg, bg: p.bg, effectiveBg, ratio: ratio.toFixed(2), required, size: p.size });
  }
}

console.log(`\n${"=".repeat(70)}`);
console.log(`WCAG AA CONTRAST AUDIT — MWC Funnel`);
console.log(`${"=".repeat(70)}`);
console.log(`✅ PASS: ${pass}   ❌ FAIL: ${fail}   TOTAL: ${pass + fail}`);

if (failures.length) {
  console.log(`\n❌ FAILING PAIRS:\n`);
  for (const f of failures) {
    console.log(`  ${f.name}`);
    console.log(`    FG: ${f.fg}  →  effective: ${f.effectiveFg}`);
    console.log(`    BG: ${f.bg}  →  effective: ${f.effectiveBg}`);
    console.log(`    Ratio: ${f.ratio}:1  (need ≥${f.required}:1 for ${f.size})`);
    console.log();
  }
} else {
  console.log("\n🎉 All pairs pass WCAG AA!\n");
}
