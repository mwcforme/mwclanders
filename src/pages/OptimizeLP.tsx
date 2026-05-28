/**
 * /optimize — CRO-optimized landing page for Men's Wellness Centers.
 *
 * Architected around 5 core CRO questions:
 *   1. What is this?                  → Hero kicker + one-sentence subhead
 *   2. Is this for someone like me?   → "For" segment band with pain bullets
 *   3. Why this vs alternatives?      → Comparison band
 *   4. Can I trust you, will it work? → Trust strip, reviews, badges
 *   5. What do I do next?             → Single dominant CTA + 3-step flow
 *
 * On form submit: posts lead to GHL via Supabase edge function,
 * seeds booking store, navigates to /book/schedule.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, X, Star, ShieldCheck, MapPin, Phone,
  Beaker, UserCheck, ClipboardList, ArrowRight, ChevronDown,
} from "lucide-react";
import { useBookingStore } from "@/domain/booking/bookingStore";
import { PHONE } from "@/lib/constants";
import { SEO } from "@/components/SEO";
import { trackFunnelEvent } from "@/hooks/useAnalytics";

const LOCATIONS_DATA = [
  { city: "Richmond",       key: "richmond",       addressShort: "Glen Allen, VA",       drive: "5 min from I-64",           phone: "(804) 346-4636" },
  { city: "Newport News",   key: "newport-news",   addressShort: "Newport News, VA",     drive: "3 min from I-64, Exit 258A", phone: "(757) 806-6263" },
  { city: "Virginia Beach", key: "virginia-beach", addressShort: "Virginia Beach, VA",   drive: "5 min from I-264",           phone: "(757) 612-4428" },
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
  { q: "Is testosterone therapy safe?", a: "Testosterone therapy is FDA-approved when prescribed and monitored by a licensed provider for members with clinically diagnosed low testosterone. Potential side effects are reviewed with you by your provider. Ongoing lab monitoring is part of every care plan." },
  { q: "How do I know if treatment is right for me?", a: "A diagnosis requires lab work and a clinical evaluation. At your first visit, we run a full hormone lab panel and review your symptoms. Treatment is only prescribed when clinically appropriate. If it is not right for you, our providers will tell you." },
];

// ─── Lead form ────────────────────────────────────────────────────────────────

interface LeadFormProps { idSuffix?: string; }

function LeadForm({ idSuffix = "" }: LeadFormProps) {
  const navigate = useNavigate();
  const patch    = useBookingStore(s => s.patch);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const fd   = new FormData(formRef.current!);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const loc   = String(fd.get("location") ?? "").trim();
    if (!name || !phone || !loc) return;

    setSubmitting(true);
    setError(null);
    trackFunnelEvent("lp_form_submit", { location: loc });

    try {
      // Import Supabase lazily to avoid blocking initial render
      const { supabase } = await import("@/integrations/supabase/legacy");
      const firstName = name.split(/\s+/)[0];
      const lastName  = name.split(/\s+/).slice(1).join(" ") || "";

      // Call GHL contact-creation edge function (same as BookEntry path)
      const { GhlProxyLeadSubmitter } = await import("@/services/impl/GhlProxyLeadSubmitter");
      const submitter = new GhlProxyLeadSubmitter();
      const result = await submitter.submitLead({
        firstName,
        lastName: lastName || undefined,
        phone,
        source: "optimize-lp",
        customFields: { mwc_funnel_service: "trt", mwc_lp_slug: "optimize" },
      });

      // Seed booking store so /book/schedule has identity
      patch({
        identity: {
          firstName,
          phone,
          email: "",
          ghlContactId: result.contactId,
        },
        location: loc,
        service:  "trt",
        source:   "optimize-lp",
        lpSlug:   "optimize",
      });

      trackFunnelEvent("lp_form_success", { location: loc });
      navigate("/book/schedule");

    } catch (err) {
      console.error("[OptimizeLP] form error", err);
      setError("Something went wrong. Please call us directly to book.");
      setSubmitting(false);
    }
  }

  const formId = `reserve${idSuffix}`;

  return (
    <form
      id={formId}
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-2xl bg-panel text-panel-foreground p-6 sm:p-8 shadow-card border-2 border-panel-divider"
      aria-labelledby={`${formId}-heading`}
    >
      <h2 id={`${formId}-heading`}
        className="font-display text-2xl sm:text-3xl font-bold uppercase leading-[1.05] text-panel-foreground">
        Reserve your 60-minute visit.
      </h2>
      <p className="mt-2 text-sm text-panel-muted">
        No-cost. No obligation. Labs reviewed by your provider on the same visit.
      </p>

      <div className="mt-5 grid gap-3">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input type="text" name="name" required placeholder="Your name"
            className="w-full rounded-xl border-2 border-panel-divider bg-background/60 text-panel-foreground placeholder:text-text-muted px-4 h-12 text-base focus:outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="sr-only">Phone</span>
          <input type="tel" name="phone" required placeholder="Phone"
            className="w-full rounded-xl border-2 border-panel-divider bg-background/60 text-panel-foreground placeholder:text-text-muted px-4 h-12 text-base focus:outline-none focus:border-primary" />
        </label>
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-panel-muted mb-2">Closest location</legend>
          <div className="grid grid-cols-3 gap-2">
            {LOCATIONS_DATA.map((loc) => (
              <label key={loc.city}
                className="cursor-pointer rounded-xl border-2 border-panel-divider bg-background/60 px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-panel-foreground hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white transition-colors">
                <input type="radio" name="location" value={loc.key} className="sr-only" required />
                {loc.city === "Virginia Beach" ? "VA Beach" : loc.city === "Newport News" ? "Newport" : loc.city}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="mt-4 flex items-start gap-2 text-[11px] text-panel-muted leading-snug">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-primary flex-shrink-0" />
        <span>I agree to receive SMS and calls from Men's Wellness Centers. Msg and data rates may apply. Reply STOP to opt out. Not a condition of service.</span>
      </label>

      {error && (
        <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm font-semibold text-panel-foreground">
          {error}{" "}
          <a href={PHONE.tel} className="text-primary underline underline-offset-2">{PHONE.display}</a>
        </div>
      )}

      <button type="submit" disabled={submitting}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-display font-bold uppercase tracking-[0.14em] text-base py-4 shadow-cta hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-wait">
        {submitting ? "Booking…" : <>Get Started <ArrowRight className="h-5 w-5" aria-hidden /></>}
      </button>
      <p className="mt-3 text-center text-[11px] text-panel-muted">
        Booking takes under 60 seconds. You pick the time next.
      </p>
    </form>
  );
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────

function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="border-b-2 border-panel-divider last:border-b-0">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}>
        <span className="font-display text-base sm:text-lg font-bold uppercase tracking-wide text-panel-foreground">{q}</span>
        <ChevronDown className={`h-5 w-5 text-primary-hover flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <p className="pb-5 text-base text-panel-muted leading-relaxed">{a}</p>}
    </div>
  );
}

// ─── Sticky mobile CTA ────────────────────────────────────────────────────────

function StickyMobileCTA() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t-2 border-panel-divider px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
      <a href="#reserve"
        className="block w-full text-center rounded-xl bg-primary text-white font-display font-bold uppercase tracking-[0.14em] text-base py-4 shadow-cta hover:bg-primary-hover transition-colors">
        Book My No-Cost Visit
      </a>
      <p className="text-center text-[11px] text-text-muted mt-1.5">60-minute in-person visit · Men's Wellness Centers</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OptimizeLP() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Men's Wellness Centers — Virginia's TRT, ED & Weight Loss Specialists"
        description="In-person testosterone therapy, ED treatment, and weight loss at 3 Virginia centers. No-cost 60-minute physician visit. Same-day lab results."
      />

      {/* ── Header ── */}
      <header className="border-b-2 border-panel-divider/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <img src="/logos/Text_Logo_dark.webp"
            onError={e => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_dark.png"; }}
            alt="Men's Wellness Centers" width={160} height={28} style={{ height: 28, width: "auto" }} />
          <a href={PHONE.tel}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-hover hover:text-primary">
            <Phone className="h-4 w-4" aria-hidden /> {PHONE.display}
          </a>
          <a href="#reserve"
            className="inline-flex items-center rounded-lg bg-primary text-white font-display font-bold uppercase tracking-wider text-xs px-4 h-9 shadow-cta hover:bg-primary-hover transition-colors sm:hidden">
            Book
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="reserve">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-10 sm:pt-12 sm:pb-16 grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-start">
          <div>
            <p className="inline-flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-primary-hover">
              <MapPin className="h-4 w-4" aria-hidden /> Virginia · 3 Centers · Physician-led
            </p>
            <h1 className="mt-3 font-display text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-[1.02] text-foreground">
              Virginia's choice for
              <span className="block text-primary">TRT, ED, and weight loss.</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-text-muted leading-snug max-w-xl">
              Men's Wellness Centers is an in-person men's health practice with three Virginia locations. A licensed provider draws your labs, reviews them with you, and gives you a real protocol. Same visit. Same day.
            </p>
            <ul className="mt-6 grid gap-2 max-w-xl">
              {[
                "Tired by noon. Coffee stopped working.",
                "Six months of training. Your body hasn't changed.",
                "Sex drive is down. She's noticed too.",
                "Your GP said labs are normal. You don't feel normal.",
              ].map(line => (
                <li key={line} className="flex items-start gap-3 text-base sm:text-lg text-foreground">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
                <strong className="text-foreground">4.9</strong> · 200+ Google reviews
              </span>
              <span className="inline-flex items-center gap-1.5">
                <strong className="text-foreground">10,000+</strong> Virginia members since 2015
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary-hover" aria-hidden /> LegitScript certified
              </span>
            </div>
          </div>
          <div className="md:sticky md:top-6">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── Who this is for ── */}
      <section className="bg-panel text-panel-foreground py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-primary-hover">Who this is for</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase leading-[1.05] text-panel-foreground">
            Built for Virginia men over 35 who feel off and want a real answer.
          </h2>
          <p className="mt-3 text-lg text-panel-muted max-w-3xl">
            Most members are 38 to 62, working, with a family. They have already been told their labs are normal. They want a 60-minute conversation with a Virginia-licensed provider who specializes in men's health.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { title: "Low energy and recovery", body: "Energy drops in the afternoon. Workouts feel harder. Sleep is broken. You suspect testosterone is involved.", icon: Beaker },
              { title: "Sexual health concerns", body: "ED, lower libido, or both. You want an in-person evaluation, not a questionnaire from an app.", icon: UserCheck },
              { title: "Weight that will not move", body: "You are training and eating clean. The scale will not budge. You want a lab-guided GLP-1 protocol with monitoring.", icon: ClipboardList },
            ].map(({ title, body, icon: Icon }) => (
              <div key={title} className="rounded-2xl bg-background/50 border-2 border-panel-divider p-5 sm:p-6">
                <Icon className="h-6 w-6 text-primary-hover" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-bold uppercase text-panel-foreground">{title}</h3>
                <p className="mt-2 text-sm text-panel-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why MWC vs alternatives ── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-primary-hover">Why Men's Wellness Centers</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase leading-[1.05] text-foreground">Local. In-person. Built for men.</h2>
          <p className="mt-3 text-lg text-text-muted max-w-3xl">
            Telehealth brands send you a questionnaire and a shipping label. We sit you down with a Virginia-licensed provider, draw your labs on-site, and review every number with you the same visit.
          </p>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-panel text-panel-foreground border-2 border-primary p-6 sm:p-7 shadow-card">
              <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-primary-hover">What you get here</p>
              <ul className="mt-4 grid gap-3">
                {["60-minute in-person visit at your local center","Virginia-licensed provider, same provider every visit","Full hormone panel drawn and reviewed on-site","Personalized protocol explained in plain language","Ongoing follow-up labs included, not sold as add-ons","FSA and HSA accepted"].map(line => (
                  <li key={line} className="flex items-start gap-2.5 text-base font-semibold text-panel-foreground">
                    <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-success" aria-hidden strokeWidth={3} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-background border-2 border-panel-divider p-6 sm:p-7">
              <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-text-muted">What you will not find here</p>
              <ul className="mt-4 grid gap-3">
                {["Mail-order questionnaires and chatbots","Rotating clinicians who do not know your case","Hidden fees or auto-renewing subscriptions","Call centers between you and your provider","Generic protocols pulled from a chart range","Pressure to start treatment the same day"].map(line => (
                  <li key={line} className="flex items-start gap-2.5 text-base text-text-muted">
                    <X className="h-5 w-5 mt-0.5 flex-shrink-0 text-text-muted" aria-hidden strokeWidth={2.5} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust and proof ── */}
      <section className="bg-panel text-panel-foreground py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-primary-hover">Trust and proof</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase leading-[1.05] text-panel-foreground">
            10,000+ Virginia members. 4.9 stars. Verified.
          </h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ stat: "10,000+", label: "Virginia members since 2015" },{ stat: "4.9★", label: "200+ Google reviews" },{ stat: "3", label: "Virginia centers" },{ stat: "Same-day", label: "Labs reviewed in your visit" }].map(s => (
              <div key={s.label} className="rounded-2xl bg-background/50 border-2 border-panel-divider p-4 sm:p-5 text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-primary leading-none">{s.stat}</p>
                <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-panel-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {REVIEWS.map(r => (
              <figure key={r.name} className="rounded-2xl bg-background/50 border-2 border-panel-divider p-5">
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" aria-hidden />)}
                </div>
                <blockquote className="mt-3 text-base text-panel-foreground leading-relaxed">"{r.text}"</blockquote>
                <figcaption className="mt-3 text-sm text-panel-muted">
                  <strong className="text-panel-foreground">{r.name}</strong> · {r.when} · Verified Google review
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-xs text-panel-muted">Reviews reflect individual experiences. Individual results vary.</p>
          <div className="mt-8 pt-8 border-t-2 border-panel-divider grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            {[{ label: "LegitScript certified", icon: ShieldCheck },{ label: "CLIA certified on-site lab", icon: Beaker },{ label: "HIPAA compliant", icon: ShieldCheck },{ label: "Virginia-licensed providers", icon: UserCheck }].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-semibold text-panel-foreground">
                <Icon className="h-5 w-5 text-primary-hover flex-shrink-0" aria-hidden />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 steps ── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-primary-hover">What happens after you book</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase leading-[1.05] text-foreground">Three steps. One visit. Real answers.</h2>
          <ol className="mt-8 grid sm:grid-cols-3 gap-5">
            {[
              { n: "01", title: "Pick a time, lock it in", body: "Choose your center and a 60-minute window. Most members book inside 60 seconds. Confirmation by text and email." },
              { n: "02", title: "Labs drawn on arrival", body: "Show up 10 minutes early. A full hormone panel drawn on-site in our CLIA-certified lab. Results processed during your visit." },
              { n: "03", title: "Your provider reviews everything", body: "Sit down with a Virginia-licensed provider for 60 minutes. Walk out with a personalized protocol when clinically appropriate." },
            ].map(step => (
              <li key={step.n} className="rounded-2xl bg-panel text-panel-foreground p-6 border-2 border-panel-divider">
                <p className="font-display text-4xl sm:text-5xl font-bold text-primary leading-none">{step.n}</p>
                <h3 className="mt-3 font-display text-lg font-bold uppercase text-panel-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-panel-muted leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-2xl bg-panel text-panel-foreground p-6 sm:p-8 border-2 border-primary shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold uppercase leading-tight text-panel-foreground">Reserve your no-cost 60-minute visit.</p>
              <p className="mt-2 text-sm sm:text-base text-panel-muted">Same-day appointments at Richmond, Newport News, and Virginia Beach.</p>
            </div>
            <a href="#reserve"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-display font-bold uppercase tracking-[0.14em] text-base px-6 py-4 shadow-cta hover:bg-primary-hover transition-colors w-full sm:w-auto">
              Book My Visit <ArrowRight className="h-5 w-5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ── Locations ── */}
      <section className="bg-panel text-panel-foreground py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-primary-hover">Three Virginia centers</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase leading-[1.05] text-panel-foreground">Pick the location closest to you.</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-5">
            {LOCATIONS_DATA.map(loc => (
              <div key={loc.city} className="rounded-2xl bg-background/50 border-2 border-panel-divider p-5">
                <p className="font-display text-xl font-bold uppercase text-panel-foreground">{loc.city}</p>
                <p className="mt-1 text-sm text-panel-muted">{loc.addressShort}</p>
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary-hover">
                  <MapPin className="h-4 w-4" aria-hidden /> {loc.drive}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-panel-foreground">
                  <Phone className="h-4 w-4 text-primary-hover" aria-hidden /> {loc.phone}
                </p>
                <a href="#reserve"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-white font-display font-bold uppercase tracking-[0.12em] text-sm px-4 py-3 shadow-cta hover:bg-primary-hover transition-colors">
                  Book No-Cost Visit
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-primary-hover">Common questions</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase leading-[1.05] text-foreground">Answers before you book.</h2>
          <div className="mt-6 rounded-2xl bg-panel text-panel-foreground p-6 shadow-card border-2 border-panel-divider">
            {FAQS.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA form ── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-primary-hover text-center">One unambiguous next step</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase leading-[1.05] text-foreground text-center">Reserve your no-cost visit.</h2>
          <p className="mt-3 text-center text-base text-text-muted">Most members finish booking in under 60 seconds.</p>
          <div className="mt-6">
            <LeadForm idSuffix="-bottom" />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-panel text-panel-foreground border-t-2 border-panel-divider py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-display text-base font-bold uppercase tracking-[0.18em] text-panel-foreground">Men's Wellness Centers</p>
            <p className="mt-2 text-panel-muted leading-relaxed">Physician-led men's health, in person, at three Virginia centers. Finding Your Edge Over Age.</p>
            <a href={PHONE.tel} className="mt-3 inline-flex items-center gap-2 text-primary-hover hover:text-primary">
              <Phone className="h-4 w-4" aria-hidden /> {PHONE.display}
            </a>
          </div>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-panel-foreground">Centers</p>
            <ul className="mt-3 grid gap-1 text-panel-muted">
              {LOCATIONS_DATA.map(l => <li key={l.city}><strong className="text-panel-foreground">{l.city}</strong> · {l.phone}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-panel-foreground">Compliance</p>
            <ul className="mt-3 grid gap-1 text-panel-muted">
              <li>LegitScript certified</li>
              <li>CLIA certified on-site labs</li>
              <li>HIPAA compliant</li>
              <li>Virginia-licensed providers</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 pt-6 border-t-2 border-panel-divider text-[11px] text-panel-muted leading-relaxed">
          <p>The information on this website is for general informational purposes only and is not medical advice. Treatment is provided only when clinically appropriate. Testimonials reflect individual experiences. Individual results vary.</p>
          <p className="mt-2">© 2026 Men's Wellness Centers · <a href="/privacy-policy" className="hover:text-primary-hover">Privacy</a> · <a href="/terms-of-service" className="hover:text-primary-hover">Terms</a> · <a href="/prescribing-policy" className="hover:text-primary-hover">Safety policy</a></p>
        </div>
      </footer>

      <StickyMobileCTA />
      <div className="md:hidden h-24" aria-hidden />
    </div>
  );
}
