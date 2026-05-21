/**
 * Tests for lib/schema.ts — JSON-LD schema builders.
 * Pure functions — no React, no browser globals.
 */
import { describe, it, expect } from "vitest";
import {
  buildLocalBusinessJsonLd,
  buildAllLocationsJsonLd,
  buildFaqJsonLd,
} from "@/lib/schema";
import { LOCATIONS } from "@/data/locations";
import { TRT_FAQS } from "@/data/faqs";

// ─── buildLocalBusinessJsonLd ──────────────────────────────────────────────────

describe("buildLocalBusinessJsonLd", () => {
  const loc = LOCATIONS[0]; // Richmond

  it("returns @type MedicalClinic", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld["@type"]).toBe("MedicalClinic");
  });

  it("includes @context schema.org", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld["@context"]).toBe("https://schema.org");
  });

  it("includes location name", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld.name).toBe(loc.name);
  });

  it("includes telephone", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld.telephone).toBe(loc.phone);
  });

  it("includes PostalAddress with addressRegion VA", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld.address["@type"]).toBe("PostalAddress");
    expect(ld.address.addressRegion).toBe("VA");
    expect(ld.address.addressCountry).toBe("US");
  });

  it("extracts postalCode from cityStateZip", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld.address.postalCode).toMatch(/^\d{5}$/);
  });

  it("includes geo coordinates", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld.geo["@type"]).toBe("GeoCoordinates");
    expect(typeof ld.geo.latitude).toBe("number");
    expect(typeof ld.geo.longitude).toBe("number");
  });

  it("includes Saturday in dayOfWeek", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    const days = ld.openingHoursSpecification[0].dayOfWeek;
    expect(days).toContain("Saturday");
  });

  it("opening hours are 08:00", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld.openingHoursSpecification[0].opens).toBe("08:00");
  });

  it("@id includes location slug", () => {
    const ld = buildLocalBusinessJsonLd(loc);
    expect(ld["@id"]).toContain(loc.slug);
  });
});

// ─── buildAllLocationsJsonLd ───────────────────────────────────────────────────

describe("buildAllLocationsJsonLd", () => {
  it("returns an array with one entry per location", () => {
    const ldArr = buildAllLocationsJsonLd();
    expect(ldArr.length).toBe(LOCATIONS.length);
  });

  it("all entries are MedicalClinic", () => {
    const ldArr = buildAllLocationsJsonLd();
    for (const ld of ldArr) {
      expect(ld["@type"]).toBe("MedicalClinic");
    }
  });

  it("each entry has a unique @id", () => {
    const ldArr = buildAllLocationsJsonLd();
    const ids = ldArr.map((ld) => ld["@id"]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── buildFaqJsonLd ───────────────────────────────────────────────────────────

describe("buildFaqJsonLd", () => {
  it("returns @type FAQPage", () => {
    const ld = buildFaqJsonLd();
    expect(ld["@type"]).toBe("FAQPage");
  });

  it("mainEntity has one entry per FAQ item", () => {
    const ld = buildFaqJsonLd();
    expect(ld.mainEntity.length).toBe(TRT_FAQS.length);
  });

  it("each question has @type Question", () => {
    const ld = buildFaqJsonLd();
    for (const q of ld.mainEntity) {
      expect(q["@type"]).toBe("Question");
    }
  });

  it("each answer has @type Answer", () => {
    const ld = buildFaqJsonLd();
    for (const q of ld.mainEntity) {
      expect(q.acceptedAnswer["@type"]).toBe("Answer");
    }
  });

  it("accepts custom FAQ array", () => {
    const custom = [{ q: "Test?", a: "Yes." }];
    const ld = buildFaqJsonLd(custom);
    expect(ld.mainEntity[0].name).toBe("Test?");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("Yes.");
  });

  it("uses TRT_FAQS when no argument passed", () => {
    const ld = buildFaqJsonLd();
    expect(ld.mainEntity[0].name).toBe(TRT_FAQS[0].q);
  });
});
