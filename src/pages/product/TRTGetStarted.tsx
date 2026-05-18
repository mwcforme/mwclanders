/**
 * /product/trt/get-started — Contact capture form
 * Step 1 of the 10-step TRT funnel.
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, AlertCircle, Loader2, ArrowRight, Lock } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";
import { upsertContact } from "@/lib/ghlCalendars";

const ORANGE = "var(--brand-cta)";
const NAVY   = "var(--brand-navy-deep)";
const ERR    = "var(--c-error-on-light)";
// hardcoded-color-allow-next-line
const GREEN  = "#16A34A";

const formatPhone = (v: string): string => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

interface FieldState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tcpa: boolean;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tcpa?: string;
}

function SimpleInput({
  id,
  label,
  type,
  inputMode,
  autoComplete,
  value,
  onChange,
  error,
  required,
  inputRef,
}: {
  id: string;
  label: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}) {
  const [focused, setFocused] = useState(false);
  const phoneComplete = type === "tel" && value.replace(/\D/g, "").length === 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        htmlFor={id}
        style={{ fontSize: 13, fontWeight: 600, color: NAVY, fontFamily: "Inter, sans-serif" }}
      >
        {label}{required && <span style={{ color: ORANGE }}> *</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          ref={inputRef}
          type={type ?? "text"}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          required={required}
          aria-invalid={!!error}
          onChange={(e) => onChange(type === "tel" ? formatPhone(e.target.value) : e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 56,
            // hardcoded-color-allow-next-line
            border: `1.5px solid ${error ? ERR : focused ? ORANGE : "#D0D5DD"}`,
            borderRadius: 8,
            padding: "0 42px 0 16px",
            fontSize: 16,
            color: NAVY,
            outline: "none",
            fontFamily: "Inter, sans-serif",
            background: "var(--c-text-on-dark)",
            transition: "border-color 150ms ease",
            WebkitAppearance: "none",
            boxSizing: "border-box",
          }}
        />
        {phoneComplete && !error && (
          <div style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            color: GREEN,
          }}>
            <Check size={18} strokeWidth={2.5} />
          </div>
        )}
      </div>
      {error && (
        <p role="alert" style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 12, color: ERR, fontFamily: "Inter, sans-serif",
        }}>
          <AlertCircle size={12} strokeWidth={2} /> {error}
        </p>
      )}
    </div>
  );
}

export default function TRTGetStarted() {
  const navigate   = useNavigate();
  const setIdentity = useBookingStore((s) => s.setIdentity);

  const [fields, setFields] = useState<FieldState>({
    firstName: "", lastName: "", email: "", phone: "", tcpa: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef  = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FieldState>(k: K, v: FieldState[K]) => {
    setFields((p) => ({ ...p, [k]: v }));
    setErrors((p) => { const { [k]: _, ...r } = p; return r; });
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!fields.firstName.trim()) e.firstName = "First name is required";
    if (!fields.lastName.trim())  e.lastName  = "Last name is required";
    if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      e.email = "Valid email is required";
    if (fields.phone.replace(/\D/g, "").length !== 10)
      e.phone = "Valid 10-digit phone required";
    if (!fields.tcpa) e.tcpa = "Consent required to continue";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const order: (keyof FieldErrors)[] = ["firstName", "lastName", "email", "phone", "tcpa"];
      const first = order.find((k) => errs[k]);
      if (first === "firstName") firstRef.current?.focus();
      else if (first === "lastName") lastRef.current?.focus();
      else if (first === "email") emailRef.current?.focus();
      else if (first === "phone") phoneRef.current?.focus();
      return;
    }

    setSubmitting(true);
    markSessionSubmitted();

    // Store identity in booking store (optimistically — no ghlContactId yet)
    setIdentity({
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      email: fields.email.trim(),
      phone: fields.phone,
    });

    // GHL upsert — fire-and-forget, never block navigation
    upsertContact({
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      email: fields.email.trim(),
      phone: fields.phone,
      source: "product-trt-funnel",
      tags: ["product-trt"],
    }).then((ghlContactId) => {
      // Back-fill the contactId so downstream steps can tag the contact
      setIdentity({
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        email: fields.email.trim(),
        phone: fields.phone,
        ghlContactId,
      });
    }).catch(() => { /* non-blocking — UX must never depend on this */ });

    // Fire-and-forget partial capture (Supabase fallback)
    void capturePartialLead({
      phone: fields.phone,
      name: `${fields.firstName} ${fields.lastName}`,
      email: fields.email,
      source: "product-trt-funnel",
    });

    navigate("/product/trt/medical-protocol");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--c-text-on-dark)" }}>
      <SEO
        title="Get Started with TRT | Men's Wellness Centers"
        description="Begin your no-cost testosterone consultation with a Virginia-licensed provider."
      />
      <TRTHeader minimal />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 48px" }}>
        <div style={{
          width: "100%", maxWidth: 480,
          background: "var(--c-text-on-dark)",
          borderRadius: 16,
          // hardcoded-color-allow-next-line
          boxShadow: "0 8px 40px rgba(11,16,41,0.10)",
          overflow: "hidden",
        }}>

          {/* Provider image */}
          <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
            <img
              src="/src/assets/lp/provider-headshot.webp"
              alt="Men's Wellness Centers provider"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Overlay */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "24px 20px 16px",
              // hardcoded-color-allow-next-line
              background: "linear-gradient(transparent, rgba(11,16,41,0.85))",
            }}>
              <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--c-text-on-dark)" }}>
                TRT In-Person{" "}
                <span style={{ color: ORANGE }}>·</span>
                {" "}No-Cost Consultation
              </span>
            </div>
          </div>

          {/* Promo banner */}
          <div style={{
            // hardcoded-color-allow-next-line
            background: "#F0FDF4",
            // hardcoded-color-allow-next-line
            borderBottom: "1px solid #BBF7D0",
            padding: "10px 20px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Check size={12} strokeWidth={3} style={{ color: "var(--c-text-on-dark)" }} />
            </div>
            <span style={{ fontSize: 14, color: "#15803D", fontFamily: "Inter, sans-serif" }}>
              <strong>Promo Applied:</strong> Free Testosterone Test
            </span>
          </div>

          {/* Step indicator */}
          <div style={{ padding: "16px 28px 0", textAlign: "center" }}>
            <span style={{
              // hardcoded-color-allow-next-line
              fontSize: 12, fontWeight: 600, color: "#9CA3AF",
              fontFamily: "Inter, sans-serif", letterSpacing: "0.05em",
            }}>
              STEP 1 OF 3
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ padding: "20px 28px 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SimpleInput
                id="gs-first"
                label="First Name"
                autoComplete="given-name"
                value={fields.firstName}
                onChange={(v) => set("firstName", v)}
                error={errors.firstName}
                inputRef={firstRef}
              />
              <SimpleInput
                id="gs-last"
                label="Last Name"
                autoComplete="family-name"
                value={fields.lastName}
                onChange={(v) => set("lastName", v)}
                error={errors.lastName}
                inputRef={lastRef}
              />
              <SimpleInput
                id="gs-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={fields.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
                inputRef={emailRef}
              />
              <SimpleInput
                id="gs-phone"
                label="Phone Number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={fields.phone}
                onChange={(v) => set("phone", v)}
                error={errors.phone}
                required
                inputRef={phoneRef}
              />

              {/* TCPA */}
              <div>
                <input
                  id="gs-tcpa"
                  type="checkbox"
                  checked={fields.tcpa}
                  onChange={(e) => set("tcpa", e.target.checked)}
                  aria-invalid={!!errors.tcpa}
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                />
                <label
                  htmlFor="gs-tcpa"
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    cursor: "pointer", userSelect: "none", padding: "4px 0",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                      // hardcoded-color-allow-next-line
                      border: `2px solid ${fields.tcpa ? ORANGE : errors.tcpa ? ERR : "#D0D5DD"}`,
                      background: fields.tcpa ? ORANGE : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: 1,
                      transition: "background 150ms ease, border-color 150ms ease",
                    }}
                  >
                    {fields.tcpa && <Check size={13} strokeWidth={3} style={{ color: "var(--c-text-on-dark)" }} />}
                  </div>
                  <span style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
                    I agree to receive SMS/calls from Men&rsquo;s Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out.
                    Not a condition of service. HIPAA Compliant.{" "}
                    <a href="/privacy-policy" style={{ color: ORANGE, textDecoration: "none" }}>Privacy Policy</a>
                  </span>
                </label>
                {errors.tcpa && (
                  <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR, marginTop: 6 }}>
                    <AlertCircle size={12} strokeWidth={2} /> {errors.tcpa}
                  </p>
                )}
              </div>

              {/* CTA */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", height: 56, borderRadius: 999,
                  background: ORANGE, color: "var(--c-text-on-dark)", border: "none",
                  fontFamily: "Oswald, sans-serif", fontWeight: 700,
                  fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase",
                  cursor: submitting ? "wait" : "pointer",
                  opacity: submitting ? 0.8 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  // hardcoded-color-allow-next-line
                  boxShadow: "0 4px 20px rgba(232,103,10,0.35)",
                  transition: "opacity 150ms ease",
                }}
              >
                {submitting
                  ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  : <>Continue <ArrowRight size={18} strokeWidth={2.5} /></>
                }
              </button>

              {/* Security trust line */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 0 2px",
              }}>
                <Lock size={13} strokeWidth={2} style={{ color: "#6B7280", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "Inter, sans-serif" }}>
                  Your information is encrypted and HIPAA protected
                </span>
              </div>
              </div>

              {/* Legal line */}
              <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
                By clicking Continue, you agree to our{" "}
                <a href="/terms-of-service" style={{ color: NAVY, textDecoration: "underline" }}>Terms &amp; Conditions</a>
                {" "}&amp;{" "}
                <a href="/privacy-policy" style={{ color: NAVY, textDecoration: "underline" }}>Privacy Policy</a>
              </p>
            </div>
          </form>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
}
