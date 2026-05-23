/**
 * Quiz state machine for /quiz. Persists to sessionStorage under `mwc_quiz_v2`.
 * Simplified 3-step funnel: 8 symptom tiles → 1 yes/no → lead form → approved.
 *
 * Legacy exports (computeScores, topCategories, QuizAnswer, Tier) retained for
 * backward compat with TRTQuizApproved and existing tests.
 */
import { useCallback, useEffect, useState } from "react";
import { CATEGORIES, type CategoryId, type QuizTileId } from "@/data/quizContent";

// ─── Legacy types (kept for TRTQuizApproved + quizState.test.ts) ─────────────

export type QuizAnswer = 0 | 1 | 2 | 3;
export type Tier = "None" | "Mild" | "Moderate" | "Severe";

export type StepKey = 1 | 2 | 3 | "processing" | "finalizing" | "approved" | "disqualified";

// ─── State ────────────────────────────────────────────────────────────────────

interface QuizState {
  /** Step 1: which symptom tiles were selected */
  selectedTiles: QuizTileId[];
  /** Step 2: yes/no cancer history disqualifier */
  hasContraindication: boolean | null;
  /** Lead fields */
  fullName: string;
  email: string;
  phone: string;
  consent: boolean;
  /** Navigation */
  currentStep: StepKey;
  completed: boolean;
  disqualified: boolean;
  startedAt: string;
  completedAt?: string;
  /** Score (tile count * 3) — kept for TRTQuizApproved display */
  totalScore: number;
  /** Category scores — kept for TRTQuizApproved Section3Symptoms (will be empty) */
  categoryScores: Record<CategoryId, { sum: number; tier: Tier }>;
}

const KEY = "mwc_quiz_v2";

// ─── Legacy helpers (retained for quizState.test.ts + TRTQuizApproved) ───────

const tierForSum = (sum: number): Tier =>
  sum === 0 ? "None" : sum <= 2 ? "Mild" : sum <= 5 ? "Moderate" : "Severe";

const emptyCategoryScores = (): Record<CategoryId, { sum: number; tier: Tier }> =>
  Object.fromEntries(
    CATEGORIES.map((c) => [c.id, { sum: 0, tier: "None" as Tier }]),
  ) as Record<CategoryId, { sum: number; tier: Tier }>;

/** Compute category and total scores from a per-symptom answers map (legacy). */
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

// ─── State helpers ────────────────────────────────────────────────────────────

export const initialQuizState = (): QuizState => ({
  selectedTiles: [],
  hasContraindication: null,
  fullName: "",
  email: "",
  phone: "",
  consent: false,
  currentStep: 1,
  completed: false,
  disqualified: false,
  startedAt: new Date().toISOString(),
  totalScore: 0,
  categoryScores: emptyCategoryScores(),
});

const readState = (): QuizState => {
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

const writeState = (s: QuizState) => {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
};

export const getQuizState = (): QuizState => readState();

export const resetQuizState = () => {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
};

/** Derive totalScore from tile selections (tile count * 3, "none" excluded). */
const scoreFromTiles = (tiles: QuizTileId[]): number =>
  tiles.filter((t) => t !== "none").length * 3;

// ─── Hook API ─────────────────────────────────────────────────────────────────

export interface UseQuizStateApi {
  state: QuizState;
  setSelectedTiles: (tiles: QuizTileId[]) => void;
  setHasContraindication: (v: boolean) => void;
  setContact: (patch: Partial<Pick<QuizState, "fullName" | "email" | "phone" | "consent">>) => void;
  setStep: (step: StepKey) => void;
  markCompleted: (disqualified: boolean) => void;
  reset: () => void;
}

export function useQuizState(): UseQuizStateApi {
  const [state, setState] = useState<QuizState>(() => readState());

  useEffect(() => { writeState(state); }, [state]);

  const persist = useCallback((updater: (prev: QuizState) => QuizState) => {
    setState((prev) => updater(prev));
  }, []);

  return {
    state,
    setSelectedTiles: (tiles) =>
      persist((p) => ({ ...p, selectedTiles: tiles, totalScore: scoreFromTiles(tiles) })),
    setHasContraindication: (v) =>
      persist((p) => ({ ...p, hasContraindication: v })),
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
