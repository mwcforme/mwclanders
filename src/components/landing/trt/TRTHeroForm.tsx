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
  name: "Please enter your full name",
  phone: "Please enter a valid 10-digit phone number",
  email: "Please enter a valid email address",
  location: "Please select a location",
  tcpa: "Please agree to receive SMS so we can confirm your appointment",
} as const;

const ERROR_RED = "#DC2626";

type Service = "trt" | "wl" | "ed";

interface TRTHeroFormProps {
  service?: Service;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
}

const VALID_LOCATIONS = ["richmond", "virginia-beach", "newport-news"] as const;

function getLocationFromUrl(): string {
  if (typeof window === "undefined") return "";
  const param = new URLSearchParams(window.location.search).get("location") ?? "";
  return VALID_LOCATIONS.includes(param as typeof VALID_LOCATIONS[number]) ? param : "";
}

export const TRTHeroForm = ({
  service = "trt",
  heading = COPY.cta.bookConsult,
  subheading = "Same-day and next-day availability. Takes under 2 minutes.",
  ctaLabel = COPY.cta.bookConsult,
}: TRTHeroFormProps = {}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState(() => getLocationFromUrl());
  const [tcpa, setTcpa] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const refs: Record<string, React.RefObject<HTMLElement>> = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    location: useRef<HTMLSelectElement>(null),
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
        email: v.email,
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
            email: v.email,
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

  // Mirror controller-validation errors into local state so we can clear per-field onChange.
  useEffect(() => {
    const fe = controller.fieldErrors;
    if (Object.keys(fe).length === 0) return;
    const mapped: Record<string, string> = {};
    for (const k of Object.keys(fe)) {
      mapped[k] = ERR_MSG[k as keyof typeof ERR_MSG] || fe[k];
    }
    setLocalErrors(mapped);
    // Smooth-scroll to first failing field
    const order = ["name", "phone", "email", "location", "tcpa"];
    const firstKey = order.find((k) => mapped[k]);
    if (firstKey) {
      const el = refs[firstKey]?.current;
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
    setLocalErrors((p) => {
      const { [key]: _, ...rest } = p;
      return rest;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-validate locally so errors render even if controller short-circuits.
    const fe: Record<string, string> = {};
    if (!name.trim()) fe.name = ERR_MSG.name;
    if (phone.replace(/\D/g, "").length !== 10) fe.phone = ERR_MSG.phone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) fe.email = ERR_MSG.email;
    if (!location) fe.location = ERR_MSG.location;
    if (!tcpa) fe.tcpa = ERR_MSG.tcpa;
    if (Object.keys(fe).length) {
      setLocalErrors(fe);
      const order = ["name", "phone", "email", "location", "tcpa"];
      const firstKey = order.find((k) => fe[k]);
      if (firstKey) {
        const el = refs[firstKey]?.current;
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if ("focus" in el) (el as HTMLInputElement).focus({ preventScroll: true });
        }
      }
      return;
    }
    void controller.submit({ name, phone, email, location, tcpa });
  };

  const inputBase = (field: string): React.CSSProperties => ({
    width: "100%",
    height: 50,
    background: "rgba(11,16,41,0.6)",
    border: `1px solid ${
      errors[field]
        ? ERROR_RED
        : focused === field
          ? "var(--brand-accent)"
          : "var(--c-border-on-dark)"
    }`,
    borderRadius: 8,
    padding: "0 16px",
    fontSize: 15,
    color: "#F5F0EB",
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
        <div>
          <label htmlFor="hf-name" className="sr-only">Full Name</label>
          <input
            id="hf-name"
            ref={refs.name as React.RefObject<HTMLInputElement>}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            style={inputBase("name")}
            autoComplete="name"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p role="alert" className="text-xs mt-1" style={{ color: ERROR_RED }}>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="hf-phone" className="sr-only">Phone Number</label>
          <input
            id="hf-phone"
            ref={refs.phone as React.RefObject<HTMLInputElement>}
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => { setPhone(formatPhone(e.target.value)); clearError("phone"); }}
            onFocus={() => setFocused("phone")}
            onBlur={() => {
              setFocused(null);
              void capturePartialLead({ phone, name, email, location, source: "hero-form-blur" });
            }}
            style={inputBase("phone")}
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p role="alert" className="text-xs mt-1" style={{ color: ERROR_RED }}>{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="hf-email" className="sr-only">Email Address</label>
          <input
            id="hf-email"
            ref={refs.email as React.RefObject<HTMLInputElement>}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => { setEmail(e.target.value.slice(0, 255)); clearError("email"); }}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            style={inputBase("email")}
            autoComplete="email"
            inputMode="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p role="alert" className="text-xs mt-1" style={{ color: ERROR_RED }}>{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="hf-loc" className="sr-only">Location</label>
          <select
            id="hf-loc"
            ref={refs.location as React.RefObject<HTMLSelectElement>}
            value={location}
            onChange={(e) => { setLocation(e.target.value); clearError("location"); }}
            onFocus={() => setFocused("location")}
            onBlur={() => setFocused(null)}
            aria-invalid={!!errors.location}
            style={{
              ...inputBase("location"),
              color: location ? "#F5F0EB" : "rgba(245,240,235,0.50)",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23F5F1E8' opacity='0.6' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: 40,
            }}
          >
            <option value="" disabled style={{ color: "#0B1029" }}>Location</option>
            <option value="virginia-beach" style={{ color: "#0B1029" }}>Virginia Beach</option>
            <option value="newport-news" style={{ color: "#0B1029" }}>Newport News</option>
            <option value="richmond" style={{ color: "#0B1029" }}>Richmond</option>
          </select>
          {errors.location && <p role="alert" className="text-xs mt-1" style={{ color: ERROR_RED }}>{errors.location}</p>}
        </div>

        <label
          ref={refs.tcpa as React.RefObject<HTMLLabelElement>}
          className="flex items-start gap-3 cursor-pointer select-none"
          style={{ minHeight: 44, padding: "10px 0" }}
        >
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 44, height: 44, marginLeft: -10 }}
          >
            <input
              type="checkbox"
              checked={tcpa}
              onChange={(e) => { setTcpa(e.target.checked); clearError("tcpa"); }}
              className="w-5 h-5 min-w-[20px] min-h-[20px] rounded border bg-transparent cursor-pointer"
              style={{
                accentColor: "#E8670A",
                borderColor: errors.tcpa ? ERROR_RED : "rgba(255,255,255,0.30)",
              }}
              aria-invalid={!!errors.tcpa}
            />
          </span>
          <span style={{ color: "rgba(245,240,235,0.65)", fontSize: 12, lineHeight: 1.45, paddingTop: 4 }}>
            I agree to receive SMS/calls about my appointment. Reply STOP to opt out. Msg & data rates may apply.
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
            color: "#FFFFFF",
            fontSize: 19,
            border: "none",
            borderRadius: 8,
            letterSpacing: "0.08em",
            fontFamily: "Inter, sans-serif",
            marginTop: 8,
            opacity: isSubmitting ? 0.85 : 1,
            cursor: isSubmitting ? "wait" : "pointer",
            transition: "background-color 180ms ease, transform 180ms ease",
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

      <p className="text-center mt-4 inline-flex items-center justify-center gap-1.5 w-full" style={{ color: "rgba(245,240,235,0.60)", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
        <Lock size={12} /> HIPAA secure. No spam, ever.
      </p>
    </div>
  );
};
