// Banned-wording scanner. Run via: node scripts/check-banned-wording.mjs
/**
 * Banned-wording scanner.
 *
 * Fails (exit 1) if any source file contains banned marketing wording such as
 * "free" (any case) or hardcoded CTA labels that should come from
 * `src/data/copy.ts` (the COPY map).
 *
 * Used by:
 *  - Vite plugin (vitePluginCheckBannedWording) at buildStart.
 *  - Direct invocation: `node scripts/check-banned-wording.mjs` (pre-commit).
 *
 * To allow legitimate text (e.g. the phrase "free of charge" inside a legal
 * disclaimer or the wording-map file itself), add a path to ALLOWLIST_FILES
 * or wrap the line with `// banned-wording-allow-next-line`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

/** Files exempt from the scan (they document or define the rules). */
const ALLOWLIST_FILES = new Set(
  [
    "src/data/copy.ts",
    "scripts/check-banned-wording.mjs",
    "src/integrations/supabase/types.ts",
  ].map((p) => path.join(ROOT, p))
);

/** Path substrings to skip entirely. */
const SKIP_DIRS = ["node_modules", "dist", "build", ".git", "supabase/.temp"];

/** File extensions we scan. */
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx", ".html"]);

/**
 * Banned patterns. Each entry: { id, pattern (RegExp), message, scope? }.
 * - `scope`: optional path-prefix filter (relative to repo root). When set,
 *   the rule only applies to files under that prefix.
 */
const RULES = [
  {
    id: "free-word",
    // Word boundary, case-insensitive. Matches "Free", "free", "FREE", "free." etc.
    // Does NOT match "freedom", "freeway", "free-form" because of `\b` then a non-letter.
    pattern: /\bfree\b/i,
    message:
      'Banned word "free". Use "no-cost", "no obligation", "no commitment", or "at no charge".',
  },
  {
    id: "hardcoded-book-consult",
    pattern: /["'`]Book My Consult["'`]/,
    message:
      'Hardcoded CTA label. Import COPY.cta.bookConsult from "@/data/copy" instead.',
    scope: "src/components/landing",
  },
  {
    id: "hardcoded-no-cost-consult",
    pattern: /["'`]No-cost consult\.?["'`]/i,
    message:
      'Hardcoded badge label. Import COPY.badge.noCostConsult from "@/data/copy" instead.',
    scope: "src/components/landing",
  },
  {
    id: "hardcoded-no-obligation-tag",
    pattern: /No-obligation consult\. Individual results vary\./,
    message:
      'Hardcoded manifesto tag. Import COPY.offer.manifestoTag from "@/data/copy" instead.',
    scope: "src/components/landing",
  },
];

const ALLOW_INLINE = "banned-wording-allow-next-line";

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.some((skip) => entry.name === skip)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (EXTS.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

function relativeToRoot(p) {
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

function ruleApplies(rule, relPath) {
  if (!rule.scope) return true;
  return relPath.startsWith(rule.scope);
}

export function scan() {
  const violations = [];
  for (const file of walk(SRC)) {
    if (ALLOWLIST_FILES.has(file)) continue;
    const rel = relativeToRoot(file);
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prev = i > 0 ? lines[i - 1] : "";
      if (prev.includes(ALLOW_INLINE)) continue;
      for (const rule of RULES) {
        if (!ruleApplies(rule, rel)) continue;
        if (rule.pattern.test(line)) {
          violations.push({
            file: rel,
            line: i + 1,
            rule: rule.id,
            message: rule.message,
            snippet: line.trim().slice(0, 200),
          });
        }
      }
    }
  }
  return violations;
}

function format(violations) {
  return violations
    .map(
      (v) =>
        `  ${v.file}:${v.line}  [${v.rule}]\n    ${v.message}\n    > ${v.snippet}`
    )
    .join("\n\n");
}

// CLI entrypoint
const isMain =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("check-banned-wording.mjs");

if (isMain) {
  const violations = scan();
  if (violations.length === 0) {
    console.log("[check-banned-wording] OK. No banned wording found.");
    process.exit(0);
  }
  console.error(
    `\n[check-banned-wording] Found ${violations.length} violation(s):\n\n` +
      format(violations) +
      "\n\nFix by importing from src/data/copy.ts (COPY) or rewording.\n"
  );
  process.exit(1);
}

/** Vite plugin export: fails the build if violations are found. */
export function vitePluginCheckBannedWording() {
  return {
    name: "check-banned-wording",
    enforce: "pre",
    buildStart() {
      const violations = scan();
      if (violations.length === 0) return;
      this.error(
        `Banned wording check failed (${violations.length} violation${
          violations.length === 1 ? "" : "s"
        }):\n\n` +
          format(violations) +
          "\n\nFix by importing from src/data/copy.ts (COPY) or rewording."
      );
    },
  };
}
