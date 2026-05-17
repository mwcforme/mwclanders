import { useState, useRef, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { heroLeadSchema, type HeroLeadInput } from "@/domain/leads/leadFormSchema";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { COPY } from "@/data/copy";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const ERR_MSG = {
  name: "Please enter your name",
  phone: "Please enter a valid 10-digit phone number",
  location: "Please choose a location",
  tcpa: "Please agree to receive SMS so we can confirm your appointment",
} as const;

const ERROR_RED = "#DC2626";
const ORANGE = "#E8670A";

type Service = "trt" | "wl" | "ed";

interface TRTHeroFormProps {
  service?: Service;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
}

const VALID_LOCATIONS = ["richmond", "virginia-beach", "newport-news"] as const;
type LocationKey = typeof VALID_LOCATIONS[number];

const LOCATION_OPTIONS: { key: LocationKey; label: string; hint: string }[] = [
  { key: "richmond", label: "Richmond", hint: "Serving Richmond & surrounding areas" },
  { key: "virginia-beach", label: "Virginia Beach", hint: "Serving Hampton Roads & Chesapeake" },
  { key: "newport-news", label: "Newport News", hint: "Serving the Peninsula & Williamsburg" },
];

function getLocationFromUrl(): LocationKey | "" {
  if (typeof window === "undefined") return "";
  const param = new URLSearchParams(window.location.search).get("location") ?? "";
  return VALID_LOCATIONS.includes(param as LocationKey) ? (param as LocationKey) : "";
}

export const TRTHeroForm = ({
  service = "trt",
  heading = COPY.cta.bookConsult,
  subheading = "Same-day and next-day availability. Takes under 2 minutes.",
  ctaLabel = COPY.cta.bookConsult,
}: TRTHeroFormProps = {}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<LocationKey | "">(() => getLocationFromUrl());
  const [tcpa, setTcpa] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    location: useRef<HTMLDivElement>(null),
    tcpa: useRef<HTMLLabelElement>(null),
  };

  const controller = useLeadSubmitController<HeroLeadInput>({
    schema: heroLeadSchema,
    source: "landing-page-hero",
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return {
        firstName: first || "Guest",
        lastName: rest.join(" ") || undefined,
        email: undefined,
        phone: v.phone,
      };
    },
    onSuccess: (result, v) => {
      markSessionSubmitted();
      const [first, ...rest] = v.name.trim().split(/\s+/);
      enterBookingFunnel(
        {
          identity: {
            firstName: first || "Guest",
            lastName: rest.join(" ") || undefined,
            email: "",
            phone: v.phone,
            ghlContactId: result.contactId,
          },
          service,
          location: v.location,
          source: "landing-page-hero",
          lpSlug: typeof window !== "undefined" ? window.location.pathname : undefined,
        },
        navigate,
      );
    },
    toastOnError: false,
  });

  // Mirror controller validation errors into local state
  useEffect(() => {
    const fe = controller.fieldErrors;
    if (Object.keys(fe).length === 0) return;
    const mapped: Record<string, string> = {};
    for (const k of Object.keys(fe)) {
      mapped[k] = ERR_MSG[k as keyof typeof ERR_MSG] || fe[k];
    }
    setLocalErrors(mapped);
    const order = ["name", "phone", "location", "tcpa"];
    const firstKey = order.find((k) => mapped[k]);
    if (firstKey) {
      const el = refs[firstKey as keyof typeof refs]?.current;
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if ("focus" in el) (el as HTMLInputElement).focus({ preventScroll: true });
      }
    }
  }, [controller.fieldErrors]);

  const errors = localErrors;
  const isSubmitting = controller.isSubmitting;

  const clearError = (key: string) => {
    if (!errors[key]) return;
    setLocalErrors((p) => { const { [key]: _, ...rest } = p; return rest; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!name.trim()) fe.name = ERR_MSG.name;
    if (phone.replace(/\D/g, "").length !== 10) fe.phone = ERR_MSG.phone;
    if (!location) fe.location = ERR_MSG.location;
    if (!tcpa) fe.tcpa = ERR_MSG.tcpa;
    if (Object.keys(fe).length) {
      setLocalErrors(fe);
      const order = ["name", "phone", "location", "tcpa"];
      const firstKey = order.find((k) => fe[k]);
      if (firstKey) {
        const el = refs[firstKey as keyof typeof refs]?.current;
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if ("focus" in el) (el as HTMLInputElement).focus({ preventScroll: true });
        }
      }
      return;
    }
    void controller.submit({ name, phone, location: location as LocationKey, tcpa });
  };

  const inputBase = (field: string): React.CSSProperties => ({
    width: "100%",
    height: 58,
    background: "#FFFFFF",
    border: `1.5px solid ${
      errors[field] ? ERROR_RED : focused === field ? "var(--brand-accent)" : "rgba(0,0,0,0.15)"
    }`,
    borderRadius: 10,
    padding: "0 18px",
    fontSize: 17,
    color: "#0B1029",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 150ms ease",
  });

  return (
    <div
      className="rounded-2xl p-7 md:p-8 w-full"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.12)",
        maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      }}
    >
      <h2
        className="font-bold"
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: 22,
          color: "#F5F0EB",
          fontWeight: 700,
          letterSpacing: "0.05em",
          lineHeight: 1.15,
          textTransform: "none",
        }}
      >
        {heading}
      </h2>
      <p
        className="mt-1.5 mb-5"
        style={{ color: "rgba(245,240,235,0.70)", fontFamily: "Inter, sans-serif", fontSize: 14 }}
      >
        {subheading}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>

        {/* Name */}
        <div>
          <label htmlFor="hf-name" className="sr-only">First Name</label>
          <input
            id="hf-name"
            ref={refs.name}
            type="text"
            placeholder="First Name"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
            onFocus={() => {
              setFocused("name");
              void import("@/pages/book/BookContact");
              void import("@/pages/book/BookLocation");
              void import("@/domain/booking/bookingStore");
            }}
            onBlur={() => setFocused(null)}
            style={inputBase("name")}
            autoComplete="given-name"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p role="alert" className="text-xs mt-1" style={{ color: ERROR_RED }}>{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="hf-phone" className="sr-only">Phone Number</label>
          <input
            id="hf-phone"
            ref={refs.phone}
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => { setPhone(formatPhone(e.target.value)); clearError("phone"); }}
            onFocus={() => setFocused("phone")}
            onBlur={() => {
              setFocused(null);
              void capturePartialLead({ phone, name, location: location || undefined, source: "hero-form-blur" });
            }}
            style={inputBase("phone")}
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p role="alert" className="text-xs mt-1" style={{ color: ERROR_RED }}>{errors.phone}</p>}
        </div>

        {/* Location — stacked cards with city + neighborhood hint */}
        <div ref={refs.location}>
          {errors.location && (
            <p role="alert" className="text-xs mb-1" style={{ color: ERROR_RED, fontFamily: "Inter, sans-serif" }}>Please choose a location to continue</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LOCATION_OPTIONS.map((opt) => {
              const isSelected = location === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => { setLocation(opt.key); clearError("location"); }}
                  aria-pressed={isSelected}
                  style={{
                    width: "100%",
                    minHeight: 64,
                    borderRadius: 10,
                    border: `2px solid ${
                      isSelected ? ORANGE : errors.location ? ERROR_RED : "rgba(255,255,255,0.45)"
                    }`,
                    background: isSelected ? ORANGE : "rgba(255,255,255,0.11)",
                    color: "#FFFFFF",
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                    transition: "all 0.14s ease",
                    padding: "0 16px",
                    boxShadow: isSelected
                      ? "0 6px 20px rgba(232,103,10,0.45)"
                      : "0 2px 6px rgba(0,0,0,0.30)",
                    transform: isSelected ? "scale(0.985)" : "scale(1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                  }}
                >
                  {/* Left: radio circle — larger, high-contrast border */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: `2.5px solid ${isSelected ? "#FFFFFF" : "rgba(255,255,255,0.70)"}`,
                      background: isSelected ? "rgba(255,255,255,0.20)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.14s ease",
                      marginRight: 12,
                    }}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {/* Right: city + neighborhood */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 400, opacity: isSelected ? 0.85 : 0.55, marginTop: 2 }}>
                      {opt.hint}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TCPA — custom styled checkbox, fully TCPA compliant */}
        <label
          ref={refs.tcpa}
          htmlFor="hf-tcpa"
          className="flex items-start gap-3 cursor-pointer select-none"
          style={{ padding: "4px 0" }}
        >
          {/* Hidden native checkbox — accessible, keyboard navigable */}
          <input
            id="hf-tcpa"
            type="checkbox"
            checked={tcpa}
            onChange={(e) => { setTcpa(e.target.checked); clearError("tcpa"); }}
            aria-invalid={!!errors.tcpa}
            aria-describedby="tcpa-text"
            style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
          />
          {/* Custom visual checkbox */}
          <div
            aria-hidden="true"
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              border: `2px solid ${
                tcpa ? ORANGE : errors.tcpa ? ERROR_RED : "rgba(255,255,255,0.55)"
              }`,
              background: tcpa ? ORANGE : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
              transition: "all 0.14s ease",
              boxShadow: tcpa ? "0 2px 8px rgba(232,103,10,0.40)" : "none",
            }}
          >
            {tcpa && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span
            id="tcpa-text"
            style={{ color: "rgba(245,240,235,0.65)", fontSize: 13, lineHeight: 1.5 }}
          >
            I agree to receive SMS/calls about my appointment. Reply STOP to opt out. Msg &amp; data rates may apply.
          </span>
        </label>
        {errors.tcpa && <p role="alert" className="text-xs" style={{ color: ERROR_RED, fontFamily: "Inter, sans-serif" }}>{errors.tcpa}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full font-bold cursor-pointer inline-flex items-center justify-center gap-2"
          style={{
            height: 58,
            background: "var(--brand-cta)",
            color: "#FFFFFF",
            fontSize: 17,
            border: "none",
            borderRadius: 10,
            letterSpacing: "0.05em",
            fontFamily: "Inter, sans-serif",
            marginTop: 10,
            boxShadow: "0 4px 24px rgba(232,103,10,0.35)",
            opacity: isSubmitting ? 0.85 : 1,
            cursor: isSubmitting ? "wait" : "pointer",
            transition: "background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
            textTransform: "none",
          }}
          onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.background = "var(--brand-cta-hover)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Booking..." : ctaLabel}
        </button>

        {controller.error && !Object.keys(errors).length && (
          <p className="text-xs" style={{ color: ERROR_RED }}>{controller.error}</p>
        )}
      </form>

      <p className="text-center mt-4 inline-flex items-center justify-center gap-1.5 w-full" style={{ color: "rgba(245,240,235,0.65)", fontFamily: "Inter, sans-serif", fontSize: 14 }}>
        <Lock size={14} /> HIPAA secure. No spam, ever.
      </p>
    </div>
  );
};
