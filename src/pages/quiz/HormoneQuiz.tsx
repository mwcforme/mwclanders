/**
 * /check — Low-T Quiz
 *
 * Design: matches /optimize exactly.
 *   - Dark navy hero, cream quiz section, white cards, orange CTAs
 *   - Direct masculine copy, no corporate softness
 *   - 5 quick questions + 2-field lead capture
 *   - GHL integration via useLeadSubmitController
 *   - Analytics: quiz_* events (PII-safe)
 */
import { useState, useEffect, useRef } from "react";
import {
  ChevronDown, Check, Star, MapPin, Phone, Clock, FlaskConical,
  UserCheck, ArrowRight, Zap, Target, Dumbbell, Brain,
  Moon, Heart, Circle, Loader2, Shield, Award,
} from "lucide-react";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { BookHeader } from "@/components/book/BookHeader";
import { SEO } from "@/components/SEO";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { m } from "@/lib/miniSchema";
import { getAttribution } from "@/lib/attribution";
import { PHONE } from "@/lib/constants";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const NAVY   = "var(--brand-navy-deep)";
const CREAM  = "var(--brand-cream)";
const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const WHITE  = "#FFFFFF";
// hardcoded-color-allow-next-line
const INK    = "#0B1029";

// ─── Analytics ────────────────────────────────────────────────────────────────
function track(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const safe = Object.fromEntries(
    Object.entries(props).filter(([k]) => !/(name|phone|email|first|last)/i.test(k))
  );
  (window as { dataLayer?: unknown[] }).dataLayer = (window as { dataLayer?: unknown[] }).dataLayer || [];
  ((window as { dataLayer?: unknown[] }).dataLayer as unknown[]).push({ event, ...safe });
}

// ─── Quiz config ──────────────────────────────────────────────────────────────
const QUIZ_SYMPTOMS = [
  { id: "energy",   label: "Low energy",                              Icon: Zap      },
  { id: "drive",    label: "Less drive or motivation",                Icon: Target   },
  { id: "strength", label: "Changes in strength or body composition", Icon: Dumbbell },
  { id: "focus",    label: "Trouble staying focused",                 Icon: Brain    },
  { id: "sleep",    label: "Sleep feels less restorative",            Icon: Moon     },
  { id: "sexual",   label: "Changes in sexual confidence",            Icon: Heart    },
  { id: "none",     label: "None of these",                           Icon: Circle   },
] as const;
type SymptomId = typeof QUIZ_SYMPTOMS[number]["id"];

const IMPACT_OPTS = [
  { id: "mild",        label: "Mildly",             note: "I notice it but push through" },
  { id: "moderate",    label: "Moderately",          note: "Affecting daily performance" },
  { id: "significant", label: "Significantly",       note: "Hard to ignore every day" },
  { id: "unsure",      label: "Not sure yet",        note: "Still figuring out what is normal" },
] as const;
type ImpactId = typeof IMPACT_OPTS[number]["id"];

const TIMELINE_OPTS = [
  { id: "lt3mo",   label: "Less than 3 months" },
  { id: "3to6mo",  label: "3 to 6 months" },
  { id: "6to12mo", label: "6 to 12 months" },
  { id: "gt12mo",  label: "More than 12 months" },
  { id: "unsure",  label: "Not sure" },
] as const;
type TimelineId = typeof TIMELINE_OPTS[number]["id"];

const READINESS_OPTS = [
  { id: "asap",     label: "As soon as possible" },
  { id: "weeks",    label: "Within the next few weeks" },
  { id: "research", label: "Still researching options" },
  { id: "notready", label: "Not ready yet" },
] as const;
type ReadinessId = typeof READINESS_OPTS[number]["id"];

interface Answers {
  symptoms:  SymptomId[];
  impact:    ImpactId | null;
  timeline:  TimelineId | null;
  readiness: ReadinessId | null;
}

type QuizStep = "intro" | "q1" | "q2" | "q3" | "q4" | "result";

function getBucket(a: Answers): "consult" | "soft" {
  const hasNone = a.symptoms.includes("none");
  const real    = !hasNone && a.symptoms.length > 0;
  const moderate = a.impact === "moderate" || a.impact === "significant";
  return (real && moderate) ? "consult" : "soft";
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const quizLeadSchema = m.object({
  firstName: m.str().trim().min(1, "Please enter your first name.").max(60, ""),
  phone: m.str()
    .transform((v: string) => v.replace(/\D/g, ""))
    .refine((d: string) => d.length === 10, "Please enter a valid 10-digit phone number."),
});

const fmt = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
};

// ─── Shared card button ───────────────────────────────────────────────────────
function OptionBtn({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      style={{
        width: "100%", minHeight: 64, textAlign: "left",
        borderRadius: 14, padding: "14px 18px",
        border: `1.5px solid ${selected ? ORANGE : "rgba(11,16,41,0.18)"}`,
        // hardcoded-color-allow-next-line
        background: selected ? "rgba(232,103,10,0.07)" : WHITE,
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 14,
        // hardcoded-color-allow-next-line
        boxShadow: selected ? "0 0 0 3px rgba(232,103,10,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "border-color 140ms, box-shadow 140ms, background 140ms",
      }}>
      {children}
      {selected && (
        <div style={{
          marginLeft: "auto", flexShrink: 0,
          width: 22, height: 22, borderRadius: "50%", background: ORANGE,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Check size={13} color={WHITE} strokeWidth={3} aria-hidden />
        </div>
      )}
    </button>
  );
}

function NextBtn({ disabled, onClick, label = "Next" }: {
  disabled?: boolean; onClick: () => void; label?: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{
        width: "100%", height: 56, borderRadius: 10, border: "none",
        background: disabled ? "rgba(11,16,41,0.12)" : ORANGE,
        color: disabled ? "rgba(11,16,41,0.35)" : WHITE,
        fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16,
        letterSpacing: "0.06em", textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        // hardcoded-color-allow-next-line
        boxShadow: disabled ? "none" : "0 4px 20px rgba(232,103,10,0.40)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "background 150ms",
      }}>
      {label} {!disabled && <ArrowRight size={16} aria-hidden />}
    </button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
const STEP_ORDER: QuizStep[] = ["intro", "q1", "q2", "q3", "q4", "result"];
function ProgressBar({ quizStep }: { quizStep: QuizStep }) {
  const idx = STEP_ORDER.indexOf(quizStep);
  const pct = idx <= 1 ? 0 : ((idx - 1) / 4) * 100;
  return (
    <div style={{ height: 3, background: "rgba(232,103,10,0.20)", borderRadius: 2 }}>
      <div style={{
        height: "100%", width: `${pct}%`, background: ORANGE,
        borderRadius: 2, transition: "width 350ms ease",
      }} />
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepIntro({ onStart }: { onStart: () => void }) {
  return (
    <>
      {/* Hero — dark navy, matches /optimize */}
      <section id="hero" style={{ background: NAVY, paddingTop: 64, paddingBottom: 64, position: "relative", overflow: "hidden" }}>
        {/* Grain */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05,
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "200px 200px",
        }} />
        {/* Orange glow */}
        <div aria-hidden style={{
          position: "absolute", top: 0, right: 0, width: 420, height: 340, pointerEvents: "none",
          // hardcoded-color-allow-next-line
          background: "radial-gradient(ellipse 60% 60% at 100% 0%, rgba(232,103,10,0.14) 0%, transparent 70%)",
        }} />

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          {/* Eyebrow */}
          <p style={{
            fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: ORANGE, marginBottom: 18,
          }}>
            Low-T Assessment · Men's Wellness Centers
          </p>

          <h1 style={{
            fontFamily: "Oswald, sans-serif", fontWeight: 700,
            fontSize: "clamp(34px, 6vw, 60px)", textTransform: "uppercase",
            color: WHITE, lineHeight: 1.02, letterSpacing: "-0.01em", marginBottom: 20,
          }}>
            Is low testosterone{" "}
            <span style={{ color: ORANGE, display: "block" }}>holding you back?</span>
          </h1>

          <p style={{
            fontFamily: "Inter, sans-serif", fontSize: 18, lineHeight: 1.65,
            // hardcoded-color-allow-next-line
            color: "rgba(255,255,255,0.78)", maxWidth: 560, marginBottom: 32,
          }}>
            Take our 60-second quiz. If your answers suggest a conversation is worth your time, you can reserve a no-cost 60-minute in-person visit at your nearest Men's Wellness Centers.
          </p>

          {/* Symptom chips */}
          <ul style={{ display: "grid", gap: 12, marginBottom: 40, maxWidth: 520 }}>
            {[
              "Still tired at 10am after a full night's sleep.",
              "Your workouts stopped working months ago.",
              "Your drive is low. You've noticed. She has too.",
              "Labs say everything is fine. You don't feel fine.",
            ].map(s => (
              <li key={s} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontFamily: "Inter, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.85)" }}>
                <span style={{ marginTop: 8, height: 6, width: 6, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} aria-hidden />
                {s}
              </li>
            ))}
          </ul>

          {/* Star strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={16} style={{ fill: "#C9A961", color: "#C9A961" }} aria-hidden />)}
            </div>
            {/* hardcoded-color-allow-next-line */}
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.70)" }}>
              4.9 · 191 verified Google reviews · 10,000+ Virginia members since 2015
            </span>
          </div>

          <button type="button" onClick={onStart}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              height: 58, padding: "0 40px", borderRadius: 10, border: "none",
              background: ORANGE, color: WHITE, cursor: "pointer",
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 17,
              letterSpacing: "0.06em", textTransform: "uppercase",
              // hardcoded-color-allow-next-line
              boxShadow: "0 8px 28px rgba(232,103,10,0.42)",
            }}>
            Take The Quiz <ArrowRight size={18} aria-hidden />
          </button>

          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 14 }}>
            60 seconds. No diagnosis. No obligation.
          </p>
        </div>
      </section>

      {/* Trust band */}
      <section style={{ background: CREAM, borderBottom: "1px solid rgba(11,16,41,0.08)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 24px", display: "flex", flexWrap: "wrap", gap: "10px 28px", justifyContent: "center" }}>
          {[
            { Icon: Award,       text: "LegitScript certified" },
            { Icon: Shield,      text: "100% private" },
            { Icon: FlaskConical, text: "In-clinic labs, same visit" },
            { Icon: Clock,       text: "Same- or next-day availability" },
          ].map(({ Icon, text }) => (
            <span key={text} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: INK }}>
              <Icon size={14} style={{ color: ORANGE, flexShrink: 0 }} aria-hidden />
              {text}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

// ─── Quiz wrapper card ────────────────────────────────────────────────────────
function QuizCard({ quizStep, title, disclaimer, children, stepLabel }: {
  quizStep: QuizStep;
  title: string;
  disclaimer?: string;
  children: React.ReactNode;
  stepLabel?: string;
}) {
  return (
    <section style={{ background: CREAM, padding: "48px 0 64px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>
        {/* Step label */}
        {stepLabel && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            {stepLabel}
          </p>
        )}
        <h2 style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700,
          fontSize: "clamp(24px, 4vw, 34px)", textTransform: "uppercase",
          color: INK, lineHeight: 1.1, marginBottom: disclaimer ? 10 : 24,
        }}>{title}</h2>
        {disclaimer && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(11,16,41,0.55)", lineHeight: 1.5, marginBottom: 20 }}>
            {disclaimer}
          </p>
        )}
        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <ProgressBar quizStep={quizStep} />
        </div>
        {children}
      </div>
    </section>
  );
}

function Q1_Symptoms({ selected, onToggle, onNext }: {
  selected: SymptomId[]; onToggle: (id: string) => void; onNext: () => void;
}) {
  return (
    <QuizCard quizStep="q1" title="Which of these sound familiar?" stepLabel="Step 1 of 4"
      disclaimer="This quiz does not diagnose a medical condition. It helps determine whether a physician-led consultation may be appropriate.">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {QUIZ_SYMPTOMS.map(({ id, label, Icon }) => {
          const isSelected = selected.includes(id as SymptomId);
          return (
            <OptionBtn key={id} selected={isSelected} onClick={() => onToggle(id)}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: isSelected ? ORANGE : "rgba(232,103,10,0.10)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 150ms" }}>
                <Icon size={18} style={{ color: isSelected ? WHITE : ORANGE }} aria-hidden />
              </div>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, color: INK }}>{label}</span>
            </OptionBtn>
          );
        })}
      </div>
      <NextBtn disabled={selected.length === 0} onClick={onNext} />
    </QuizCard>
  );
}

function Q2_Impact({ selected, onSelect, onNext }: {
  selected: ImpactId | null; onSelect: (id: string) => void; onNext: () => void;
}) {
  return (
    <QuizCard quizStep="q2" title="How much are these changes affecting your day-to-day life?" stepLabel="Step 2 of 4">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {IMPACT_OPTS.map(({ id, label, note }) => (
          <OptionBtn key={id} selected={selected === id} onClick={() => onSelect(id)}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, color: INK, margin: 0 }}>{label}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(11,16,41,0.55)", margin: "2px 0 0" }}>{note}</p>
            </div>
          </OptionBtn>
        ))}
      </div>
      <NextBtn disabled={!selected} onClick={onNext} />
    </QuizCard>
  );
}

function Q3_Timeline({ selected, onSelect, onNext }: {
  selected: TimelineId | null; onSelect: (id: string) => void; onNext: () => void;
}) {
  return (
    <QuizCard quizStep="q3" title="How long have you noticed these changes?" stepLabel="Step 3 of 4">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {TIMELINE_OPTS.map(({ id, label }) => (
          <OptionBtn key={id} selected={selected === id} onClick={() => onSelect(id)}>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, color: INK }}>{label}</span>
          </OptionBtn>
        ))}
      </div>
      <NextBtn disabled={!selected} onClick={onNext} />
    </QuizCard>
  );
}

function Q4_Readiness({ selected, onSelect, onNext }: {
  selected: ReadinessId | null; onSelect: (id: string) => void; onNext: () => void;
}) {
  return (
    <QuizCard quizStep="q4" title="When would you like to take action?" stepLabel="Step 4 of 4">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {READINESS_OPTS.map(({ id, label }) => (
          <OptionBtn key={id} selected={selected === id} onClick={() => onSelect(id)}>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, color: INK }}>{label}</span>
          </OptionBtn>
        ))}
      </div>
      <NextBtn disabled={!selected} onClick={onNext} label="See My Results" />
    </QuizCard>
  );
}

// ─── Result + form ────────────────────────────────────────────────────────────
function StepResult({ answers, onSuccess }: { answers: Answers; onSuccess: () => void }) {
  const bucket = getBucket(answers);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const attr = getAttribution();

  const controller = useLeadSubmitController({
    schema: quizLeadSchema,
    source: "low-t-quiz",
    tags: [
      "quiz_low_t",
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
      customFields: { mwc_funnel_service: "quiz_low_t", mwc_lp_slug: "/check" },
    }),
    toastOnError: false,
    onSuccess: () => { track("quiz_submit_success", { bucket }); onSuccess(); },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    track("quiz_submit_attempt", { bucket });
    void controller.submit({ firstName: firstName.trim(), phone });
  };

  useEffect(() => {
    const fe = controller.fieldErrors;
    if (!Object.keys(fe).length) return;
    const m: Record<string, string> = {};
    for (const k of Object.keys(fe)) m[k] = fe[k];
    setErrors(m);
    if (m.firstName) firstRef.current?.focus();
    else if (m.phone) phoneRef.current?.focus();
  }, [controller.fieldErrors]);

  const clearErr = (k: string) => setErrors(p => { const { [k]: _, ...r } = p; return r; });

  return (
    <>
      {/* Result band — navy, paddingTop clears BookHeader (48px) + breathing room */}
      <section style={{ background: NAVY, paddingTop: 80, paddingBottom: 56 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            Your Result
          </p>
          <h2 style={{
            fontFamily: "Oswald, sans-serif", fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 40px)", textTransform: "uppercase",
            color: WHITE, lineHeight: 1.1, marginBottom: 16,
          }}>
            {bucket === "consult"
              ? "A 60-minute consultation may be worth your time."
              : "A conversation may still be worth it."}
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.65, color: "rgba(255,255,255,0.78)", marginBottom: 28 }}>
            {bucket === "consult"
              ? "Your answers suggest it may be worth sitting down with a physician at Men's Wellness Centers. During your visit, the team reviews your goals, draws labs on-site, and walks through options when clinically appropriate."
              : "Even if you are still researching, a no-cost 60-minute consultation can help you understand your options before you commit to anything."}
          </p>
          <a href="#reserve-form"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              height: 52, padding: "0 28px", borderRadius: 10, border: "none",
              background: ORANGE, color: WHITE, cursor: "pointer",
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15,
              letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
              // hardcoded-color-allow-next-line
              boxShadow: "0 4px 20px rgba(232,103,10,0.40)",
            }}>
            Reserve My No-Cost Visit <ArrowRight size={16} aria-hidden />
          </a>
        </div>
      </section>

      {/* Form — cream */}
      <section style={{ background: CREAM, padding: "56px 0" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
          {/* Steps — stacked on mobile */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            {[
              { n: "1", Icon: Clock,        label: "Book your slot",     body: "Pick a center and a time online. Same- or next-day availability." },
              { n: "2", Icon: FlaskConical, label: "Labs on arrival",    body: "Full hormone panel drawn in our on-site CLIA-certified lab." },
              { n: "3", Icon: UserCheck,    label: "Results reviewed",   body: "Your provider goes through every number before you leave." },
            ].map(step => (
              <div key={step.label} style={{
                background: WHITE, borderRadius: 14, padding: "16px 18px",
                // hardcoded-color-allow-next-line
                border: "1px solid rgba(11,16,41,0.10)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: ORANGE, color: WHITE, fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{step.n}</div>
                <div>
                  <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 16, textTransform: "uppercase", color: INK, margin: "0 0 4px" }}>{step.label}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(11,16,41,0.60)", lineHeight: 1.5, margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form card */}
          <div id="reserve-form" style={{
            background: WHITE, borderRadius: 18, overflow: "hidden",
            // hardcoded-color-allow-next-line
            boxShadow: "0 4px 32px rgba(0,0,0,0.10)", border: "1px solid rgba(11,16,41,0.08)",
          }}>
            {/* Card header */}
            <div style={{ background: INK, padding: "20px 24px" }}>
              <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: WHITE, marginBottom: 4 }}>
                Reserve your no-cost visit.
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                Same- or next-day availability at 3 Virginia centers.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} noValidate style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* First name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="lq-first" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: INK }}>First name</label>
                <input
                  id="lq-first" ref={firstRef} type="text" autoComplete="given-name" placeholder="John"
                  value={firstName} onChange={e => { setFirstName(e.target.value); clearErr("firstName"); }}
                  style={{
                    height: 52, borderRadius: 10, padding: "0 16px",
                    // hardcoded-color-allow-next-line
                    border: `1.5px solid ${errors.firstName ? "#DC2626" : "rgba(11,16,41,0.20)"}`,
                    fontFamily: "Inter, sans-serif", fontSize: 16, color: INK,
                    outline: "none", width: "100%", boxSizing: "border-box",
                  }}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && <p role="alert" style={{ fontSize: 12, color: "#DC2626", fontFamily: "Inter, sans-serif" }}>{errors.firstName}</p>}
              </div>

              {/* Phone */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="lq-phone" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: INK }}>Phone number</label>
                <input
                  id="lq-phone" ref={phoneRef} type="tel" inputMode="tel" autoComplete="tel" placeholder="(555) 000-0000"
                  value={phone} onChange={e => { setPhone(fmt(e.target.value)); clearErr("phone"); }}
                  style={{
                    height: 52, borderRadius: 10, padding: "0 16px",
                    // hardcoded-color-allow-next-line
                    border: `1.5px solid ${errors.phone ? "#DC2626" : "rgba(11,16,41,0.20)"}`,
                    fontFamily: "Inter, sans-serif", fontSize: 16, color: INK,
                    outline: "none", width: "100%", boxSizing: "border-box",
                  }}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <p role="alert" style={{ fontSize: 12, color: "#DC2626", fontFamily: "Inter, sans-serif" }}>{errors.phone}</p>}
              </div>

              {/* TCPA */}
              <p style={{ fontSize: 11, color: "rgba(11,16,41,0.50)", lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
                By submitting, you agree to receive SMS/calls from Men's Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out.{" "}
                <a href="/privacy-policy" style={{ color: ORANGE, textDecoration: "none" }}>Privacy Policy</a>
              </p>

              {controller.error && !Object.keys(errors).length && (
                <p role="alert" style={{ fontSize: 13, color: "#DC2626", fontFamily: "Inter, sans-serif" }}>
                  Something went wrong. Try again or call us directly.
                </p>
              )}

              <button type="submit" disabled={controller.isSubmitting}
                style={{
                  width: "100%", height: 56, borderRadius: 10, border: "none",
                  background: controller.isSubmitting ? "rgba(232,103,10,0.60)" : ORANGE,
                  color: WHITE, cursor: controller.isSubmitting ? "wait" : "pointer",
                  fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  // hardcoded-color-allow-next-line
                  boxShadow: "0 4px 20px rgba(232,103,10,0.40)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                {controller.isSubmitting
                  ? <><Loader2 size={16} className="animate-spin" /> Reserving...</>
                  : <>Reserve My 60-Minute Visit <ArrowRight size={16} aria-hidden /></>}
              </button>

              {/* Tap-to-call */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(11,16,41,0.55)", marginBottom: 8 }}>Prefer to call?</p>
                <a href={PHONE.tel} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: ORANGE, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                  <Phone size={15} aria-hidden /> {PHONE.display}
                </a>
              </div>
            </form>
          </div>

          {/* Disclaimer */}
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(11,16,41,0.50)", lineHeight: 1.6, textAlign: "center", marginTop: 20 }}>
            This quiz is not a diagnosis. Treatment requires a clinical evaluation and is provided only when medically appropriate.
          </p>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button type="button" onClick={() => window.location.reload()}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(11,16,41,0.45)", textDecoration: "underline" }}>
              Retake the quiz
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <section style={{ background: CREAM, padding: "72px 0" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", margin: "0 auto 24px",
          background: "rgba(34,197,94,0.12)", border: "2px solid #22C55E",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Check size={28} style={{ color: "#22C55E" }} strokeWidth={2.5} aria-hidden />
        </div>
        <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(26px,4vw,36px)", textTransform: "uppercase", color: INK, lineHeight: 1.1, marginBottom: 16 }}>
          You're on the list.
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: "rgba(11,16,41,0.70)", lineHeight: 1.65, marginBottom: 36 }}>
          A Men's Wellness Centers team member will call you within one business hour to help reserve your 60-minute in-person consultation.
        </p>
        <div style={{ background: WHITE, borderRadius: 16, padding: "24px", textAlign: "left", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(11,16,41,0.50)", marginBottom: 18 }}>
            What to expect
          </p>
          {[
            { n: "1", text: "A team member will call to confirm your visit." },
            { n: "2", text: "Bring a photo ID and wear loose sleeves." },
            { n: "3", text: "Plan for 60 minutes from arrival to checkout." },
          ].map(({ n, text }) => (
            <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: ORANGE, color: WHITE, fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: INK, lineHeight: 1.5, margin: "4px 0 0" }}>{text}</p>
            </div>
          ))}
        </div>
        <a href="/" style={{ display: "inline-block", marginTop: 32, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(11,16,41,0.50)" }}>
          Return to Men's Wellness Centers
        </a>
      </div>
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HormoneQuiz() {
  const [quizStep, setQuizStep] = useState<QuizStep>("intro");
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    symptoms: [], impact: null, timeline: null, readiness: null,
  });
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => { track("quiz_view", { quiz: "low_t" }); }, []);
  useEffect(() => {
    if (quizStep !== "intro") track("quiz_step_view", { step: quizStep, quiz: "low_t" });
  }, [quizStep]);

  const scrollTop = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);

  const advance = (next: QuizStep) => {
    track("quiz_step_complete", { step: quizStep, quiz: "low_t" });
    setQuizStep(next);
    scrollTop();
  };
  const back = () => {
    const prev: Record<QuizStep, QuizStep> = { intro: "intro", q1: "intro", q2: "q1", q3: "q2", q4: "q3", result: "q4" };
    track("quiz_back_click", { step: quizStep, quiz: "low_t" });
    setQuizStep(prev[quizStep]);
    scrollTop();
  };

  const toggleSymptom = (id: string) => {
    setAnswers(a => {
      const cur = a.symptoms;
      if (id === "none") return { ...a, symptoms: cur.includes("none") ? [] : ["none"] };
      const without = cur.filter(x => x !== "none" && x !== id);
      return { ...a, symptoms: cur.includes(id as SymptomId) ? without : [...without, id as SymptomId] };
    });
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <SEO
        title="Low-T Quiz | Men's Wellness Centers"
        description="Take our 60-second low testosterone quiz. See if a no-cost 60-minute in-person consultation at Men's Wellness Centers may be worth your time."
      />

      <div ref={topRef} />
      <BookHeader />

      {/* Sticky back button for quiz steps */}
      {quizStep !== "intro" && quizStep !== "result" && !submitted && (
        <div style={{ position: "sticky", top: 48, zIndex: 40, background: CREAM, borderBottom: "1px solid rgba(11,16,41,0.08)", padding: "10px 20px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button type="button" onClick={back}
              style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(11,16,41,0.60)" }}>
              <ChevronDown size={16} style={{ transform: "rotate(90deg)" }} aria-hidden /> Back
            </button>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(11,16,41,0.45)" }}>
              {{ q1: "1", q2: "2", q3: "3", q4: "4" }[quizStep] ?? ""} of 4
            </span>
          </div>
        </div>
      )}

      {submitted ? (
        <SuccessScreen />
      ) : quizStep === "intro" ? (
        <StepIntro onStart={() => { track("quiz_start", { quiz: "low_t" }); advance("q1"); }} />
      ) : quizStep === "q1" ? (
        <Q1_Symptoms selected={answers.symptoms} onToggle={toggleSymptom} onNext={() => advance("q2")} />
      ) : quizStep === "q2" ? (
        <Q2_Impact selected={answers.impact} onSelect={id => setAnswers(a => ({ ...a, impact: id as ImpactId }))} onNext={() => advance("q3")} />
      ) : quizStep === "q3" ? (
        <Q3_Timeline selected={answers.timeline} onSelect={id => setAnswers(a => ({ ...a, timeline: id as TimelineId }))} onNext={() => advance("q4")} />
      ) : quizStep === "q4" ? (
        <Q4_Readiness selected={answers.readiness} onSelect={id => setAnswers(a => ({ ...a, readiness: id as ReadinessId }))} onNext={() => { track("quiz_form_view", { bucket: getBucket(answers) }); advance("result"); }} />
      ) : (
        <StepResult answers={answers} onSuccess={() => setSubmitted(true)} />
      )}


    </div>
  );
}
