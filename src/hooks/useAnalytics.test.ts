/**
 * Tests for hooks/useAnalytics.ts — analytics event tracking utilities.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { trackCro, trackFunnelEvent, useScrollDepth } from "@/hooks/useAnalytics";

beforeEach(() => {
  window.dataLayer = [];
});

// ─── trackCro ─────────────────────────────────────────────────────────────────

describe("trackCro", () => {
  it("pushes cro_click event to dataLayer", () => {
    trackCro("hero-cta");
    expect(window.dataLayer?.some((e: Record<string, unknown>) => e.event === "cro_click")).toBe(true);
  });

  it("includes slug in event", () => {
    trackCro("quiz-start");
    const evt = window.dataLayer?.find((e: Record<string, unknown>) => e.event === "cro_click") as Record<string, unknown>;
    expect(evt?.cro).toBe("quiz-start");
  });

  it("merges extra properties", () => {
    trackCro("book-cta", { location: "richmond" });
    const evt = window.dataLayer?.find((e: Record<string, unknown>) => e.event === "cro_click") as Record<string, unknown>;
    expect(evt?.location).toBe("richmond");
  });

  it("initializes dataLayer if not present", () => {
    (window as Record<string, unknown>).dataLayer = undefined;
    trackCro("test");
    expect(window.dataLayer).toBeDefined();
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });
});

// ─── trackFunnelEvent ─────────────────────────────────────────────────────────

describe("trackFunnelEvent", () => {
  it("pushes booking_started event", () => {
    trackFunnelEvent("booking_started");
    expect(window.dataLayer?.some((e: Record<string, unknown>) => e.event === "booking_started")).toBe(true);
  });

  it("pushes location_selected event", () => {
    trackFunnelEvent("location_selected", { location: "richmond" });
    const evt = window.dataLayer?.find((e: Record<string, unknown>) => e.event === "location_selected") as Record<string, unknown>;
    expect(evt?.location).toBe("richmond");
  });

  it("strips PII keys from extra", () => {
    trackFunnelEvent("booking_started", {
      location: "richmond",
      firstName: "John",  // should be stripped
      email: "j@test.com", // should be stripped
      phone: "8001234567", // should be stripped
    });
    const evt = window.dataLayer?.find((e: Record<string, unknown>) => e.event === "booking_started") as Record<string, unknown>;
    expect(evt?.location).toBe("richmond");
    expect(evt?.firstName).toBeUndefined();
    expect(evt?.email).toBeUndefined();
    expect(evt?.phone).toBeUndefined();
  });

  it("handles undefined extra gracefully", () => {
    expect(() => trackFunnelEvent("booking_completed")).not.toThrow();
  });

  it("initializes dataLayer if not present", () => {
    (window as Record<string, unknown>).dataLayer = undefined;
    trackFunnelEvent("time_selected");
    expect(window.dataLayer).toBeDefined();
  });
});

// ─── useScrollDepth ───────────────────────────────────────────────────────────

describe("useScrollDepth", () => {
  it("mounts without error", () => {
    expect(() => renderHook(() => useScrollDepth())).not.toThrow();
  });

  it("adds scroll event listener on mount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useScrollDepth());
    expect(addSpy.mock.calls.some((c) => c[0] === "scroll")).toBe(true);
    addSpy.mockRestore();
  });

  it("removes scroll event listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useScrollDepth());
    unmount();
    expect(removeSpy.mock.calls.some((c) => c[0] === "scroll")).toBe(true);
    removeSpy.mockRestore();
  });
});
