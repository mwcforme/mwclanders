/**
 * Regression: quiz scoring + tier classification.
 * Pure functions, no React. Locks down the math behind /quiz/approved.
 */
import { describe, it, expect } from "vitest";
import { computeScores, topCategories, type QuizAnswer } from "@/lib/quizState";
import { CATEGORIES, ALL_SYMPTOM_IDS } from "@/data/quizContent";

const allNull = () =>
  Object.fromEntries(ALL_SYMPTOM_IDS.map((id) => [id, null])) as Record<string, QuizAnswer | null>;

describe("computeScores", () => {
  it("returns zero total and 'None' tier when no answers", () => {
    const r = computeScores(allNull());
    expect(r.totalScore).toBe(0);
    for (const c of CATEGORIES) {
      expect(r.categoryScores[c.id].sum).toBe(0);
      expect(r.categoryScores[c.id].tier).toBe("None");
    }
  });

  it("sums per-symptom answers within a category", () => {
    const cat = CATEGORIES[0];
    const symptoms = allNull();
    for (const s of cat.symptoms) symptoms[s.id] = 1;
    const r = computeScores(symptoms);
    expect(r.categoryScores[cat.id].sum).toBe(cat.symptoms.length);
    expect(r.totalScore).toBe(cat.symptoms.length);
  });

  it("classifies tiers: Mild <=2, Moderate <=5, Severe >5", () => {
    const cat = CATEGORIES[0];
    const symptoms = allNull();
    symptoms[cat.symptoms[0].id] = 2;
    expect(computeScores(symptoms).categoryScores[cat.id].tier).toBe("Mild");
    symptoms[cat.symptoms[1].id] = 3;
    expect(computeScores(symptoms).categoryScores[cat.id].tier).toBe("Moderate");
    symptoms[cat.symptoms[2].id] = 3;
    expect(computeScores(symptoms).categoryScores[cat.id].tier).toBe("Severe");
  });
});

describe("topCategories", () => {
  it("excludes zero-score categories and sorts by sum desc", () => {
    const symptoms = allNull();
    const c0 = CATEGORIES[0];
    const c1 = CATEGORIES[1];
    symptoms[c0.symptoms[0].id] = 1;
    symptoms[c1.symptoms[0].id] = 3;
    const { categoryScores } = computeScores(symptoms);
    const top = topCategories(categoryScores);
    expect(top.map((t) => t.id)).toEqual([c1.id, c0.id]);
    for (const t of top) expect(t.sum).toBeGreaterThan(0);
  });

  it("respects the limit argument", () => {
    const symptoms = allNull();
    for (const c of CATEGORIES) symptoms[c.symptoms[0].id] = 2;
    const { categoryScores } = computeScores(symptoms);
    expect(topCategories(categoryScores, 3)).toHaveLength(3);
  });
});
