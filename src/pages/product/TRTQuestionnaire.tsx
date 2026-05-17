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

const ORANGE  = "#E8670A";
const NAVY    = "#0B1029";
const TOTAL   = 17;

type Answer = string | string[] | number | undefined;

interface IntakeAnswers {
  age?: number;
  heightFt?: number;
  heightIn?: number;
  weight?: number;
  symptoms?: string[];
  symptomDuration?: string;
  testedBefore?: string;
  onMedications?: string;
  medicationList?: string;
  conditions?: string[];
  treatedBefore?: string;
  currentlyOnTRT?: string;
  smoke?: string;
  activityLevel?: string;
  energyRating?: number;
  sexHealthRating?: number;
  hasPCP?: string;
  additionalServices?: string[];
  providerNotes?: string;
}

const SYMPTOM_OPTIONS = [
  "Low energy", "Decreased libido", "Mood changes", "Poor sleep",
  "Reduced muscle mass", "Weight gain", "Brain fog", "Other",
];
const CONDITION_OPTIONS = [
  "Sleep apnea", "Prostate issues", "Heart disease", "Liver disease", "None of the above",
];
const SERVICE_OPTIONS = [
  "ED treatment", "Medical weight loss", "Both", "Just TRT",
];

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map((opt) => {
        const sel = value === opt;
        return (
          <label
            key={opt}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${sel ? ORANGE : "#E5E7EB"}`,
              background: sel ? "rgba(232,103,10,0.04)" : "#FAFAFA",
              transition: "all 150ms ease", userSelect: "none",
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={sel}
              onChange={() => onChange(opt)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            />
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${sel ? ORANGE : "#D0D5DD"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {sel && <div style={{ width: 10, height: 10, borderRadius: "50%", background: ORANGE }} />}
            </div>
            <span style={{ fontSize: 15, color: NAVY, fontWeight: sel ? 600 : 400 }}>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function CheckGroup({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((x) => x !== opt));
    else onChange([...values, opt]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map((opt) => {
        const sel = values.includes(opt);
        return (
          <label
            key={opt}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${sel ? ORANGE : "#E5E7EB"}`,
              background: sel ? "rgba(232,103,10,0.04)" : "#FAFAFA",
              transition: "all 150ms ease", userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={sel}
              onChange={() => toggle(opt)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            />
            <div style={{
              width: 20, height: 20, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${sel ? ORANGE : "#D0D5DD"}`,
              background: sel ? ORANGE : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 150ms ease, border-color 150ms ease",
            }}>
              {sel && (
                <svg viewBox="0 0 12 9" width={12} fill="none">
                  <polyline points="1,5 4,8 11,1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 15, color: NAVY, fontWeight: sel ? 600 : 400 }}>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function SliderInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "#6B7280" }}>1 — Poor</span>
        <span style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700,
          fontSize: 28, color: ORANGE,
        }}>
          {value}
        </span>
        <span style={{ fontSize: 13, color: "#6B7280" }}>10 — Excellent</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{
          width: "100%",
          accentColor: ORANGE,
          height: 8,
          cursor: "pointer",
        }}
      />
      <p style={{ textAlign: "center", marginTop: 8, fontSize: 14, color: NAVY, fontWeight: 600 }}>
        {label}: {value}/10
      </p>
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", height: 56, border: `1.5px solid #D0D5DD`,
        borderRadius: 8, padding: "0 16px", fontSize: 16,
        color: value ? NAVY : "#9CA3AF",
        fontFamily: "Inter, sans-serif",
        background: "#FFFFFF", outline: "none", cursor: "pointer",
        appearance: "none",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function TRTQuestionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<IntakeAnswers>({
    symptoms: [], conditions: [], additionalServices: [],
    energyRating: 5, sexHealthRating: 5,
    heightFt: 5, heightIn: 6,
  });

  const pct = (step / TOTAL) * 100;

  const set = <K extends keyof IntakeAnswers>(k: K, v: IntakeAnswers[K]) => {
    setAnswers((p) => ({ ...p, [k]: v }));
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return (answers.age ?? 0) >= 18 && (answers.age ?? 0) <= 99;
      case 2: return true;
      case 3: return (answers.weight ?? 0) >= 80 && (answers.weight ?? 0) <= 500;
      case 4: return (answers.symptoms?.length ?? 0) > 0;
      case 5: return !!answers.symptomDuration;
      case 6: return !!answers.testedBefore;
      case 7: return !!answers.onMedications;
      case 8: return (answers.conditions?.length ?? 0) > 0;
      case 9: return !!answers.treatedBefore;
      case 10: return !!answers.currentlyOnTRT;
      case 11: return !!answers.smoke;
      case 12: return !!answers.activityLevel;
      case 13: return true;
      case 14: return true;
      case 15: return !!answers.hasPCP;
      case 16: return (answers.additionalServices?.length ?? 0) > 0;
      case 17: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    window.sessionStorage.setItem("mwc_intake_v1", JSON.stringify(answers));
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
            <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 8 }}>lbs</p>
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
    fontSize: 13, color: "#9CA3AF", marginBottom: 16,
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: NAVY, marginBottom: 8, fontFamily: "Inter, sans-serif",
  };
  const numInputStyle: React.CSSProperties = {
    width: "100%", height: 56, border: `1.5px solid #D0D5DD`,
    borderRadius: 8, padding: "0 16px", fontSize: 20,
    color: NAVY, fontFamily: "Oswald, sans-serif", fontWeight: 600,
    background: "#FFFFFF", outline: "none",
    boxSizing: "border-box",
  };
  const textareaStyle: React.CSSProperties = {
    width: "100%", border: `1.5px solid #D0D5DD`,
    borderRadius: 8, padding: "12px 16px", fontSize: 16,
    color: NAVY, fontFamily: "Inter, sans-serif",
    background: "#FFFFFF", outline: "none", resize: "vertical",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
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
                Step {step} of {TOTAL}
              </span>
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>
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
            background: "#FFFFFF",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(11,16,41,0.10)",
            padding: "32px 28px",
            marginBottom: 20,
            fontFamily: "Inter, sans-serif",
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
                background: canAdvance() ? ORANGE : "#E5E7EB",
                color: canAdvance() ? "#FFFFFF" : "#9CA3AF",
                border: "none",
                fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 16,
                letterSpacing: "0.04em", textTransform: "uppercase",
                cursor: canAdvance() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 150ms ease, color 150ms ease",
                boxShadow: canAdvance() ? "0 4px 16px rgba(232,103,10,0.30)" : "none",
              }}
            >
              {step === TOTAL ? "Submit" : "Next"} <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}
