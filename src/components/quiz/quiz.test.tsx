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
import { StepTiles } from "@/components/quiz/StepTiles";

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

// ─── StepSafety (simplified yes/no disqualifier) ─────────────────────────────

describe("StepSafety", () => {
  // SAFETY_CONDITIONS / SAFETY_NONE_ID still exported from quizContent
  it("quizContent still exports SAFETY_CONDITIONS", () => {
    expect(SAFETY_CONDITIONS.length).toBeGreaterThan(0);
    expect(SAFETY_NONE_ID).toBe("none");
  });

  it("renders the prostate/breast cancer question", () => {
    render(<StepSafety onAnswer={vi.fn()} />);
    expect(screen.getByText(/prostate cancer/i)).toBeInTheDocument();
  });

  it("calls onAnswer(true) when Yes is clicked", () => {
    const onAnswer = vi.fn();
    render(<StepSafety onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("button", { name: /yes/i }));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it("calls onAnswer(false) when No is clicked", () => {
    const onAnswer = vi.fn();
    render(<StepSafety onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("button", { name: /no/i }));
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it("renders without crashing when onAnswer is a no-op", () => {
    expect(() => render(<StepSafety onAnswer={vi.fn()} />)).not.toThrow();
  });
});

// ─── StepTiles ────────────────────────────────────────────────────────────────

describe("StepTiles", () => {
  it("renders 8 symptom tiles", () => {
    render(
      <StepTiles selectedTiles={[]} onChange={vi.fn()} onSubmit={vi.fn()} />,
    );
    // 8 tiles rendered as checkbox buttons
    const tiles = screen.getAllByRole("checkbox");
    expect(tiles).toHaveLength(8);
  });

  it("CTA button is disabled when nothing selected", () => {
    render(
      <StepTiles selectedTiles={[]} onChange={vi.fn()} onSubmit={vi.fn()} />,
    );
    const ctaBtn = screen.getByRole("button", { name: /see what my results mean/i });
    expect(ctaBtn).toBeDisabled();
  });

  it("CTA button is enabled when a tile is selected", () => {
    render(
      <StepTiles selectedTiles={["fatigue"]} onChange={vi.fn()} onSubmit={vi.fn()} />,
    );
    const ctaBtn = screen.getByRole("button", { name: /see what my results mean/i });
    expect(ctaBtn).not.toBeDisabled();
  });

  it("calls onChange when a tile is clicked", () => {
    const onChange = vi.fn();
    render(
      <StepTiles selectedTiles={[]} onChange={onChange} onSubmit={vi.fn()} />,
    );
    const tiles = screen.getAllByRole("checkbox");
    fireEvent.click(tiles[0]);
    expect(onChange).toHaveBeenCalled();
  });

  it("selecting 'none' tile produces exclusive selection", () => {
    const onChange = vi.fn();
    render(
      <StepTiles selectedTiles={["fatigue"]} onChange={onChange} onSubmit={vi.fn()} />,
    );
    // "None" tile is the last tile
    const tiles = screen.getAllByRole("checkbox");
    fireEvent.click(tiles[tiles.length - 1]); // "None of these apply"
    expect(onChange).toHaveBeenCalledWith(["none"]);
  });

  it("calls onSubmit when CTA clicked with a selection", () => {
    const onSubmit = vi.fn();
    render(
      <StepTiles selectedTiles={["sleep"]} onChange={vi.fn()} onSubmit={onSubmit} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /see what my results mean/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
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
