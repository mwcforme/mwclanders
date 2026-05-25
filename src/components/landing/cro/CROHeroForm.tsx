/**
 * CROHeroForm — lead capture form for /cro-op hero and closing sections.
 * Handles name, phone, location, TCPA, GHL submission, and booking funnel entry.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Phone, User, AlertCircle, ArrowRight, Star, Check } from "lucide-react";

import { heroLeadSchema } from "@/domain/leads/leadFormSchema";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { formatPhone, getLocationFromUrl, type LocationKey } from "@/data/croContent";
import { FloatInput } from "@/components/landing/shared/FloatInput";
import { CROLocationSelector } from "./CROLocationSelector";
import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";

const croHeroLeadSchema = heroLeadSchema;
import type { HeroLeadInput } from "@/domain/leads/leadFormSchema";
type CROHeroLeadInput = HeroLeadInput;

// hardcoded-color-allow-next-line
const ERR_RED = "#DC2626";
const ORANGE  = "var(--brand-cta)";
const WHITE   = "var(--bg-white)";

export interface CROHeroFormProps {
  service?:    "trt" | "wl" | "ed";
  heading?:    string;
  subheading?: string;
  ctaLabel?:   string;
  formId?:     string;
  source?:     string;
}

export const CROHeroForm = ({
  service    = "trt",
  heading    = "Claim Your No-Cost Consultation",
  subheading = "Labs drawn on-site. Results reviewed same visit. Leave with a plan.",
  ctaLabel   = "Claim My No-Cost Visit Today",
  formId     = "cro-hf",
  source     = "cro-op-hero",
}: CROHeroFormProps = {}) => {
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState<LocationKey | "">(() => getLocationFromUrl());
  const [tcpa,     setTcpa]     = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const nameRef  = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const tcpaRef     = useRef<HTMLDivElement>(null);

  const controller = useLeadSubmitController<CROHeroLeadInput>({
    schema: croHeroLeadSchema,
    source,
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return { firstName: first || "Guest", lastName: rest.join(" ") || undefined, phone: v.phone };
    },
    onSuccess: (result, v) => {
      markSessionSubmitted();
      trackFunnelEvent("booking_started", { service, location: v.location });
      const [first, ...rest] = v.name.trim().split(/\s+/);
      enterBookingFunnel({
        identity: {
          firstName: first || "Guest", lastName: rest.join(" ") || undefined,
          phone: v.phone, email: (v as { email?: string }).email ?? "",
          ghlContactId: result.contactId,
        },
        service, location: v.location, source,
        lpSlug: typeof window !== "undefined" ? window.location.pathname : undefined,
      }, navigate);
    },
    toastOnError: false,
  });

  useEffect(() => {
    const fe = controller.fieldErrors;
    if (!Object.keys(fe).length) return;
    const mapped: Record<string, string> = {};
    for (const k of Object.keys(fe)) mapped[k] = fe[k];
    setErrors(mapped);
    const order = ["name", "phone", "location", "tcpa"];
    const first = order.find((k) => mapped[k]);
    if (first === "name")     nameRef.current?.focus();
    if (first === "phone")    phoneRef.current?.focus();
    if (first === "location") locationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (first === "tcpa")     tcpaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [controller.fieldErrors]);

  const clearErr = (k: string) => setErrors((p) => { const { [k]: _, ...r } = p; return r; });
  const isSubmitting = controller.isSubmitting;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void controller.submit({ name, phone, location: location as LocationKey, tcpa });
  };

  return (
    <BookingErrorBoundary>
      <div style={{
        // hardcoded-color-allow-next-line
        background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        // hardcoded-color-allow-next-line
        border: "1px solid rgba(255,255,255,0.35)", borderRadius: 16, padding: "32px 28px",
        // hardcoded-color-allow-next-line
        width: "100%", maxWidth: 416, boxShadow: "0 24px 64px rgba(0,0,0,0.50)", fontFamily: "Inter, sans-serif",
      }}>
        <a href={GBP_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 12 }}>
          <span style={{ display: "flex", gap: 2 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#C9A961" stroke="#C9A961" />)}
          </span>
          {/* hardcoded-color-allow-next-line */}
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(245,240,235,0.80)" }}>4.9 &middot; 200+ Google reviews</span>
        </a>
        <h2 style={{
          fontFamily: "Oswald, sans-serif", fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 700,
          color: "var(--c-text-on-dark)", lineHeight: 1.15, marginBottom: 4, textTransform: "uppercase",
        }}>{heading}</h2>
        {/* hardcoded-color-allow-next-line */}
        <p style={{ fontSize: 13, color: "rgba(245,240,235,0.70)", marginBottom: 16, fontFamily: "Inter, sans-serif" }}>{subheading}</p>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FloatInput id={`${formId}-name`} label="Name" type="text" autoComplete="given-name"
            placeholder="John" value={name} inputRef={nameRef} error={errors.name} ariaInvalid={!!errors.name}
            icon={<User size={16} strokeWidth={1.75} />}
            onChange={(v) => { setName(v); clearErr("name"); }}
            onFocus={() => { void import("@/pages/book/BookLocation"); }} />

          <FloatInput id={`${formId}-phone`} label="Phone" type="tel" inputMode="tel" autoComplete="tel"
            placeholder="(555) 000-0000" value={phone} inputRef={phoneRef} error={errors.phone} ariaInvalid={!!errors.phone}
            icon={<Phone size={16} strokeWidth={1.75} />}
            onChange={(v) => { setPhone(formatPhone(v)); clearErr("phone"); }}
            onBlur={() => { void capturePartialLead({ phone, name, location: location || undefined, source: `${source}-blur` }); }} />

          <div ref={locationRef}>
            <CROLocationSelector formId={formId} value={location} onChange={(k) => { setLocation(k); clearErr("location"); }} error={errors.location} />
          </div>

          {/* TCPA */}
          <div ref={tcpaRef}>
            <input id={`${formId}-tcpa`} type="checkbox" checked={tcpa}
              onChange={(e) => { setTcpa(e.target.checked); clearErr("tcpa"); }}
              aria-describedby={`${formId}-tcpa-text`} aria-invalid={!!errors.tcpa}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} />
            <label htmlFor={`${formId}-tcpa`}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", userSelect: "none", padding: "10px 12px", margin: "0 -12px", borderRadius: 8 }}>
              <div aria-hidden="true" style={{
                width: 24, height: 24, borderRadius: 5,
                // hardcoded-color-allow-next-line
                border: `2px solid ${tcpa ? ORANGE : errors.tcpa ? ERR_RED : "rgba(255,255,255,0.40)"}`,
                background: tcpa ? ORANGE : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                transition: "background 150ms ease, border-color 150ms ease",
              }}>
                {tcpa && <Check size={14} strokeWidth={3} style={{ color: WHITE }} />}
              </div>
              <span id={`${formId}-tcpa-text`} style={{ fontSize: 11, color: "rgba(245,240,235,0.50)", lineHeight: 1.4 }}>
                I agree to receive SMS/calls &amp; texts from Men&rsquo;s Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out.{" "}
                Not a condition of service. HIPAA Compliant.{" "}
                <a href="/privacy-policy" style={{ color: "var(--brand-cta)", textDecoration: "none" }}>Privacy Policy</a>
              </span>
            </label>
            {errors.tcpa && (
              <p role="alert" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED, marginTop: 6 }}>
                <AlertCircle size={12} strokeWidth={2} /> {errors.tcpa}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} style={{
            marginTop: 4, width: "100%", height: 54, background: ORANGE, color: WHITE, border: "none",
            borderRadius: 8, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "Inter, sans-serif",
            cursor: isSubmitting ? "wait" : "pointer", opacity: isSubmitting ? 0.80 : 1,
            // hardcoded-color-allow-next-line
            boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(232,103,10,0.40)",
            transition: "background 180ms ease, transform 180ms ease, box-shadow 180ms ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
            onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.background = "var(--brand-cta-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ORANGE; e.currentTarget.style.transform = "translateY(0)"; }}>
            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Booking...</> : <>{ctaLabel} <ArrowRight size={16} strokeWidth={2.5} /></>}
          </button>

          {controller.error && !Object.keys(errors).length && (
            <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED }}>
              <AlertCircle size={12} strokeWidth={2} /> {controller.error}
            </p>
          )}
          {/* hardcoded-color-allow-next-line */}
          <p style={{ fontSize: 11, color: "rgba(245,240,235,0.45)", textAlign: "center", lineHeight: 1.5, marginTop: 2 }}>
            &ldquo;I&rsquo;ve been to two GPs who told me my levels were fine. After one visit here I had answers and a plan. Game-changer for me.&rdquo; &mdash; R.T., Richmond &middot; Verified patient
          </p>
        </form>
      </div>
    </BookingErrorBoundary>
  );
};
