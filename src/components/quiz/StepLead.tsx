import { useState } from "react";
import { Lock, Loader2, ChevronDown, Star } from "lucide-react";
import { z } from "zod";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { nameField, phoneField, emailField } from "@/domain/leads/leadFormSchema";
import { US_STATES } from "@/data/quizContent";
import { QuizShell } from "./QuizShell";
import { PrimaryQuizButton } from "./PrimaryQuizButton";

interface StepLeadProps {
  initial: { fullName: string; email: string; phone: string; state: string; consent: boolean };
  totalScore: number;
  bracket: string;
  disqualified: boolean;
  tags: string[];
  /** Reserved for future GHL note support; currently unused. */
  noteBody?: string;
  onCapture: (patch: { fullName: string; email: string; phone: string; state: string; consent: boolean }) => void;
  onSubmitted: () => void;
}

const stateField = z.string().min(2, "Please select your state");

const quizLeadSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  state: stateField,
  tcpa: z.literal(true, { errorMap: () => ({ message: "Consent required to continue" }) }),
});

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

/**
 * Step 3 of /quiz. Captures contact info, fires the lead submission via the
 * shared controller (which handles GHL + Meta CAPI + GA4), then advances to
 * the Finalizing transition. Progress 85–100%.
 */
export function StepLead({
  initial, totalScore, bracket, disqualified, tags,
  onCapture, onSubmitted,
}: StepLeadProps) {
  const [name, setName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [stateCode, setStateCode] = useState(initial.state);
  const [tcpa, setTcpa] = useState(initial.consent);
  const [focused, setFocused] = useState<string | null>(null);

  const controller = useLeadSubmitController({
    schema: quizLeadSchema,
    source: "trt-quiz-v2",
    tags,
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return {
        firstName: first || "Guest",
        lastName: rest.join(" ") || undefined,
        email: v.email,
        phone: v.phone,
        tags: [`quiz_state:${v.state}`],
      };
    },
    onSuccess: (_r, v) => {
      onCapture({
        fullName: v.name,
        email: v.email,
        phone: v.phone,
        state: v.state,
        consent: true,
      });
      onSubmitted();
    },
    persistToBookingState: false,
    toastOnError: true,
  });

  const errors = controller.fieldErrors;
  const submitting = controller.isSubmitting;
  const valid = name.trim().length >= 2 && phone.replace(/\D/g, "").length === 10 &&
    /\S+@\S+\.\S+/.test(email) && stateCode.length >= 2 && tcpa;

  const inputBase = (field: string): React.CSSProperties => ({
    width: "100%",
    height: 52,
    // hardcoded-color-allow-next-line
    background: "rgba(11,16,41,0.55)",
    // hardcoded-color-allow-next-line
    border: `1.5px solid ${focused === field ? "var(--brand-cta)" : "rgba(245,240,235,0.32)"}`,
    borderRadius: 10,
    padding: "0 16px",
    fontSize: 16, // 16px prevents iOS zoom-on-focus
    color: "var(--brand-cream)",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 150ms ease",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void controller.submit({
      name,
      email,
      phone,
      state: stateCode,
      tcpa,
    });
  }

  // Progress bumps 85 -> 99 as fields get filled.
  const filled =
    [name.length >= 2, /\S+@\S+\.\S+/.test(email), phone.replace(/\D/g, "").length === 10, !!stateCode]
      .filter(Boolean).length;
  const progress = 85 + filled * 3.5;

  return (
    <QuizShell
      progress={progress}
      cta={
        <PrimaryQuizButton type="submit" form="quiz-lead-form" disabled={!valid || submitting}>
          {submitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Sending
            </span>
          ) : (
            <>Show my results &rarr;</>
          )}
        </PrimaryQuizButton>
      }
    >
      <header className="mb-8">
        <p
          className="text-xs uppercase tracking-[0.18em] mb-3 font-semibold"
          style={{ color: "var(--brand-cta)" }}
        >
          Step 3 of 3 . Almost there
        </p>
        <h1
          className="font-bold uppercase leading-[1.05]"
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(30px, 5vw, 46px)",
            letterSpacing: "0.01em",
          }}
        >
          Where should we send my results?
        </h1>
        <p
          className="mt-4 text-base md:text-lg max-w-[600px]"
          // hardcoded-color-allow-next-line
          style={{ color: "rgba(245,240,235,0.85)" }}
        >
          Enter my details to confirm eligibility and view my results securely.{" "}
          {/* hardcoded-color-allow-next-line */}
          <span style={{ color: "rgba(245,240,235,0.65)" }}>
            Score: {totalScore} of 69 . Tier: {bracket}.
          </span>
        </p>
      </header>

      <form id="quiz-lead-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Full Name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            style={inputBase("name")}
          />
          {errors.name ? (
            <p className="mt-1 text-xs" style={{ color: "var(--c-error-on-dark)" }}>{errors.name}</p>
          ) : null}
        </div>
        <div>
          <input
            type="email"
            inputMode="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            style={inputBase("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-xs" style={{ color: "var(--c-error-on-dark)" }}>{errors.email}</p>
          ) : null}
        </div>
        <div>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(555) 555-5555"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            style={inputBase("phone")}
          />
          {errors.phone ? (
            <p className="mt-1 text-xs" style={{ color: "var(--c-error-on-dark)" }}>{errors.phone}</p>
          ) : null}
        </div>
        <div className="relative">
          <select
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            onFocus={() => setFocused("state")}
            onBlur={() => setFocused(null)}
            style={{ ...inputBase("state"), appearance: "none", paddingRight: 40 }}
          >
            <option value="" disabled>Select your state</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            // hardcoded-color-allow-next-line
            style={{ color: "rgba(245,240,235,0.75)" }}
          />
          {errors.state ? (
            <p className="mt-1 text-xs" style={{ color: "var(--c-error-on-dark)" }}>{errors.state}</p>
          ) : null}
        </div>

        <label
          className="flex items-start gap-3 text-xs md:text-sm leading-relaxed select-none pt-2"
          // hardcoded-color-allow-next-line
          style={{ color: "rgba(245,240,235,0.85)" }}
        >
          <input
            type="checkbox"
            checked={tcpa}
            onChange={(e) => setTcpa(e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-[var(--brand-cta)]"
          />
          <span>
            I am over 18 and agree to receive communications from Men's Wellness Centers about my assessment, including by phone, text, and email. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of service. View our{" "}
            <a href="/tcpa" className="underline">TCPA disclosure</a>,{" "}
            <a href="/privacy-policy" className="underline">privacy policy</a>, and{" "}
            <a href="/terms-of-service" className="underline">terms</a>.
          </span>
        </label>
        {errors.tcpa ? <p className="text-xs" style={{ color: "var(--c-error-on-dark)" }}>{errors.tcpa}</p> : null}

        {disqualified ? (
          <div
            className="rounded-md p-3 text-xs"
            style={{
              // hardcoded-color-allow-next-line
              background: "rgba(255,176,122,0.10)",
              // hardcoded-color-allow-next-line
              border: "1px solid rgba(255,176,122,0.35)",
              // hardcoded-color-allow-next-line
              color: "#FFB07A",
            }}
          >
            Based on your safety check, your provider may need to clear you in person before TRT. We'll still review your results and reach out to discuss the right next step for you.
          </div>
        ) : null}
      </form>

      {/* Trust + testimonial */}
      {/* hardcoded-color-allow-next-line */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs" style={{ color: "rgba(245,240,235,0.75)" }}>
        <Lock size={12} /> 256-bit encrypted . Private . HIPAA-conscious
      </div>

      <div
        className="mt-6 rounded-xl p-5"
        style={{
          // hardcoded-color-allow-next-line
          background: "rgba(255,255,255,0.05)",
          // hardcoded-color-allow-next-line
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill="var(--brand-cta)" stroke="var(--brand-cta)" />
          ))}
          {/* hardcoded-color-allow-next-line */}
          <span className="text-xs font-semibold" style={{ color: "rgba(245,240,235,0.85)" }}>
            Excellent . 4.9 average
          </span>
        </div>
        {/* hardcoded-color-allow-next-line */}
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,235,0.92)" }}>
          "Now that I've started TRT, I can't believe how much has changed. My ED is improving. My muscles are coming back. It's only been two weeks. The depression and mental fog are finally lifting. MWC helped me feel like myself again."
        </p>
        {/* hardcoded-color-allow-next-line */}
        <p className="mt-2 text-xs" style={{ color: "rgba(245,240,235,0.65)" }}>
          Johnathan W. . Verified MWC patient
        </p>
      </div>
    </QuizShell>
  );
}
