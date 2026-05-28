/**
 * /optimize — CRO-optimized landing page.
 * Uses TRTHeader, TRTFooter, StickyMobileCTA and brand-navy/brand-cream
 * alternating sections — matches the design system of the main LP exactly.
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, X, Star, ShieldCheck, MapPin, Phone,
  Beaker, UserCheck, ClipboardList, ArrowRight, ChevronDown,
} from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { StickyMobileCTA } from "@/components/landing/trt/StickyMobileCTA";
import { SectionReveal } from "@/components/landing/trt/SectionReveal";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { PHONE } from "@/lib/constants";
import { SEO } from "@/components/SEO";
import { trackFunnelEvent } from "@/hooks/useAnalytics";

const TRTFooter = lazy(() =>
  import("@/components/landing/trt/TRTFooter").then(m => ({ default: m.TRTFooter }))
);

// ─── Design tokens (matches LP) ───────────────────────────────────────────────
const CREAM  = "var(--brand-cream)";   // #F5F0EB — light sections
const NAVY   = "var(--brand-navy)";    // #000033 — dark sections
const ORANGE = "var(--brand-cta)";     // #E8670A
const ON_LIGHT  = "var(--c-text-on-light)";        // dark navy body
const MUTED     = "var(--c-text-on-light-muted)";  // #424857
const ON_DARK   = "var(--c-text-on-dark)";          // white
const DARK_MUTED = "var(--c-text-on-dark-muted)";  // soft white

// ─── Data ─────────────────────────────────────────────────────────────────────
const LOCATIONS_DATA = [
  { city: "Richmond",       key: "richmond",       addr: "Glen Allen, VA",     drive: "5 min from I-64",            phone: "(804) 346-4636" },
  { city: "Newport News",   key: "newport-news",   addr: "Newport News, VA",   drive: "3 min from I-64, Exit 258A", phone: "(757) 806-6263" },
  { city: "Virginia Beach", key: "virginia-beach", addr: "Virginia Beach, VA", drive: "5 min from I-264",           phone: "(757) 612-4428" },
];

const REVIEWS = [
  { name: "Jared C.",    when: "3 days ago", text: "Very streamlined. People that actually listen and care about getting you healthy. They focus on symptoms and getting you feeling better." },
  { name: "Jeremiah N.", when: "1 day ago",  text: "10/10. I was able to make a same-day appointment online. Reception was friendly and made for a comfortable experience." },
  { name: "Clarke M.",   when: "5 days ago", text: "Have been going for about 6 months now and feel way better. Energy throughout the day, better workouts, sleeping straight through the night." },
  { name: "Bobby M.",    when: "2 days ago", text: "Excellent service and I'm always greeted by name, which makes me feel like it's a personal visit, not a transaction." },
];

const FAQS = [
  { q: "How is this different from Hims, Hone, or an online TRT clinic?", a: "We're in-person only. You see the same Virginia-licensed provider at the same center, labs are drawn on-site and reviewed that day, and your provider knows your full case. No mail-order chatbots, no rotating clinicians, no waiting on shipping." },
  { q: "What does the first visit actually cover?", a: "Plan for 60 minutes. Labs drawn on-site. Your Virginia provider reviews every result with you in the same visit, explains what it means in plain language, and if treatment is appropriate, you leave with a protocol that day. No-cost consultation. No obligation to proceed." },
  { q: "Does insurance cover this?", a: "Your first visit is at no cost, including labs and the provider review. We do not bill insurance, but we accept FSA and HSA cards. Most members find the straightforward pricing easier than navigating insurance approvals." },
  { q: "Is testosterone therapy safe?", a: "Testosterone therapy is FDA-approved when prescribed and monitored by a licensed provider for members with clinically diagnosed low testosterone. Potential side effects are reviewed with you. Ongoing lab monitoring is included in every care plan." },
  { q: "How do I know if treatment is right for me?", a: "A diagnosis requires lab work and a clinical evaluation. At your first visit, we run a full hormone panel and review your symptoms. Treatment is only prescribed when clinically appropriate. If it is not right for you, our providers will tell you." },
];

// ─── Lead form ────────────────────────────────────────────────────────────────
function LeadForm({ idSuffix = "", dark = false }: { idSuffix?: string; dark?: boolean }) {
  const navigate = useNavigate();
  const patch    = useBookingStore(s => s.patch);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formId  = `reserve${idSuffix}`;

  const bg        = dark ? "rgba(255,255,255,0.06)" : "#FFFFFF";
  const border    = dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #D4D3D1";
  const textColor = dark ? ON_DARK : ON_LIGHT;
  const phColor   = dark ? "rgba(255,255,255,0.45)" : "#6B7280";
  const subColor  = dark ? DARK_MUTED : MUTED;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const fd    = new FormData(formRef.current!);
    const name  = String(fd.get("name")  ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const loc   = String(fd.get("location") ?? "").trim();
    if (!name || !phone || !loc) return;
    setSubmitting(true);
    setError(null);
    trackFunnelEvent("optimize_form_submit", { location: loc });
    try {
      const { GhlProxyLeadSubmitter } = await import("@/services/impl/GhlProxyLeadSubmitter");
      const result = await new GhlProxyLeadSubmitter().submitLead({
        firstName: name.split(/\s+/)[0],
        lastName:  name.split(/\s+/).slice(1).join(" ") || undefined,
        phone,
        source: "optimize-lp",
        customFields: { mwc_funnel_service: "trt", mwc_lp_slug: "optimize" },
      });
      patch({
        identity: { firstName: name.split(/\s+/)[0], phone, email: "", ghlContactId: result.contactId },
        location: loc, service: "trt", source: "optimize-lp", lpSlug: "optimize",
      });
      trackFunnelEvent("optimize_form_success", { location: loc });
      navigate("/book/schedule");
    } catch {
      setError("Something went wrong. Please call us to book.");
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 52, borderRadius: 10,
    background: bg, border,
    color: textColor, fontSize: 16, fontFamily: "Inter, sans-serif",
    padding: "0 16px", boxSizing: "border-box", outline: "none",
  };

  return (
    <form id={formId} ref={formRef} onSubmit={onSubmit}
      style={{ background: dark ? "rgba(255,255,255,0.07)" : "#FFFFFF", border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #E5E3E0", borderRadius: 16, padding: 28, boxShadow: dark ? "none" : "0 4px 24px rgba(0,0,0,0.08)" }}
      aria-labelledby={`${formId}-heading`}>
      <h2 id={`${formId}-heading`}
        style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(22px,3.5vw,28px)", textTransform: "uppercase", color: dark ? ON_DARK : ON_LIGHT, lineHeight: 1.1, marginBottom: 6 }}>
        Reserve your 60-minute visit.
      </h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: subColor, marginBottom: 20 }}>
        No-cost. No obligation. Labs reviewed on the same visit.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="text" name="name" required placeholder="Your name"
          style={{ ...inputStyle, "::placeholder": { color: phColor } } as React.CSSProperties}
          className="optimize-input" />
        <input type="tel" name="phone" required placeholder="Phone number"
          style={inputStyle} className="optimize-input" />

        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: subColor, marginBottom: 8, display: "block" }}>
            Closest location
          </legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {LOCATIONS_DATA.map(loc => (
              <label key={loc.city} style={{ cursor: "pointer" }}>
                <input type="radio" name="location" value={loc.key} required className="sr-only optimize-radio" />
                <span className="optimize-radio-label" style={{
                  display: "block", textAlign: "center", padding: "10px 4px",
                  borderRadius: 8, border: dark ? "1.5px solid rgba(255,255,255,0.2)" : "1.5px solid #D4D3D1",
                  fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: dark ? ON_DARK : ON_LIGHT,
                  background: dark ? "rgba(255,255,255,0.05)" : "#F9F8F6",
                  userSelect: "none",
                }}>
                  {loc.city === "Virginia Beach" ? "VA Beach" : loc.city === "Newport News" ? "Newport" : loc.city}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, cursor: "pointer" }}>
        <input type="checkbox" required style={{ marginTop: 2, accentColor: ORANGE, flexShrink: 0 }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: subColor, lineHeight: 1.55 }}>
          I agree to receive SMS and calls from Men's Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out. Not a condition of service.
        </span>
      </label>

      {error && (
        <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 8, background: "rgba(167,33,28,0.08)", border: "1px solid rgba(167,33,28,0.25)", fontFamily: "Inter, sans-serif", fontSize: 14, color: ON_LIGHT }}>
          {error}{" "}
          <a href={PHONE.tel} style={{ color: ORANGE, textDecoration: "underline" }}>{PHONE.display}</a>
        </div>
      )}

      <button type="submit" disabled={submitting} style={{
        marginTop: 18, width: "100%", height: 56, borderRadius: 10,
        background: submitting ? "#CF5B09" : ORANGE, border: "none",
        color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 700,
        letterSpacing: "0.06em", cursor: submitting ? "wait" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: "0 8px 24px rgba(232,103,10,0.40)",
      }}>
        {submitting ? "Booking…" : <><span>Get Started</span> <ArrowRight size={18} aria-hidden /></>}
      </button>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: subColor, textAlign: "center", marginTop: 10 }}>
        Takes under 60 seconds. You pick the time next.
      </p>

      <style>{`
        .optimize-input::placeholder { color: ${phColor}; }
        .optimize-radio:checked + .optimize-radio-label {
          background: var(--brand-cta) !important;
          color: #fff !important;
          border-color: var(--brand-cta) !important;
        }
      `}</style>
    </form>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a, idx, dark = false }: { q: string; a: string; idx: number; dark?: boolean }) {
  const [open, setOpen] = useState(idx === 0);
  const divider = dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #E5E3E0";
  return (
    <div style={{ borderBottom: divider }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 0", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
        aria-expanded={open}>
        <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 700, textTransform: "uppercase", color: dark ? ON_DARK : ON_LIGHT, letterSpacing: "0.02em" }}>{q}</span>
        <ChevronDown size={20} style={{ color: ORANGE, flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }} aria-hidden />
      </button>
      {open && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: dark ? DARK_MUTED : MUTED, lineHeight: 1.65, paddingBottom: 20 }}>{a}</p>}
    </div>
  );
}

// ─── Section primitives ───────────────────────────────────────────────────────
const Eyebrow = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 10 }}>{children}</p>
);

const Heading = ({ children, dark = false, center = false }: { children: React.ReactNode; dark?: boolean; center?: boolean }) => (
  <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 40px)", textTransform: "uppercase", color: dark ? ON_DARK : ON_LIGHT, lineHeight: 1.08, textAlign: center ? "center" : "left", marginBottom: 12 }}>{children}</h2>
);

const Body = ({ children, dark = false, center = false, maxWidth = 680 }: { children: React.ReactNode; dark?: boolean; center?: boolean; maxWidth?: number }) => (
  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: dark ? DARK_MUTED : MUTED, lineHeight: 1.65, maxWidth, textAlign: center ? "center" : "left", margin: center ? "0 auto" : 0 }}>{children}</p>
);

const INNER = "max-width: 1200px; margin: 0 auto; padding: 0 24px";
const sectionStyle = (bg: string): React.CSSProperties => ({ background: bg, padding: "72px 0" });

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OptimizeLP() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: CREAM }}>
      <SEO
        title="Men's Wellness Centers — Virginia's TRT, ED & Weight Loss Specialists"
        description="In-person testosterone therapy, ED treatment, and weight loss at 3 Virginia centers. No-cost 60-minute physician visit. Same-day lab results."
      />

      <TRTHeader />

      {/* ── Hero: cream bg, 2-col ── */}
      <section id="reserve" style={{ ...sectionStyle(CREAM), paddingTop: 96 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="optimize-hero-grid">
          <div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <MapPin size={14} aria-hidden /> Virginia · 3 Centers · Physician-led
            </p>
            <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(34px, 5vw, 56px)", textTransform: "uppercase", color: ON_LIGHT, lineHeight: 1.05, marginBottom: 20 }}>
              Virginia's choice for{" "}
              <span style={{ color: ORANGE }}>TRT, ED, and weight loss.</span>
            </h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: MUTED, lineHeight: 1.6, maxWidth: 520, marginBottom: 24 }}>
              Men's Wellness Centers is an in-person men's health practice with three Virginia locations. A licensed provider draws your labs, reviews them with you, and gives you a real protocol. Same visit. Same day.
            </p>
            <ul style={{ display: "grid", gap: 10, maxWidth: 520, marginBottom: 28 }}>
              {["Tired by noon. Coffee stopped working.","Six months of training. Your body hasn't changed.","Sex drive is down. She's noticed too.","Your GP said labs are normal. You don't feel normal."].map(line => (
                <li key={line} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontFamily: "Inter, sans-serif", fontSize: 17, color: ON_LIGHT }}>
                  <span style={{ marginTop: 9, height: 6, width: 6, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontFamily: "Inter, sans-serif", fontSize: 14, color: MUTED }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Star size={15} style={{ fill: ORANGE, color: ORANGE }} aria-hidden />
                <strong style={{ color: ON_LIGHT }}>4.9</strong> · 200+ Google reviews
              </span>
              <span><strong style={{ color: ON_LIGHT }}>10,000+</strong> Virginia members since 2015</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ShieldCheck size={14} style={{ color: ORANGE }} aria-hidden /> LegitScript certified
              </span>
            </div>
          </div>
          <div style={{ position: "sticky", top: 88 }}>
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── Who this is for: navy bg ── */}
      <SectionReveal>
        <section style={sectionStyle(NAVY)}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <Eyebrow dark>Who this is for</Eyebrow>
            <Heading dark>Built for Virginia men over 35 who feel off and want a real answer.</Heading>
            <Body dark maxWidth={720}>
              Most members are 38 to 62, working, with a family. They've already been told their labs are normal. They want a 60-minute conversation with a Virginia-licensed provider who specializes in men's health.
            </Body>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 36 }} className="optimize-3col">
              {[
                { title: "Low energy and recovery", body: "Energy drops in the afternoon. Workouts feel harder. Sleep is broken. You suspect testosterone is involved.", icon: Beaker },
                { title: "Sexual health concerns", body: "ED, lower libido, or both. You want an in-person evaluation, not a questionnaire from an app.", icon: UserCheck },
                { title: "Weight that will not move", body: "You're training and eating clean. The scale won't budge. You want a lab-guided GLP-1 protocol with monitoring.", icon: ClipboardList },
              ].map(({ title, body, icon: Icon }) => (
                <div key={title} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "28px 24px", transition: "transform 200ms, background 200ms" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
                  <Icon size={24} style={{ color: ORANGE }} aria-hidden />
                  <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: ON_DARK, marginTop: 14, marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: DARK_MUTED, lineHeight: 1.6 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── Why MWC: cream bg ── */}
      <SectionReveal>
        <section style={sectionStyle(CREAM)}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <Eyebrow>Why Men's Wellness Centers</Eyebrow>
            <Heading>Local. In-person. Built for men.</Heading>
            <Body maxWidth={680}>
              Telehealth brands send you a questionnaire and a shipping label. We sit you down with a Virginia-licensed provider, draw your labs on-site, and review every number with you the same visit.
            </Body>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 36 }} className="optimize-2col">
              {/* What you get */}
              <div style={{ background: "#FFFFFF", border: `2px solid ${ORANGE}`, borderRadius: 16, padding: "28px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 16 }}>What you get here</p>
                <ul style={{ display: "grid", gap: 12 }}>
                  {["60-minute in-person visit at your local center","Virginia-licensed provider, same provider every visit","Full hormone panel drawn and reviewed on-site","Personalized protocol explained in plain language","Ongoing follow-up labs included","FSA and HSA accepted"].map(line => (
                    <li key={line} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: ON_LIGHT }}>
                      <Check size={18} style={{ color: "#10B981", flexShrink: 0, marginTop: 2 }} strokeWidth={3} aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              {/* What you won't find */}
              <div style={{ background: "#FAFAF9", border: "1px solid #E5E3E0", borderRadius: 16, padding: "28px 24px" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, marginBottom: 16 }}>What you will not find here</p>
                <ul style={{ display: "grid", gap: 12 }}>
                  {["Mail-order questionnaires and chatbots","Rotating clinicians who do not know your case","Hidden fees or auto-renewing subscriptions","Call centers between you and your provider","Generic protocols from a chart range","Pressure to start treatment the same day"].map(line => (
                    <li key={line} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "Inter, sans-serif", fontSize: 15, color: MUTED }}>
                      <X size={17} style={{ color: MUTED, flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── Trust & proof: navy bg ── */}
      <SectionReveal>
        <section style={sectionStyle(NAVY)}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <Eyebrow dark>Trust and proof</Eyebrow>
            <Heading dark>10,000+ Virginia members. 4.9 stars. Verified.</Heading>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 36, marginBottom: 40 }} className="optimize-4col">
              {[{ stat: "10,000+", label: "Virginia members" },{ stat: "4.9★", label: "200+ Google reviews" },{ stat: "3", label: "Virginia centers" },{ stat: "Same-day", label: "Labs in your visit" }].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                  <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 36, color: ORANGE, lineHeight: 1 }}>{s.stat}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: DARK_MUTED, marginTop: 8 }}>{s.label}</p>
                </div>
              ))}
            </div>
            {/* Reviews */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }} className="optimize-2col">
              {REVIEWS.map(r => (
                <figure key={r.name} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "20px 22px", margin: 0 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} style={{ fill: ORANGE, color: ORANGE }} aria-hidden />)}
                  </div>
                  <blockquote style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: ON_DARK, lineHeight: 1.65, margin: 0, marginBottom: 12 }}>"{r.text}"</blockquote>
                  <figcaption style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: DARK_MUTED }}>
                    <strong style={{ color: ON_DARK }}>{r.name}</strong> · {r.when} · Verified Google review
                  </figcaption>
                </figure>
              ))}
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.40)", marginBottom: 40 }}>Reviews reflect individual experiences. Individual results vary.</p>
            {/* Badges */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 32, display: "flex", flexWrap: "wrap", gap: "12px 36px" }}>
              {[{ label: "LegitScript certified", icon: ShieldCheck },{ label: "CLIA certified on-site lab", icon: Beaker },{ label: "HIPAA compliant", icon: ShieldCheck },{ label: "Virginia-licensed providers", icon: UserCheck }].map(({ label, icon: Icon }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: ON_DARK }}>
                  <Icon size={16} style={{ color: ORANGE }} aria-hidden /> {label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── 3-step process: cream bg ── */}
      <SectionReveal>
        <section style={sectionStyle(CREAM)}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <Eyebrow>What happens after you book</Eyebrow>
            <Heading>Three steps. One visit. Real answers.</Heading>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 36 }} className="optimize-3col">
              {[
                { n: "01", title: "Pick a time, lock it in", body: "Choose your center and a 60-minute window. Most members book inside 60 seconds. Confirmation by text and email." },
                { n: "02", title: "Labs drawn on arrival", body: "Show up 10 minutes early. A full hormone panel drawn on-site in our CLIA-certified lab. Results processed during your visit." },
                { n: "03", title: "Your provider reviews everything", body: "Sit down with a Virginia-licensed provider for 60 minutes. Walk out with a personalized protocol when clinically appropriate." },
              ].map(step => (
                <div key={step.n} style={{ background: "#FFFFFF", border: "1px solid #E5E3E0", borderRadius: 14, padding: "28px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 48, color: ORANGE, lineHeight: 1 }}>{step.n}</p>
                  <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: ON_LIGHT, marginTop: 12, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: MUTED, lineHeight: 1.6 }}>{step.body}</p>
                </div>
              ))}
            </div>
            {/* Mid-page CTA */}
            <div style={{ background: "#FFFFFF", border: `2px solid ${ORANGE}`, borderRadius: 16, padding: "32px 36px", marginTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <div>
                <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: "clamp(22px,3vw,28px)", textTransform: "uppercase", color: ON_LIGHT, marginBottom: 6 }}>Reserve your no-cost 60-minute visit.</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: MUTED }}>Same-day appointments at Richmond, Newport News, and Virginia Beach.</p>
              </div>
              <a href="#reserve" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 28px", background: ORANGE, color: "#FFFFFF", borderRadius: 10, fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 700, textDecoration: "none", flexShrink: 0, boxShadow: "0 8px 24px rgba(232,103,10,0.35)" }}>
                Book My Visit <ArrowRight size={18} aria-hidden />
              </a>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── Locations: navy bg ── */}
      <SectionReveal>
        <section style={sectionStyle(NAVY)}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <Eyebrow dark>Three Virginia centers</Eyebrow>
            <Heading dark>Pick the location closest to you.</Heading>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 36 }} className="optimize-3col">
              {LOCATIONS_DATA.map(loc => (
                <div key={loc.city} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "24px 22px" }}>
                  <p style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, textTransform: "uppercase", color: ON_DARK }}>{loc.city}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: DARK_MUTED, marginTop: 4 }}>{loc.addr}</p>
                  <p style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: ORANGE, marginTop: 14 }}>
                    <MapPin size={14} aria-hidden /> {loc.drive}
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: ON_DARK, marginTop: 6 }}>
                    <Phone size={14} style={{ color: ORANGE }} aria-hidden /> {loc.phone}
                  </p>
                  <a href="#reserve" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 20, height: 44, background: ORANGE, color: "#FFFFFF", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Book No-Cost Visit
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── FAQ: cream bg ── */}
      <SectionReveal>
        <section style={sectionStyle(CREAM)}>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
            <Eyebrow>Common questions</Eyebrow>
            <Heading>Answers before you book.</Heading>
            <div style={{ marginTop: 28, background: "#FFFFFF", border: "1px solid #E5E3E0", borderRadius: 16, padding: "8px 28px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
              {FAQS.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} idx={i} />)}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── Final CTA form: navy bg ── */}
      <SectionReveal>
        <section style={sectionStyle(NAVY)}>
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
            <Eyebrow dark>One unambiguous next step</Eyebrow>
            <Heading dark center>Reserve your no-cost visit.</Heading>
            <Body dark center>Most members finish booking in under 60 seconds.</Body>
            <div style={{ marginTop: 28 }}>
              <LeadForm idSuffix="-bottom" dark />
            </div>
          </div>
        </section>
      </SectionReveal>

      <Suspense fallback={null}>
        <TRTFooter />
      </Suspense>

      <StickyMobileCTA />
      <div className="md:hidden" style={{ height: 80 }} aria-hidden />

      {/* Responsive grid overrides */}
      <style>{`
        @media (max-width: 767px) {
          .optimize-hero-grid { grid-template-columns: 1fr !important; }
          .optimize-2col      { grid-template-columns: 1fr !important; }
          .optimize-3col      { grid-template-columns: 1fr !important; }
          .optimize-4col      { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
