/**
 * Tests for domain/leads/leadFormSchema.ts — Zod validation schemas.
 * Pure functions — no React, no browser globals needed.
 */
import { describe, it, expect } from "vitest";
import {
  nameField,
  phoneField,
  emailField,
  locationField,
  tcpaField,
  heroLeadSchema,
  shortHeroLeadSchema,
  confirmLeadSchema,
} from "@/domain/leads/leadFormSchema";

// ─── nameField ────────────────────────────────────────────────────────────────

describe("nameField", () => {
  it("accepts a valid name", () => {
    expect(nameField.safeParse("John Doe").success).toBe(true);
  });

  it("rejects empty string", () => {
    const r = nameField.safeParse("");
    expect(r.success).toBe(false);
  });

  it("trims whitespace before validation", () => {
    const r = nameField.safeParse("  ");
    expect(r.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const r = nameField.safeParse("a".repeat(101));
    expect(r.success).toBe(false);
  });

  it("accepts name at exactly 100 chars", () => {
    const r = nameField.safeParse("a".repeat(100));
    expect(r.success).toBe(true);
  });
});

// ─── phoneField ───────────────────────────────────────────────────────────────

describe("phoneField", () => {
  it("accepts a raw 10-digit phone", () => {
    const r = phoneField.safeParse("8001234567");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("8001234567");
  });

  it("strips formatting — (800) 123-4567", () => {
    const r = phoneField.safeParse("(800) 123-4567");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("8001234567");
  });

  it("strips formatting — 800.123.4567", () => {
    const r = phoneField.safeParse("800.123.4567");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("8001234567");
  });

  it("rejects 9-digit phone", () => {
    const r = phoneField.safeParse("800123456");
    expect(r.success).toBe(false);
  });

  it("rejects 11-digit phone", () => {
    const r = phoneField.safeParse("18001234567");
    expect(r.success).toBe(false);
  });

  it("rejects empty string", () => {
    const r = phoneField.safeParse("");
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric", () => {
    const r = phoneField.safeParse("abcdefghij");
    expect(r.success).toBe(false);
  });
});

// ─── emailField ───────────────────────────────────────────────────────────────

describe("emailField", () => {
  it("accepts valid email", () => {
    expect(emailField.safeParse("user@example.com").success).toBe(true);
  });

  it("rejects missing @", () => {
    expect(emailField.safeParse("notanemail").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(emailField.safeParse("").success).toBe(false);
  });

  it("rejects email over 255 chars", () => {
    // total 256 chars: local part 247 + @test.com (9)
    const r = emailField.safeParse("a".repeat(247) + "@test.com");
    expect(r.success).toBe(false);
  });

  it("trims whitespace", () => {
    const r = emailField.safeParse("  user@example.com  ");
    expect(r.success).toBe(true);
  });
});

// ─── locationField ────────────────────────────────────────────────────────────

describe("locationField", () => {
  it("accepts richmond", () => {
    expect(locationField.safeParse("richmond").success).toBe(true);
  });

  it("accepts newport-news", () => {
    expect(locationField.safeParse("newport-news").success).toBe(true);
  });

  it("accepts virginia-beach", () => {
    expect(locationField.safeParse("virginia-beach").success).toBe(true);
  });

  it("rejects unknown location", () => {
    expect(locationField.safeParse("miami").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(locationField.safeParse("").success).toBe(false);
  });
});

// ─── tcpaField ────────────────────────────────────────────────────────────────

describe("tcpaField", () => {
  it("accepts true", () => {
    expect(tcpaField.safeParse(true).success).toBe(true);
  });

  it("rejects false", () => {
    expect(tcpaField.safeParse(false).success).toBe(false);
  });

  it("rejects null", () => {
    expect(tcpaField.safeParse(null).success).toBe(false);
  });
});

// ─── heroLeadSchema ───────────────────────────────────────────────────────────

describe("heroLeadSchema", () => {
  const valid = {
    name: "John Smith",
    phone: "(800) 123-4567",
    location: "richmond" as const,
    tcpa: true as const,
  };

  it("accepts valid hero lead input", () => {
    expect(heroLeadSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing name", () => {
    const r = heroLeadSchema.safeParse({ ...valid, name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing phone", () => {
    const r = heroLeadSchema.safeParse({ ...valid, phone: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing tcpa", () => {
    const r = heroLeadSchema.safeParse({ ...valid, tcpa: false });
    expect(r.success).toBe(false);
  });

  it("normalizes phone on parse", () => {
    const r = heroLeadSchema.safeParse(valid);
    if (r.success) expect(r.data.phone).toBe("8001234567");
  });
});

// ─── shortHeroLeadSchema ──────────────────────────────────────────────────────

describe("shortHeroLeadSchema", () => {
  const valid = {
    phone: "(800) 123-4567",
    location: "newport-news" as const,
    tcpa: true as const,
  };

  it("accepts valid short hero lead input", () => {
    expect(shortHeroLeadSchema.safeParse(valid).success).toBe(true);
  });

  it("does not require name", () => {
    expect(shortHeroLeadSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid location", () => {
    const r = shortHeroLeadSchema.safeParse({ ...valid, location: "miami" });
    expect(r.success).toBe(false);
  });
});

// ─── confirmLeadSchema ────────────────────────────────────────────────────────

describe("confirmLeadSchema", () => {
  it("accepts empty object — all fields optional", () => {
    expect(confirmLeadSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid name", () => {
    expect(confirmLeadSchema.safeParse({ name: "Jane Doe" }).success).toBe(true);
  });

  it("rejects invalid email if provided", () => {
    expect(confirmLeadSchema.safeParse({ email: "notanemail" }).success).toBe(false);
  });

  it("accepts valid email if provided", () => {
    expect(confirmLeadSchema.safeParse({ email: "jane@example.com" }).success).toBe(true);
  });

  it("rejects invalid phone if provided", () => {
    expect(confirmLeadSchema.safeParse({ phone: "123" }).success).toBe(false);
  });
});
