// Hardcoded color scanner. Run via: node scripts/check-hardcoded-colors.mjs [--strict]
/**
 * Scans component files for hardcoded color values (hex, rgb/rgba, hsl/hsla)
 * that bypass the semantic CSS tokens defined in src/index.css.
 *
 * - Maps known brand hex values to their semantic token (e.g. #E8670A → var(--brand-cta))
 *   and reports them as "should-migrate" warnings.
 * - Flags unknown hex/rgb/hsl values as "unmapped" warnings — they need either a token
 *   or an explicit allowlist entry.
 *
 * Used by:
 *   - Vite plugin (vitePluginCheckHardcodedColors) at buildStart — warns only by default,
 *     fails the build when LOVABLE_STRICT_COLORS=1 or `--strict` is passed via CLI.
 *   - Direct invocation: `node scripts/check-hardcoded-colors.mjs [--strict]`.
 *
 * Suppression:
 *   - Add a path to ALLOWLIST_FILES (rules don't apply at all).
 *   - Add a hex value to GLOBAL_HEX_ALLOWLIST (e.g. transparent overlays).
 *   - Wrap the line with `// hardcoded-color-allow-next-line` (single-line opt-out).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

/** Files exempt from the scan. */
const ALLOWLIST_FILES = new Set(
  [
    "src/index.css",
    "src/integrations/supabase/types.ts",
    "scripts/check-hardcoded-colors.mjs",
  ].map((p) => path.join(ROOT, p))
);

/** Directory substrings to skip entirely. */
const SKIP_DIRS = ["node_modules", "dist", "build", ".git", "supabase/.temp"];

/** Only scan these extensions. */
const EXTS = new Set([".ts", ".tsx", ".jsx", ".css"]);

/** Only scan these path prefixes (relative to repo root). */
const SCAN_PREFIXES = ["src/components", "src/pages"];

/**
 * Brand hex → semantic token. Lowercased keys.
 * Anything matching here is a soft warning ("use the token instead").
 */
const HEX_TO_TOKEN = {
  "#000033": "var(--brand-navy) / var(--c-text-on-light)",
  "#0b1029": "var(--brand-navy-deep)",
  "#1a1a2e": "var(--bg-charcoal)",
  "#ffffff": "var(--c-text-on-dark) / var(--bg-white)",
  "#fff": "var(--c-text-on-dark) / var(--bg-white)",
  "#f5f0eb": "var(--brand-cream)",
  "#ebeae8": "var(--bg-warm-grey)",
  "#e8670a": "var(--brand-cta) / var(--brand-accent)",
  "#5a6072": "var(--c-placeholder-light)",
  "#424857": "var(--c-text-on-light-muted)",
  "#949494": "var(--c-border-on-light)",
  "#6b7299": "var(--c-border-on-dark)",
  "#a7211c": "var(--c-error-on-light)",
  "#ff8a8a": "var(--c-error-on-dark)",
  "#5dd68a": "var(--c-success-on-dark)",
  "#e7ddd2": "var(--c-text-on-dark-muted)",
  "#c5bfb7": "var(--c-text-on-dark-subtle)",
};

/** Hex values intentionally allowed without a token mapping. */
const GLOBAL_HEX_ALLOWLIST = new Set([
  "#000000",
  "#000",
]);

const ALLOW_INLINE = "hardcoded-color-allow-next-line";

const HEX_RE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const RGB_RE = /\brgba?\s*\(\s*\d+/g;
const HSL_RE = /\bhsla?\s*\(\s*\d/g;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (EXTS.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

function relToRoot(p) {
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

function inScope(rel) {
  return SCAN_PREFIXES.some((p) => rel.startsWith(p));
}

function normalizeHex(hex) {
  let h = hex.toLowerCase();
  // Expand short form #abc → #aabbcc for matching against token map.
  if (/^#[0-9a-f]{3}$/.test(h)) {
    h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  return h;
}

export function scan() {
  const violations = [];
  for (const file of walk(SRC)) {
    if (ALLOWLIST_FILES.has(file)) continue;
    const rel = relToRoot(file);
    if (!inScope(rel)) continue;
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prev = i > 0 ? lines[i - 1] : "";
      if (prev.includes(ALLOW_INLINE)) continue;

      const hexMatches = line.match(HEX_RE) || [];
      for (const raw of hexMatches) {
        const h = normalizeHex(raw);
        if (GLOBAL_HEX_ALLOWLIST.has(h)) continue;
        const token = HEX_TO_TOKEN[h];
        violations.push({
          file: rel,
          line: i + 1,
          kind: "hex",
          severity: token ? "should-migrate" : "unmapped",
          value: raw,
          suggestion: token || "no token mapping — add one to src/index.css or document why this hex is needed",
          snippet: line.trim().slice(0, 200),
        });
      }

      if (RGB_RE.test(line)) {
        RGB_RE.lastIndex = 0;
        violations.push({
          file: rel,
          line: i + 1,
          kind: "rgb",
          severity: "unmapped",
          value: line.match(RGB_RE)?.[0] ?? "rgb(",
          suggestion: "use a semantic token (var(--...)) or document an explicit allowlist entry",
          snippet: line.trim().slice(0, 200),
        });
      }
      if (HSL_RE.test(line)) {
        HSL_RE.lastIndex = 0;
        violations.push({
          file: rel,
          line: i + 1,
          kind: "hsl",
          severity: "unmapped",
          value: line.match(HSL_RE)?.[0] ?? "hsl(",
          suggestion: "use a semantic token (var(--...)) or document an explicit allowlist entry",
          snippet: line.trim().slice(0, 200),
        });
      }
    }
  }
  return violations;
}

function format(violations) {
  return violations
    .map(
      (v) =>
        `  ${v.file}:${v.line}  [${v.severity}:${v.kind}]  ${v.value}\n    → ${v.suggestion}\n    > ${v.snippet}`
    )
    .join("\n\n");
}

function summarize(violations) {
  const byFile = new Map();
  for (const v of violations) byFile.set(v.file, (byFile.get(v.file) || 0) + 1);
  const should = violations.filter((v) => v.severity === "should-migrate").length;
  const unmapped = violations.filter((v) => v.severity === "unmapped").length;
  return { files: byFile.size, should, unmapped, total: violations.length };
}

const isMain =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("check-hardcoded-colors.mjs");

if (isMain) {
  const strict =
    process.argv.includes("--strict") || process.env.LOVABLE_STRICT_COLORS === "1";
  const violations = scan();
  const s = summarize(violations);
  if (violations.length === 0) {
    console.log("[check-hardcoded-colors] OK. No hardcoded colors found.");
    process.exit(0);
  }
  const header =
    `[check-hardcoded-colors] Found ${s.total} occurrence(s) across ${s.files} file(s) ` +
    `(${s.should} should-migrate, ${s.unmapped} unmapped).`;
  const body = `\n${header}\n\n${format(violations)}\n`;
  if (strict) {
    console.error(body + "\nStrict mode: failing build.\n");
    process.exit(1);
  }
  console.warn(body + "\nRun with --strict (or LOVABLE_STRICT_COLORS=1) to fail the build.\n");
  process.exit(0);
}

/** Vite plugin export. Warns by default; fails when LOVABLE_STRICT_COLORS=1. */
export function vitePluginCheckHardcodedColors() {
  return {
    name: "check-hardcoded-colors",
    enforce: "pre",
    buildStart() {
      const violations = scan();
      if (violations.length === 0) return;
      const s = summarize(violations);
      const msg =
        `Hardcoded color check: ${s.total} occurrence(s) across ${s.files} file(s) ` +
        `(${s.should} should-migrate, ${s.unmapped} unmapped).\n\n` +
        format(violations) +
        "\n\nReplace with semantic tokens from src/index.css, or wrap with " +
        "`// hardcoded-color-allow-next-line` if intentional.";
      if (process.env.LOVABLE_STRICT_COLORS === "1") {
        this.error(msg);
      } else {
        this.warn(msg);
      }
    },
  };
}
