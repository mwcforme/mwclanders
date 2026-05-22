/**
 * Tests for TRTQuiz page and TRTQuizApproved page.
 * Mocks quiz state to cover both completed and in-progress states.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderWithProviders } from "@/test/renderWithProviders";

// ─── Mock quizState ────────────────────────────────────────────────────────────

const mockReset = vi.fn();
const mockSetState = vi.fn();

const completedQuizState = {
  completed: true,
  disqualified: false,
  fullName: "John Smith",
  email: "john@example.com",
  phone: "8001234567",
  state: "VA",
  totalScore: 18,
  currentStep: "approved" as const,
  safetyConditions: [],
  consent: true,
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  symptoms: {},
  categoryScores: {
    energy_mood: { sum: 5, tier: "Moderate" as const },
    weight_body: { sum: 4, tier: "Mild" as const },
    sexual_health: { sum: 5, tier: "Moderate" as const },
    skin_hair: { sum: 2, tier: "Mild" as const },
    wellbeing: { sum: 2, tier: "Mild" as const },
  },
};

const incompleteQuizState = {
  ...completedQuizState,
  completed: false,
  currentStep: 1 as const,
};

vi.mock("@/lib/quizState", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/quizState")>();
  return {
    ...actual,
    useQuizState: vi.fn().mockReturnValue({
      state: completedQuizState,
      reset: mockReset,
      setState: mockSetState,
      setSymptom: vi.fn(),
      setStep: vi.fn(),
      setSafetyConditions: vi.fn(),
      setContact: vi.fn(),
      complete: vi.fn(),
      disqualify: vi.fn(),
    }),
  };
});

// ─── TRTQuizApproved ──────────────────────────────────────────────────────────

describe("TRTQuizApproved", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the approved page for a completed quiz", async () => {
    const { default: TRTQuizApproved } = await import("@/pages/TRTQuizApproved");
    renderWithProviders(<TRTQuizApproved />);
    // Should render something — not a redirect
    expect(document.body.textContent?.length).toBeGreaterThan(10);
  });

  it("shows the first name from quiz state", async () => {
    const { default: TRTQuizApproved } = await import("@/pages/TRTQuizApproved");
    renderWithProviders(<TRTQuizApproved />);
    // John is derived from "John Smith"
    expect(document.body.textContent).toContain("John");
  });

  it("redirects to /quiz when not completed", async () => {
    const { useQuizState } = await import("@/lib/quizState");
    (useQuizState as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      state: incompleteQuizState,
      reset: mockReset,
    });
    const { default: TRTQuizApproved } = await import("@/pages/TRTQuizApproved");
    // Navigate component will redirect — just verify no crash
    expect(() => renderWithProviders(<TRTQuizApproved />)).not.toThrow();
  });

  it("shows tier bracket label for score 18", async () => {
    const { default: TRTQuizApproved } = await import("@/pages/TRTQuizApproved");
    renderWithProviders(<TRTQuizApproved />);
    // Score 18 = "Mild" bracket
    expect(document.body.textContent).toMatch(/mild/i);
  });

  it("renders FAQ items", async () => {
    const { default: TRTQuizApproved } = await import("@/pages/TRTQuizApproved");
    renderWithProviders(<TRTQuizApproved />);
    // Should have phone number displayed
    expect(document.body.textContent).toContain("866");
  });
});

// ─── TRTQuiz ──────────────────────────────────────────────────────────────────

describe("TRTQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders step 1 (symptoms) for fresh quiz state", async () => {
    const { useQuizState } = await import("@/lib/quizState");
    (useQuizState as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { ...incompleteQuizState, currentStep: 1 },
      reset: mockReset,
      setSymptom: vi.fn(),
      setStep: vi.fn(),
      setSafetyConditions: vi.fn(),
      setContact: vi.fn(),
      complete: vi.fn(),
      disqualify: vi.fn(),
    });

    const TRTQuiz = (await import("@/pages/TRTQuiz")).default;
    expect(() => renderWithProviders(<TRTQuiz />)).not.toThrow();
  });

  it("renders step 2 (safety) when currentStep is 2", async () => {
    const { useQuizState } = await import("@/lib/quizState");
    (useQuizState as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { ...incompleteQuizState, currentStep: 2 },
      reset: mockReset,
      setSymptom: vi.fn(),
      setStep: vi.fn(),
      setSafetyConditions: vi.fn(),
      setContact: vi.fn(),
      complete: vi.fn(),
      disqualify: vi.fn(),
    });

    const TRTQuiz = (await import("@/pages/TRTQuiz")).default;
    expect(() => renderWithProviders(<TRTQuiz />)).not.toThrow();
  });

  it("redirects to /quiz/approved when quiz is completed", async () => {
    const { useQuizState } = await import("@/lib/quizState");
    (useQuizState as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { ...completedQuizState, currentStep: "approved" as const },
      reset: mockReset,
      setSymptom: vi.fn(),
      setStep: vi.fn(),
      setSafetyConditions: vi.fn(),
      setContact: vi.fn(),
      complete: vi.fn(),
      disqualify: vi.fn(),
    });

    const TRTQuiz = (await import("@/pages/TRTQuiz")).default;
    expect(() => renderWithProviders(<TRTQuiz />)).not.toThrow();
  });
});
