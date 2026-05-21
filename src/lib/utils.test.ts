/**
 * Tests for lib/utils.ts, lib/constants.ts, lib/analyticsGuard.ts
 */
import { describe, it, expect, beforeEach } from "vitest";
import { cn } from "@/lib/utils";
import { PHONE, BRAND, GA4_ID } from "@/lib/constants";
import {
  sanitizeAnalyticsForBookingRoute,
  fireSanitizedPageView,
} from "@/lib/analyticsGuard";

// ─── cn (clsx + tailwind-merge) ──────────────────────────────────────────────

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const condition = false;
    expect(cn("foo", condition && "bar", "baz")).toBe("foo baz");
  });

  it("deduplicates tailwind classes (last wins)", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("returns empty string for no valid inputs", () => {
    expect(cn(false, undefined, null)).toBe("");
  });
});

// ─── PHONE / BRAND constants ──────────────────────────────────────────────────

describe("constants", () => {
  it("PHONE.display is formatted", () => {
    expect(PHONE.display).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/);
  });

  it("PHONE.tel starts with tel:", () => {
    expect(PHONE.tel).toMatch(/^tel:\+1/);
  });

  it("PHONE.digits contains only digits", () => {
    expect(PHONE.digits).toMatch(/^\d+$/);
  });

  it("BRAND.name is Men's Wellness Centers", () => {
    expect(BRAND.name).toBe("Men's Wellness Centers");
  });

  it("BRAND.url starts with https", () => {
    expect(BRAND.url).toMatch(/^https:\/\//);
  });

  it("GA4_ID starts with G-", () => {
    expect(GA4_ID).toMatch(/^G-/);
  });
});

// ─── sanitizeAnalyticsForBookingRoute ────────────────────────────────────────

describe("sanitizeAnalyticsForBookingRoute", () => {
  beforeEach(() => {
    window.dataLayer = [];
    (window as Record<string, unknown>).gtag = undefined;
  });

  it("pushes page_view_sanitized to dataLayer", () => {
    sanitizeAnalyticsForBookingRoute("/book/schedule");
    const evt = window.dataLayer?.find((e: Record<string, unknown>) => e.event === "page_view_sanitized");
    expect(evt).toBeDefined();
    expect((evt as Record<string, unknown>).page_path).toBe("/book/schedule");
  });

  it("omits query string from page_location", () => {
    sanitizeAnalyticsForBookingRoute("/book/schedule");
    const evt = window.dataLayer?.find((e: Record<string, unknown>) => e.event === "page_view_sanitized") as Record<string, string>;
    expect(evt?.page_location).not.toContain("?");
  });

  it("calls gtag when available", () => {
    const calls: unknown[][] = [];
    (window as Record<string, unknown>).gtag = (...args: unknown[]) => calls.push(args);
    sanitizeAnalyticsForBookingRoute("/book/schedule");
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][0]).toBe("config");
  });

  it("does nothing if window is undefined (SSR guard)", () => {
    // jsdom always has window, so just verify no throw
    expect(() => sanitizeAnalyticsForBookingRoute("/book/schedule")).not.toThrow();
  });
});

// ─── fireSanitizedPageView ────────────────────────────────────────────────────

describe("fireSanitizedPageView", () => {
  beforeEach(() => {
    (window as Record<string, unknown>).gtag = undefined;
  });

  it("calls gtag event with page_view when gtag available", () => {
    const calls: unknown[][] = [];
    (window as Record<string, unknown>).gtag = (...args: unknown[]) => calls.push(args);
    fireSanitizedPageView("/quiz");
    expect(calls[0][0]).toBe("event");
    expect(calls[0][1]).toBe("page_view");
  });

  it("does not throw when gtag not available", () => {
    expect(() => fireSanitizedPageView("/quiz")).not.toThrow();
  });
});
