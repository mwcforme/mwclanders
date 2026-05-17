/**
 * Regression: LP directory data integrity.
 * Every entry in LANDING_PAGES must be wired to a real route in App.tsx,
 * use a valid primary CTA, have a unique slug, and a parseable updatedAt.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  LANDING_PAGES,
  BOOKING_STEPS,
  COMPLIANCE_PAGES,
} from "@/data/landingPages";

const appSource = readFileSync(
  path.resolve(__dirname, "../App.tsx"),
  "utf8",
);

const routePaths = Array.from(
  appSource.matchAll(/<Route\s+path="([^"]+)"/g),
).map((m) => m[1]);

describe("LP directory: data integrity", () => {
  it("has at least the three live LPs", () => {
    const live = LANDING_PAGES.filter((p) => p.status === "live").map((p) => p.slug);
    expect(live).toEqual(expect.arrayContaining(["/", "/quiz", "/quiz/approved"]));
  });

  it("has unique slugs", () => {
    const slugs = LANDING_PAGES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every LP slug resolves to a real <Route> in App.tsx", () => {
    for (const lp of LANDING_PAGES) {
      expect(routePaths, `missing route for ${lp.slug}`).toContain(lp.slug);
    }
  });

  it("every primary CTA is a real route or a real booking step", () => {
    const known = new Set([...routePaths, ...BOOKING_STEPS.map((s) => s.slug)]);
    for (const lp of LANDING_PAGES) {
      expect(known, `unknown CTA ${lp.primaryCta} on ${lp.slug}`).toContain(lp.primaryCta);
    }
  });

  it("updatedAt parses as ISO date", () => {
    for (const lp of LANDING_PAGES) {
      expect(Number.isNaN(new Date(lp.updatedAt).getTime())).toBe(false);
    }
  });
});

describe("LP directory: booking funnel", () => {
  it("registers /book entry redirect and the four real funnel steps", () => {
    const slugs = BOOKING_STEPS.map((s) => s.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "/book",
        "/book/symptom",
        "/book/duration",
        "/book/schedule",
        "/book/confirmed",
        "/book/lets-talk",
      ]),
    );
  });

  it("/book entry is documented as redirecting", () => {
    const entry = BOOKING_STEPS.find((s) => s.slug === "/book");
    expect(entry?.description.toLowerCase()).toMatch(/redirect/);
  });

  it("App.tsx redirects /book directly to /book/schedule (no symptom gate)", () => {
    expect(appSource).toMatch(
      /path="\/book"\s+element=\{<Navigate\s+to="\/book\/schedule"\s+replace\s*\/>\}/,
    );
  });
});

describe("LP directory: compliance pages", () => {
  it("flags the three legally required pages and they exist", () => {
    const required = COMPLIANCE_PAGES.filter((p) => p.required);
    expect(required.length).toBeGreaterThanOrEqual(3);
    for (const p of required) {
      expect(p.exists, `required page ${p.slug} must exist`).toBe(true);
      expect(routePaths, `required page ${p.slug} must be routed`).toContain(p.slug);
    }
  });
});
