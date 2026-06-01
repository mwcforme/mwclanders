/**
 * /short-quiz — Keeps-style 60-second TRT symptom assessment.
 * 7 categories, 22 symptoms scored 0-3 (None/Mild/Moderate/Severe).
 * Single long-scroll page → score → lead capture → /short-quiz/approved.
 */
import { lazy, useState, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Loader2 } from "lucide-react";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { nameField, phoneField, tcpaField } from "@/domain/leads/leadFormSchema";
import { m } from "@/lib/miniSchema";
import { LocationSelector } from "@/components/landing/trt/LocationSelector";
import type { LocationKey } from "@/data/croContent";

// ─── Data ────────────────────────────────────────────────────────────────────

interface SQSymptom { id: string; label: string; }
interface SQCategory { title: string; description: string; symptoms: SQSymptom[]; }

const CATEGORIES: SQCategory[] = [
  {
    title: "Low Energy / Mood / Cognitive Function",
    description: "These symptoms are often the first sign of changing testosterone levels.",
    symptoms: [
      { id: "fatigue",     label: "Fatigue" },
      { id: "depression",  label: "Depression" },
      { id: "irritability",label: "Irritability" },
      { id: "anxiety",     label: "Anxiety" },
      { id: "brain_fog",   label: "Brain fog / poor focus" },
    ],
  },
  {
    title: "Weight / Muscle / Body Shape",
    description: "Testosterone plays a key role in regulating fat distribution, muscle mass, and bone density.",
    symptoms: [
      { id: "weight_gain", label: "Weight gain" },
      { id: "muscle_loss", label: "Muscle loss" },
      { id: "bone_loss",   label: "Bone loss" },
    ],
  },
  {
    title: "Sexual Health / Reproductive Function",
    description: "Testosterone drives desire, performance, and overall sexual health.",
    symptoms: [
      { id: "low_libido",  label: "Low sex drive" },
      { id: "ed",          label: "Erectile dysfunction" },
      { id: "fertility",   label: "Fertility challenges" },
    ],
  },
  {
    title: "Skin or Hair Changes",
    description: "Testosterone keeps skin firm and hair full. When levels fall, it often signals change within.",
    symptoms: [
      { id: "brittle_hair", label: "Dry or brittle hair" },
      { id: "hair_loss",    label: "Thinning hair / hair loss" },
      { id: "skin_change",  label: "Dry or oily skin" },
    ],
  },
  {
    title: "Circulation or Body Temperature",
    description: "Testosterone drives circulation and heat regulation. When it dips, you may notice colder hands or reduced stamina.",
    symptoms: [
      { id: "cold_body",       label: "Cold body temperature" },
      { id: "cold_extremities",label: "Cold hands or feet" },
      { id: "palpitations",    label: "Irregular heartbeat / palpitations" },
    ],
  },
  {
    title: "Chronic Pain or Headaches",
    description: "Testosterone helps regulate inflammation and pain. When it drops, discomfort tends to rise.",
    symptoms: [
      { id: "aches",     label: "Aches and pains" },
      { id: "headaches", label: "Headaches" },
    ],
  },
  {
    title: "Digestive Issues",
    description: "Hormonal balance affects how efficiently your body breaks down food and absorbs nutrients.",
    symptoms: [
      { id: "constipation",  label: "Constipation" },
      { id: "bloating",      label: "Bloating" },
      { id: "upset_stomach", label: "Upset stomach" },
    ],
  },
];

const SCORE_LABELS = ["None", "Mild", "Moderate", "Severe"] as const;
const MAX_SCORE = CATEGORIES.flatMap(c => c.symptoms).length * 3;

type ScoreVal = 0 | 1 | 2 | 3;
type Scores = Record<string, ScoreVal>;

function bracket(total: number): { label: string; color: string; message: string } {
  const pct = total / MAX_SCORE;
  if (pct < 0.15) return {
    label: "Minimal",
    // hardcoded-color-allow-next-line
    color: "#4ADE80",
    message: "Your symptoms are minimal, but a baseline panel is still worthwhile. Many men don't know their levels until they test.",
  };
  if (pct < 0.35) return {
    label: "Mild",
    // hardcoded-color-allow-next-line
    color: "#FCD34D",
    message: "You're showing early signs consistent with sub-optimal testosterone. A lab review would clarify the picture.",
  };
  if (pct < 0.60) return {
    label: "Moderate",
    // hardcoded-color-allow-next-line
    color: "#FB923C",
    message: "Your symptom pattern closely aligns with Low T. Most men at this level see meaningful improvement with treatment.",
  };
  return {
    label: "Severe",
    // hardcoded-color-allow-next-line
    color: "#F87171",
    message: "Your results strongly suggest Low T. You're a strong candidate for TRT — a same-day consult can confirm it.",
  };
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const NAVY = "#0B1029"; // brand navy
const CREAM = "var(--brand-cream)";
const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const CREAM_85 = "rgba(245,240,235,0.85)";
// hardcoded-color-allow-next-line
const CREAM_55 = "rgba(245,240,235,0.55)";
// hardcoded-color-allow-next-line
const WHITE_06 = "rgba(255,255,255,0.06)";
// hardcoded-color-allow-next-line
const WHITE_25 = "rgba(255,255,255,0.25)";

// ─── Score button row ─────────────────────────────────────────────────────────

function ScoreRow({ symptom, value, onChange }: {
  symptom: SQSymptom;
  value: ScoreVal;
  onChange: (id: string, v: ScoreVal) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, flexWrap: "wrap", marginBottom: 8,
      }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: CREAM }}>{symptom.label}</span>
        <span style={{
          fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          // hardcoded-color-allow-next-line
          color: value === 0 ? CREAM_55 : ORANGE,
        }}>{SCORE_LABELS[value]}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {([0, 1, 2, 3] as ScoreVal[]).map((v) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(symptom.id, v)}
              style={{
                flex: 1, height: 40, borderRadius: 8,
                fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700,
                border: `1.5px solid ${active ? ORANGE : WHITE_25}`,
                background: active ? ORANGE : WHITE_06,
                color: active ? "#fff" : CREAM_85,
                cursor: "pointer",
                // hardcoded-color-allow-next-line
                boxShadow: active ? "0 4px 16px rgba(232,103,10,0.35)" : "none",
                transition: "all 120ms ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Lead form schema ─────────────────────────────────────────────────────────

const optionalEmail = m.str().trim().max(255).email("Enter a valid email or leave blank").optional();
const shortQuizSchema = m.object({
  name: nameField,
  email: optionalEmail,
  phone: phoneField,
  location: m.str().min(2, "Please select a location"),
  tcpa: tcpaField,
});

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

// ─── Shell ────────────────────────────────────────────────────────────────────

function ShortQuizShell({ children, topContent }: { children: React.ReactNode; topContent?: React.ReactNode }) {
  return (
    <div style={{ background: NAVY, color: CREAM, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{
        // hardcoded-color-allow-next-line
        background: "rgba(11,16,41,0.95)", backdropFilter: "blur(8px)",
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 40,
        // hardcoded-color-allow-next-line
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <img src="/logos/Text_Logo_white.webp"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
          alt="Men's Wellness Centers" style={{ height: 22, width: "auto" }} width={140} height={22} loading="eager" decoding="async" />
        <a href="tel:+18663444955" style={{
          fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700,
          // hardcoded-color-allow-next-line
          color: "var(--brand-cta-accessible)", textDecoration: "none", letterSpacing: "0.03em",
        }}>
          (866) 344-4955
        </a>
      </div>
      {topContent}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

type SQStep = "intro" | "quiz" | "results" | "done";

export default function ShortQuiz() {
  const [step, setStep] = useState<SQStep>("intro");
  const [scores, setScores] = useState<Scores>(() =>
    Object.fromEntries(CATEGORIES.flatMap(c => c.symptoms.map(s => [s.id, 0 as ScoreVal])))
  );
  const [submitted, setSubmitted] = useState(false);

  // lead form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<LocationKey | "">("");
  const [tcpa, setTcpa] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const b = bracket(totalScore);

  const handleScore = useCallback((id: string, v: ScoreVal) => {
    setScores(prev => ({ ...prev, [id]: v }));
  }, []);

  const tags = [
    `short_quiz_score:${totalScore}`,
    `short_quiz_bracket:${b.label.toLowerCase()}`,
    "short_quiz_v1",
  ];

  const controller = useLeadSubmitController({
    schema: shortQuizSchema,
    source: "short-quiz-v1",
    tags,
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return {
        firstName: first || "Guest",
        lastName: rest.join(" ") || undefined,
        email: v.email || undefined,
        phone: v.phone,
        tags: [],
      };
    },
    onSuccess: () => {
      setSubmitted(true);
      setStep("done");
    },
    persistToBookingState: false,
    toastOnError: true,
  });

  const errors = controller.fieldErrors;
  const submitting = controller.isSubmitting;
  const valid = name.trim().length >= 2 && phone.replace(/\D/g, "").length === 10 && location !== "" && tcpa;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void controller.submit({ name, email, phone, location: location || "", tcpa });
  }

  if (step === "done" || submitted) {
    return <Navigate to="/short-quiz/approved" replace />;
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", height: 52,
    // hardcoded-color-allow-next-line
    background: "rgba(11,16,41,0.55)",
    border: `1.5px solid ${focused === field ? ORANGE : WHITE_25}`,
    borderRadius: 10, padding: "0 16px",
    fontSize: 16, color: CREAM, outline: "none",
    fontFamily: "Inter, sans-serif", transition: "border-color 150ms ease",
    boxSizing: "border-box",
  });

  // ─── Intro ──────────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <>
        <SEO
          title="60-Second TRT Assessment · Men's Wellness Centers"
          description="Score your symptoms and find out if Low T could be affecting you. Takes about 60 seconds. No cost, no commitment."
        />
        <ShortQuizShell>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: ORANGE, marginBottom: 16,
              fontFamily: "Inter, sans-serif",
            }}>
              FREE · 60 SECONDS · NO COMMITMENT
            </p>
            <h1 style={{
              fontFamily: "Oswald, 'Arial Narrow', sans-serif",
              fontSize: "clamp(34px, 7vw, 60px)", lineHeight: 1.0,
              letterSpacing: "0.01em", fontWeight: 700, color: CREAM, marginBottom: 20,
            }}>
              TAKE OUR 60-SECOND<br />
              <span style={{ color: ORANGE }}>TRT ASSESSMENT</span>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: CREAM_85, maxWidth: 520, margin: "0 auto 32px", fontFamily: "Inter, sans-serif" }}>
              This quick assessment analyzes your symptom patterns to show how closely they align with signs of Low&nbsp;T.
            </p>

            {/* Scoring legend */}
            <div style={{
              display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "center",
              // hardcoded-color-allow-next-line
              background: "rgba(255,255,255,0.04)", border: `1px solid ${WHITE_25}`,
              borderRadius: 12, padding: "16px 20px", marginBottom: 36,
            }}>
              <p style={{ width: "100%", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: CREAM_55, marginBottom: 10, fontFamily: "Inter, sans-serif" }}>
                Score your symptoms as follows:
              </p>
              {SCORE_LABELS.map((label, i) => (
                <span key={label} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 14px", borderRadius: 999,
                  border: `1.5px solid ${WHITE_25}`, background: WHITE_06,
                  fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: CREAM_85,
                }}>
                  <strong style={{ color: ORANGE }}>{i}</strong> = {label}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep("quiz")}
              style={{
                display: "block", width: "100%", maxWidth: 440, margin: "0 auto",
                height: 56, borderRadius: 12,
                background: ORANGE, color: "#fff", border: "none",
                fontFamily: "Inter, sans-serif", fontSize: 17, fontWeight: 800,
                letterSpacing: "0.05em", textTransform: "uppercase",
                cursor: "pointer",
                // hardcoded-color-allow-next-line
                boxShadow: "0 16px 40px rgba(232,103,10,0.40)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Start Assessment →
            </button>
          </div>

          {/* Trust row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {["CLIA Certified Labs", "Licensed Virginia Providers", "100% Confidential"].map(t => (
              <span key={t} style={{
                fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase", color: CREAM_55,
              }}>✓ {t}</span>
            ))}
          </div>
        </ShortQuizShell>
      </>
    );
  }

  // ─── Quiz ──────────────────────────────────────────────────────────────────
  if (step === "quiz") {
    return (
      <>
        <SEO
          title="60-Second TRT Assessment · Men's Wellness Centers"
          description="Score your symptoms and find out if Low T could be affecting you."
        />
        <ShortQuizShell>
          <div style={{ marginBottom: 40 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: ORANGE, marginBottom: 12,
              fontFamily: "Inter, sans-serif",
            }}>
              Score each symptom: 0 = None · 1 = Mild · 2 = Moderate · 3 = Severe
            </p>
            <h1 style={{
              fontFamily: "Oswald, sans-serif", fontSize: "clamp(26px, 5vw, 42px)",
              lineHeight: 1.0, fontWeight: 700, color: CREAM,
            }}>
              Rate Your Symptoms
            </h1>
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat.title} style={{ marginBottom: 40 }}>
              {/* Category header */}
              <div style={{
                // hardcoded-color-allow-next-line
                borderLeft: `3px solid ${ORANGE}`, paddingLeft: 14, marginBottom: 20,
              }}>
                <h2 style={{
                  fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700,
                  textTransform: "uppercase", color: CREAM, letterSpacing: "0.02em", marginBottom: 4,
                }}>
                  {cat.title}
                </h2>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: CREAM_55, lineHeight: 1.5 }}>
                  {cat.description}
                </p>
              </div>

              {/* Symptoms */}
              <div style={{
                // hardcoded-color-allow-next-line
                background: "rgba(255,255,255,0.03)", borderRadius: 12,
                border: `1px solid rgba(255,255,255,0.08)`, padding: "20px 16px",
              }}>
                {cat.symptoms.map((s) => (
                  <ScoreRow key={s.id} symptom={s} value={scores[s.id] as ScoreVal} onChange={handleScore} />
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "instant" });
              setStep("results");
            }}
            style={{
              display: "block", width: "100%", height: 56, borderRadius: 12,
              background: ORANGE, color: "#fff", border: "none",
              fontFamily: "Inter, sans-serif", fontSize: 17, fontWeight: 800,
              letterSpacing: "0.05em", textTransform: "uppercase",
              cursor: "pointer",
              // hardcoded-color-allow-next-line
              boxShadow: "0 16px 40px rgba(232,103,10,0.40)",
              WebkitTapHighlightColor: "transparent",
              marginTop: 8,
            }}
          >
            Get My Results →
          </button>
        </ShortQuizShell>
      </>
    );
  }

  // ─── Results + lead form ───────────────────────────────────────────────────
  return (
    <>
      <SEO
        title="Your TRT Assessment Results · Men's Wellness Centers"
        description="See your Low T symptom score and book a no-cost visit at Men's Wellness Centers."
      />
      <ShortQuizShell
        topContent={
          /* Score banner */
          <div style={{
            background: `linear-gradient(135deg, rgba(11,16,41,0.95) 0%, rgba(11,16,41,0.80) 100%)`,
            // hardcoded-color-allow-next-line
            borderBottom: `3px solid ${b.color}`,
            padding: "32px 20px", textAlign: "center",
          }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: CREAM_55, marginBottom: 12 }}>
              Your Assessment Results
            </p>
            {/* Score ring */}
            <div style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center",
              width: 120, height: 120, borderRadius: "50%",
              border: `4px solid ${b.color}`,
              // hardcoded-color-allow-next-line
              background: "rgba(11,16,41,0.70)",
              marginBottom: 16,
            }}>
              <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 36, fontWeight: 700, lineHeight: 1, color: b.color }}>{totalScore}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, color: CREAM_55, letterSpacing: "0.06em" }}>/ {MAX_SCORE}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{
                display: "inline-block", padding: "4px 18px", borderRadius: 999,
                background: b.color, color: "#000",
                fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 800,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>{b.label}</span>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.6, color: CREAM_85, maxWidth: 480, margin: "0 auto" }}>
              {b.message}
            </p>
          </div>
        }
      >
        <div style={{ marginBottom: 36 }}>
          <h2 style={{
            fontFamily: "Oswald, sans-serif", fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 700, textTransform: "uppercase", color: CREAM,
            lineHeight: 1.05, marginBottom: 12,
          }}>
            Get Your <span style={{ color: ORANGE }}>Full Report</span>
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: CREAM_85, lineHeight: 1.6 }}>
            A licensed Virginia provider will review your results and reach out to discuss next steps. No cost. No commitment.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Name */}
          <div>
            <input type="text" placeholder="Full Name" autoComplete="name"
              value={name} onChange={e => setName(e.target.value)}
              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
              style={inputStyle("name")} />
            {errors.name ? <p style={{ fontSize: 12, color: "var(--c-error-on-dark)", marginTop: 4 }}>{errors.name}</p> : null}
          </div>

          {/* Location */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: errors.location ? "var(--c-error-on-dark)" : CREAM_55, marginBottom: 8, fontFamily: "Inter, sans-serif" }}>
              Nearest Location
            </p>
            <LocationSelector value={location} onChange={loc => setLocation(loc)} />
            {errors.location ? <p style={{ fontSize: 12, color: "var(--c-error-on-dark)", marginTop: 4 }}>{errors.location}</p> : null}
          </div>

          {/* Phone */}
          <div>
            <input type="tel" inputMode="tel" placeholder="(555) 555-5555" autoComplete="tel"
              value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
              onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
              style={inputStyle("phone")} />
            {errors.phone ? <p style={{ fontSize: 12, color: "var(--c-error-on-dark)", marginTop: 4 }}>{errors.phone}</p> : null}
          </div>

          {/* Email optional */}
          <div style={{ position: "relative" }}>
            <input type="email" inputMode="email" placeholder="Email address"
              autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              style={inputStyle("email")} />
            <span style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
              color: CREAM_55, pointerEvents: "none",
            }}>optional</span>
            {errors.email ? <p style={{ fontSize: 12, color: "var(--c-error-on-dark)", marginTop: 4 }}>{errors.email}</p> : null}
          </div>

          {/* TCPA */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 12, lineHeight: 1.6, color: CREAM_85, paddingTop: 4, cursor: "pointer" }}>
            <input type="checkbox" checked={tcpa} onChange={e => setTcpa(e.target.checked)}
              style={{ marginTop: 2, width: 18, height: 18, accentColor: "var(--brand-cta)", flexShrink: 0 }} />
            <span>
              I am over 18 and agree to receive communications from Men's Wellness Centers about my assessment, including by phone, text, and email. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of service. View our{" "}
              <a href="/tcpa" style={{ color: "var(--brand-cta-accessible)", textDecoration: "underline" }}>TCPA disclosure</a>,{" "}
              <a href="/privacy-policy" style={{ color: "var(--brand-cta-accessible)", textDecoration: "underline" }}>privacy policy</a>, and{" "}
              <a href="/terms-of-service" style={{ color: "var(--brand-cta-accessible)", textDecoration: "underline" }}>terms</a>.
            </span>
          </label>
          {errors.tcpa ? <p style={{ fontSize: 12, color: "var(--c-error-on-dark)" }}>{errors.tcpa}</p> : null}

          <button
            type="submit"
            disabled={!valid || submitting}
            style={{
              width: "100%", height: 56, borderRadius: 12,
              background: ORANGE, color: "#fff", border: "none",
              fontFamily: "Inter, sans-serif", fontSize: 17, fontWeight: 800,
              letterSpacing: "0.05em", textTransform: "uppercase",
              cursor: !valid || submitting ? "not-allowed" : "pointer",
              opacity: !valid || submitting ? 0.45 : 1,
              // hardcoded-color-allow-next-line
              boxShadow: valid ? "0 16px 40px rgba(232,103,10,0.40)" : "none",
              transition: "opacity 150ms ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {submitting
              ? <><Loader2 size={18} style={{ animation: "spin 0.7s linear infinite" }} /> Sending</>
              : "See My Full Results →"}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <p style={{ textAlign: "center", fontSize: 12, color: CREAM_55, fontFamily: "Inter, sans-serif" }}>
            No cost. No commitment. Results reviewed by a licensed Virginia provider.
          </p>
        </form>

        {/* Score breakdown */}
        <div style={{ marginTop: 48 }}>
          <h3 style={{
            fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700,
            textTransform: "uppercase", color: CREAM, marginBottom: 16,
          }}>
            Your Score Breakdown
          </h3>
          {CATEGORIES.map(cat => {
            const catScore = cat.symptoms.reduce((a, s) => a + (scores[s.id] ?? 0), 0);
            const catMax = cat.symptoms.length * 3;
            const pct = catMax > 0 ? (catScore / catMax) * 100 : 0;
            return (
              <div key={cat.title} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: CREAM_85 }}>{cat.title}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: ORANGE }}>{catScore}/{catMax}</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: WHITE_06, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99, background: ORANGE,
                    width: `${pct}%`, transition: "width 600ms ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </ShortQuizShell>
    </>
  );
}
