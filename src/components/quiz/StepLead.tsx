import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { QuizTrustBlock } from "./QuizTrustBlock";
import { z } from "zod";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { nameField, phoneField } from "@/domain/leads/leadFormSchema";
import { QuizShell } from "./QuizShell";
import { PrimaryQuizButton } from "./PrimaryQuizButton";
import { LocationSelector } from "@/components/landing/trt/LocationSelector";
import type { LocationKey } from "@/data/croContent";

interface StepLeadProps {
  initial: { fullName: string; email: string; phone: string; location: string; consent: boolean };
  totalScore: number;
  bracket: string;
  disqualified: boolean;
  tags: string[];
  /** Reserved for future GHL note support; currently unused. */
  noteBody?: string;
  onCapture: (patch: { fullName: string; email: string; phone: string; location: string; consent: boolean }) => void;
  onSubmitted: () => void;
}

/** Email is optional — allow empty string or a valid email address. */
const optionalEmailField = z.union([
  z.literal(""),
  z.string().trim().max(255).email("Enter a valid email or leave blank"),
]);

const locationField = z.string().min(2, "Please select a location");

const quizLeadSchema = z.object({
  name: nameField,
  email: optionalEmailField,
  phone: phoneField,
  location: locationField,
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
 * the Finalizing transition.
 * - Email is optional (labelled as such).
 * - State/dropdown removed.
 * Progress: 75–95%.
 */
export function StepLead({
  initial, totalScore, bracket, disqualified, tags,
  onCapture, onSubmitted,
}: StepLeadProps) {
  const [name, setName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [location, setLocation] = useState<LocationKey | "">(initial.location as LocationKey | "");
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
        email: v.email || undefined,
        phone: v.phone,
        tags: [],
      };
    },
    onSuccess: (_r, v) => {
      onCapture({
        fullName: v.name,
        email: v.email,
        phone: v.phone,
        location: v.location,
        consent: true,
      });
      onSubmitted();
    },
    persistToBookingState: false,
    toastOnError: true,
  });

  const errors = controller.fieldErrors;
  const submitting = controller.isSubmitting;

  // Required: name + phone + consent. Email is optional.
  const valid =
    name.trim().length >= 2 &&
    phone.replace(/\D/g, "").length === 10 &&
    location !== "" &&
    tcpa;

  const inputBase = (field: string): React.CSSProperties => ({
    width: "100%",
    height: 52,
    background: "rgba(11,16,41,0.55)",
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
    void controller.submit({ name, email, phone, location: location || "", tcpa });
  }

  // Progress 75 → 95 as required fields get filled.
  const filled = [name.length >= 2, phone.replace(/\D/g, "").length === 10].filter(Boolean).length;
  const progress = 75 + filled * 10;

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
            <>See My Results &rarr;</>
          )}
        </PrimaryQuizButton>
      }
    >
      <header className="mb-8">
        <p
          className="text-xs uppercase tracking-[0.18em] mb-3 font-semibold"
          style={{ color: "var(--brand-cta-accessible)" }}
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
          Get your results.
        </h1>
        <p
          className="mt-4 text-base md:text-lg max-w-[600px]"
          style={{ color: "rgba(245,240,235,0.85)" }}
        >
          Enter your details to confirm eligibility and view your personalized report.{" "}
          {/* hardcoded-color-allow-next-line */}
          <span style={{ color: "rgba(245,240,235,0.65)" }}>
            Score: {totalScore} . Tier: {bracket}.
          </span>
        </p>
      </header>

      <form id="quiz-lead-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
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

        {/* Location */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: errors.location ? "var(--c-error-on-dark)" : "rgba(245,240,235,0.55)",
            marginBottom: 8, fontFamily: "Inter, sans-serif",
          }}>
            Location <MapPin size={11} style={{ display: "inline", verticalAlign: "middle" }} />
          </p>
          <LocationSelector
            value={location}
            onChange={(loc) => setLocation(loc)}
          />
          {errors.location ? (
            <p className="mt-1 text-xs" style={{ color: "var(--c-error-on-dark)" }}>{errors.location}</p>
          ) : null}
        </div>

        {/* Phone (required) */}
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

        {/* Email (optional) */}
        <div>
          <div className="relative">
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
            <span
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium tracking-wide uppercase"
              // hardcoded-color-allow-next-line
              style={{ color: "rgba(245,240,235,0.45)" }}
            >
              optional
            </span>
          </div>
          {errors.email ? (
            <p className="mt-1 text-xs" style={{ color: "var(--c-error-on-dark)" }}>{errors.email}</p>
          ) : null}
        </div>

        {/* TCPA */}
        <label
          className="flex items-start gap-3 text-xs md:text-sm leading-relaxed select-none pt-2"
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
            Based on your answers, we recommend speaking with your provider before starting TRT. We'll still review your results and reach out to discuss the right next step for you.
          </div>
        ) : null}
      </form>

      <QuizTrustBlock />
    </QuizShell>
  );
}
