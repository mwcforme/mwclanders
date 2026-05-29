/**
 * /check — "Check Your Edge" hormone health decision-support quiz.
 *
 * 6-step funnel:
 *   1. Intro
 *   2. Multi-select wellness changes
 *   3. Impact level
 *   4. Timeline
 *   5. Readiness
 *   6. Result + 2-field lead form
 *
 * Compliance: no diagnosis, no treatment promises, no PHI beyond name+phone.
 * Analytics: quiz_* events via dataLayer (PII-stripped).
 * CRM: uses existing useLeadSubmitController + GHL proxy.
 */
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Check, Phone, Shield, Award } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { m } from "@/lib/miniSchema";
import { getAttribution } from "@/lib/attribution";
import { PHONE } from "@/lib/constants";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const NAVY     = "#0B1029";
const NAVY_MID = "#161B3A";
const NAVY_LT  = "#1E244A";
const ORANGE   = "#E8670A";
const OFFWHITE = "#F5F3F0";
const BODY_GRY = "#B0ADA8";
const WHITE    = "#FFFFFF";

// ─── Analytics (PII-safe) ────────────────────────────────────────────────────
function track(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const safe = Object.fromEntries(
    Object.entries(props).filter(([k]) => !/(name|phone|email|first|last)/i.test(k))
  );
  (window as { dataLayer?: unknown[] }).dataLayer = (window as { dataLayer?: unknown[] }).dataLayer || [];
  ((window as { dataLayer?: unknown[] }).dataLayer as unknown[]).push({ event, ...safe });
}

// ─── Quiz config ──────────────────────────────────────────────────────────────
const WELLNESS_OPTIONS = [
  { id: "energy",     label: "Lower energy" },
  { id: "drive",      label: "Less drive or motivation" },
  { id: "strength",   label: "Changes in strength or body composition" },
  { id: "focus",      label: "Trouble staying focused" },
  { id: "sleep",      label: "Sleep feels less restorative" },
  { id: "sexual",     label: "Changes in sexual confidence" },
  { id: "none",       label: "None of these" },
] as const;

type WellnessId = typeof WELLNESS_OPTIONS[number]["id"];

const IMPACT_OPTIONS = [
  { id: "mild",     label: "Mildly" },
  { id: "moderate", label: "Moderately" },
  { id: "significant", label: "Significantly" },
  { id: "unsure",   label: "I am not sure yet" },
] as const;
type ImpactId = typeof IMPACT_OPTIONS[number]["id"];

const TIMELINE_OPTIONS = [
  { id: "lt3mo",  label: "Less than 3 months" },
  { id: "3to6mo", label: "3 to 6 months" },
  { id: "6to12mo",label: "6 to 12 months" },
  { id: "gt12mo", label: "More than 12 months" },
  { id: "unsure", label: "Not sure" },
] as const;
type TimelineId = typeof TIMELINE_OPTIONS[number]["id"];

const READINESS_OPTIONS = [
  { id: "asap",     label: "As soon as possible" },
  { id: "weeks",    label: "Within the next few weeks" },
  { id: "research", label: "I am researching options" },
  { id: "notready", label: "I am not ready yet" },
] as const;
type ReadinessId = typeof READINESS_OPTIONS[number]["id"];

interface QuizAnswers {
  wellness:   WellnessId[];
  impact:     ImpactId | null;
  timeline:   TimelineId | null;
  readiness:  ReadinessId | null;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL_STEPS = 6;

// Result bucket logic
function getResultBucket(answers: QuizAnswers): "consult" | "soft" {
  const hasNone = answers.wellness.includes("none");
  const meaningfulConcerns = !hasNone && answers.wellness.length > 0;
  const moderateOrHigher = answers.impact === "moderate" || answers.impact === "significant";
  return (meaningfulConcerns && moderateOrHigher) ? "consult" : "soft";
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const quizLeadSchema = m.object({
  firstName: m.str().trim().min(1, "Please enter your first name.").max(60, "Name is too long"),
  phone:     m.str().transform((v: string) => v.replace(/\D/g, "")).refine(
    (d: string) => d.length === 10,
    "Please enter a valid 10-digit phone number."
  ),
});

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  const pct = step === 1 ? 0 : ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  return (
    <div style={{ width: "100%", height: 3, background: NAVY_LT }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: ORANGE,
        transition: "width 300ms ease",
        borderRadius: 2,
      }} />
    </div>
  );
}

function Header({ step, onBack }: { step: Step; onBack?: () => void }) {
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: NAVY, borderBottom: `1px solid rgba(255,255,255,0.06)`,
    }}>
      <div style={{
        maxWidth: 640, margin: "0 auto", padding: "0 16px",
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        {/* Back or spacer */}
        {step > 1 && onBack ? (
          <button type="button" onClick={onBack} aria-label="Go back"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", color: BODY_GRY, display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontFamily: "Montserrat, sans-serif", fontWeight: 600, minWidth: 48 }}>
            <ChevronLeft size={18} aria-hidden /> Back
          </button>
        ) : <div style={{ minWidth: 48 }} />}

        {/* Logo */}
        <img src="/logos/Text_Logo_white.webp"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
          alt="Men's Wellness Centers" style={{ height: 22, width: "auto" }} />

        {/* Step indicator */}
        {step > 1 && step < 6 ? (
          <span style={{ fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: BODY_GRY, minWidth: 48, textAlign: "right" }}>
            {step - 1} of {TOTAL_STEPS - 2}
          </span>
        ) : <div style={{ minWidth: 48 }} />}
      </div>
      <ProgressBar step={step} />
    </header>
  );
}

function TrustStrip() {
  const items = [
    "Physician-led care",
    "In-clinic labs",
    "60-minute in-person consultation",
    "LegitScript certified",
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "center", padding: "0 4px" }}>
      {items.map(item => (
        <span key={item} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 600,
          // hardcoded-color-allow-next-line
          color: "rgba(240,237,233,0.70)", letterSpacing: "0.04em",
        }}>
          <Check size={12} style={{ color: ORANGE, flexShrink: 0 }} aria-hidden />
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepIntro({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 28, padding: "0 4px" }}>
      <div>
        <p style={{
          fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 14,
        }}>
          Men's Wellness Centers
        </p>
        <h1 style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(30px,7vw,44px)",
          textTransform: "uppercase", color: WHITE, lineHeight: 1.05, marginBottom: 20,
          letterSpacing: "-0.01em",
        }}>
          Check Your Edge.
        </h1>
        <p style={{
          fontFamily: "Montserrat, sans-serif", fontSize: 16, lineHeight: 1.65, color: OFFWHITE,
          maxWidth: 480, margin: "0 auto",
        }}>
          Answer a few quick questions to see whether a 60-minute in-person consultation at Men's Wellness Centers may be worth your time.
        </p>
      </div>

      <TrustStrip />

      <div style={{ width: "100%", maxWidth: 380 }}>
        <button type="button" onClick={onStart}
          style={{
            width: "100%", minHeight: 56, borderRadius: 10,
            background: ORANGE, color: WHITE, border: "none", cursor: "pointer",
            fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17,
            letterSpacing: "0.04em", textTransform: "uppercase",
            // hardcoded-color-allow-next-line
            boxShadow: "0 8px 24px rgba(232,103,10,0.40)",
            transition: "transform 150ms ease, background 150ms ease",
          }}
          onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#CF5C09"; }}
          onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ORANGE; }}
        >
          Start The Quiz
        </button>
        <p style={{ fontSize: 11, color: BODY_GRY, marginTop: 12, fontFamily: "Montserrat, sans-serif" }}>
          Takes about 60 seconds. No diagnosis. No obligation.
        </p>
      </div>
    </div>
  );
}

function MultiSelectStep({
  question, options, selected, onToggle, onNext, disclaimer,
}: {
  question: string;
  options: readonly { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  disclaimer?: string;
}) {
  const hasSelection = selected.length > 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{
        fontFamily: "Oswald, sans-serif", fontWeight: 700,
        fontSize: "clamp(22px,5vw,30px)", textTransform: "uppercase",
        color: WHITE, lineHeight: 1.1,
      }}>{question}</h2>

      {disclaimer && (
        <p style={{ fontSize: 12, color: BODY_GRY, fontFamily: "Montserrat, sans-serif", lineHeight: 1.5 }}>
          {disclaimer}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map(opt => {
          const isSelected = selected.includes(opt.id);
          return (
            <button key={opt.id} type="button"
              onClick={() => onToggle(opt.id)}
              aria-pressed={isSelected}
              style={{
                width: "100%", minHeight: 60, textAlign: "left",
                borderRadius: 12, padding: "14px 18px",
                border: `1.5px solid ${isSelected ? ORANGE : "rgba(255,255,255,0.15)"}`,
                background: isSelected ? "rgba(232,103,10,0.12)" : "rgba(255,255,255,0.04)",
                color: isSelected ? WHITE : OFFWHITE,
                fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 15,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                transition: "border-color 150ms, background 150ms",
              }}
            >
              <span>{opt.label}</span>
              {isSelected && (
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", background: ORANGE, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={13} color={WHITE} strokeWidth={3} aria-hidden />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onNext} disabled={!hasSelection}
        style={{
          width: "100%", minHeight: 56, borderRadius: 10,
          background: hasSelection ? ORANGE : "rgba(255,255,255,0.10)",
          color: hasSelection ? WHITE : BODY_GRY,
          border: "none", cursor: hasSelection ? "pointer" : "not-allowed",
          fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16,
          letterSpacing: "0.04em", textTransform: "uppercase",
          transition: "background 200ms",
        }}>
        Next
      </button>
    </div>
  );
}

function SingleSelectStep({
  question, options, selected, onSelect, onNext,
}: {
  question: string;
  options: readonly { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{
        fontFamily: "Oswald, sans-serif", fontWeight: 700,
        fontSize: "clamp(22px,5vw,30px)", textTransform: "uppercase",
        color: WHITE, lineHeight: 1.1,
      }}>{question}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map(opt => {
          const isSelected = selected === opt.id;
          return (
            <button key={opt.id} type="button"
              onClick={() => onSelect(opt.id)}
              aria-pressed={isSelected}
              style={{
                width: "100%", minHeight: 60, textAlign: "left",
                borderRadius: 12, padding: "14px 18px",
                border: `1.5px solid ${isSelected ? ORANGE : "rgba(255,255,255,0.15)"}`,
                background: isSelected ? "rgba(232,103,10,0.12)" : "rgba(255,255,255,0.04)",
                color: isSelected ? WHITE : OFFWHITE,
                fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 15,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                transition: "border-color 150ms, background 150ms",
              }}
            >
              <span>{opt.label}</span>
              {isSelected && (
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", background: ORANGE, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={13} color={WHITE} strokeWidth={3} aria-hidden />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onNext} disabled={!selected}
        style={{
          width: "100%", minHeight: 56, borderRadius: 10,
          background: selected ? ORANGE : "rgba(255,255,255,0.10)",
          color: selected ? WHITE : BODY_GRY,
          border: "none", cursor: selected ? "pointer" : "not-allowed",
          fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16,
          letterSpacing: "0.04em", textTransform: "uppercase",
          transition: "background 200ms",
        }}>
        Next
      </button>
    </div>
  );
}

function StepResult({
  answers, onSubmitSuccess,
}: {
  answers: QuizAnswers;
  onSubmitSuccess: () => void;
}) {
  const bucket = getResultBucket(answers);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const attr = getAttribution();

  const controller = useLeadSubmitController({
    schema: quizLeadSchema,
    source: "hormone-quiz",
    tags: [
      "quiz_hormone_check",
      `quiz_bucket:${bucket}`,
      `quiz_impact:${answers.impact ?? "unknown"}`,
      `quiz_readiness:${answers.readiness ?? "unknown"}`,
      `quiz_timeline:${answers.timeline ?? "unknown"}`,
      ...(attr.utm_source ? [`utm_source:${attr.utm_source}`] : []),
      ...(attr.utm_campaign ? [`utm_campaign:${attr.utm_campaign}`] : []),
    ],
    toLeadInput: (v) => ({
      firstName: v.firstName,
      phone: v.phone,
      customFields: {
        mwc_funnel_service: "quiz_hormone_check",
        mwc_lp_slug: "/check",
      },
    }),
    toastOnError: false,
    onSuccess: () => {
      track("quiz_submit_success", {
        bucket,
        impact: answers.impact,
        readiness: answers.readiness,
        timeline: answers.timeline,
      });
      onSubmitSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track("quiz_submit_attempt", { bucket });
    void controller.submit({ firstName: firstName.trim(), phone });
  };

  useEffect(() => {
    const fe = controller.fieldErrors;
    if (!Object.keys(fe).length) return;
    const mapped: Record<string, string> = {};
    for (const k of Object.keys(fe)) mapped[k] = fe[k];
    setErrors(mapped);
    if (mapped.firstName) firstRef.current?.focus();
    else if (mapped.phone) phoneRef.current?.focus();
  }, [controller.fieldErrors]);

  const clearErr = (k: string) => setErrors(p => { const { [k]: _, ...r } = p; return r; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Result headline */}
      <div style={{
        background: NAVY_LT, borderRadius: 14, padding: "22px 20px",
        border: `1px solid rgba(232,103,10,0.25)`,
      }}>
        <h2 style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700,
          fontSize: "clamp(22px,5vw,28px)", textTransform: "uppercase",
          color: WHITE, marginBottom: 12, lineHeight: 1.1,
        }}>
          {bucket === "consult"
            ? "A 60-Minute Consultation May Be Worth Your Time."
            : "It May Still Be Worth A Conversation."}
        </h2>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, color: OFFWHITE, lineHeight: 1.6 }}>
          {bucket === "consult"
            ? "Your answers suggest it may be worth sitting down with a physician at Men's Wellness Centers. During your visit, the team can review your goals, discuss in-clinic lab work, and walk through options when clinically appropriate."
            : "Even if you are still researching, a no-cost 60-minute consultation can help you understand your options and decide whether physician-led men's health care is right for you."}
        </p>
      </div>

      {/* Trust block */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
      }}>
        {[
          { icon: <Award size={16} />, text: "LegitScript certified" },
          { icon: <Shield size={16} />, text: "100% private" },
          { icon: <Check size={16} />, text: "No-cost first visit" },
          { icon: <Check size={16} />, text: "Physician-led care" },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", borderRadius: 10,
            padding: "10px 12px", border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ color: ORANGE, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: OFFWHITE }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 700, color: BODY_GRY, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
          Reserve your no-cost visit
        </p>

        {/* First name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="hq-first" style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, color: OFFWHITE }}>
            First name
          </label>
          <input
            id="hq-first"
            ref={firstRef}
            type="text"
            autoComplete="given-name"
            placeholder="John"
            value={firstName}
            onChange={e => { setFirstName(e.target.value); clearErr("firstName"); }}
            style={{
              height: 52, borderRadius: 10, padding: "0 16px",
              background: "rgba(255,255,255,0.07)",
              border: `1.5px solid ${errors.firstName ? "#ef4444" : "rgba(255,255,255,0.20)"}`,
              color: WHITE, fontFamily: "Montserrat, sans-serif", fontSize: 16,
              outline: "none", width: "100%", boxSizing: "border-box",
            }}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "hq-first-err" : undefined}
          />
          {errors.firstName && (
            <p id="hq-first-err" role="alert" style={{ fontSize: 12, color: "#ef4444", margin: 0, fontFamily: "Montserrat, sans-serif" }}>
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Phone */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="hq-phone" style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, color: OFFWHITE }}>
            Phone number
          </label>
          <input
            id="hq-phone"
            ref={phoneRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 000-0000"
            value={phone}
            onChange={e => { setPhone(formatPhone(e.target.value)); clearErr("phone"); }}
            style={{
              height: 52, borderRadius: 10, padding: "0 16px",
              background: "rgba(255,255,255,0.07)",
              border: `1.5px solid ${errors.phone ? "#ef4444" : "rgba(255,255,255,0.20)"}`,
              color: WHITE, fontFamily: "Montserrat, sans-serif", fontSize: 16,
              outline: "none", width: "100%", boxSizing: "border-box",
            }}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "hq-phone-err" : undefined}
          />
          {errors.phone && (
            <p id="hq-phone-err" role="alert" style={{ fontSize: 12, color: "#ef4444", margin: 0, fontFamily: "Montserrat, sans-serif" }}>
              {errors.phone}
            </p>
          )}
        </div>

        {/* TCPA + disclaimer */}
        <p style={{ fontSize: 11, color: BODY_GRY, lineHeight: 1.5, fontFamily: "Montserrat, sans-serif" }}>
          By submitting, you agree to receive SMS/calls from Men's Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out. Not a condition of service.{" "}
          <a href="/privacy-policy" style={{ color: ORANGE, textDecoration: "none" }}>Privacy Policy</a>
        </p>

        {controller.error && !Object.keys(errors).length && (
          <p role="alert" style={{ fontSize: 13, color: "#ef4444", fontFamily: "Montserrat, sans-serif" }}>
            Something went wrong. Please try again, or call Men's Wellness Centers directly.
          </p>
        )}

        <button type="submit" disabled={controller.isSubmitting}
          style={{
            width: "100%", minHeight: 58, borderRadius: 10,
            background: controller.isSubmitting ? "rgba(232,103,10,0.60)" : ORANGE,
            color: WHITE, border: "none",
            cursor: controller.isSubmitting ? "wait" : "pointer",
            fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17,
            letterSpacing: "0.04em", textTransform: "uppercase",
            // hardcoded-color-allow-next-line
            boxShadow: "0 8px 24px rgba(232,103,10,0.40)",
          }}>
          {controller.isSubmitting ? "Reserving..." : "Reserve My 60-Minute Visit"}
        </button>
      </form>

      {/* Tap-to-call fallback */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: BODY_GRY, fontFamily: "Montserrat, sans-serif", marginBottom: 10 }}>
          Prefer to talk now?
        </p>
        <a href={PHONE.tel}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: ORANGE, fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 15,
            textDecoration: "none",
          }}>
          <Phone size={16} aria-hidden /> {PHONE.display}
        </a>
      </div>

      {/* Compliance disclaimer */}
      <p style={{ fontSize: 11, color: BODY_GRY, lineHeight: 1.55, fontFamily: "Montserrat, sans-serif", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
        This quiz is not a diagnosis. Treatment requires a clinical evaluation and is provided only when medically appropriate.
      </p>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        // hardcoded-color-allow-next-line
        background: "rgba(232,103,10,0.15)", border: `2px solid ${ORANGE}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Check size={32} color={ORANGE} strokeWidth={2.5} aria-hidden />
      </div>

      <div>
        <h2 style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700,
          fontSize: "clamp(24px,5vw,32px)", textTransform: "uppercase",
          color: WHITE, lineHeight: 1.1, marginBottom: 16,
        }}>You're On The List.</h2>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, color: OFFWHITE, lineHeight: 1.65, maxWidth: 420, margin: "0 auto" }}>
          A Men's Wellness Centers team member will call you within one business hour to help reserve your 60-minute in-person consultation.
        </p>
      </div>

      <div style={{ background: NAVY_LT, borderRadius: 14, padding: "20px", width: "100%", maxWidth: 380 }}>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 700, color: BODY_GRY, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
          What to expect
        </p>
        {[
          "A team member will call to confirm your visit.",
          "Bring a photo ID and wear loose sleeves.",
          "Plan for 60 minutes from arrival to checkout.",
        ].map((text, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: ORANGE, color: WHITE, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 13,
            }}>{i + 1}</div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: OFFWHITE, lineHeight: 1.5, margin: 0 }}>{text}</p>
          </div>
        ))}
      </div>

      <a href="/" style={{
        fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 600,
        color: BODY_GRY, textDecoration: "none",
      }}>
        Return to Men's Wellness Centers
      </a>
    </div>
  );
}

// ─── Main Quiz Page ───────────────────────────────────────────────────────────

export default function HormoneQuiz() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    wellness: [], impact: null, timeline: null, readiness: null,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Analytics on mount
  useEffect(() => {
    track("quiz_view", { quiz: "hormone_check" });
  }, []);

  const scrollToTop = () => {
    setTimeout(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
  };

  const goNext = (nextStep: Step) => {
    track("quiz_step_complete", { step_number: step, quiz: "hormone_check" });
    setStep(nextStep);
    scrollToTop();
  };

  const goBack = () => {
    track("quiz_back_click", { step_number: step, quiz: "hormone_check" });
    setStep(s => Math.max(1, s - 1) as Step);
    scrollToTop();
  };

  // Step 2 multi-select toggle (none is exclusive)
  const toggleWellness = (id: string) => {
    setAnswers(a => {
      const cur = a.wellness;
      if (id === "none") return { ...a, wellness: cur.includes("none") ? [] : ["none"] };
      const without = cur.filter(x => x !== "none" && x !== id);
      return { ...a, wellness: cur.includes(id as WellnessId) ? without : [...without, id as WellnessId] };
    });
  };

  useEffect(() => {
    if (step > 1) track("quiz_step_view", { step_number: step, quiz: "hormone_check" });
  }, [step]);

  const pageStyle: React.CSSProperties = {
    minHeight: "100dvh",
    background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
    color: WHITE,
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: 560, margin: "0 auto",
    padding: "80px 20px 120px",
  };

  if (submitted) {
    return (
      <div style={pageStyle}>
        <SEO title="Consultation Reserved | Men's Wellness Centers" description="A team member will call you within one business hour." />
        <Header step={6} />
        <div ref={scrollRef} style={contentStyle}>
          <SuccessScreen />
        </div>
        <QuizFooter />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <SEO
        title="Check Your Edge | Men's Wellness Centers"
        description="Answer a few quick questions to see whether a 60-minute in-person consultation at Men's Wellness Centers may be worth your time."
      />
      <Header step={step} onBack={step > 1 ? goBack : undefined} />
      <div ref={scrollRef} style={contentStyle}>

        {step === 1 && (
          <StepIntro onStart={() => {
            track("quiz_start", { quiz: "hormone_check" });
            goNext(2);
          }} />
        )}

        {step === 2 && (
          <MultiSelectStep
            question="Which changes have you noticed lately?"
            options={WELLNESS_OPTIONS}
            selected={answers.wellness}
            onToggle={toggleWellness}
            onNext={() => goNext(3)}
            disclaimer="This quiz does not diagnose a medical condition. It helps determine whether a physician-led consultation may be appropriate."
          />
        )}

        {step === 3 && (
          <SingleSelectStep
            question="How much are these changes affecting your day-to-day life?"
            options={IMPACT_OPTIONS}
            selected={answers.impact}
            onSelect={id => setAnswers(a => ({ ...a, impact: id as ImpactId }))}
            onNext={() => goNext(4)}
          />
        )}

        {step === 4 && (
          <SingleSelectStep
            question="How long have you noticed these changes?"
            options={TIMELINE_OPTIONS}
            selected={answers.timeline}
            onSelect={id => setAnswers(a => ({ ...a, timeline: id as TimelineId }))}
            onNext={() => goNext(5)}
          />
        )}

        {step === 5 && (
          <SingleSelectStep
            question="When would you like to take action?"
            options={READINESS_OPTIONS}
            selected={answers.readiness}
            onSelect={id => setAnswers(a => ({ ...a, readiness: id as ReadinessId }))}
            onNext={() => {
              track("quiz_form_view", { bucket: getResultBucket(answers), quiz: "hormone_check" });
              goNext(6);
            }}
          />
        )}

        {step === 6 && (
          <StepResult answers={answers} onSubmitSuccess={() => setSubmitted(true)} />
        )}
      </div>
      <QuizFooter />
    </div>
  );
}

function QuizFooter() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "24px 20px",
      textAlign: "center",
      background: NAVY,
    }}>
      <p style={{ fontSize: 11, color: BODY_GRY, lineHeight: 1.6, fontFamily: "Montserrat, sans-serif", maxWidth: 560, margin: "0 auto 12px" }}>
        Treatment requires a clinical evaluation and is provided only when medically appropriate. Individual results vary. Treatment is provided by licensed physicians at Men's Wellness Centers.
      </p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms", href: "/terms-of-service" },
          { label: "HIPAA Notice", href: "/privacy-practices" },
        ].map(link => (
          <a key={link.href} href={link.href}
            style={{ fontSize: 11, color: BODY_GRY, fontFamily: "Montserrat, sans-serif", textDecoration: "none" }}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
