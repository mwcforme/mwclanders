import { useRef, useState } from "react";
import { Check, MapPin } from "lucide-react";

interface ServiceFinalCTAProps {
  service: "wl" | "ed";
  headline: string;
  subhead: string;
  cardTitle: string;
  ctaLabel: string;
  bullets: string[];
  intro: string;
}

const ERR = {
  name: "Please enter your full name",
  phone: "Please enter a valid 10-digit phone number",
  email: "Please enter a valid email address",
  location: "Please select a location",
  tcpa: "Please agree to receive SMS so we can confirm your appointment",
} as const;
// hardcoded-color-allow-next-line
const ERROR_RED = "#DC2626";

export const ServiceFinalCTA = ({
  service, headline, subhead, cardTitle, ctaLabel, bullets, intro,
}: ServiceFinalCTAProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [tcpa, setTcpa] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    location: useRef<HTMLSelectElement>(null),
    tcpa: useRef<HTMLLabelElement>(null),
  };

  const validatePhone = (v: string) => v.replace(/\D/g, "").length === 10;
  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const clearError = (key: string) => {
    if (!errors[key]) return;
    setErrors((p) => { const { [key]: _, ...rest } = p; return rest; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = ERR.name;
    if (!validatePhone(phone)) errs.phone = ERR.phone;
    if (!email.trim() || !validateEmail(email)) errs.email = ERR.email;
    if (!location) errs.location = ERR.location;
    if (!tcpa) errs.tcpa = ERR.tcpa;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const order = ["name", "phone", "email", "location", "tcpa"] as const;
      const firstKey = order.find((k) => errs[k]);
      const el = firstKey ? refs[firstKey].current : null;
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if ("focus" in el) (el as HTMLInputElement).focus({ preventScroll: true });
      }
      return;
    }

    const params = new URLSearchParams({
      name, email, phone, location, source: "landing-page-final", service,
    });
    const urls: Record<string, string> = {
      richmond: "https://menswellnesscenters.com/thank-you-richmond/",
      "newport-news": "https://menswellnesscenters.com/thank-you-newport-news/",
      "virginia-beach": "https://menswellnesscenters.com/thank-you-virginia-beach/",
    };
    window.location.href = `${urls[location]}?${params.toString()}`;
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", height: 52, background: "var(--brand-cream)",
    // hardcoded-color-allow-next-line
    border: `2px solid ${errors[field] ? ERROR_RED : "#C8C6C1"}`,
    borderRadius: 8, padding: "0 16px", fontSize: 16, color: "var(--brand-navy)", outline: "none",
    fontFamily: "Inter, sans-serif", transition: "border-color 200ms ease, box-shadow 200ms ease",
  });
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--brand-cta)";
    // hardcoded-color-allow-next-line
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,103,10,0.15)";
  };
  const handleBlur = (field: string) => (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    // hardcoded-color-allow-next-line
    e.currentTarget.style.borderColor = errors[field] ? ERROR_RED : "#C8C6C1";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <section id="final-cta" className="py-14 md:py-20" style={{ background: "var(--brand-navy)" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center">
          <h2 className="font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 40px)", color: "var(--c-text-on-dark)", fontWeight: 700 }}>
            {headline}
          </h2>
          {/* hardcoded-color-allow-next-line */}
          <p className="text-base mt-2" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
            {subhead}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => {
              // hardcoded-color-allow-next-line
              return <span key={i} style={{ color: "#D4A017", fontSize: "20px" }}>★</span>;
            })}
            {/* hardcoded-color-allow-next-line */}
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>200+ Reviews</span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="order-2 md:order-1 md:pt-2">
            {/* hardcoded-color-allow-next-line */}
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif" }}>
              {intro}
            </p>
            <ul className="mt-6 space-y-3">
              {bullets.map((t) => (
                <li key={t} className="flex items-start gap-3" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}>
                  {/* hardcoded-color-allow-next-line */}
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={3} style={{ color: "#2ECC71" }} />
                  <span className="text-base">{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {/* hardcoded-color-allow-next-line */}
              <div className="text-xs font-semibold uppercase mb-3" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", fontFamily: "Inter, sans-serif" }}>
                Center Locations
              </div>
              <ul className="space-y-2">
                {[
                  { label: "Richmond, VA", to: "#locations" },
                  { label: "Newport News, VA", to: "#locations" },
                  { label: "Virginia Beach, VA", to: "#locations" },
                ].map((l) => (
                  <li key={l.label} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: "var(--brand-cta)" }} />
                    {/* hardcoded-color-allow-next-line */}
                    <a href={l.to} className="text-base underline underline-offset-4 hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Inter, sans-serif" }}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="mx-auto rounded-2xl p-8" style={{
              background: "var(--bg-white)", maxWidth: 480,
              // hardcoded-color-allow-next-line
              boxShadow: "0 8px 40px rgba(0,0,0,0.30)",
            }}>
              <h3 className="font-bold uppercase text-center mb-6" style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(20px, 3vw, 24px)", color: "var(--brand-navy)", fontWeight: 700 }}>
                {cardTitle}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <input ref={refs.name} type="text" placeholder="Name" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} onFocus={handleFocus} onBlur={handleBlur("name")} style={inputStyle("name")} className="placeholder:text-[var(--c-placeholder-on-white)]" autoComplete="name" aria-invalid={!!errors.name} />
                  {errors.name && <p role="alert" className="text-xs mt-1 text-left" style={{ color: ERROR_RED }}>{errors.name}</p>}
                </div>
                <div>
                  <input ref={refs.phone} type="tel" placeholder="Phone Number" value={phone} onChange={(e) => { setPhone(e.target.value); clearError("phone"); }} onFocus={handleFocus} onBlur={handleBlur("phone")} style={inputStyle("phone")} className="placeholder:text-[var(--c-placeholder-on-white)]" autoComplete="tel" aria-invalid={!!errors.phone} />
                  {errors.phone && <p role="alert" className="text-xs mt-1 text-left" style={{ color: ERROR_RED }}>{errors.phone}</p>}
                </div>
                <div>
                  <input ref={refs.email} type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} onFocus={handleFocus} onBlur={handleBlur("email")} style={inputStyle("email")} className="placeholder:text-[var(--c-placeholder-on-white)]" autoComplete="email" aria-invalid={!!errors.email} />
                  {errors.email && <p role="alert" className="text-xs mt-1 text-left" style={{ color: ERROR_RED }}>{errors.email}</p>}
                </div>
                <div>
                  <select
                    ref={refs.location}
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); clearError("location"); }}
                    onFocus={handleFocus as never}
                    onBlur={handleBlur("location") as never}
                    aria-invalid={!!errors.location}
                    style={{
                      ...inputStyle("location"),
                      // hardcoded-color-allow-next-line
                      color: location ? "var(--brand-navy)" : "var(--c-placeholder-on-white)",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23636B80' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      paddingRight: 40,
                    }}
                  >
                    <option value="" disabled>Select Location</option>
                    <option value="richmond">Richmond</option>
                    <option value="newport-news">Newport News</option>
                    <option value="virginia-beach">Virginia Beach</option>
                  </select>
                  {errors.location && <p role="alert" className="text-xs mt-1 text-left" style={{ color: ERROR_RED }}>{errors.location}</p>}
                </div>

                <label
                  ref={refs.tcpa}
                  className="flex items-start gap-3 cursor-pointer select-none"
                  style={{ minHeight: 44, padding: "8px 0" }}
                >
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 44, height: 44, marginLeft: -10 }}
                  >
                    <input
                      type="checkbox"
                      checked={tcpa}
                      onChange={(e) => { setTcpa(e.target.checked); clearError("tcpa"); }}
                      className="rounded cursor-pointer"
                      style={{
                        width: 20, height: 20,
                        accentColor: "var(--brand-cta)",
                        // hardcoded-color-allow-next-line
                        borderColor: errors.tcpa ? ERROR_RED : "#C8C6C1",
                      }}
                      aria-invalid={!!errors.tcpa}
                    />
                  </span>
                  <span style={{ color: "var(--c-placeholder-light)", fontSize: 12, lineHeight: 1.45, paddingTop: 4, textAlign: "left" }}>
                    I agree to receive SMS/calls about my appointment. Reply STOP to opt out. Msg & data rates may apply.
                  </span>
                </label>
                {errors.tcpa && <p role="alert" className="text-xs text-left" style={{ color: ERROR_RED }}>{errors.tcpa}</p>}

                <button
                  type="submit"
                  className="w-full rounded-lg font-bold cursor-pointer transition-colors duration-200"
                  style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "var(--c-text-on-dark)", fontSize: 15, border: "none", letterSpacing: "0.07em", fontFamily: "Inter, sans-serif", marginTop: 8, whiteSpace: "nowrap" }}
                  onMouseEnter={(e) => {
                    // hardcoded-color-allow-next-line
                    e.currentTarget.style.background = "#CF5B09";
                  }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
                >
                  {ctaLabel}
                </button>
              </form>

              <p className="text-center text-xs mt-4" style={{ color: "var(--c-placeholder-on-white)", fontFamily: "Inter, sans-serif" }}>
                HIPAA Compliant · No Spam · Book entirely online
              </p>
              <p className="text-center text-sm mt-3">
                <a href="tel:8663444955" className="font-bold transition-colors duration-200" style={{ color: "var(--brand-navy)", fontFamily: "Inter, sans-serif" }}>
                  Or call: 866-344-4955
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
