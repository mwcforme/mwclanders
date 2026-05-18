/**
 * /product/trt/questionnaire — 17-step medical intake
 * Step 3 of the 10-step TRT funnel.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { contactUpdater } from "@/services/contactUpdater";
import {
  RadioGroup, CheckGroup, SliderInput, SelectInput,
} from "@/components/product/IntakeFormHelpers";
import {
  type IntakeAnswers,
  INTAKE_DEFAULTS, INTAKE_TOTAL_STEPS,
  SYMPTOM_OPTIONS, CONDITION_OPTIONS, SERVICE_OPTIONS,
  isStepValid,
} from "@/domain/intake/intakeTypes";

const ORANGE = "var(--brand-cta)";
const NAVY   = "var(--brand-navy-deep)";

export default function TRTQuestionnaire() {
  const navigate   = useNavigate();
  const identity   = useBookingStore((s) => s.identity);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<IntakeAnswers>(INTAKE_DEFAULTS);

  const pct = (step / INTAKE_TOTAL_STEPS) * 100;

  const set = <K extends keyof IntakeAnswers>(k: K, v: IntakeAnswers[K]) => {
    setAnswers((p) => ({ ...p, [k]: v }));
  };

  const canAdvance = () => isStepValid(step, answers);

  const handleNext = () => {
    if (step < INTAKE_TOTAL_STEPS) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    window.sessionStorage.setItem("mwc_intake_v1", JSON.stringify(answers));

    // Send intake data to GHL — fire-and-forget
    const contactId = identity?.ghlContactId;
    if (contactId) {
      contactUpdater.updateContact(contactId, {
        customFields: { mwc_intake_notes: JSON.stringify(answers) },
      }).catch(() => {});
      contactUpdater.addTag(contactId, "questionnaire-complete").catch(() => {});
    }

    navigate("/product/trt/identity-verification");
  };

  const renderQuestion = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 style={qStyle}>What is your age?</h2>
            <input
              type="number"
              min={18}
              max={99}
              value={answers.age ?? ""}
              onChange={(e) => set("age", Number(e.target.value))}
              placeholder="e.g. 42"
              style={numInputStyle}
              aria-label="Age in years"
            />
          </>
        );
      case 2:
        return (
          <>
            <h2 style={qStyle}>What is your height?</h2>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Feet</label>
                <SelectInput
                  value={String(answers.heightFt ?? 5)}
                  onChange={(v) => set("heightFt", Number(v))}
                  options={["4", "5", "6", "7"]}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Inches</label>
                <SelectInput
                  value={String(answers.heightIn ?? 6)}
                  onChange={(v) => set("heightIn", Number(v))}
                  options={["0","1","2","3","4","5","6","7","8","9","10","11"]}
                />
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 style={qStyle}>What is your weight?</h2>
            <input
              type="number"
              min={80}
              max={500}
              value={answers.weight ?? ""}
              onChange={(e) => set("weight", Number(e.target.value))}
              placeholder="e.g. 185"
              style={numInputStyle}
              aria-label="Weight in pounds"
            />
            <p style={{ color: "var(--c-placeholder-light)", fontSize: 13, marginTop: 8 }}>lbs</p>
          </>
        );
      case 4:
        return (
          <>
            <h2 style={qStyle}>Which of the following best describes your current symptoms?</h2>
            <p style={subStyle}>Select all that apply</p>
            <CheckGroup
              options={SYMPTOM_OPTIONS}
              values={answers.symptoms ?? []}
              onChange={(v) => set("symptoms", v)}
            />
          </>
        );
      case 5:
        return (
          <>
            <h2 style={qStyle}>How long have you experienced these symptoms?</h2>
            <RadioGroup
              name="symptomDuration"
              options={["Less than 6 months", "6-12 months", "1-2 years", "More than 2 years"]}
              value={answers.symptomDuration ?? ""}
              onChange={(v) => set("symptomDuration", v)}
            />
          </>
        );
      case 6:
        return (
          <>
            <h2 style={qStyle}>Have you ever had your testosterone levels tested?</h2>
            <RadioGroup
              name="testedBefore"
              options={["Yes", "No", "Not sure"]}
              value={answers.testedBefore ?? ""}
              onChange={(v) => set("testedBefore", v)}
            />
          </>
        );
      case 7:
        return (
          <>
            <h2 style={qStyle}>Are you currently on any medications?</h2>
            <RadioGroup
              name="onMedications"
              options={["Yes", "No"]}
              value={answers.onMedications ?? ""}
              onChange={(v) => set("onMedications", v)}
            />
            {answers.onMedications === "Yes" && (
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Please list your medications</label>
                <textarea
                  rows={3}
                  value={answers.medicationList ?? ""}
                  onChange={(e) => set("medicationList", e.target.value)}
                  placeholder="e.g. Metformin, Lisinopril..."
                  style={textareaStyle}
                />
              </div>
            )}
          </>
        );
      case 8:
        return (
          <>
            <h2 style={qStyle}>Do you have any of the following conditions?</h2>
            <p style={subStyle}>Select all that apply</p>
            <CheckGroup
              options={CONDITION_OPTIONS}
              values={answers.conditions ?? []}
              onChange={(v) => set("conditions", v)}
            />
          </>
        );
      case 9:
        return (
          <>
            <h2 style={qStyle}>Have you ever been treated for low testosterone before?</h2>
            <RadioGroup
              name="treatedBefore"
              options={["Yes", "No"]}
              value={answers.treatedBefore ?? ""}
              onChange={(v) => set("treatedBefore", v)}
            />
          </>
        );
      case 10:
        return (
          <>
            <h2 style={qStyle}>Are you currently using testosterone or any hormone therapy?</h2>
            <RadioGroup
              name="currentlyOnTRT"
              options={["Yes", "No"]}
              value={answers.currentlyOnTRT ?? ""}
              onChange={(v) => set("currentlyOnTRT", v)}
            />
          </>
        );
      case 11:
        return (
          <>
            <h2 style={qStyle}>Do you smoke or use tobacco products?</h2>
            <RadioGroup
              name="smoke"
              options={["Yes", "No", "Former smoker"]}
              value={answers.smoke ?? ""}
              onChange={(v) => set("smoke", v)}
            />
          </>
        );
      case 12:
        return (
          <>
            <h2 style={qStyle}>How would you describe your current activity level?</h2>
            <RadioGroup
              name="activityLevel"
              options={["Sedentary", "Lightly active", "Moderately active", "Very active"]}
              value={answers.activityLevel ?? ""}
              onChange={(v) => set("activityLevel", v)}
            />
          </>
        );
      case 13:
        return (
          <>
            <h2 style={qStyle}>How would you rate your current energy level?</h2>
            <SliderInput
              value={answers.energyRating ?? 5}
              onChange={(v) => set("energyRating", v)}
              label="Energy level"
            />
          </>
        );
      case 14:
        return (
          <>
            <h2 style={qStyle}>How would you rate your current sexual health?</h2>
            <SliderInput
              value={answers.sexHealthRating ?? 5}
              onChange={(v) => set("sexHealthRating", v)}
              label="Sexual health"
            />
          </>
        );
      case 15:
        return (
          <>
            <h2 style={qStyle}>Do you have a primary care provider?</h2>
            <RadioGroup
              name="hasPCP"
              options={["Yes", "No"]}
              value={answers.hasPCP ?? ""}
              onChange={(v) => set("hasPCP", v)}
            />
          </>
        );
      case 16:
        return (
          <>
            <h2 style={qStyle}>Are you interested in any of the following additional services?</h2>
            <p style={subStyle}>Select all that apply</p>
            <CheckGroup
              options={SERVICE_OPTIONS}
              values={answers.additionalServices ?? []}
              onChange={(v) => set("additionalServices", v)}
            />
          </>
        );
      case 17:
        return (
          <>
            <h2 style={qStyle}>Anything else you'd like your provider to know?</h2>
            <p style={subStyle}>Optional</p>
            <textarea
              rows={5}
              value={answers.providerNotes ?? ""}
              onChange={(e) => set("providerNotes", e.target.value)}
              placeholder="Share anything that might help your provider..."
              style={textareaStyle}
            />
          </>
        );
      default:
        return null;
    }
  };

  const qStyle: React.CSSProperties = {
    fontFamily: "Oswald, sans-serif",
    fontWeight: 700,
    fontSize: "clamp(18px, 3.5vw, 24px)",
    color: NAVY,
    lineHeight: 1.2,
    marginBottom: 8,
  };
  const subStyle: React.CSSProperties = {
    fontSize: 13, color: "var(--c-placeholder-light)", marginBottom: 16,
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: NAVY, marginBottom: 8, fontFamily: "Inter, sans-serif",
  };
  const numInputStyle: React.CSSProperties = {
    width: "100%", height: 56, border: `1.5px solid #D0D5DD`,
    borderRadius: 8, padding: "0 16px", fontSize: 20,
    color: NAVY, fontFamily: "Oswald, sans-serif", fontWeight: 600,
    background: "var(--bg-white)", outline: "none",
    boxSizing: "border-box",
  };
  const textareaStyle: React.CSSProperties = {
    width: "100%", border: `1.5px solid #D0D5DD`,
    borderRadius: 8, padding: "12px 16px", fontSize: 16,
    color: NAVY, fontFamily: "Inter, sans-serif",
    background: "var(--bg-white)", outline: "none", resize: "vertical",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-white)" }}>
      <SEO
        title="Medical Intake | Men's Wellness Centers"
        description="Complete your 17-step medical intake for your testosterone consultation."
      />
      <TRTHeader minimal />

      <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "80px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 600 }}>

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, fontFamily: "Inter, sans-serif" }}>
                Question {step} of {TOTAL}
              </span>
              <span style={{ fontSize: 13, color: "var(--c-placeholder-light)" }}>
                {Math.round(pct)}% complete
              </span>
            </div>
            <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: ORANGE,
                borderRadius: 3,
                transition: "width 300ms ease",
              }} />
            </div>
          </div>

          {/* Question card */}
          <div style={{
            background: "var(--bg-white)",
            borderRadius: 16,
            // hardcoded-color-allow-next-line
            boxShadow: "0 8px 40px rgba(11,16,41,0.10)",
            padding: "32px 28px",
            marginBottom: 20,
            fontFamily: "Inter, sans-serif",
            minHeight: 240,
          }}>
            {renderQuestion()}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12 }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                style={{
                  flex: 1, height: 52, borderRadius: 999,
                  // hardcoded-color-allow-next-line
                  background: "#F9FAFB", color: NAVY, border: "1.5px solid #E5E7EB",
                  fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 15,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <ArrowLeft size={16} strokeWidth={2.5} /> Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance()}
              style={{
                flex: 2, height: 52, borderRadius: 999,
                // hardcoded-color-allow-next-line
                background: canAdvance() ? ORANGE : "#E5E7EB",
                // hardcoded-color-allow-next-line
                color: canAdvance() ? "var(--c-text-on-dark)" : "#636B80",
                border: "none",
                fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 16,
                letterSpacing: "0.04em", textTransform: "uppercase",
                cursor: canAdvance() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 150ms ease, color 150ms ease",
                // hardcoded-color-allow-next-line
                boxShadow: canAdvance() ? "0 4px 16px rgba(232,103,10,0.30)" : "none",
              }}
            >
              {step === INTAKE_TOTAL_STEPS ? "Submit" : "Next"} <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}
