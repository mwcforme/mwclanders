/**
 * Tests for lib/env.ts and lib/envOverride.ts.
 * Stage environment removed 2026-05-25. APP_ENV is now a hardcoded constant.
 */
import { describe, it, expect } from "vitest";
import { hasEnvOverride, setEnvOverride } from "@/lib/envOverride";
import { APP_ENV, IS_PROD, IS_STAGE } from "@/lib/env";

// ─── envOverride stubs (no-ops after stage removal) ───────────────────────────

describe("hasEnvOverride", () => {
  it("always returns false — override system removed", () => {
    expect(hasEnvOverride()).toBe(false);
  });

  it("returns false for unknown override value", () => {
    expect(hasEnvOverride()).toBe(false);
  });
});

describe("setEnvOverride", () => {
  it("is a no-op — does not throw", () => {
    expect(() => setEnvOverride("prod")).not.toThrow();
    expect(() => setEnvOverride("stage")).not.toThrow();
    expect(() => setEnvOverride("auto")).not.toThrow();
  });
});

// ─── lib/env.ts — simplified constants ────────────────────────────────────────

describe("APP_ENV constants", () => {
  it("APP_ENV is always prod", () => {
    expect(APP_ENV).toBe("prod");
  });

  it("IS_PROD is true", () => {
    expect(IS_PROD).toBe(true);
  });

  it("IS_STAGE is false", () => {
    expect(IS_STAGE).toBe(false);
  });

  it("IS_PROD and IS_STAGE are mutually exclusive", () => {
    expect(IS_PROD).toBe(!IS_STAGE);
  });
});
