/**
 * croContent.ts — data shape and integrity tests.
 */
import { describe, it, expect } from "vitest";
import {
  ROTATING_SERVICES,
  SYMPTOMS,
  VALID_LOCATIONS,
  LOCATIONS,
  CRO_STATS,
  CRO_EXTRA_FAQS,
  formatPhone,
  getLocationFromUrl,
} from "./croContent";

describe("croContent", () => {
  describe("ROTATING_SERVICES", () => {
    it("has 4 service strings", () => {
      expect(ROTATING_SERVICES).toHaveLength(4);
    });
    it("includes TESTOSTERONE", () => {
      expect(ROTATING_SERVICES).toContain("TESTOSTERONE");
    });
  });

  describe("SYMPTOMS", () => {
    it("has at least 3 symptoms", () => {
      expect(SYMPTOMS.length).toBeGreaterThanOrEqual(3);
    });
    it("contains no em-dashes", () => {
      SYMPTOMS.forEach((s) => {
        expect(s).not.toContain("\u2014");
      });
    });
  });

  describe("LOCATIONS", () => {
    it("has exactly 3 locations", () => {
      expect(LOCATIONS).toHaveLength(3);
    });
    it("each location has a key matching VALID_LOCATIONS", () => {
      LOCATIONS.forEach(({ key }) => {
        expect(VALID_LOCATIONS).toContain(key);
      });
    });
    it("each location has a non-empty label", () => {
      LOCATIONS.forEach(({ label }) => {
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe("CRO_STATS", () => {
    it("has exactly 4 stats", () => {
      expect(CRO_STATS).toHaveLength(4);
    });
    it("each stat has a value and label", () => {
      CRO_STATS.forEach((stat) => {
        expect(stat.value).toBeTruthy();
        expect(stat.label).toBeTruthy();
      });
    });
  });

  describe("CRO_EXTRA_FAQS", () => {
    it("has exactly 2 FAQ entries", () => {
      expect(CRO_EXTRA_FAQS).toHaveLength(2);
    });
    it("each FAQ has non-empty q and a", () => {
      CRO_EXTRA_FAQS.forEach(({ q, a }) => {
        expect(q.length).toBeGreaterThan(0);
        expect(a.length).toBeGreaterThan(0);
      });
    });
  });

  describe("formatPhone", () => {
    it("formats a 10-digit number", () => {
      expect(formatPhone("5550001234")).toBe("(555) 000-1234");
    });
    it("strips non-digits and formats", () => {
      expect(formatPhone("555-000-1234")).toBe("(555) 000-1234");
    });
    it("handles partial input (3 digits)", () => {
      expect(formatPhone("555")).toBe("555");
    });
    it("handles partial input (6 digits)", () => {
      expect(formatPhone("555000")).toBe("(555) 000");
    });
    it("caps at 10 digits", () => {
      expect(formatPhone("55500012345678")).toBe("(555) 000-1234");
    });
  });

  describe("getLocationFromUrl", () => {
    it("returns empty string in SSR (no window)", () => {
      // In the test environment window exists but location.search is empty
      expect(getLocationFromUrl()).toBe("");
    });
  });
});
