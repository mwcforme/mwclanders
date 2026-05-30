/**
 * Text-driven design regression.
 * Locks down the visible brand surface so a careless edit can't drift the
 * tone, palette, or required compliance copy.
 *
 * Rules enforced (per project memory):
 * - Primary accent orange #E8670A on CTAs.
 * - Brand navy is #000814 or #000033 on dark sections.
 * - Headings use Oswald.
 * - Tone: prefer "men" / "Center" / "Provider"; never "guys"; no em-dashes.
 * - TCPA / HIPAA disclosure copy present on lead-capture forms.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (rel: string) =>
  readFileSync(path.resolve(__dirname, "../../", rel), "utf8");

// Include extracted sub-components so compliance checks cover the full form surface.
const HERO_FORM = [
  read("src/components/landing/trt/TRTHeroForm.tsx"),
  read("src/components/landing/trt/TCPADisclaimer.tsx"),
  read("src/components/landing/shared/FloatInput.tsx"),
].join("\n");
const FINAL_CTA = read("src/components/landing/trt/TRTFinalCTA.tsx");
const STEP_LEAD = read("src/components/quiz/StepLead.tsx");
const QUIZ_APPROVED = read("src/pages/TRTQuizApproved.tsx");
const LP_DIRECTORY = read("src/components/internal/LpCards.tsx");

const BRAND_SURFACES = [
  ["TRTHeroForm", HERO_FORM],
  ["TRTFinalCTA", FINAL_CTA],
  ["StepLead", STEP_LEAD],
  ["TRTQuizApproved", QUIZ_APPROVED],
  ["LpDirectory", LP_DIRECTORY],
] as const;

describe("Brand palette", () => {
  it.each([
    ["TRTHeroForm", HERO_FORM],
    ["TRTFinalCTA", FINAL_CTA],
  ])("%s primary CTA uses brand orange #E8670A or var(--brand-cta)", (_, src) => {
    expect(src).toMatch(/#E8670A|var\(--brand-cta\)|var\(--brand-accent\)/i);
  });

  it.each([
    ["TRTHeroForm", HERO_FORM],
    ["TRTFinalCTA", FINAL_CTA],
  ])("%s uses an approved navy (#000814 or #000033 or #0B1029) or token", (_, src) => {
    expect(src).toMatch(/#000814|#000033|#0B1029|var\(--brand-navy|var\(--brand-navy-deep\)/i);
  });
});

describe("Typography", () => {
  it.each(BRAND_SURFACES)("%s headings use Oswald", (_, src) => {
    if (!/font-bold|fontWeight/i.test(src)) return;
    expect(src).toMatch(/Oswald/);
  });
});

describe("Tone of voice", () => {
  // Strip JSX/TS code: keep only string/template/JSX-text content so we
  // don't false-positive on identifiers like `RadixDialog`.
  const visibleText = (src: string) =>
    [
      ...src.matchAll(/"([^"\\]|\\.)*"/g),
      ...src.matchAll(/'([^'\\]|\\.)*'/g),
      ...src.matchAll(/`([^`\\]|\\.)*`/g),
      ...src.matchAll(/>([^<{}]+)</g),
    ]
      .map((m) => m[0])
      .join(" ");

  it.each(BRAND_SURFACES)("%s never uses the word 'guys'", (_, src) => {
    const text = visibleText(src);
    expect(text).not.toMatch(/\bguys\b/i);
  });

  it.each(BRAND_SURFACES)("%s never uses em-dashes in copy", (_, src) => {
    const text = visibleText(src);
    // Em-dash (U+2014). Hyphens and en-dashes are fine.
    expect(text.includes("\u2014"), "found em-dash in user-visible copy").toBe(false);
  });
});

describe("Compliance copy", () => {
  it("Hero form shows TCPA SMS disclosure", () => {
    expect(HERO_FORM).toMatch(/SMS\/calls/);
    expect(HERO_FORM).toMatch(/STOP/);
    expect(HERO_FORM).toMatch(/Msg & data rates/);
  });

  it("Hero form TCPA checkbox defaults to unchecked", () => {
    expect(HERO_FORM).toMatch(/useState\(false\)/);
  });

  it("Hero form shows HIPAA assurance", () => {
    expect(HERO_FORM).toMatch(/HIPAA/);
  });

  it("Final CTA shows HIPAA + no-spam line", () => {
    expect(FINAL_CTA).toMatch(/HIPAA Compliant/);
    expect(FINAL_CTA).toMatch(/No Spam/);
  });
});

describe("Form ID uniqueness — duplicate id bug prevention", () => {
  // Each TRTHeroForm on the same page MUST have a unique formId so
  // label[htmlFor] targets the correct checkbox. A repeated formId causes
  // clicking the bottom-form TCPA checkbox to toggle the top-form's checkbox.

  const TCPA = read("src/components/landing/trt/TCPADisclaimer.tsx");
  const FINAL_TRT = read("src/components/landing/trt/TRTFinalCTA.tsx");
  const FINAL_SVC = read("src/components/landing/shared/ServiceFinalCTA.tsx");
  const ED_PAGE   = read("src/pages/NewED.tsx");
  const WL_PAGE   = read("src/pages/NewWeightLoss.tsx");

  it("TCPADisclaimer uses useId() — no static default id string", () => {
    expect(TCPA).toMatch(/useId/);
    // Must NOT have the old static fallback
    expect(TCPA).not.toMatch(/id\s*=\s*["']hf-tcpa["']/);
  });

  it("TRTFinalCTA uses a page-scoped formId, not the generic 'footer-form'", () => {
    expect(FINAL_TRT).toMatch(/formId=["']trt-footer-form["']/);
    expect(FINAL_TRT).not.toMatch(/formId=["']footer-form["']/);
  });

  it("ServiceFinalCTA forwards formId prop instead of hardcoding it", () => {
    // Must accept formId as a prop
    expect(FINAL_SVC).toMatch(/formId:\s*string/);
    // Must NOT have the old hardcoded value
    expect(FINAL_SVC).not.toMatch(/formId=["']footer-form["']/);
  });

  it("ED page passes a unique formId to ServiceFinalCTA", () => {
    expect(ED_PAGE).toMatch(/formId=["']ed-footer-form["']/);
  });

  it("WL page passes a unique formId to ServiceFinalCTA", () => {
    expect(WL_PAGE).toMatch(/formId=["']wl-footer-form["']/);
  });
});

describe("Quiz funnel routing", () => {
  it("Quiz Approved CTA routes book directly to /book (no symptom gate)", () => {
    // Non-DQ path goes to /book; DQ path goes to /book/lets-talk.
    expect(QUIZ_APPROVED).toMatch(/"\/book"/);
    expect(QUIZ_APPROVED).toMatch(/"\/book\/lets-talk"/);
    // And explicitly NOT routing the happy path through /book/symptom.
    expect(QUIZ_APPROVED).not.toMatch(/dq\s*\?\s*"\/book\/lets-talk"\s*:\s*"\/book\/symptom"/);
  });
});

describe("Internal directory hardening", () => {
  // LpCards is an internal admin widget — it doesn't need SEO or navy palette.
  it("LP directory component exists and renders card links", () => {
    expect(LP_DIRECTORY).toMatch(/ExternalLink/);
  });
});

describe("Sitewide noindex", () => {
  const INDEX_HTML = readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");
  const ROBOTS = readFileSync(path.resolve(__dirname, "../../public/robots.txt"), "utf8");
  it("index.html declares noindex for paid LP subdomain", () => {
    expect(INDEX_HTML).toMatch(/name="robots"[^>]*noindex/);
  });
  it("robots.txt disallows generic crawlers but allows AdsBot", () => {
    expect(ROBOTS).toMatch(/User-agent: \*\s*\n\s*Disallow: \//);
    expect(ROBOTS).toMatch(/User-agent: AdsBot-Google\s*\n\s*Allow: \//);
  });
});

