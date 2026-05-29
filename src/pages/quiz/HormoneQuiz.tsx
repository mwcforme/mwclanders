/**
 * /check — "Check Your Edge" hormone health decision-support quiz.
 *
 * Design: matches book.menswellnesscenters.com booking funnel exactly —
 * white cards on cream/light bg, orange primary, dark navy text, Lucide icons.
 *
 * 6-step funnel:
 *   1. Intro
 *   2. Multi-select wellness changes (with icons)
 *   3. Impact level
 *   4. Timeline
 *   5. Readiness
 *   6. Result + 2-field lead form
 *
 * Compliance: no diagnosis, no treatment promises, no PHI beyond name+phone.
 */
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, Check, Phone, Shield, Award,
  Zap, Target, Dumbbell, Brain, Moon, Heart,
  Circle, Clock, TrendingUp, Calendar, ArrowRight,
  Loader2, Star,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { BookHeader } from "@/components/book/BookHeader";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { m } from "@/lib/miniSchema";
import { getAttribution } from "@/lib/attribution";
import { PHONE } from "@/lib/constants";

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
  { id: "energy",   label: "Lower energy",                          Icon: Zap       },
  { id: "drive",    label: "Less drive or motivation",              Icon: Target    },
  { id: "strength", label: "Changes in strength or body composition", Icon: Dumbbell },
  { id: "focus",    label: "Trouble staying focused",               Icon: Brain     },
  { id: "sleep",    label: "Sleep feels less restorative",          Icon: Moon      },
  { id: "sexual",   label: "Changes in sexual confidence",          Icon: Heart     },
  { id: "none",     label: "None of these",                         Icon: Circle    },
] as const;
type WellnessId = typeof WELLNESS_OPTIONS[number]["id"];

const IMPACT_OPTIONS = [
  { id: "mild",        label: "Mildly",           sub: "I notice it but push through",          Icon: TrendingUp },
  { id: "moderate",    label: "Moderately",        sub: "Affecting work, workouts, or relationships", Icon: TrendingUp },
  { id: "significant", label: "Significantly",     sub: "It is hard to ignore day to day",      Icon: TrendingUp },
  { id: "unsure",      label: "I am not sure yet", sub: "Still figuring out what is normal",    Icon: Circle     },
] as const;
type ImpactId = typeof IMPACT_OPTIONS[number]["id"];

const TIMELINE_OPTIONS = [
  { id: "lt3mo",   label: "Less than 3 months", Icon: Clock    },
  { id: "3to6mo",  label: "3 to 6 months",      Icon: Clock    },
  { id: "6to12mo", label: "6 to 12 months",     Icon: Calendar },
  { id: "gt12mo",  label: "More than 12 months", Icon: Calendar },
  { id: "unsure",  label: "Not sure",            Icon: Circle   },
] as const;
type TimelineId = typeof TIMELINE_OPTIONS[number]["id"];

const READINESS_OPTIONS = [
  { id: "asap",     label: "As soon as possible",         sub: "I am ready to take action",       Icon: ArrowRight },
  { id: "weeks",    label: "Within the next few weeks",   sub: "Almost ready, just researching",  Icon: Calendar   },
  { id: "research", label: "I am researching options",    sub: "Learning before I commit",         Icon: Brain      },
  { id: "notready", label: "I am not ready yet",          sub: "Just curious for now",            Icon: Circle     },
] as const;
type ReadinessId = typeof READINESS_OPTIONS[number]["id"];

interface QuizAnswers {
  wellness:  WellnessId[];
  impact:    ImpactId | null;
  timeline:  TimelineId | null;
  readiness: ReadinessId | null;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL_QUIZ_STEPS = 4; // steps 2-5 are the quiz questions

function getResultBucket(answers: QuizAnswers): "consult" | "soft" {
  const hasNone = answers.wellness.includes("none");
  const meaningfulConcerns = !hasNone && answers.wellness.length > 0;
  const moderateOrHigher = answers.impact === "moderate" || answers.impact === "significant";
  return (meaningfulConcerns && moderateOrHigher) ? "consult" : "soft";
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const quizLeadSchema = m.object({
  firstName: m.str().trim().min(1, "Please enter your first name.").max(60, "Name is too long"),
  phone: m.str().transform((v: string) => v.replace(/\D/g, "")).refine(
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

// ─── Layout shell ─────────────────────────────────────────────────────────────

function QuizLayout({ children, step, onBack }: {
  children: React.ReactNode;
  step: Step;
  onBack?: () => void;
}) {
  const pct = step === 1 ? 0 : ((step - 2) / TOTAL_QUIZ_STEPS) * 100;
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--brand-cream, #F5F0EB)" }}>
      <BookHeader />
      {/* Progress bar */}
      {step > 1 && step < 6 && (
        <div style={{ position: "fixed", top: 48, left: 0, right: 0, height: 3, background: "rgba(11,16,41,0.10)", zIndex: 49 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--brand-cta)", transition: "width 350ms ease", borderRadius: 2 }} />
        </div>
      )}
      <main className="flex-1 mx-auto w-full max-w-xl px-4 sm:px-6" style={{ paddingTop: step > 1 ? 76 : 72, paddingBottom: 40 }}>
        {/* Back + step count */}
        {step > 1 && step < 6 && (
          <div className="flex items-center justify-between mb-6">
            {onBack ? (
              <button type="button" onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-panel-muted hover:text-panel-foreground transition-colors py-1 min-h-[44px]">
                <ChevronLeft size={16} aria-hidden /> Back
              </button>
            ) : <div />}
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-panel-muted">
              Step {step - 1} of {TOTAL_QUIZ_STEPS}
            </span>
          </div>
        )}
        {children}
      </main>
      <QuizFooter />
    </div>
  );
}

// ─── Step 1: Intro ────────────────────────────────────────────────────────────

function StepIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-8 pt-4">
      {/* Eyebrow */}
      <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white bg-panel-foreground rounded-md px-3 py-1 inline-block">
        Men's Wellness Centers
      </p>

      <div>
        <h1 className="font-display font-bold text-[clamp(30px,7vw,44px)] text-panel-foreground uppercase leading-tight mb-4">
          Check Your Edge.
        </h1>
        <p className="text-base text-panel-muted leading-relaxed max-w-md mx-auto">
          Answer a few quick questions to see whether a 60-minute in-person consultation at Men's Wellness Centers may be worth your time.
        </p>
      </div>

      {/* Trust strip */}
      <div className="w-full rounded-2xl bg-panel shadow-card border border-panel-divider p-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { Icon: Award,  text: "LegitScript certified" },
            { Icon: Shield, text: "100% private" },
            { Icon: Check,  text: "No-cost first visit" },
            { Icon: Star,   text: "4.9 · 191 Google reviews" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon size={15} className="text-primary" aria-hidden />
              </div>
              <span className="text-sm font-semibold text-panel-foreground leading-tight">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <button type="button" onClick={onStart}
          className="w-full h-14 rounded-2xl font-display font-bold uppercase tracking-wider text-base bg-primary text-white shadow-cta hover:bg-primary-hover transition-colors">
          Start The Quiz
        </button>
        <p className="text-xs text-panel-muted mt-3">
          Takes about 60 seconds. No diagnosis. No obligation.
        </p>
      </div>
    </div>
  );
}

// ─── Multi-select step (Step 2) ───────────────────────────────────────────────

function MultiSelectStep({
  question, disclaimer, options, selected, onToggle, onNext,
}: {
  question: string;
  disclaimer?: string;
  options: readonly { id: string; label: string; Icon: React.ElementType }[];
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  const hasSelection = selected.length > 0;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-bold text-[clamp(22px,5vw,30px)] text-panel-foreground uppercase leading-tight mb-2">
          {question}
        </h2>
        {disclaimer && (
          <p className="text-xs text-panel-muted leading-relaxed">{disclaimer}</p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {options.map(({ id, label, Icon }) => {
          const isSelected = selected.includes(id);
          return (
            <button key={id} type="button"
              onClick={() => onToggle(id)}
              aria-pressed={isSelected}
              className={[
                "w-full min-h-[64px] text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5",
                "border-[1.5px] bg-panel transition-all",
                isSelected
                  ? "border-primary shadow-cta"
                  : "border-panel-border hover:border-primary shadow-card",
              ].join(" ")}
            >
              {/* Icon circle */}
              <div className={[
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isSelected ? "bg-primary" : "bg-primary/10",
              ].join(" ")}>
                <Icon size={18} className={isSelected ? "text-white" : "text-primary"} aria-hidden />
              </div>
              <span className="font-display text-base font-bold uppercase tracking-wide text-panel-foreground flex-1">
                {label}
              </span>
              {isSelected && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check size={13} className="text-white" strokeWidth={3} aria-hidden />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onNext} disabled={!hasSelection}
        className={[
          "w-full h-14 rounded-2xl font-display font-bold uppercase tracking-wider text-base transition-colors",
          hasSelection
            ? "bg-primary text-white shadow-cta hover:bg-primary-hover cursor-pointer"
            : "bg-disabled text-disabled-foreground cursor-not-allowed",
        ].join(" ")}>
        Next
      </button>
    </div>
  );
}

// ─── Single-select step (Steps 3, 4, 5) ──────────────────────────────────────

function SingleSelectStep({
  question, options, selected, onSelect, onNext,
}: {
  question: string;
  options: readonly { id: string; label: string; sub?: string; Icon: React.ElementType }[];
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display font-bold text-[clamp(22px,5vw,30px)] text-panel-foreground uppercase leading-tight">
        {question}
      </h2>

      <div className="flex flex-col gap-2.5">
        {options.map(({ id, label, sub, Icon }) => {
          const isSelected = selected === id;
          return (
            <button key={id} type="button"
              onClick={() => onSelect(id)}
              aria-pressed={isSelected}
              className={[
                "w-full min-h-[64px] text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5",
                "border-[1.5px] bg-panel transition-all",
                isSelected
                  ? "border-primary shadow-cta"
                  : "border-panel-border hover:border-primary shadow-card",
              ].join(" ")}
            >
              <div className={[
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isSelected ? "bg-primary" : "bg-primary/10",
              ].join(" ")}>
                <Icon size={18} className={isSelected ? "text-white" : "text-primary"} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-bold uppercase tracking-wide text-panel-foreground leading-tight">
                  {label}
                </p>
                {sub && (
                  <p className="text-xs text-panel-muted mt-0.5 leading-snug">{sub}</p>
                )}
              </div>
              {isSelected && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check size={13} className="text-white" strokeWidth={3} aria-hidden />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onNext} disabled={!selected}
        className={[
          "w-full h-14 rounded-2xl font-display font-bold uppercase tracking-wider text-base transition-colors",
          selected
            ? "bg-primary text-white shadow-cta hover:bg-primary-hover cursor-pointer"
            : "bg-disabled text-disabled-foreground cursor-not-allowed",
        ].join(" ")}>
        Next
      </button>
    </div>
  );
}

// ─── Step 6: Result + lead form ───────────────────────────────────────────────

function StepResult({ answers, onSubmitSuccess }: {
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
      track("quiz_submit_success", { bucket, impact: answers.impact, readiness: answers.readiness });
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
    <div className="flex flex-col gap-5">
      {/* Result card */}
      <div className="rounded-2xl bg-panel shadow-card border-2 border-primary/30 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Check size={20} className="text-primary" strokeWidth={2.5} aria-hidden />
          </div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Your Result
          </p>
        </div>
        <h2 className="font-display font-bold text-[clamp(20px,4vw,26px)] text-panel-foreground uppercase leading-tight mb-3">
          {bucket === "consult"
            ? "A 60-Minute Consultation May Be Worth Your Time."
            : "It May Still Be Worth A Conversation."}
        </h2>
        <p className="text-sm text-panel-muted leading-relaxed">
          {bucket === "consult"
            ? "Your answers suggest it may be worth sitting down with a physician at Men's Wellness Centers. During your visit, the team can review your goals, discuss in-clinic lab work, and walk through options when clinically appropriate."
            : "Even if you are still researching, a no-cost 60-minute consultation can help you understand your options and decide whether physician-led men's health care is right for you."}
        </p>
      </div>

      {/* Trust grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { Icon: Award,      text: "LegitScript certified" },
          { Icon: Shield,     text: "100% private" },
          { Icon: Check,      text: "No-cost first visit" },
          { Icon: Dumbbell,   text: "Physician-led care" },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 rounded-xl bg-panel border border-panel-divider shadow-card px-3 py-2.5">
            <Icon size={15} className="text-primary flex-shrink-0" aria-hidden />
            <span className="text-xs font-semibold text-panel-foreground leading-tight">{text}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-panel shadow-card border border-panel-divider overflow-hidden">
        <div className="bg-panel-foreground px-5 py-4">
          <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
            Reserve your no-cost visit
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
            Same- or next-day availability at 3 Virginia centers.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-5 py-5 flex flex-col gap-4">
          {/* First name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hq-first" className="text-sm font-semibold text-panel-foreground">
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
              className={[
                "w-full h-12 rounded-xl border bg-background px-4 text-base text-panel-foreground placeholder:text-panel-muted outline-none transition-colors",
                errors.firstName ? "border-destructive focus:border-destructive" : "border-panel-border focus:border-primary",
              ].join(" ")}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "hq-first-err" : undefined}
            />
            {errors.firstName && (
              <p id="hq-first-err" role="alert" className="text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hq-phone" className="text-sm font-semibold text-panel-foreground">
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
              className={[
                "w-full h-12 rounded-xl border bg-background px-4 text-base text-panel-foreground placeholder:text-panel-muted outline-none transition-colors",
                errors.phone ? "border-destructive focus:border-destructive" : "border-panel-border focus:border-primary",
              ].join(" ")}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "hq-phone-err" : undefined}
            />
            {errors.phone && (
              <p id="hq-phone-err" role="alert" className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* TCPA */}
          <p className="text-xs text-panel-muted leading-relaxed">
            By submitting, you agree to receive SMS/calls from Men's Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out. Not a condition of service.{" "}
            <a href="/privacy-policy" className="text-primary underline underline-offset-2">Privacy Policy</a>
          </p>

          {controller.error && !Object.keys(errors).length && (
            <p role="alert" className="text-sm text-destructive">
              Something went wrong. Please try again, or call Men's Wellness Centers directly.
            </p>
          )}

          <button type="submit" disabled={controller.isSubmitting}
            className={[
              "w-full h-14 rounded-2xl font-display font-bold uppercase tracking-wider text-base transition-colors",
              controller.isSubmitting
                ? "bg-primary/60 text-white cursor-wait"
                : "bg-primary text-white shadow-cta hover:bg-primary-hover cursor-pointer",
            ].join(" ")}>
            {controller.isSubmitting
              ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Reserving...</span>
              : "Reserve My 60-Minute Visit"}
          </button>
        </form>
      </div>

      {/* Tap-to-call */}
      <div className="text-center">
        <p className="text-xs text-panel-muted mb-2">Prefer to talk now?</p>
        <a href={PHONE.tel}
          className="inline-flex items-center gap-2 text-primary font-semibold text-base">
          <Phone size={16} aria-hidden /> {PHONE.display}
        </a>
      </div>

      <p className="text-xs text-panel-muted leading-relaxed text-center border-t border-panel-divider pt-4">
        This quiz is not a diagnosis. Treatment requires a clinical evaluation and is provided only when medically appropriate.
      </p>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center gap-6 text-center pt-4">
      <div className="w-16 h-16 rounded-full bg-success/15 ring-4 ring-success flex items-center justify-center">
        <Check size={28} className="text-success" strokeWidth={2.5} aria-hidden />
      </div>
      <div>
        <h2 className="font-display font-bold text-[clamp(24px,5vw,32px)] text-panel-foreground uppercase leading-tight mb-3">
          You're On The List.
        </h2>
        <p className="text-base text-panel-muted leading-relaxed max-w-sm mx-auto">
          A Men's Wellness Centers team member will call you within one business hour to help reserve your 60-minute in-person consultation.
        </p>
      </div>

      <div className="w-full rounded-2xl bg-panel shadow-card border border-panel-divider p-5">
        <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-panel-muted mb-4">
          What to expect
        </p>
        {[
          { n: "1", text: "A team member will call to confirm your visit." },
          { n: "2", text: "Bring a photo ID and wear loose sleeves." },
          { n: "3", text: "Plan for 60 minutes from arrival to checkout." },
        ].map(({ n, text }) => (
          <div key={n} className="flex items-start gap-3 mb-3 last:mb-0">
            <div className="w-8 h-8 rounded-full bg-primary text-white font-display font-bold text-sm flex items-center justify-center flex-shrink-0">
              {n}
            </div>
            <p className="text-sm text-panel-foreground leading-relaxed mt-1">{text}</p>
          </div>
        ))}
      </div>

      <a href="/" className="text-sm font-semibold text-panel-muted hover:text-panel-foreground transition-colors">
        Return to Men's Wellness Centers
      </a>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function QuizFooter() {
  return (
    <footer className="border-t border-panel-divider py-6 px-5 text-center bg-panel">
      <p className="text-xs text-panel-muted leading-relaxed max-w-lg mx-auto mb-3">
        Treatment requires a clinical evaluation and is provided only when medically appropriate. Individual results vary. Treatment is provided by licensed physicians at Men's Wellness Centers.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        {[
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms", href: "/terms-of-service" },
          { label: "HIPAA Notice", href: "/privacy-practices" },
        ].map(link => (
          <a key={link.href} href={link.href} className="text-xs text-panel-muted hover:text-panel-foreground transition-colors">
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HormoneQuiz() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    wellness: [], impact: null, timeline: null, readiness: null,
  });
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => { track("quiz_view", { quiz: "hormone_check" }); }, []);

  const scrollTop = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

  const goNext = (next: Step) => {
    track("quiz_step_complete", { step_number: step, quiz: "hormone_check" });
    setStep(next);
    scrollTop();
  };
  const goBack = () => {
    track("quiz_back_click", { step_number: step, quiz: "hormone_check" });
    setStep(s => Math.max(1, s - 1) as Step);
    scrollTop();
  };

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

  return (
    <>
      <SEO
        title="Check Your Edge | Men's Wellness Centers"
        description="Answer a few quick questions to see whether a 60-minute in-person consultation at Men's Wellness Centers may be worth your time."
      />
      <div ref={topRef} />
      {submitted ? (
        <QuizLayout step={6}>
          <SuccessScreen />
        </QuizLayout>
      ) : (
        <QuizLayout step={step} onBack={step > 1 ? goBack : undefined}>
          {step === 1 && (
            <StepIntro onStart={() => { track("quiz_start", { quiz: "hormone_check" }); goNext(2); }} />
          )}
          {step === 2 && (
            <MultiSelectStep
              question="Which changes have you noticed lately?"
              disclaimer="This quiz does not diagnose a medical condition. It helps determine whether a physician-led consultation may be appropriate."
              options={WELLNESS_OPTIONS}
              selected={answers.wellness}
              onToggle={toggleWellness}
              onNext={() => goNext(3)}
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
              onNext={() => { track("quiz_form_view", { bucket: getResultBucket(answers) }); goNext(6); }}
            />
          )}
          {step === 6 && (
            <StepResult answers={answers} onSubmitSuccess={() => setSubmitted(true)} />
          )}
        </QuizLayout>
      )}
    </>
  );
}
