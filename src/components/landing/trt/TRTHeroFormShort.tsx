/**
 * TRTHeroFormShort — 3-field variant (phone + location + TCPA).
 *
 * CRO rationale: each field above 3 costs ~11% in submission rate.
 * Name + email collected downstream at /book/schedule where intent is highest.
 * A/B test this against TRTHeroForm (5-field) to confirm lift before retiring the full form.
 */
import { useState, useRef } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { shortHeroLeadSchema, type ShortHeroLeadInput } from "@/domain/leads/leadFormSchema";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { COPY } from "@/data/copy";
import { trackCro } from "@/hooks/useAnalytics";

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

// hardcoded-color-allow-next-line
const ERROR_RED = "#DC2626";

const VALID_LOCATIONS = ["richmond", "virginia-beach", "newport-news"] as const;
function getLocationFromUrl(): string {
  if (typeof window === "undefined") return "";
  const param = new URLSearchParams(window.location.search).get("location") ?? "";
  return VALID_LOCATIONS.includes(param as typeof VALID_LOCATIONS[number]) ? param : "";
}

type Service = "trt" | "wl" | "ed";

interface Props {
  service?: Service;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
}

export const TRTHeroFormShort = ({
  service = "trt",
  heading = COPY.cta.bookConsult,
  subheading = "Takes under a minute. Same or next-day.",
  ctaLabel = COPY.cta.bookConsult,
}: Props = {}) => {
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(() => getLocationFromUrl());
  const [tcpa, setTcpa] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const phoneRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLSelectElement>(null);
  const tcpaRef = useRef<HTMLLabelElement>(null);

  const controller = useLeadSubmitController<ShortHeroLeadInput>({
    schema: shortHeroLeadSchema,
    source: "landing-page-hero-short",
    toLeadInput: (v) => ({
      firstName: "Guest",
      phone: v.phone,
    }),
    onSuccess: (result, v) => {
      trackCro("hero_short_form_submit");
      enterBookingFunnel(
        {
          identity: {
            firstName: "Guest",
            phone: v.phone,
            email: "",
            ghlContactId: result.contactId,
          },
          service,
          location: v.location,
          source: "landing-page-hero-short",
          lpSlug: typeof window !== "undefined" ? window.location.pathname : undefined,
        },
        navigate,
      );
    },
    toastOnError: false,
  });

  const errors = localErrors;
  const isSubmitting = controller.isSubmitting;

  const clearError = (key: string) => {
    if (!errors[key]) return;
    setLocalErrors((p) => { const { [key]: _, ...rest } = p; return rest; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (phone.replace(/\D/g, "").length !== 10) fe.phone = "Please enter a valid 10-digit phone number";
    if (!location) fe.location = "Please select a location";
    if (!tcpa) fe.tcpa = "Please agree to receive SMS so we can confirm your appointment";
    if (Object.keys(fe).length) {
      setLocalErrors(fe);
      if (fe.phone) phoneRef.current?.focus();
      else if (fe.location) locationRef.current?.focus();
      else if (fe.tcpa) tcpaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    void controller.submit({ phone, location, tcpa });
  };

  const inputBase = (field: string): React.CSSProperties => ({
    width: "100%",
    height: 52,
    background: "var(--bg-white)",
    // hardcoded-color-allow-next-line
    border: `1px solid ${errors[field] ? ERROR_RED : focused === field ? "var(--brand-accent)" : "rgba(0,0,0,0.15)"}`,
    borderRadius: 8,
    padding: "0 16px",
    fontSize: 16,
    color: "var(--brand-navy-deep)",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 150ms ease",
  });

  return (
    <div
      className="rounded-2xl p-7 md:p-8 w-full"
      style={{
        // hardcoded-color-allow-next-line
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        // hardcoded-color-allow-next-line
        border: "1px solid rgba(255,255,255,0.12)",
        maxWidth: 420,
        // hardcoded-color-allow-next-line
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      }}
    >
      <h2
        className="font-bold"
        style={{ fontFamily: "Oswald, sans-serif", fontSize: 22, color: "var(--brand-cream)", fontWeight: 700, letterSpacing: "0.05em", lineHeight: 1.15, textTransform: "none" }}
      >
        {heading}
      </h2>
      {/* hardcoded-color-allow-next-line */}
      <p className="mt-1.5 mb-5" style={{ color: "rgba(245,240,235,0.70)", fontFamily: "Inter, sans-serif", fontSize: 14 }}>
        {subheading}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Phone */}
        <div>
          <label htmlFor="hsf-phone" className="sr-only">Phone Number</label>
          <input
            id="hsf-phone"
            ref={phoneRef}
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => { setPhone(formatPhone(e.target.value)); clearError("phone"); }}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            style={inputBase("phone")}
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p role="alert" className="text-xs mt-1" style={{ color: ERROR_RED }}>{errors.phone}</p>}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="hsf-loc" className="sr-only">Location</label>
          <select
            id="hsf-loc"
            ref={locationRef}
            value={location}
            onChange={(e) => { setLocation(e.target.value); clearError("location"); }}
            onFocus={() => setFocused("location")}
            onBlur={() => setFocused(null)}
            aria-invalid={!!errors.location}
            style={{
              ...inputBase("location"),
              // hardcoded-color-allow-next-line
              color: location ? "var(--brand-navy-deep)" : "rgba(11,16,41,0.60)",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%230B1029' opacity='0.5' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: 40,
            }}
          >
            <option value="" disabled style={{ color: "var(--brand-navy-deep)" }}>Nearest Location</option>
            <option value="virginia-beach" style={{ color: "var(--brand-navy-deep)" }}>Virginia Beach</option>
            <option value="newport-news" style={{ color: "var(--brand-navy-deep)" }}>Newport News</option>
            <option value="richmond" style={{ color: "var(--brand-navy-deep)" }}>Richmond</option>
          </select>
          {errors.location && <p role="alert" className="text-xs mt-1" style={{ color: ERROR_RED }}>{errors.location}</p>}
        </div>

        {/* TCPA */}
        <label
          ref={tcpaRef}
          className="flex items-start gap-3 cursor-pointer select-none"
          style={{ minHeight: 44, padding: "10px 0" }}
        >
          <span className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, marginLeft: -10 }}>
            <input
              type="checkbox"
              checked={tcpa}
              onChange={(e) => { setTcpa(e.target.checked); clearError("tcpa"); }}
              className="w-5 h-5 min-w-[20px] min-h-[20px] rounded border bg-transparent cursor-pointer"
              style={{
                accentColor: "var(--brand-cta)",
                // hardcoded-color-allow-next-line
                borderColor: errors.tcpa ? ERROR_RED : "rgba(255,255,255,0.30)",
              }}
              aria-invalid={!!errors.tcpa}
            />
          </span>
          {/* hardcoded-color-allow-next-line */}
          <span style={{ color: "rgba(245,240,235,0.65)", fontSize: 12, lineHeight: 1.45, paddingTop: 4 }}>
            I agree to receive SMS/calls about my appointment. Reply STOP to opt out.
          </span>
        </label>
        {errors.tcpa && <p role="alert" className="text-xs" style={{ color: ERROR_RED }}>{errors.tcpa}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full font-bold cursor-pointer inline-flex items-center justify-center gap-2"
          style={{
            height: 56,
            background: "var(--brand-cta)",
            color: "var(--c-text-on-dark)",
            fontSize: 19,
            border: "none",
            borderRadius: 8,
            letterSpacing: "0.08em",
            fontFamily: "Inter, sans-serif",
            marginTop: 8,
            opacity: isSubmitting ? 0.85 : 1,
            cursor: isSubmitting ? "wait" : "pointer",
            textTransform: "none",
          }}
          onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Booking..." : ctaLabel}
        </button>
        {controller.error && !Object.keys(errors).length && (
          <p className="text-xs" style={{ color: ERROR_RED }}>{controller.error}</p>
        )}
      </form>

      {/* hardcoded-color-allow-next-line */}
      <p className="text-center mt-4 inline-flex items-center justify-center gap-1.5 w-full" style={{ color: "rgba(245,240,235,0.60)", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
        <Lock size={12} /> HIPAA secure · No spam, ever.
      </p>
    </div>
  );
};
