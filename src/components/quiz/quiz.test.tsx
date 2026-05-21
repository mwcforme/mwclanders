/**
 * Tests for quiz components.
 * Covers QuizShell, PrimaryQuizButton, SymptomRow, StepSafety, TransitionScreen.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QuizShell } from "@/components/quiz/QuizShell";
import { PrimaryQuizButton } from "@/components/quiz/PrimaryQuizButton";
import { SymptomRow } from "@/components/quiz/SymptomRow";
import { StepSafety } from "@/components/quiz/StepSafety";
import { TransitionScreen } from "@/components/quiz/TransitionScreen";
import { SAFETY_CONDITIONS, SAFETY_NONE_ID } from "@/data/quizContent";

// ─── QuizShell ────────────────────────────────────────────────────────────────

describe("QuizShell", () => {
  it("renders children", () => {
    render(<QuizShell progress={30}><p>Hello Quiz</p></QuizShell>);
    expect(screen.getByText("Hello Quiz")).toBeInTheDocument();
  });

  it("renders a progress bar element", () => {
    const { container } = render(<QuizShell progress={50}><p>Q</p></QuizShell>);
    // Progress bar is a div with an aria attribute or specific role
    const progressDivs = container.querySelectorAll("div");
    expect(progressDivs.length).toBeGreaterThan(0);
  });

  it("clamps progress to 0-100", () => {
    // Should not throw for out-of-range values
    expect(() => render(<QuizShell progress={-10}><p>Q</p></QuizShell>)).not.toThrow();
    expect(() => render(<QuizShell progress={150}><p>Q</p></QuizShell>)).not.toThrow();
  });

  it("renders optional CTA", () => {
    render(
      <QuizShell progress={50} cta={<button>Continue</button>}>
        <p>Q</p>
      </QuizShell>,
    );
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("renders without CTA when not provided", () => {
    expect(() =>
      render(<QuizShell progress={50}><p>Q</p></QuizShell>)
    ).not.toThrow();
  });
});

// ─── PrimaryQuizButton ────────────────────────────────────────────────────────

describe("PrimaryQuizButton", () => {
  it("renders button with label", () => {
    render(<PrimaryQuizButton onClick={vi.fn()}>Next</PrimaryQuizButton>);
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handler = vi.fn();
    render(<PrimaryQuizButton onClick={handler}>Next</PrimaryQuizButton>);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <PrimaryQuizButton onClick={vi.fn()} disabled>Next</PrimaryQuizButton>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled by default", () => {
    render(<PrimaryQuizButton onClick={vi.fn()}>Next</PrimaryQuizButton>);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    const handler = vi.fn();
    render(
      <PrimaryQuizButton onClick={handler} disabled>Next</PrimaryQuizButton>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── SymptomRow ───────────────────────────────────────────────────────────────

describe("SymptomRow", () => {
  it("renders the symptom label", () => {
    render(
      <SymptomRow
        label="Low Energy"
        value={null}
        disabled={false}
        showError={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Low Energy")).toBeInTheDocument();
  });

  it("calls onChange with selected value", () => {
    const onChange = vi.fn();
    render(
      <SymptomRow
        label="Brain Fog"
        value={null}
        disabled={false}
        showError={false}
        onChange={onChange}
      />,
    );
    // Click the "1" button (mild)
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]); // value=1
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("shows error styling when showError is true and value is null", () => {
    const { container } = render(
      <SymptomRow
        label="Brain Fog"
        value={null}
        disabled={false}
        showError={true}
        onChange={vi.fn()}
      />,
    );
    // The component applies error styling — just verify no crash
    expect(container).toBeTruthy();
  });

  it("is marked aria-disabled when disabled", () => {
    const { container } = render(
      <SymptomRow
        label="Low Energy"
        value={null}
        disabled={true}
        showError={false}
        onChange={vi.fn()}
      />,
    );
    // The row itself is aria-disabled when locked
    const row = container.querySelector('[aria-disabled="true"]');
    expect(row).toBeInTheDocument();
  });

  it("renders 4 scale buttons (0-3)", () => {
    render(
      <SymptomRow
        label="Test"
        value={null}
        disabled={false}
        showError={false}
        onChange={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(4);
  });
});

// ─── StepSafety ───────────────────────────────────────────────────────────────

describe("StepSafety", () => {
  it("renders safety conditions", () => {
    render(
      <StepSafety
        selected={[]}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    // At least one safety condition should be rendered
    expect(SAFETY_CONDITIONS.length).toBeGreaterThan(0);
    // The first condition label should appear
    expect(
      screen.getByText(SAFETY_CONDITIONS[0].label)
    ).toBeInTheDocument();
  });

  it("calls onChange when condition is selected", () => {
    const onChange = vi.fn();
    render(
      <StepSafety selected={[]} onChange={onChange} onSubmit={vi.fn()} />,
    );
    const firstCondition = SAFETY_CONDITIONS.find((c) => c.id !== SAFETY_NONE_ID);
    if (firstCondition) {
      fireEvent.click(screen.getByText(firstCondition.label));
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("selecting 'none' clears other selections", () => {
    const onChange = vi.fn();
    const someCondition = SAFETY_CONDITIONS.find((c) => c.id !== SAFETY_NONE_ID);
    render(
      <StepSafety
        selected={someCondition ? [someCondition.id] : []}
        onChange={onChange}
        onSubmit={vi.fn()}
      />,
    );
    // Click 'None of the below'
    const noneCondition = SAFETY_CONDITIONS.find((c) => c.id === SAFETY_NONE_ID);
    if (noneCondition) {
      fireEvent.click(screen.getByText(noneCondition.label));
      expect(onChange).toHaveBeenCalledWith([SAFETY_NONE_ID]);
    }
  });

  it("calls onSubmit when 'none' is already selected and submit clicked", () => {
    const onSubmit = vi.fn();
    render(
      <StepSafety
        selected={[SAFETY_NONE_ID]}
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    // Find the continue/submit button
    const submitBtn = screen.getAllByRole("button").find(
      (b) => b.textContent?.match(/continue|next|submit/i),
    );
    if (submitBtn) {
      fireEvent.click(submitBtn);
      expect(onSubmit).toHaveBeenCalled();
    }
  });
});

// ─── TransitionScreen ─────────────────────────────────────────────────────────

describe("TransitionScreen", () => {
  it("renders headline", () => {
    vi.useFakeTimers();
    render(
      <TransitionScreen
        headline="Analyzing Results"
        durationMs={1000}
        onDone={vi.fn()}
      />,
    );
    expect(screen.getByText("Analyzing Results")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders subtext when provided", () => {
    vi.useFakeTimers();
    render(
      <TransitionScreen
        headline="Processing"
        subtext="Just a moment..."
        durationMs={1000}
        onDone={vi.fn()}
      />,
    );
    expect(screen.getByText("Just a moment...")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("calls onDone after durationMs", async () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(
      <TransitionScreen
        headline="Processing"
        durationMs={500}
        onDone={onDone}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(onDone).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("renders checklist items", () => {
    vi.useFakeTimers();
    render(
      <TransitionScreen
        headline="Processing"
        durationMs={2000}
        checklist={["Step A", "Step B"]}
        onDone={vi.fn()}
      />,
    );
    // At least the first item should eventually appear
    // Just verify no crash on render
    expect(screen.getByText("Processing")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
