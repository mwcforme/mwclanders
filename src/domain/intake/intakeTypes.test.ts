/**
 * Regression: TRT intake step validation.
 * Pure function, no React. Locks down canAdvance logic extracted from TRTQuestionnaire.
 */
import { describe, it, expect } from "vitest";
import { isStepValid, type IntakeAnswers } from "@/domain/intake/intakeTypes";

const empty: IntakeAnswers = {};

describe("isStepValid", () => {
  it("step 1 rejects empty age", () => {
    expect(isStepValid(1, empty)).toBe(false);
  });

  it("step 1 accepts age 30", () => {
    expect(isStepValid(1, { age: 30 })).toBe(true);
  });

  it("step 1 rejects age 17 (under 18)", () => {
    expect(isStepValid(1, { age: 17 })).toBe(false);
  });

  it("step 1 rejects age 100 (over 99)", () => {
    expect(isStepValid(1, { age: 100 })).toBe(false);
  });

  it("step 2 always valid (informational step)", () => {
    expect(isStepValid(2, empty)).toBe(true);
  });

  it("step 3 rejects weight 0", () => {
    expect(isStepValid(3, empty)).toBe(false);
  });

  it("step 3 accepts weight 180", () => {
    expect(isStepValid(3, { weight: 180 })).toBe(true);
  });

  it("step 3 rejects weight 79 (too low)", () => {
    expect(isStepValid(3, { weight: 79 })).toBe(false);
  });

  it("step 4 rejects empty symptoms array", () => {
    expect(isStepValid(4, { symptoms: [] })).toBe(false);
  });

  it("step 4 accepts non-empty symptoms", () => {
    expect(isStepValid(4, { symptoms: ["Low energy"] })).toBe(true);
  });

  it("step 5 requires symptomDuration", () => {
    expect(isStepValid(5, empty)).toBe(false);
    expect(isStepValid(5, { symptomDuration: "6+ months" })).toBe(true);
  });

  it("step 8 rejects empty conditions", () => {
    expect(isStepValid(8, { conditions: [] })).toBe(false);
    expect(isStepValid(8, { conditions: ["None of the above"] })).toBe(true);
  });

  it("step 13 always valid (slider — has default)", () => {
    expect(isStepValid(13, empty)).toBe(true);
  });

  it("step 16 requires at least one additionalService", () => {
    expect(isStepValid(16, { additionalServices: [] })).toBe(false);
    expect(isStepValid(16, { additionalServices: ["Just TRT"] })).toBe(true);
  });

  it("step 17 always valid (review step)", () => {
    expect(isStepValid(17, empty)).toBe(true);
  });

  it("unknown step returns false", () => {
    expect(isStepValid(99, empty)).toBe(false);
  });
});
