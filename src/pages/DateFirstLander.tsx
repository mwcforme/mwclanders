/**
 * /book-now — Date-first landing page.
 * Step 1: pick location → see live availability → pick a date/time
 * Step 2: enter name + phone → submit lead → enter booking funnel
 *
 * Psychology: commitment to a specific slot before asking for contact info
 * dramatically increases form completion vs. form-first flow.
 */
import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Calendar, Clock, ArrowRight, Check, Star, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { TCPADisclaimer } from "@/components/landing/trt/TCPADisclaimer";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { heroLeadSchema } from "@/domain/leads/leadFormSchema";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { markSessionSubmitted, capturePartialLead } from "@/lib/partialCapture";
import { trackFunnelEvent } from "@/hooks/useAnalytics";
import { getFreeSlots, CENTER_CALENDARS, TIMEZONE, type LocationKey } from "@/lib/ghlCalendars";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { formatPhone } from "@/data/croContent";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "location" | "date" | "form";

interface SlotDay {
  dateObj: Date;
  label: string;     // "Sat, May 31"
  dayShort: string;  // "SAT"
  dayNum: string;    // "31"
  month: string;     // "MAY"
  slots: string[];   // ISO strings
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LOCATIONS: { key: LocationKey; label: string; address: string }[] = [
  { key: "richmond",       label: "Richmond",       address: "4050 Innslake Dr, Suite 360, Glen Allen" },
  { key: "newport-news",   label: "Newport News",   address: "827 Diligence Drive, Suite 206" },
  { key: "virginia-beach", label: "Virginia Beach", address: "996 First Colonial Road" },
];

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIMEZONE })
    .replace(/\s+/g, " ").replace("AM", "am").replace("PM", "pm");
}

function fmtSlotDay(d: Date): Omit<SlotDay, "slots"> {
  const tz = TIMEZONE;
  const dayShort = d.toLocaleDateString("en-US", { weekday: "short", timeZone: tz }).toUpperCase();
  const dayNum   = d.toLocaleDateString("en-US", { day: "numeric",   timeZone: tz });
  const month    = d.toLocaleDateString("en-US", { month: "short",   timeZone: tz }).toUpperCase();
  const label    = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: tz });
  return { dateObj: d, label, dayShort, dayNum, month };
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const NAVY   = "var(--brand-navy-deep)";
const ORANGE = "var(--brand-cta)";
const CREAM  = "var(--brand-cream)";
// hardcoded-color-allow-next-line
const CREAM80 = "rgba(245,240,235,0.80)";
// hardcoded-color-allow-next-line
const CREAM55 = "rgba(245,240,235,0.55)";
// hardcoded-color-allow-next-line
const WHITE06 = "rgba(255,255,255,0.06)";
// hardcoded-color-allow-next-line
const WHITE15 = "rgba(255,255,255,0.15)";
// hardcoded-color-allow-next-line
const GOLD    = "#C9A961";

// ─── Step 1 — Location picker ─────────────────────────────────────────────

function LocationPicker({ onSelect }: { onSelect: (k: LocationKey) => void }) {
  const [hovered, setHovered] = useState<LocationKey | null>(null);
  return (
    <div>
      <h2 style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px,5vw,32px)", fontWeight: 700, textTransform: "uppercase", color: CREAM, marginBottom: 8, lineHeight: 1.1 }}>
        Which location works for you?
      </h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: CREAM80, marginBottom: 24, lineHeight: 1.5 }}>
        We'll show you real available times next.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LOCATIONS.map(loc => {
          const hov = hovered === loc.key;
          return (
            <button
              key={loc.key}
              type="button"
              onClick={() => onSelect(loc.key)}
              onMouseEnter={() => setHovered(loc.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 18px", borderRadius: 12,
                border: `1.5px solid ${hov ? ORANGE : WHITE15}`,
                background: hov ? "rgba(232,103,10,0.10)" : WHITE06,
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "all 150ms ease", WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{
                display: "grid", placeItems: "center", width: 40, height: 40,
                borderRadius: "50%", background: "rgba(232,103,10,0.15)", flexShrink: 0,
              }}>
                <MapPin size={18} color={ORANGE} aria-hidden />
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700, textTransform: "uppercase", color: CREAM, letterSpacing: "0.02em" }}>
                  {loc.label}
                </span>
                <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: 13, color: CREAM55, marginTop: 2 }}>
                  {loc.address}
                </span>
              </span>
              <ChevronRight size={18} color={CREAM55} aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2 — Date + time picker ─────────────────────────────────────────

function DateTimePicker({
  locationKey, onSelect, onBack,
}: { locationKey: LocationKey; onSelect: (iso: string, label: string) => void; onBack: () => void }) {
  const [days, setDays] = useState<SlotDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loc = LOCATIONS.find(l => l.key === locationKey)!;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const start = new Date();
    const end   = addDays(start, 14);
    getFreeSlots(locationKey, start, end)
      .then(raw => {
        if (!raw || typeof raw !== "object") { setError("Couldn't load availability."); return; }
        const built: SlotDay[] = [];
        for (const [_k, val] of Object.entries(raw as Record<string, unknown>)) {
          if (_k === "traceId") continue;
          const v = val as { slots?: string[] };
          if (!v?.slots?.length) continue;
          // Parse first slot to get date
          const d = new Date(v.slots[0]);
          built.push({ ...fmtSlotDay(d), slots: v.slots });
        }
        built.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        setDays(built.slice(0, 10));
        if (built.length > 0) setSelectedDay(0);
      })
      .catch(() => setError("Couldn't load availability. Please try again."))
      .finally(() => setLoading(false));
  }, [locationKey]);

  const activeDayData = selectedDay !== null ? days[selectedDay] : null;

  return (
    <div>
      {/* Back + location label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <button type="button" onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: CREAM55, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          ← Back
        </button>
        <span style={{ color: CREAM55, fontSize: 13 }}>|</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, color: CREAM80, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600 }}>
          <MapPin size={13} color={ORANGE} /> {loc.label}
        </span>
      </div>

      <h2 style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px,5vw,32px)", fontWeight: 700, textTransform: "uppercase", color: CREAM, marginBottom: 6, lineHeight: 1.1 }}>
        Pick a day.
      </h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: CREAM80, marginBottom: 20 }}>
        60-minute in-person visit. Labs drawn on-site.
      </p>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader2 size={28} color={ORANGE} style={{ animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: CREAM55, marginTop: 12 }}>Loading availability…</p>
        </div>
      )}

      {error && (
        <div style={{ padding: "16px", borderRadius: 10, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)", color: "#FCA5A5", fontFamily: "Inter, sans-serif", fontSize: 14 }}>
          {error}
        </div>
      )}

      {!loading && !error && days.length === 0 && (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: CREAM55 }}>No availability in the next 14 days. Please call us at (866) 344-4955.</p>
      )}

      {!loading && days.length > 0 && (
        <>
          {/* Day strip */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20, scrollbarWidth: "none" }}>
            {days.map((day, i) => {
              const sel = selectedDay === i;
              return (
                <button key={i} type="button" onClick={() => setSelectedDay(i)}
                  style={{
                    flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 14px", borderRadius: 10, minWidth: 58,
                    border: `1.5px solid ${sel ? ORANGE : WHITE15}`,
                    background: sel ? ORANGE : WHITE06,
                    cursor: "pointer", WebkitTapHighlightColor: "transparent",
                    transition: "all 150ms ease",
                  }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: sel ? "#fff" : CREAM55 }}>{day.dayShort}</span>
                  <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 22, fontWeight: 700, color: sel ? "#fff" : CREAM, lineHeight: 1.1 }}>{day.dayNum}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, color: sel ? "rgba(255,255,255,0.80)" : CREAM55 }}>{day.month}</span>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          {activeDayData && (
            <>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: CREAM55, marginBottom: 10 }}>
                {activeDayData.label}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {activeDayData.slots.map(iso => (
                  <button key={iso} type="button"
                    onClick={() => onSelect(iso, `${activeDayData.label} at ${fmtTime(iso)}`)}
                    style={{
                      padding: "12px 8px", borderRadius: 10, textAlign: "center",
                      border: `1.5px solid ${WHITE15}`, background: WHITE06,
                      cursor: "pointer", WebkitTapHighlightColor: "transparent",
                      fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700,
                      color: CREAM, transition: "all 150ms ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ORANGE; (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,103,10,0.10)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = WHITE15; (e.currentTarget as HTMLButtonElement).style.background = WHITE06; }}
                  >
                    {fmtTime(iso)}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Step 3 — Contact form ────────────────────────────────────────────────

function ContactForm({
  locationKey, slotIso, slotLabel, onBack,
}: { locationKey: LocationKey; slotIso: string; slotLabel: string; onBack: () => void }) {
  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [tcpa,  setTcpa]  = useState(false);
  const navigate = useNavigate();
  const loc = LOCATIONS.find(l => l.key === locationKey)!;

  const inputBase: React.CSSProperties = {
    width: "100%", height: 52, borderRadius: 10,
    // hardcoded-color-allow-next-line
    border: "1.5px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)",
    color: CREAM, fontSize: 16, fontFamily: "Inter, sans-serif", padding: "0 16px",
    outline: "none", boxSizing: "border-box",
  };

  const controller = useLeadSubmitController({
    schema: heroLeadSchema,
    source: "date-first-lander",
    tags: [`slot:${slotIso}`, `location:${locationKey}`, "date-first-v1"],
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return { firstName: first || "Guest", lastName: rest.join(" ") || undefined, phone: v.phone };
    },
    onSuccess: (result, v) => {
      markSessionSubmitted();
      trackFunnelEvent("booking_started", { location: locationKey, source: "date-first" });
      const [first, ...rest] = v.name.trim().split(/\s+/);
      // Seed the pre-selected slot into the store so BookSchedule can auto-select it
      const store = useBookingStore.getState();
      store.patch({ appointmentTime: slotIso ?? undefined });
      enterBookingFunnel({
        identity: { firstName: first || "Guest", lastName: rest.join(" ") || undefined, email: "", phone: v.phone, ghlContactId: result.contactId },
        service: "trt", location: locationKey, source: "date-first-lander",
      }, navigate);
    },
    persistToBookingState: false,
    toastOnError: true,
  });

  const valid = name.trim().length >= 2 && phone.replace(/\D/g, "").length === 10 && tcpa;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void controller.submit({ name, phone, location: locationKey, tcpa });
  }

  return (
    <div>
      {/* Back */}
      <button type="button" onClick={onBack}
        style={{ background: "none", border: "none", cursor: "pointer", color: CREAM55, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        ← Change time
      </button>

      {/* Slot confirmation pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12,
        background: "rgba(232,103,10,0.10)", border: "1.5px solid rgba(232,103,10,0.35)", marginBottom: 24,
      }}>
        <Check size={18} color={ORANGE} style={{ flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: "Oswald, sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: ORANGE, margin: 0 }}>
            Slot reserved
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: CREAM80, margin: "2px 0 0" }}>
            {slotLabel} · {loc.label}
          </p>
        </div>
      </div>

      <h2 style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(22px,5vw,30px)", fontWeight: 700, textTransform: "uppercase", color: CREAM, marginBottom: 6, lineHeight: 1.1 }}>
        Who should we hold this for?
      </h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: CREAM80, marginBottom: 20 }}>
        No cost. No insurance needed. We'll confirm by text.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="text" placeholder="Full Name" autoComplete="name"
          value={name} onChange={e => setName(e.target.value)}
          style={inputBase}
        />
        <input
          type="tel" inputMode="tel" placeholder="(555) 555-5555" autoComplete="tel"
          value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
          style={inputBase}
        />

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 12, lineHeight: 1.6, color: CREAM55, fontFamily: "Inter, sans-serif", paddingTop: 4 }}>
          <input type="checkbox" checked={tcpa} onChange={e => setTcpa(e.target.checked)}
            style={{ marginTop: 2, width: 16, height: 16, accentColor: ORANGE, flexShrink: 0 }} />
          <span>
            I agree to receive appointment communications from Men's Wellness Centers. Message & data rates may apply. Reply STOP to opt out.{" "}
            <a href="/tcpa" style={{ color: "var(--brand-cta-accessible)", textDecoration: "underline" }}>TCPA disclosure</a>.
          </span>
        </label>

        {controller.fieldErrors.tcpa && (
          <p style={{ fontSize: 12, color: "#FCA5A5" }}>{controller.fieldErrors.tcpa}</p>
        )}

        <button type="submit" disabled={!valid || controller.isSubmitting}
          style={{
            width: "100%", height: 56, borderRadius: 12, border: "none",
            background: ORANGE, color: "#fff",
            fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.05em",
            cursor: !valid || controller.isSubmitting ? "not-allowed" : "pointer",
            opacity: !valid || controller.isSubmitting ? 0.45 : 1,
            // hardcoded-color-allow-next-line
            boxShadow: valid ? "0 12px 32px rgba(232,103,10,0.40)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 150ms ease",
          }}>
          {controller.isSubmitting
            ? <><Loader2 size={18} style={{ animation: "spin 0.7s linear infinite" }} /> Confirming…</>
            : <>Confirm My Appointment <ArrowRight size={18} /></>}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: CREAM55, fontFamily: "Inter, sans-serif" }}>
          No cost consultation. Labs drawn on-site. Results reviewed same visit.
        </p>
      </form>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function DateFirstLander() {
  const [step, setStep]             = useState<Step>("location");
  const [locationKey, setLocationKey] = useState<LocationKey | null>(null);
  const [slotIso, setSlotIso]       = useState<string | null>(null);
  const [slotLabel, setSlotLabel]   = useState<string>("");

  const handleLocationSelect = (key: LocationKey) => {
    setLocationKey(key);
    setStep("date");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleSlotSelect = (iso: string, label: string) => {
    setSlotIso(iso);
    setSlotLabel(label);
    setStep("form");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const progress = step === "location" ? 15 : step === "date" ? 55 : 90;

  return (
    <div style={{ background: NAVY, color: CREAM, minHeight: "100vh", fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <SEO
        title="Book Your Visit · Men's Wellness Centers Virginia"
        description="Pick your appointment time first. 60-minute in-person visit. Labs drawn on-site. No cost, no insurance needed."
      />

      <TRTHeader />

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 39, height: 3, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ height: "100%", background: ORANGE, width: `${progress}%`, transition: "width 400ms ease" }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 20px 80px", display: "grid", gridTemplateColumns: "1fr", gap: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="df-grid">

          {/* Left — step panel */}
          <div style={{ maxWidth: 520 }}>
            {step === "location" && (
              <LocationPicker onSelect={handleLocationSelect} />
            )}
            {step === "date" && locationKey && (
              <DateTimePicker
                locationKey={locationKey}
                onSelect={handleSlotSelect}
                onBack={() => setStep("location")}
              />
            )}
            {step === "form" && locationKey && slotIso && (
              <ContactForm
                locationKey={locationKey}
                slotIso={slotIso}
                slotLabel={slotLabel}
                onBack={() => setStep("date")}
              />
            )}
          </div>

          {/* Right — social proof sidebar */}
          <aside style={{ maxWidth: 360 }}>
            {/* Hero statement */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px,5vw,42px)", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.05, color: CREAM, margin: 0 }}>
                Virginia&rsquo;s Choice<br />
                <span style={{ color: ORANGE }}>For Men&rsquo;s Health</span>
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: CREAM80, marginTop: 12, lineHeight: 1.6 }}>
                Sit down with a licensed Virginia provider. Labs drawn on-site and reviewed in the same visit. No referrals. No runaround.
              </p>
            </div>

            {/* Stars */}
            <a href={GBP_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 24 }}>
              <span style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={GOLD} stroke={GOLD} />)}
              </span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: CREAM80 }}>
                4.9 · 191 verified Google reviews
              </span>
            </a>

            {/* What you get */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "No-cost initial consultation",
                "Labs drawn on-site, results same visit",
                "Licensed Virginia provider, in person",
                "No insurance needed · FSA/HSA accepted",
                "Same- or next-day availability",
              ].map(text => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(232,103,10,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check size={11} color={ORANGE} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: CREAM80, lineHeight: 1.4 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Clinic image */}
            <div style={{ marginTop: 28, borderRadius: 12, overflow: "hidden", aspectRatio: "16/9", position: "relative" }}>
              <img
                src="/images/clinic-lab-draw.webp"
                alt="Men's Wellness Centers clinic — lab draw on-site"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }}
                loading="lazy" decoding="async"
              />
              <div aria-hidden style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
                // hardcoded-color-allow-next-line
                background: "linear-gradient(to top, rgba(11,16,41,0.70) 0%, transparent 100%)",
              }} />
            </div>
          </aside>

        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .df-grid {
            grid-template-columns: 520px 1fr !important;
          }
        }
      `}</style>

      <TRTFooter />
    </div>
  );
}
