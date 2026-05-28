import { useState } from "react";
import { Phone, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import BookLayout from "@/components/book/BookLayout";
import { ContactCard } from "@/components/book/ContactCard";
import { PHONE } from "@/lib/constants";
import { capturePartialLead } from "@/lib/partialCapture";
import { formatPhone } from "@/data/croContent";

const PHONE_DISPLAY = PHONE.display;
const PHONE_TEL = PHONE.tel;
const SMS_HREF = PHONE.sms;

function CallbackForm() {
  const [phone, setPhone]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    setLoading(true);
    await capturePartialLead({ phone, source: "lets-talk-callback" }).catch(() => {});
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-panel border border-panel-border p-6 mt-4">
      <p className="font-display text-base font-bold uppercase tracking-wide text-panel-foreground mb-1">
        Not a phone call person?
      </p>
      <p className="text-sm text-panel-muted mb-4">
        Leave your number. We'll call you to match you with the right visit.
      </p>
      {sent ? (
        <p className="text-sm font-semibold text-success">
          Got it. We'll call you shortly.
        </p>
      ) : (
        <form onSubmit={(e) => { void handleSubmit(e); }} className="flex gap-2">
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            required
            className="flex-1 rounded-xl border border-panel-border bg-background px-4 py-3 text-base text-panel-foreground placeholder:text-panel-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g, "").length < 10}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white font-display font-bold uppercase tracking-wide px-4 py-3 text-sm shadow-cta disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          </button>
        </form>
      )}
    </div>
  );
}

function isTeamAvailable(): boolean {
  const now = new Date();
  const et = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", hour: "numeric", minute: "numeric",
    weekday: "short", hour12: false,
  }).formatToParts(now);
  const day = et.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(et.find((p) => p.type === "hour")?.value ?? "0", 10);
  const isSat = day === "Sat";
  const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
  if (isSat) return hour >= 8 && hour < 16;
  return isWeekday && hour >= 8 && hour < 18;
}

function trackEvent(event: string, page: string) {
  const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (typeof window !== "undefined" && dl) dl.push({ event, page });
}

/**
 * /book/lets-talk — Termination page for the "Something else" symptom path.
 * Goal: phone conversion via call or text. Not a disqualifier.
 */
const BookLetsTalk = () => {
  return (
    <BookLayout page="lets-talk" title="Let's talk it through | Men's Wellness Centers">
      <div className="px-4 md:px-6 pt-8 md:pt-14 pb-28 md:pb-16">
        <div className="mx-auto max-w-[760px]">

          {/* Main CTA section — dark surface card */}
          <section className="rounded-2xl bg-surface p-6 md:p-10 text-center mb-8">
            {isTeamAvailable() && (
              <div className="inline-flex items-center gap-2 mb-4 md:mb-5 rounded-full px-3 py-1 bg-primary/20 border border-primary/40">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="font-display text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  Team available now
                </span>
              </div>
            )}
            <h1 className="font-display font-bold text-[clamp(28px,5vw,44px)] text-white uppercase leading-tight mb-3">
              TALK TO US.
            </h1>
            <p className="text-base md:text-lg text-white/75 leading-relaxed max-w-[520px] mx-auto">
              Call or text us. A real person will match you with the right visit. No phone tree, no runaround.
            </p>
          </section>

          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-2xl border border-primary/30">
              <ContactCard
                type="call"
                phoneDisplay={PHONE_DISPLAY}
                phoneTel={PHONE_TEL}
                smsHref={SMS_HREF}
                onCallClick={() => trackEvent("phone_click", "lets-talk")}
                onSmsClick={() => trackEvent("sms_click", "lets-talk")}
              />
            </div>
            <ContactCard
              type="text"
              phoneDisplay={PHONE_DISPLAY}
              phoneTel={PHONE_TEL}
              smsHref={SMS_HREF}
              onCallClick={() => trackEvent("phone_click", "lets-talk")}
              onSmsClick={() => trackEvent("sms_click", "lets-talk")}
            />
          </div>

          {/* Callback form — capture leads who won't call */}
          <CallbackForm />

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-panel-muted hover:text-panel-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Book online instead
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky mobile tap-to-call bar */}
      <a
        href={PHONE_TEL}
        onClick={() => trackEvent("phone_click", "lets-talk")}
        aria-label={`Call ${PHONE_DISPLAY}`}
        className="md:hidden fixed inset-x-0 bottom-0 flex items-center justify-center gap-3 z-50 bg-primary text-white font-display font-bold text-[22px] no-underline shadow-cta"
        style={{
          minHeight: 72, padding: "16px 20px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        }}
      >
        <Phone size={24} strokeWidth={2.5} />
        <span>CALL {PHONE_DISPLAY}</span>
      </a>
    </BookLayout>
  );
};

export default BookLetsTalk;
