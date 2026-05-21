/**
 * Tests for lib/env.ts and lib/envOverride.ts.
 * Covers environment detection and override helpers.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { setEnvOverride, hasEnvOverride } from "@/lib/envOverride";

// ─── hasEnvOverride ────────────────────────────────────────────────────────────

const storageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };
})();

beforeEach(() => {
  storageMock.clear();
  vi.stubGlobal("localStorage", storageMock);
  // Mock window.location.reload to prevent jsdom errors
  Object.defineProperty(window, "location", {
    value: { ...window.location, reload: vi.fn() },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("hasEnvOverride", () => {
  it("returns false when no override set", () => {
    expect(hasEnvOverride()).toBe(false);
  });

  it("returns true when override is 'prod'", () => {
    storageMock.setItem("mwc_env_override", "prod");
    expect(hasEnvOverride()).toBe(true);
  });

  it("returns true when override is 'stage'", () => {
    storageMock.setItem("mwc_env_override", "stage");
    expect(hasEnvOverride()).toBe(true);
  });

  it("returns false for unknown override value", () => {
    storageMock.setItem("mwc_env_override", "unknown");
    expect(hasEnvOverride()).toBe(false);
  });
});

// ─── setEnvOverride ────────────────────────────────────────────────────────────

describe("setEnvOverride", () => {
  it("sets 'prod' override in localStorage", () => {
    setEnvOverride("prod");
    expect(storageMock.getItem("mwc_env_override")).toBe("prod");
  });

  it("sets 'stage' override in localStorage", () => {
    setEnvOverride("stage");
    expect(storageMock.getItem("mwc_env_override")).toBe("stage");
  });

  it("removes override when set to 'auto'", () => {
    storageMock.setItem("mwc_env_override", "prod");
    setEnvOverride("auto");
    expect(storageMock.getItem("mwc_env_override")).toBeNull();
  });

  it("calls window.location.reload after setting override", () => {
    setEnvOverride("prod");
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("calls window.location.reload after removing override", () => {
    setEnvOverride("auto");
    expect(window.location.reload).toHaveBeenCalled();
  });
});

// ─── lib/env.ts — APP_ENV detection ───────────────────────────────────────────

describe("APP_ENV detection", () => {
  it("IS_PROD and IS_STAGE are mutually exclusive", async () => {
    const { IS_PROD, IS_STAGE } = await import("@/lib/env");
    expect(IS_PROD).toBe(!IS_STAGE);
  });

  it("APP_ENV is either 'prod' or 'stage'", async () => {
    const { APP_ENV } = await import("@/lib/env");
    expect(["prod", "stage"]).toContain(APP_ENV);
  });

  it("defaults to stage in test environment (localhost/test host)", async () => {
    // In test environment, hostname is localhost or similar
    const { APP_ENV } = await import("@/lib/env");
    // jsdom hostname is localhost by default, which is not in PROD_HOSTS
    expect(APP_ENV).toBe("stage");
  });
});
