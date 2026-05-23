import { useCallback, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useQuizState } from "@/lib/quizState";
import { StepTiles } from "@/components/quiz/StepTiles";
import { StepSafety } from "@/components/quiz/StepSafety";
import { StepLead } from "@/components/quiz/StepLead";
import { TransitionScreen } from "@/components/quiz/TransitionScreen";

const tierBracketLabel = (total: number) =>
  total <= 9 ? "Minimal" : total <= 19 ? "Mild" : total <= 29 ? "Moderate" : "Severe";

const buildLeadTags = (
  totalScore: number,
  bracket: string,
  disqualified: boolean,
  tiles: string[],
): string[] => {
  const out: string[] = [
    `quiz_score:${totalScore}`,
    `quiz_bracket:${bracket.toLowerCase()}`,
    "quiz_v2",
  ];
  tiles.filter((t) => t !== "none").forEach((t) => out.push(`symptom:${t}`));
  if (disqualified) out.push("needs_in_person_clearance");
  return out;
};

const buildLeadNote = (
  totalScore: number,
  bracket: string,
  tiles: string[],
  disqualified: boolean,
): string => {
  const lines: string[] = [];
  lines.push(`TRT Quiz v2 (3-step) . Score ${totalScore} (${bracket})`);
  if (disqualified) lines.push("FLAG: prostate/breast cancer history — requires provider review.");
  lines.push("");
  const selected = tiles.filter((t) => t !== "none");
  if (selected.length > 0) {
    lines.push("Selected symptoms: " + selected.join(", "));
  } else {
    lines.push("No symptoms selected (chose 'None of these apply').");
  }
  return lines.join("\n");
};

/**
 * /quiz — 3-step CRO funnel.
 * Step 1: 8 symptom tiles (StepTiles)
 * Step 2: single yes/no cancer history question (StepSafety)
 * Step 3: lead form (StepLead)
 * → processing transition → /quiz/approved
 */
export default function TRTQuiz() {
  const navigate = useNavigate();
  const {
    state, setSelectedTiles, setHasContraindication, setContact, setStep, markCompleted,
  } = useQuizState();

  // Scroll to top on every step change.
  const advanceStep = useCallback(
    (step: Parameters<typeof setStep>[0]) => {
      window.scrollTo({ top: 0, behavior: "instant" });
      setStep(step);
    },
    [setStep],
  );

  // Reset to step 1 if state is in a stale approved state.
  useEffect(() => {
    if (state.currentStep === "approved" && !state.completed) advanceStep(1);
  }, [state.currentStep, state.completed, advanceStep]);

  // After completion, redirect to approved page.
  if (state.completed) return <Navigate to="/quiz/approved" replace />;

  const totalScore = state.totalScore;
  const bracket = tierBracketLabel(totalScore);
  const selectedTiles = state.selectedTiles ?? [];

  // ─── Step handlers ──────────────────────────────────────────────────────────

  const handleStep1Submit = () => advanceStep("processing");

  const handleStep2Answer = (hasContraindication: boolean) => {
    setHasContraindication(hasContraindication);
    advanceStep(3);
  };

  const handleStep3Submitted = () => {
    const dq = state.hasContraindication === true;
    markCompleted(dq);
    advanceStep("finalizing");
  };

  return (
    <>
      <SEO
        title="No-Cost TRT Assessment . 3 Quick Questions . MWC"
        description="Take our 3-question testosterone assessment. See your results and book a face-to-face evaluation with a Virginia provider — no cost, no commitment."
      />

      {/* Step 1 — Symptom tiles */}
      {state.currentStep === 1 ? (
        <StepTiles
          selectedTiles={selectedTiles}
          onChange={setSelectedTiles}
          onSubmit={handleStep1Submit}
        />
      ) : null}

      {/* Processing transition */}
      {state.currentStep === "processing" ? (
        <TransitionScreen
          headline="Analyzing your results"
          subtext="Matching symptoms to clinical patterns."
          durationMs={2000}
          onDone={() => advanceStep(2)}
        />
      ) : null}

      {/* Step 2 — Single yes/no disqualifier */}
      {state.currentStep === 2 ? (
        <StepSafety onAnswer={handleStep2Answer} />
      ) : null}

      {/* Step 3 — Lead form */}
      {state.currentStep === 3 ? (() => {
        const dq = state.hasContraindication === true;
        const tags = buildLeadTags(totalScore, bracket, dq, selectedTiles);
        const note = buildLeadNote(totalScore, bracket, selectedTiles, dq);
        return (
          <StepLead
            initial={{
              fullName: state.fullName,
              email: state.email,
              phone: state.phone,
              location: state.location ?? "",
              consent: state.consent,
            }}
            totalScore={totalScore}
            bracket={bracket}
            disqualified={dq}
            tags={tags}
            noteBody={note}
            onCapture={(patch) => setContact(patch)}
            onSubmitted={handleStep3Submitted}
          />
        );
      })() : null}

      {/* Finalizing transition */}
      {state.currentStep === "finalizing" ? (
        <TransitionScreen
          headline="Finalizing your results"
          durationMs={3500}
          withProgressBar
          checklist={[
            "Confirming clinical eligibility",
            "Analyzing your symptom pattern",
            "Preparing your personalized report",
          ]}
          onDone={() => navigate("/quiz/approved", { replace: true })}
        />
      ) : null}
    </>
  );
}
