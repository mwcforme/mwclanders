/**
 * Tests for lib/partialCapture.ts — partial lead capture.
 * Mocks Supabase and sessionStorage.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const sessionStorageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };
})();

vi.stubGlobal("sessionStorage", sessionStorageMock);

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({ insert: mockInsert }),
  },
}));

// Also mock attribution to return empty (no cookie in test)
vi.mock("@/lib/attribution", () => ({
  getAttribution: vi.fn().mockReturnValue({}),
}));

beforeEach(() => {
  sessionStorageMock.clear();
  vi.clearAllMocks();
  mockInsert.mockResolvedValue({ error: null });
});

// ─── capturePartialLead ───────────────────────────────────────────────────────

describe("capturePartialLead", () => {
  it("does nothing for phone with fewer than 10 digits", async () => {
    await capturePartialLead({ phone: "123" });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("does nothing if already captured this session", async () => {
    sessionStorageMock.setItem("mwc_partial_fired", "1");
    await capturePartialLead({ phone: "(800) 123-4567" });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("inserts to lead_captures for valid phone", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await capturePartialLead({ phone: "(800) 123-4567" });
    expect(supabase.from).toHaveBeenCalledWith("lead_captures");
    expect(mockInsert).toHaveBeenCalled();
  });

  it("marks session as fired after capture", async () => {
    await capturePartialLead({ phone: "(800) 123-4567" });
    expect(sessionStorageMock.getItem("mwc_partial_fired")).toBe("1");
  });

  it("prevents duplicate capture in same session", async () => {
    await capturePartialLead({ phone: "(800) 123-4567" });
    await capturePartialLead({ phone: "(800) 123-4567" });
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it("passes phone to insert call", async () => {
    await capturePartialLead({ phone: "(800) 123-4567" });
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.phone).toBe("(800) 123-4567");
  });

  it("passes optional name when provided", async () => {
    await capturePartialLead({ phone: "(800) 123-4567", name: "John" });
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.name).toBe("John");
  });

  it("sets source to partial-abandon by default", async () => {
    await capturePartialLead({ phone: "(800) 123-4567" });
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.source).toBe("partial-abandon");
  });

  it("passes custom source when provided", async () => {
    await capturePartialLead({ phone: "(800) 123-4567", source: "hero-form" });
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.source).toBe("hero-form");
  });

  it("does not throw on Supabase error", async () => {
    mockInsert.mockRejectedValueOnce(new Error("DB error"));
    await expect(
      capturePartialLead({ phone: "(800) 123-4567" }),
    ).resolves.toBeUndefined();
  });
});

// ─── markSessionSubmitted ──────────────────────────────────────────────────────

describe("markSessionSubmitted", () => {
  it("sets mwc_partial_fired in sessionStorage", () => {
    markSessionSubmitted();
    expect(sessionStorageMock.getItem("mwc_partial_fired")).toBe("1");
  });

  it("prevents capture after marking submitted", async () => {
    markSessionSubmitted();
    await capturePartialLead({ phone: "(800) 123-4567" });
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
