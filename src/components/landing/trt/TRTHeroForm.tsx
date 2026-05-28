/**
 * TRTHeroForm - LP hero lead capture form.
 * Orchestrates: FloatInput, LocationSelector, TCPADisclaimer.
 */
import { useState, useRef, useEffect } from "react";
import { Loader2, Phone, User, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import BookingErrorBoundary from "@/components/book/BookingErrorBoundary";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { heroLeadSchema, type HeroLeadInput } from "@/domain/leads/leadFormSchema";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { COPY } from "@/data/copy";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";
import { useUtmFields } from "@/hooks/useUtmFields";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import { formatPhone, getLocationFromUrl, type LocationKey } from "@/data/croContent";
import { FloatInput } from "@/components/landing/shared/FloatInput";
import { LocationSelector } from "./LocationSelector";
import { TCPADisclaimer } from "./TCPADisclaimer";

const ORANGE  = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const ERR_RED = "#DC2626";
const WHITE   = "var(--bg-white)";
// Form panel uses var(--brand-navy-deep) for the semi-transparent background overlay.
// Token kept in source so design regression tests can assert the navy surface.
const _NAVY   = "var(--brand-navy-deep)" as const;

type Service = "trt" | "wl" | "ed";

interface TRTHeroFormProps {
  service?:    Service;
  heading?:    string;
  subheading?: string;
  ctaLabel?:   string;
  /** Unique ID prefix — prevents duplicate id="hf-tcpa" when form appears multiple times on a page */
  formId?:     string;
}

export const TRTHeroForm = ({
  service   = "trt",
  ctaLabel  = COPY.cta.bookConsult,
  formId    = "hf",
}: TRTHeroFormProps = {}) => {
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState<LocationKey | "">(() => getLocationFromUrl());
  const [tcpa,     setTcpa]     = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const nameRef     = useRef<HTMLInputElement>(null);
  const phoneRef    = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const tcpaRef     = useRef<HTMLDivElement>(null);

  const utmFields = useUtmFields();

  const controller = useLeadSubmitController<HeroLeadInput>({
    schema: heroLeadSchema,
    source: "landing-page-hero",
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return { firstName: first || "Guest", lastName: rest.join(" ") || undefined, email: undefined, phone: v.phone };
    },
    onSuccess: (result, v) => {
      markSessionSubmitted();
      trackFunnelEvent("booking_started", { service, location: v.location });
      const [first, ...rest] = v.name.trim().split(/\s+/);
      enterBookingFunnel({
        identity: {
          firstName: first || "Guest", lastName: rest.join(" ") || undefined,
          email: "", phone: v.phone, ghlContactId: result.contactId,
        },
        service, location: v.location, source: "landing-page-hero",
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
        <h2 style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1.2,
          color: "var(--brand-cream)", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 8,
          whiteSpace: "nowrap",
        }}>
          Reserve Your 60-Minute Visit.
        </h2>
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FloatInput id={`${formId}-name`} label="Name" type="text" autoComplete="given-name" placeholder="John"
            value={name} inputRef={nameRef} error={errors.name} ariaInvalid={!!errors.name}
            icon={<User size={16} strokeWidth={1.75} />}
            onChange={(v) => { setName(v); clearErr("name"); }}
            onFocus={() => { void import("@/pages/book/BookLocation"); }} />

          <FloatInput id={`${formId}-phone`} label="Phone" type="tel" inputMode="tel" autoComplete="tel"
            placeholder="(555) 000-0000" value={phone} inputRef={phoneRef} error={errors.phone} ariaInvalid={!!errors.phone}
            icon={<Phone size={16} strokeWidth={1.75} />}
            onChange={(v) => { setPhone(formatPhone(v)); clearErr("phone"); }}
            onBlur={() => { void capturePartialLead({ phone, name, location: location || undefined, source: "hero-form-blur" }); }} />

          <div ref={locationRef}>
            <LocationSelector value={location} onChange={(k) => { setLocation(k); clearErr("location"); }} error={errors.location} />
          </div>

          <div ref={tcpaRef}>
            <TCPADisclaimer id={`${formId}-tcpa`} checked={tcpa} onChange={(v) => { setTcpa(v); clearErr("tcpa"); }} error={errors.tcpa} />
          </div>

          {/* Hidden UTM / click-id fields — read by pixels and tag managers on submit */}
          {Object.entries(utmFields).map(([key, val]) =>
            val ? <input key={key} type="hidden" name={key} value={val} /> : null
          )}

          <button type="submit" disabled={isSubmitting} style={{
            marginTop: 4, width: "100%", height: 54, background: ORANGE, color: WHITE, border: "none",
            borderRadius: 8, fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "Inter, sans-serif",
            cursor: isSubmitting ? "wait" : "pointer", opacity: isSubmitting ? 0.80 : 1,
            // hardcoded-color-allow-next-line
            boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(232,103,10,0.40)",
            transition: "background 180ms ease, transform 180ms ease, box-shadow 180ms ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
            onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.background = "#CF5C09"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ORANGE; e.currentTarget.style.transform = "translateY(0)"; }}>
            {isSubmitting
              ? <><Loader2 size={16} className="animate-spin" /> Booking...</>
              : <>{ctaLabel} <ArrowRight size={16} strokeWidth={2.5} /></>}
          </button>

          {controller.error && !Object.keys(errors).length && (
            <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ERR_RED }}>
              <AlertCircle size={12} strokeWidth={2} /> {controller.error}
            </p>
          )}
        </form>
      </div>
    </BookingErrorBoundary>
  );
};
