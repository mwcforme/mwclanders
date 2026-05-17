import { X } from "lucide-react";
import { COPY } from "@/data/copy";

const symptoms = [
  "Stubborn belly fat that diet and exercise will not move.",
  "Constant cravings and energy crashes.",
  '"Normal" labs that do not match how you feel.',
  "Weight that creeps back after every diet.",
  "Sleep apnea, joint pain, or rising blood pressure.",
];

const steps = [
  {
    num: "1",
    title: "Book Online In Under 5 Minutes",
    desc: "Pick the location and time that works for you. No referral, no phone tag.",
  },
  {
    num: "2",
    title: "Labs And A Real Provider, Same Visit",
    desc: "We run metabolic labs in-center and a licensed Virginia provider reviews them with you. No mail-order chatbot, no rotating clinicians.",
  },
  {
    num: "3",
    title: "Walk Out With A Plan And, If Right For You, Your First Dose",
    desc: "Provider-supervised weight loss medication when clinically appropriate, paired with a sustainable nutrition plan and ongoing monitoring.",
  },
];

export const WLHowItWorks = () => {
  const scrollToForm = () => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" });

  const eyebrow = (text: string) => (
    <div className="uppercase mb-3 inline-flex items-center gap-2" style={{ color: "var(--brand-navy)", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" }}>
      <span aria-hidden="true" style={{ display: "inline-block", width: 18, height: 2, background: "var(--brand-cta)", flexShrink: 0 }} />
      {text}
    </div>
  );

  const heading = (text: string) => (
    <h2 className="font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 44px)", color: "var(--brand-navy)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
      {text}
    </h2>
  );

  return (
    <section id="how-it-works" className="py-10 md:py-20" style={{ background: "var(--brand-cream)" }}>
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        <div className="order-2 md:order-1">
          {eyebrow("Sound Familiar?")}
          {heading("Why traditional weight loss stops working")}
          // hardcoded-color-allow-next-line
          <p className="mt-5 text-base leading-relaxed" style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif", maxWidth: 520 }}>
            For men in their 40s and beyond, hormones, metabolism, and sleep all start working against you. Willpower alone is not the problem.
          </p>
          <ul className="mt-8 space-y-4">
            {symptoms.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <X className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={3} style={{ color: "var(--brand-cta)" }} />
                // hardcoded-color-allow-next-line
                <span className="text-base" style={{ color: "#1A1A1A", fontFamily: "Inter, sans-serif" }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 md:order-2">
          {eyebrow("The Fix")}
          {heading("How medical weight loss works here")}
          <div className="mt-8 flex flex-col gap-6">
            {steps.map((s, i) => {
              const isFinal = i === steps.length - 1;
              return (
                <div key={s.num} className="flex gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isFinal ? "var(--brand-cta)" : "var(--brand-navy)",
                      boxShadow: isFinal
                        // hardcoded-color-allow-next-line
                        ? "0 0 0 4px rgba(232,103,10,0.20), 0 8px 24px rgba(232,103,10,0.30)"
                        // hardcoded-color-allow-next-line
                        : "0 0 0 3px rgba(11,16,41,0.12), 0 4px 16px rgba(0,0,0,0.15)",
                    }}
                  >
                    <span className="font-bold text-base" style={{ color: "var(--c-text-on-dark)", fontFamily: "Oswald, sans-serif" }}>{s.num}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: "var(--brand-navy)", fontFamily: "Inter, sans-serif" }}>{s.title}</h3>
                    // hardcoded-color-allow-next-line
                    <p style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.6, marginTop: 4 }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={scrollToForm}
            className="mt-10 w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer transition-colors duration-200"
            style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "var(--c-text-on-dark)", fontSize: 15, letterSpacing: "0.07em", fontFamily: "Inter, sans-serif", border: "none", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
          >
            {COPY.cta.bookConsult}
          </button>
        </div>
      </div>
    </section>
  );
};
