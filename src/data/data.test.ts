/**
 * Tests for data/* files — integrity checks on static data.
 * Ensures data contracts (types, required fields, uniqueness) are met.
 */
import { describe, it, expect } from "vitest";
import { LOCATIONS, type Location } from "@/data/locations";
import { TRT_FAQS } from "@/data/faqs";
import { COPY } from "@/data/copy";
import {
  TESTIMONIALS,
  GBP_REVIEWS_URL,
} from "@/data/testimonials";

// ─── LOCATIONS ─────────────────────────────────────────────────────────────────

describe("LOCATIONS", () => {
  it("has exactly 3 locations", () => {
    expect(LOCATIONS.length).toBe(3);
  });

  it("all locations have required fields", () => {
    for (const loc of LOCATIONS) {
      expect(loc.slug).toBeTruthy();
      expect(loc.name).toBeTruthy();
      expect(loc.address).toBeTruthy();
      expect(loc.phone).toBeTruthy();
      expect(loc.city).toBeTruthy();
    }
  });

  it("slugs are unique", () => {
    const slugs = LOCATIONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all locations have Saturday open (openDays includes 6)", () => {
    for (const loc of LOCATIONS) {
      expect(loc.openDays).toContain(6); // 6 = Saturday
    }
  });

  it("weeklyOpens is 08:00 for all locations", () => {
    for (const loc of LOCATIONS) {
      expect(loc.weeklyOpens).toBe("08:00");
    }
  });

  it("all locations have valid geo coordinates", () => {
    for (const loc of LOCATIONS) {
      expect(typeof loc.geo.latitude).toBe("number");
      expect(typeof loc.geo.longitude).toBe("number");
      // Sanity check: Virginia coordinates
      expect(loc.geo.latitude).toBeGreaterThan(35);
      expect(loc.geo.latitude).toBeLessThan(40);
      expect(loc.geo.longitude).toBeLessThan(-75);
      expect(loc.geo.longitude).toBeGreaterThan(-80);
    }
  });

  it("all phone hrefs start with tel:", () => {
    for (const loc of LOCATIONS) {
      expect(loc.phoneHref).toMatch(/^tel:/);
    }
  });

  it("has richmond, newport-news, virginia-beach", () => {
    const slugs = LOCATIONS.map((l) => l.slug);
    expect(slugs).toContain("richmond-va");
    expect(slugs).toContain("newport-news-va");
    expect(slugs).toContain("virginia-beach-va");
  });

  it("brand name includes Men's Wellness Centers", () => {
    for (const loc of LOCATIONS) {
      expect(loc.name).toContain("Men's Wellness Centers");
    }
  });
});

describe("Location type completeness", () => {
  it("first location has all Location fields", () => {
    const loc: Location = LOCATIONS[0];
    expect(loc.cityStateZip).toBeTruthy();
    expect(loc.fullAddress).toBeTruthy();
    expect(loc.hours).toBeTruthy();
    expect(loc.mapsQuery).toBeTruthy();
    expect(loc.driveTime).toBeTruthy();
    expect(loc.region).toMatch(/^(richmond|hampton-roads)$/);
  });
});

// ─── TRT_FAQS ──────────────────────────────────────────────────────────────────

describe("TRT_FAQS", () => {
  it("has at least 5 FAQs", () => {
    expect(TRT_FAQS.length).toBeGreaterThanOrEqual(5);
  });

  it("all FAQs have non-empty question and answer", () => {
    for (const faq of TRT_FAQS) {
      expect(faq.q.length).toBeGreaterThan(5);
      expect(faq.a.length).toBeGreaterThan(10);
    }
  });

  it("no FAQ questions are duplicated", () => {
    const questions = TRT_FAQS.map((f) => f.q);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("no FAQ contains em-dash (brand voice rule)", () => {
    for (const faq of TRT_FAQS) {
      expect(faq.q).not.toContain("\u2014");
      expect(faq.a).not.toContain("\u2014");
    }
  });
});

// ─── COPY ──────────────────────────────────────────────────────────────────────

describe("COPY", () => {
  it("bookConsult CTA is defined", () => {
    expect(COPY.cta.bookConsult).toBeTruthy();
  });

  it("callNow CTA is defined", () => {
    expect(COPY.cta.callNow).toBeTruthy();
  });

  it("no CTA contains the word 'free' (compliance rule)", () => {
    // Check each CTA value individually
    for (const [key, val] of Object.entries(COPY.cta)) {
      if (typeof val === "string") {
        expect(val.toLowerCase(), `CTA '${key}' contains banned word 'free'`).not.toContain("free");
      }
    }
  });

  it("no CTA contains em-dash", () => {
    for (const [key, val] of Object.entries(COPY.cta)) {
      if (typeof val === "string") {
        expect(val, `CTA '${key}' contains em-dash`).not.toContain("\u2014");
      }
    }
  });
});

// ─── TESTIMONIALS ──────────────────────────────────────────────────────────────

describe("TESTIMONIALS", () => {
  it("has at least 3 testimonials", () => {
    expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(3);
  });

  it("all testimonials have required fields", () => {
    for (const t of TESTIMONIALS) {
      expect(t.name).toBeTruthy();
      expect(t.quote).toBeTruthy();
      expect(typeof t.rating).toBe("number");
    }
  });

  it("all testimonial ratings are 5", () => {
    for (const t of TESTIMONIALS) {
      expect(t.rating).toBe(5);
    }
  });

  it("GBP_REVIEWS_URL is a Google Maps URL", () => {
    expect(GBP_REVIEWS_URL).toContain("google.com/maps");
  });
});
