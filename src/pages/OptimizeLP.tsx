/**
 * /optimize — CRO landing page using the exact same token system as /book/schedule.
 * bg-background (cream), bg-panel (white cards), bg-surface (dark navy sections),
 * text-panel-foreground, font-display (Oswald), Tailwind throughout.
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, X, Star, ShieldCheck, MapPin, Phone,
  Beaker, UserCheck, ClipboardList, ArrowRight, ChevronDown,
} from "lucide-react";
import { BookHeader } from "@/components/book/BookHeader";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { PHONE } from "@/lib/constants";
import { SEO } from "@/components/SEO";
import { trackFunnelEvent } from "@/hooks/useAnalytics";

const TRTFooter = lazy(() =>
  import("@/components/landing/trt/TRTFooter").then(m => ({ default: m.TRTFooter }))
);

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
  { q: "How is this different from Hims, Hone, or an online TRT clinic?", a: "We're in-person only. You see the same Virginia-licensed provider at the same center, labs are drawn on-site and reviewed that day, and your provider knows your full case. No mail-order chatbots, no rotating clinicians." },
  { q: "What does the first visit actually cover?", a: "Plan for 60 minutes. Labs drawn on-site. Your Virginia provider reviews every result with you in the same visit, explains what it means in plain language, and if treatment is appropriate, you leave with a protocol that day. No-cost. No obligation." },
  { q: "Does insurance cover this?", a: "Your first visit is at no cost, including labs and the provider review. We don't bill insurance, but we accept FSA and HSA cards. Most members find the straightforward pricing easier than navigating insurance approvals." },
  { q: "Is testosterone therapy safe?", a: "Testosterone therapy is FDA-approved when prescribed and monitored by a licensed provider for members with clinically diagnosed low testosterone. Potential side effects are reviewed with you. Ongoing lab monitoring is included in every care plan." },
  { q: "How do I know if treatment is right for me?", a: "A diagnosis requires lab work and a clinical evaluation. At your first visit, we run a full hormone panel and review your symptoms. Treatment is only prescribed when clinically appropriate. If it's not right for you, our providers will tell you." },
];

// ─── Lead form ────────────────────────────────────────────────────────────────

function LeadForm({ idSuffix = "" }: { idSuffix?: string }) {
  const navigate  = useNavigate();
  const patch     = useBookingStore(s => s.patch);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  return (
    <form ref={formRef} onSubmit={onSubmit}
      className="rounded-2xl bg-panel text-panel-foreground p-6 shadow-card border-2 border-panel-divider"
      aria-label="Reserve your visit">

      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-panel-foreground leading-tight mb-1">
        Reserve your 60-minute visit.
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--c-text-on-light-muted)" }}>
        No-cost. No obligation. Labs reviewed on the same visit.
      </p>

      <div className="flex flex-col gap-3">
        <input type="text" name="name" required placeholder="Your name"
          className="w-full rounded-xl border-[1.5px] border-panel-border bg-background text-panel-foreground placeholder:text-panel-muted px-4 h-12 text-base focus:outline-none focus:border-primary transition-colors" />
        <input type="tel" name="phone" required placeholder="Phone number"
          className="w-full rounded-xl border-[1.5px] border-panel-border bg-background text-panel-foreground placeholder:text-panel-muted px-4 h-12 text-base focus:outline-none focus:border-primary transition-colors" />

        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.12em] text-panel-muted mb-2 block">
            Closest location
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {LOCATIONS_DATA.map(loc => (
              <label key={loc.city} className="cursor-pointer">
                <input type="radio" name="location" value={loc.key} required className="sr-only optimize-radio" />
                <span className="optimize-radio-label block text-center py-2.5 px-1 rounded-xl border-[1.5px] border-panel-border bg-background text-panel-foreground text-[11px] font-bold uppercase tracking-wider transition-colors select-none">
                  {loc.city === "Virginia Beach" ? "VA Beach" : loc.city === "Newport News" ? "Newport" : loc.city}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="mt-4 flex items-start gap-2.5 cursor-pointer">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-primary flex-shrink-0" />
        <span className="text-[11px] leading-snug text-panel-muted">
          I agree to receive SMS and calls from Men's Wellness Centers. Msg &amp; data rates may apply. Reply STOP to opt out. Not a condition of service.
        </span>
      </label>

      {error && (
        <div className="mt-3 rounded-xl border border-panel-border bg-background px-4 py-3 text-sm font-semibold text-panel-foreground">
          {error}{" "}<a href={PHONE.tel} className="text-primary underline underline-offset-2">{PHONE.display}</a>
        </div>
      )}

      <button type="submit" disabled={submitting}
        className="mt-5 w-full h-14 rounded-xl bg-primary text-white font-display font-bold uppercase tracking-[0.12em] text-base shadow-cta hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2">
        {submitting ? "Booking…" : <><span>Get Started</span><ArrowRight className="h-5 w-5" aria-hidden /></>}
      </button>
      <p className="mt-2.5 text-center text-[11px] text-panel-muted">
        Takes under 60 seconds. You pick the time next.
      </p>

      <style>{`.optimize-radio:checked + .optimize-radio-label { background: var(--brand-cta) !important; color: #fff !important; border-color: var(--brand-cta) !important; }`}</style>
    </form>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="border-b border-panel-divider last:border-b-0">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left bg-transparent border-0 cursor-pointer"
        aria-expanded={open}>
        <span className="font-display text-base font-bold uppercase tracking-wide text-panel-foreground">{q}</span>
        <ChevronDown className={`h-5 w-5 text-primary flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <p className="pb-5 text-base leading-relaxed" style={{ color: "var(--c-text-on-light-muted)" }}>{a}</p>}
    </div>
  );
}

// ─── Section helpers ──────────────────────────────────────────────────────────

// Eyebrow matches schedule page section labels (dark navy, tracked caps, no orange on light)
const Eyebrow = ({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) => (
  <p className={`font-display text-xs font-bold uppercase tracking-[0.18em] mb-2 ${onDark ? "text-white/75" : "text-panel-muted"}`}>
    {children}
  </p>
);

const SectionHeading = ({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) => (
  <h2 className={`font-display text-3xl sm:text-4xl font-bold uppercase leading-tight mb-4 ${onDark ? "text-white" : "text-panel-foreground"}`}>
    {children}
  </h2>
);

const BodyText = ({ children, onDark = false, center = false }: { children: React.ReactNode; onDark?: boolean; center?: boolean }) => (
  <p className={`text-lg leading-relaxed ${onDark ? "text-white/80" : ""} ${center ? "text-center" : ""}`}
    style={onDark ? undefined : { color: "var(--c-text-on-light-muted)" }}>
    {children}
  </p>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OptimizeLP() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Men's Wellness Centers — Virginia's TRT, ED & Weight Loss Specialists"
        description="In-person testosterone therapy, ED treatment, and weight loss at 3 Virginia centers. No-cost 60-minute physician visit. Same-day lab results."
      />

      <BookHeader />

      {/* ── Hero: cream bg ── */}
      <section id="reserve" className="pt-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14 grid md:grid-cols-[1.15fr_1fr] gap-8 md:gap-12 items-start">
          {/* Left: copy */}
          <div>
            <p className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-panel-muted mb-4">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" aria-hidden />
              Virginia · 3 Centers · Physician-led
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase leading-[1.04] text-panel-foreground mb-4">
              Virginia's choice for{" "}
              <span className="text-primary">TRT, ED, and weight loss.</span>
            </h1>
            <BodyText>
              Men's Wellness Centers is an in-person men's health practice with three Virginia locations. A licensed provider draws your labs, reviews them with you, and gives you a real protocol. Same visit. Same day.
            </BodyText>
            <ul className="mt-5 grid gap-2.5 max-w-lg">
              {[
                "Tired by noon. Coffee stopped working.",
                "Six months of training. Your body hasn't changed.",
                "Sex drive is down. She's noticed too.",
                "Your GP said labs are normal. You don't feel normal.",
              ].map(line => (
                <li key={line} className="flex items-start gap-3 text-base sm:text-lg text-panel-foreground">
                  <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2" style={{ color: "var(--c-text-on-light-muted)", fontSize: 14 }}>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
                <strong className="text-panel-foreground">4.9</strong> · 200+ Google reviews
              </span>
              <span><strong className="text-panel-foreground">10,000+</strong> Virginia members since 2015</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> LegitScript certified
              </span>
            </div>
          </div>
          {/* Right: sticky form */}
          <div className="md:sticky md:top-20">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── Who this is for: bg-surface (dark) ── */}
      <section className="bg-surface py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Eyebrow onDark>Who this is for</Eyebrow>
          <SectionHeading onDark>Built for Virginia men over 35 who feel off and want a real answer.</SectionHeading>
          <BodyText onDark>
            Most members are 38 to 62, working, with a family. They've already been told their labs are normal. They want a 60-minute conversation with a Virginia-licensed provider who specializes in men's health.
          </BodyText>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { title: "Low energy and recovery", body: "Energy drops in the afternoon. Workouts feel harder. Sleep is broken. You suspect testosterone is involved.", icon: Beaker },
              { title: "Sexual health concerns", body: "ED, lower libido, or both. You want an in-person evaluation, not a questionnaire from an app.", icon: UserCheck },
              { title: "Weight that will not move", body: "You're training and eating clean. The scale won't budge. You want a lab-guided GLP-1 protocol with monitoring.", icon: ClipboardList },
            ].map(({ title, body, icon: Icon }) => (
              <div key={title}
                className="rounded-2xl bg-panel text-panel-foreground p-5 sm:p-6 shadow-card border border-panel-divider"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                style={{ transition: "transform 220ms ease" }}>
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-bold uppercase text-panel-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-on-light-muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why MWC: bg-background (cream) ── */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Eyebrow>Why Men's Wellness Centers</Eyebrow>
          <SectionHeading>Local. In-person. Built for men.</SectionHeading>
          <BodyText>
            Telehealth brands send you a questionnaire and a shipping label. We sit you down with a Virginia-licensed provider, draw your labs on-site, and review every number with you the same visit.
          </BodyText>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-panel text-panel-foreground p-6 sm:p-7 shadow-card border-2 border-primary">
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-panel-muted mb-4">What you get here</p>
              <ul className="grid gap-3">
                {["60-minute in-person visit at your local center","Virginia-licensed provider, same provider every visit","Full hormone panel drawn and reviewed on-site","Personalized protocol explained in plain language","Ongoing follow-up labs included","FSA and HSA accepted"].map(line => (
                  <li key={line} className="flex items-start gap-2.5 text-base font-semibold text-panel-foreground">
                    <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-success" aria-hidden strokeWidth={3} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-panel text-panel-foreground p-6 sm:p-7 shadow-card border border-panel-divider">
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-panel-muted mb-4">What you will not find here</p>
              <ul className="grid gap-3">
                {["Mail-order questionnaires and chatbots","Rotating clinicians who do not know your case","Hidden fees or auto-renewing subscriptions","Call centers between you and your provider","Generic protocols from a chart range","Pressure to start treatment the same day"].map(line => (
                  <li key={line} className="flex items-start gap-2.5 text-base" style={{ color: "var(--c-text-on-light-muted)" }}>
                    <X className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--c-text-on-light-muted)" }} aria-hidden strokeWidth={2.5} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust: bg-surface (dark) ── */}
      <section className="bg-surface py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Eyebrow onDark>Trust and proof</Eyebrow>
          <SectionHeading onDark>10,000+ Virginia members. 4.9 stars. Verified.</SectionHeading>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ stat: "10,000+", label: "Virginia members" },{ stat: "4.9★", label: "200+ Google reviews" },{ stat: "3", label: "Virginia centers" },{ stat: "Same-day", label: "Labs in your visit" }].map(s => (
              <div key={s.label} className="rounded-2xl bg-panel text-panel-foreground p-4 sm:p-5 text-center shadow-card">
                <p className="font-display text-3xl sm:text-4xl font-bold text-primary leading-none">{s.stat}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-panel-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {REVIEWS.map(r => (
              <figure key={r.name} className="rounded-2xl bg-panel text-panel-foreground p-5 shadow-card border border-panel-divider m-0">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" aria-hidden />)}
                </div>
                <blockquote className="text-base text-panel-foreground leading-relaxed mb-3">"{r.text}"</blockquote>
                <figcaption className="text-sm text-panel-muted">
                  <strong className="text-panel-foreground">{r.name}</strong> · {r.when} · Verified Google review
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/50">Reviews reflect individual experiences. Individual results vary.</p>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-x-8 gap-y-3">
            {[{ label: "LegitScript certified", icon: ShieldCheck },{ label: "CLIA certified lab", icon: Beaker },{ label: "HIPAA compliant", icon: ShieldCheck },{ label: "Virginia-licensed providers", icon: UserCheck }].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <Icon className="h-4 w-4 text-primary" aria-hidden /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 steps: bg-background (cream) ── */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Eyebrow>What happens after you book</Eyebrow>
          <SectionHeading>Three steps. One visit. Real answers.</SectionHeading>
          <div className="mt-8 grid sm:grid-cols-3 gap-5">
            {[
              { n: "01", title: "Pick a time, lock it in", body: "Choose your center and a 60-minute window. Most members book inside 60 seconds. Confirmation by text and email." },
              { n: "02", title: "Labs drawn on arrival", body: "Show up 10 minutes early. A full hormone panel drawn on-site in our CLIA-certified lab. Results processed during your visit." },
              { n: "03", title: "Your provider reviews everything", body: "Sit down with a Virginia-licensed provider for 60 minutes. Walk out with a personalized protocol when clinically appropriate." },
            ].map(step => (
              <div key={step.n} className="rounded-2xl bg-panel text-panel-foreground p-6 shadow-card border border-panel-divider">
                <p className="font-display text-5xl font-bold text-primary leading-none">{step.n}</p>
                <h3 className="mt-3 font-display text-lg font-bold uppercase text-panel-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-on-light-muted)" }}>{step.body}</p>
              </div>
            ))}
          </div>
          {/* Mid-page CTA */}
          <div className="mt-10 rounded-2xl bg-panel text-panel-foreground p-6 sm:p-8 shadow-card border-2 border-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="font-display text-2xl font-bold uppercase text-panel-foreground mb-1">Reserve your no-cost 60-minute visit.</p>
              <p className="text-sm" style={{ color: "var(--c-text-on-light-muted)" }}>Same-day appointments at Richmond, Newport News, and Virginia Beach.</p>
            </div>
            <a href="#reserve" className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-xl bg-primary text-white font-display font-bold uppercase tracking-[0.12em] text-base shadow-cta hover:bg-primary-hover transition-colors w-full sm:w-auto flex-shrink-0">
              Book My Visit <ArrowRight className="h-5 w-5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ── Locations: bg-surface (dark) ── */}
      <section className="bg-surface py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Eyebrow onDark>Three Virginia centers</Eyebrow>
          <SectionHeading onDark>Pick the location closest to you.</SectionHeading>
          <div className="mt-8 grid sm:grid-cols-3 gap-5">
            {LOCATIONS_DATA.map(loc => (
              <div key={loc.city} className="rounded-2xl bg-panel text-panel-foreground p-5 shadow-card border border-panel-divider">
                <p className="font-display text-xl font-bold uppercase text-panel-foreground">{loc.city}</p>
                <p className="mt-1 text-sm text-panel-muted">{loc.addr}</p>
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-panel-foreground">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" aria-hidden /> {loc.drive}
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-panel-foreground">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" aria-hidden /> {loc.phone}
                </p>
                <a href="#reserve" className="mt-4 flex w-full items-center justify-center h-11 rounded-xl bg-primary text-white font-display font-bold uppercase tracking-[0.12em] text-sm shadow-cta hover:bg-primary-hover transition-colors">
                  Book No-Cost Visit
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ: bg-background (cream) ── */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <Eyebrow>Common questions</Eyebrow>
          <SectionHeading>Answers before you book.</SectionHeading>
          <div className="mt-6 rounded-2xl bg-panel text-panel-foreground px-6 shadow-card border border-panel-divider">
            {FAQS.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA form: bg-surface (dark) ── */}
      <section className="bg-surface py-12 sm:py-16">
        <div className="mx-auto w-full max-w-xl px-4 sm:px-6 text-center">
          <Eyebrow onDark center>One unambiguous next step</Eyebrow>
          <SectionHeading onDark>Reserve your no-cost visit.</SectionHeading>
          <BodyText onDark center>Most members finish booking in under 60 seconds.</BodyText>
          <div className="mt-6">
            <LeadForm idSuffix="-bottom" />
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <TRTFooter />
      </Suspense>

      {/* Mobile sticky CTA */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border-subtle bg-background/97 backdrop-blur px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.6)]">
        <a href="#reserve" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-white font-display font-bold uppercase tracking-wider text-base py-4 shadow-cta hover:bg-primary-hover transition-colors">
          Book My No-Cost Visit
        </a>
        <p className="text-center text-[11px] text-text-muted mt-1.5">60-minute in-person visit · Men's Wellness Centers</p>
      </div>
      <div className="sm:hidden h-24" aria-hidden />
    </div>
  );
}
