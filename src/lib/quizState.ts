/**
 * Quiz state machine for /quiz. Persists to sessionStorage under `mwc_quiz_v1`.
 * Single source of truth for symptom answers, safety responses, contact info,
 * and computed scores used by /quiz/approved.
 */
import { useCallback, useEffect, useState } from "react";
import { CATEGORIES, ALL_SYMPTOM_IDS, type CategoryId } from "@/data/quizContent";

export type QuizAnswer = 0 | 1 | 2 | 3;
export type Tier = "None" | "Mild" | "Moderate" | "Severe";
type StepKey = 1 | 2 | 3 | "processing" | "finalizing" | "approved";

interface QuizState {
  symptoms: Record<string, QuizAnswer | null>;
  safetyConditions: string[];
  fullName: string;
  email: string;
  phone: string;
  state: string;
  consent: boolean;
  currentStep: StepKey;
  completed: boolean;
  disqualified: boolean;
  startedAt: string;
  completedAt?: string;
  totalScore: number;
  categoryScores: Record<CategoryId, { sum: number; tier: Tier }>;
}

const KEY = "mwc_quiz_v1";

const tierForSum = (sum: number): Tier =>
  sum === 0 ? "None" : sum <= 2 ? "Mild" : sum <= 5 ? "Moderate" : "Severe";

const emptySymptoms = (): Record<string, QuizAnswer | null> =>
  Object.fromEntries(ALL_SYMPTOM_IDS.map((id) => [id, null]));

const emptyCategoryScores = (): Record<CategoryId, { sum: number; tier: Tier }> =>
  Object.fromEntries(
    CATEGORIES.map((c) => [c.id, { sum: 0, tier: "None" as Tier }]),
  ) as Record<CategoryId, { sum: number; tier: Tier }>;

export const initialQuizState = (): QuizState => ({
  symptoms: emptySymptoms(),
  safetyConditions: [],
  fullName: "",
  email: "",
  phone: "",
  state: "",
  consent: false,
  currentStep: 1,
  completed: false,
  disqualified: false,
  startedAt: new Date().toISOString(),
  totalScore: 0,
  categoryScores: emptyCategoryScores(),
});

const read = (): QuizState => {
  if (typeof window === "undefined") return initialQuizState();
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return initialQuizState();
    const parsed = JSON.parse(raw) as Partial<QuizState>;
    return { ...initialQuizState(), ...parsed };
  } catch {
    return initialQuizState();
  }
};

const write = (s: QuizState) => {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
};

export const getQuizState = (): QuizState => read();

export const resetQuizState = () => {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
};

export const computeScores = (symptoms: Record<string, QuizAnswer | null>) => {
  const categoryScores = emptyCategoryScores();
  let total = 0;
  for (const cat of CATEGORIES) {
    let sum = 0;
    for (const s of cat.symptoms) {
      const v = symptoms[s.id];
      if (typeof v === "number") sum += v;
    }
    categoryScores[cat.id] = { sum, tier: tierForSum(sum) };
    total += sum;
  }
  return { totalScore: total, categoryScores };
};

/** Top N categories by sum (excludes zero scores). */
export const topCategories = (
  categoryScores: Record<CategoryId, { sum: number; tier: Tier }>,
  limit = 5,
) =>
  CATEGORIES
    .map((c) => ({ ...c, ...categoryScores[c.id] }))
    .filter((c) => c.sum > 0)
    .sort((a, b) => b.sum - a.sum)
    .slice(0, limit);

export interface UseQuizStateApi {
  state: QuizState;
  setSymptom: (id: string, value: QuizAnswer) => void;
  setSafetyConditions: (ids: string[]) => void;
  setContact: (patch: Partial<Pick<QuizState, "fullName"|"email"|"phone"|"state"|"consent">>) => void;
  setStep: (step: StepKey) => void;
  markCompleted: (disqualified: boolean) => void;
  reset: () => void;
}

export function useQuizState(): UseQuizStateApi {
  const [state, setState] = useState<QuizState>(() => read());

  useEffect(() => { write(state); }, [state]);

  const persist = useCallback((updater: (prev: QuizState) => QuizState) => {
    setState((prev) => {
      const next = updater(prev);
      const scored = computeScores(next.symptoms);
      return { ...next, totalScore: scored.totalScore, categoryScores: scored.categoryScores };
    });
  }, []);

  return {
    state,
    setSymptom: (id, value) =>
      persist((p) => ({ ...p, symptoms: { ...p.symptoms, [id]: value } })),
    setSafetyConditions: (ids) =>
      persist((p) => ({ ...p, safetyConditions: ids })),
    setContact: (patch) =>
      persist((p) => ({ ...p, ...patch })),
    setStep: (step) => persist((p) => ({ ...p, currentStep: step })),
    markCompleted: (disqualified) =>
      persist((p) => ({
        ...p,
        completed: true,
        disqualified,
        completedAt: new Date().toISOString(),
        currentStep: "approved",
      })),
    reset: () => {
      resetQuizState();
      setState(initialQuizState());
    },
  };
}
