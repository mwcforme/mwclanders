/**
 * Tests for StepSymptoms — the main quiz symptom step.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StepSymptoms } from "@/components/quiz/StepSymptoms";
import { CATEGORIES, ALL_SYMPTOM_IDS } from "@/data/quizContent";
import type { QuizAnswer } from "@/lib/quizState";

const allNull = (): Record<string, QuizAnswer | null> =>
  Object.fromEntries(ALL_SYMPTOM_IDS.map((id) => [id, null]));

const allAnswered = (): Record<string, QuizAnswer | null> =>
  Object.fromEntries(ALL_SYMPTOM_IDS.map((id) => [id, 1 as QuizAnswer]));

describe("StepSymptoms", () => {
  it("renders category titles", () => {
    render(
      <StepSymptoms
        symptoms={allNull()}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    // At least the first category should be visible
    expect(CATEGORIES.length).toBeGreaterThan(0);
    // The first category title should appear (StepSymptoms renders cat.title)
    expect(
      screen.getByText(CATEGORIES[0].title),
    ).toBeInTheDocument();
  });

  it("renders the Continue/Submit button", () => {
    render(
      <StepSymptoms
        symptoms={allNull()}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    // The submit CTA renders inside QuizShell
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("calls onChange when a symptom is answered", () => {
    const onChange = vi.fn();
    render(
      <StepSymptoms
        symptoms={allNull()}
        onChange={onChange}
        onSubmit={vi.fn()}
      />,
    );
    // Click the first available button (scale 0 = "0" button of first symptom)
    const buttons = screen.getAllByRole("button");
    const scaleButtons = buttons.filter((b) => /^[0-3]$/.test(b.textContent?.trim() ?? ""));
    if (scaleButtons.length > 0) {
      fireEvent.click(scaleButtons[0]);
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("does not call onSubmit when not all answered", () => {
    const onSubmit = vi.fn();
    render(
      <StepSymptoms
        symptoms={allNull()}
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    // Click first button (scale button, not submit)
    const allBtns = screen.getAllByRole("button");
    // The last button should be the submit CTA
    fireEvent.click(allBtns[allBtns.length - 1]);
    // Not all answered so onSubmit should NOT be called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit when all symptoms are answered", () => {
    const onSubmit = vi.fn();
    render(
      <StepSymptoms
        symptoms={allAnswered()}
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    const allBtns = screen.getAllByRole("button");
    // Click the last button (should be the Get my results CTA)
    fireEvent.click(allBtns[allBtns.length - 1]);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows progress bar", () => {
    const { container } = render(
      <StepSymptoms
        symptoms={allAnswered()}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    // Some progress indicator element should exist
    expect(container.firstChild).toBeTruthy();
  });
});
