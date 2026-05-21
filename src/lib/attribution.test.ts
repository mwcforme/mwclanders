/**
 * Tests for lib/attribution.ts — marketing attribution capture.
 * Covers cookie read/write, URL param parsing, merging, tag generation.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  ATTRIBUTION_KEYS,
  initAttribution,
  getAttribution,
  attributionTags,
  type Attribution,
} from "@/lib/attribution";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COOKIE_NAME = "mwc_attr_v2";

function setCookie(value: object) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${COOKIE_NAME}=${encoded}; Path=/`;
}

function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/`;
}

function setSearch(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  Object.defineProperty(window, "location", {
    value: { ...window.location, search: qs ? `?${qs}` : "" },
    writable: true,
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  clearCookie();
  setSearch({});
  // Reset module-level cache by reimporting (vitest re-executes on each file run)
  // We can't easily reset the module cache, so we'll call initAttribution() to refresh
});

// ─── ATTRIBUTION_KEYS ─────────────────────────────────────────────────────────

describe("ATTRIBUTION_KEYS", () => {
  it("includes standard UTM params", () => {
    expect(ATTRIBUTION_KEYS).toContain("utm_source");
    expect(ATTRIBUTION_KEYS).toContain("utm_medium");
    expect(ATTRIBUTION_KEYS).toContain("utm_campaign");
  });

  it("includes click IDs", () => {
    expect(ATTRIBUTION_KEYS).toContain("gclid");
    expect(ATTRIBUTION_KEYS).toContain("fbclid");
    expect(ATTRIBUTION_KEYS).toContain("msclkid");
  });

  it("includes page_id", () => {
    expect(ATTRIBUTION_KEYS).toContain("page_id");
  });
});

// ─── initAttribution — from URL ────────────────────────────────────────────────

describe("initAttribution — URL params", () => {
  it("reads utm_source from URL", () => {
    setSearch({ utm_source: "google" });
    const attr = initAttribution();
    expect(attr.utm_source).toBe("google");
  });

  it("reads multiple UTM params from URL", () => {
    setSearch({ utm_source: "google", utm_medium: "cpc", utm_campaign: "trt" });
    const attr = initAttribution();
    expect(attr.utm_source).toBe("google");
    expect(attr.utm_medium).toBe("cpc");
    expect(attr.utm_campaign).toBe("trt");
  });

  it("ignores unknown params", () => {
    setSearch({ utm_source: "google", first_name: "John" });
    const attr = initAttribution();
    expect(attr.utm_source).toBe("google");
    expect((attr as Record<string, unknown>).first_name).toBeUndefined();
  });

  it("trims and truncates long values to 200 chars", () => {
    const longVal = "x".repeat(300);
    setSearch({ utm_source: longVal });
    const attr = initAttribution();
    expect(attr.utm_source?.length).toBe(200);
  });

  it("ignores empty string values", () => {
    setSearch({ utm_source: "  " });
    const attr = initAttribution();
    expect(attr.utm_source).toBeUndefined();
  });
});

// ─── initAttribution — from cookie ────────────────────────────────────────────

describe("initAttribution — cookie", () => {
  it("reads attribution from existing cookie", () => {
    setCookie({ utm_source: "facebook", utm_medium: "social" });
    setSearch({});
    const attr = initAttribution();
    expect(attr.utm_source).toBe("facebook");
    expect(attr.utm_medium).toBe("social");
  });

  it("URL params override cookie values", () => {
    setCookie({ utm_source: "facebook" });
    setSearch({ utm_source: "google" });
    const attr = initAttribution();
    expect(attr.utm_source).toBe("google");
  });

  it("merges cookie and URL, URL wins for duplicates", () => {
    setCookie({ utm_source: "old", utm_medium: "social" });
    setSearch({ utm_source: "new" });
    const attr = initAttribution();
    expect(attr.utm_source).toBe("new");
    expect(attr.utm_medium).toBe("social");
  });

  it("returns empty object for malformed cookie", () => {
    document.cookie = `${COOKIE_NAME}=not-valid-json; Path=/`;
    setSearch({});
    const attr = initAttribution();
    expect(Object.keys(attr).length).toBe(0);
  });

  it("ignores cookie with non-object top-level value", () => {
    const encoded = encodeURIComponent(JSON.stringify(["array", "value"]));
    document.cookie = `${COOKIE_NAME}=${encoded}; Path=/`;
    setSearch({});
    const attr = initAttribution();
    expect(Object.keys(attr).length).toBe(0);
  });
});

// ─── attributionTags ───────────────────────────────────────────────────────────

describe("attributionTags", () => {
  it("returns empty array for empty attribution", () => {
    const tags = attributionTags({});
    expect(tags).toEqual([]);
  });

  it("returns one tag per set key", () => {
    const attr: Attribution = { utm_source: "google", utm_medium: "cpc" };
    const tags = attributionTags(attr);
    expect(tags).toContain("utm_source:google");
    expect(tags).toContain("utm_medium:cpc");
    expect(tags.length).toBe(2);
  });

  it("truncates tags to 100 chars", () => {
    const attr: Attribution = { utm_source: "x".repeat(200) };
    const tags = attributionTags(attr);
    expect(tags[0].length).toBe(100);
  });

  it("preserves order of ATTRIBUTION_KEYS", () => {
    const attr: Attribution = {
      utm_source: "google",
      page_id: "trt",
    };
    const tags = attributionTags(attr);
    // page_id comes before utm_source in ATTRIBUTION_KEYS
    const pageIdx = tags.findIndex((t) => t.startsWith("page_id:"));
    const srcIdx = tags.findIndex((t) => t.startsWith("utm_source:"));
    expect(pageIdx).toBeLessThan(srcIdx);
  });

  it("uses getAttribution() when no argument passed", () => {
    setSearch({ utm_source: "test-default" });
    initAttribution();
    const tags = attributionTags();
    expect(tags.some((t) => t.startsWith("utm_source:"))).toBe(true);
  });
});

// ─── getAttribution ────────────────────────────────────────────────────────────

describe("getAttribution", () => {
  it("returns same object as initAttribution after init", () => {
    setSearch({ utm_source: "test" });
    const init = initAttribution();
    const get = getAttribution();
    expect(get.utm_source).toBe(init.utm_source);
  });
});
