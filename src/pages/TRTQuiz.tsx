import { useCallback, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useQuizState, computeScores, type Tier } from "@/lib/quizState";
import { CATEGORIES } from "@/data/quizContent";
import { StepSymptoms } from "@/components/quiz/StepSymptoms";
import { StepSafety } from "@/components/quiz/StepSafety";
import { StepLead } from "@/components/quiz/StepLead";
import { TransitionScreen } from "@/components/quiz/TransitionScreen";

const tierBracketLabel = (total: number) =>
  total <= 9 ? "Minimal" : total <= 19 ? "Mild" : total <= 29 ? "Moderate" : "Severe";

const buildLeadTags = (
  totalScore: number,
  bracket: string,
  catScores: Record<string, { sum: number; tier: Tier }>,
  disqualified: boolean,
  safety: string[],
): string[] => {
  const out: string[] = [
    `quiz_score:${totalScore}`,
    `quiz_bracket:${bracket.toLowerCase()}`,
    "quiz_v2",
  ];
  Object.entries(catScores).forEach(([id, v]) => {
    if (v.tier !== "None") out.push(`quiz_${id}:${v.tier.toLowerCase()}`);
  });
  if (disqualified) out.push("needs_in_person_clearance");
  safety.forEach((s) => out.push(`safety:${s}`));
  return out;
};

const buildLeadNote = (
  totalScore: number,
  bracket: string,
  catScores: Record<string, { sum: number; tier: Tier }>,
  symptoms: Record<string, number | null>,
  safety: string[],
  disqualified: boolean,
): string => {
  const lines: string[] = [];
  lines.push(`TRT Quiz v2 . Total ${totalScore}/69 (${bracket})`);
  if (disqualified) lines.push("FLAG: medical safety check requires in-person clearance.");
  lines.push("");
  lines.push("Category tiers:");
  CATEGORIES.forEach((c) => {
    const v = catScores[c.id];
    if (v && v.sum > 0) lines.push(`. ${c.shortLabel}: ${v.sum} (${v.tier})`);
  });
  lines.push("");
  lines.push("Top symptom scores:");
  CATEGORIES.forEach((c) => {
    c.symptoms.forEach((s) => {
      const v = symptoms[s.id];
      if (typeof v === "number" && v > 0) lines.push(`. ${s.label}: ${v}`);
    });
  });
  lines.push("");
  lines.push(`Safety check: ${safety.length ? safety.join(", ") : "none"}`);
  return lines.join("\n");
};

/**
 * /quiz multi-step funnel. Renders the active step based on `currentStep` in
 * sessionStorage, or auto-redirects to /quiz/approved if completed.
 */
export default function TRTQuiz() {
  const navigate = useNavigate();
  const { state, setSymptom, setSafetyConditions, setContact, setStep, markCompleted } = useQuizState();

  // Scroll to top on every step change.
  const advanceStep = useCallback(
    (step: Parameters<typeof setStep>[0]) => {
      window.scrollTo({ top: 0, behavior: "instant" });
      setStep(step);
    },
    [setStep],
  );

  // Reset to step 1 if state is in a transition phase from a stale session.
  useEffect(() => {
    if (state.currentStep === "approved" && !state.completed) advanceStep(1);
  }, [state.currentStep, state.completed, advanceStep]);

  // After completion, /quiz redirects to /quiz/approved (mirrors Titan).
  if (state.completed) return <Navigate to="/quiz/approved" replace />;

  const totalScore = state.totalScore;
  const bracket = tierBracketLabel(totalScore);

  const handleStep1Submit = () => advanceStep("processing");

  const handleStep2Submit = () => {
    const dq = state.safetyConditions.some((id) => id !== "none");
    setContact({}); // touch persistence
    advanceStep(3);
    // store disqualified flag inline by markCompleted call later
    void dq; // captured inline at submit
  };

  const handleStep3Submitted = () => {
    const dq = state.safetyConditions.some((id) => id !== "none");
    markCompleted(dq);
    advanceStep("finalizing");
  };

  return (
    <>
      <SEO
        title="No-Cost TRT Assessment . 60-Second Symptom Quiz . MWC"
        description="Take our 60-second testosterone assessment. Score your symptoms, see your tier, and book a face-to-face evaluation with a Virginia provider."
      />

      {state.currentStep === 1 ? (
        <StepSymptoms
          symptoms={state.symptoms}
          onChange={setSymptom}
          onSubmit={handleStep1Submit}
        />
      ) : null}

      {state.currentStep === "processing" ? (
        <TransitionScreen
          headline="Analyzing my assessment"
          subtext="Mapping symptoms to clinical patterns."
          durationMs={2500}
          onDone={() => advanceStep(2)}
        />
      ) : null}

      {state.currentStep === 2 ? (
        <StepSafety
          selected={state.safetyConditions}
          onChange={setSafetyConditions}
          onSubmit={handleStep2Submit}
        />
      ) : null}

      {state.currentStep === 3 ? (() => {
        const scored = computeScores(state.symptoms);
        const dq = state.safetyConditions.some((id) => id !== "none");
        const tags = buildLeadTags(scored.totalScore, bracket, scored.categoryScores, dq, state.safetyConditions);
        const note = buildLeadNote(scored.totalScore, bracket, scored.categoryScores, state.symptoms, state.safetyConditions, dq);
        return (
          <StepLead
            initial={{
              fullName: state.fullName, email: state.email, phone: state.phone,
              state: state.state, consent: state.consent,
            }}
            totalScore={scored.totalScore}
            bracket={bracket}
            disqualified={dq}
            tags={tags}
            noteBody={note}
            onCapture={(patch) => setContact(patch)}
            onSubmitted={handleStep3Submitted}
          />
        );
      })() : null}

      {state.currentStep === "finalizing" ? (
        <TransitionScreen
          headline="Finalizing my results"
          durationMs={4000}
          withProgressBar
          checklist={[
            "Confirming clinical eligibility",
            "Analyzing symptom patterns",
            "Preparing my personalized report",
          ]}
          onDone={() => navigate("/quiz/approved", { replace: true })}
        />
      ) : null}
    </>
  );
}
