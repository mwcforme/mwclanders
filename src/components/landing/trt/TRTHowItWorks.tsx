import { Minus } from "lucide-react";
import { COPY } from "@/data/copy";

const symptoms = [
  "Persistent fatigue",
  "Loss of drive and motivation",
  "Difficulty focusing",
  "Stubborn belly fat and muscle loss",
  "Bloodwork that comes back fine, but you still don't feel right",
];

const steps = [
  {
    num: "1",
    title: "Book Online In Under 5 Minutes",
    desc: "Pick the location and time that works for you. No referral, no phone tag.",
  },
  {
    num: "2",
    title: "Doctor Who Actually Listens",
    desc: "A physician who specializes in men's hormones sits with you, goes over every number, and actually explains what's going on.",
  },
  {
    num: "3",
    title: "Walk Out With Your Protocol Locked In",
    desc: "A plan dialed in to your labs and your goals. Many patients begin treatment the same day, when clinically appropriate.",
  },
];

export const TRTHowItWorks = () => {
  const scrollToForm = () => {
    document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" });
  };

  const eyebrow = (text: string) => (
    <div
      className="uppercase mb-3 inline-flex items-center gap-2"
      style={{
        color: "#000033",
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.12em",
      }}
    >
      <span aria-hidden="true" style={{ display: "inline-block", width: 18, height: 2, background: "var(--brand-cta)" }} />
      {text}
    </div>
  );

  const heading = (text: string) => (
    <h2
      className="font-bold uppercase"
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: "clamp(28px, 4vw, 44px)",
        color: "#000033",
        fontWeight: 700,
        lineHeight: 1.05,
        letterSpacing: "-0.01em",
      }}
    >
      {text}
    </h2>
  );

  return (
    <section id="how-it-works" className="py-10 md:py-20" style={{ background: "#F5F0EB" }} aria-label="Symptoms and how it works">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left: Symptoms (mobile shown second) */}
        <div className="order-2 md:order-1">
          {eyebrow("Sound Familiar?")}
          {heading("Common signs men ask us about")}
          <p
            className="mt-5 text-base leading-relaxed"
            style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif", maxWidth: 520 }}
          >
            Many men in their 40s, 50s, and beyond tell us the same story. The energy, focus, and drive they used to have just are not there. Their doctor says their labs are "normal," but they know something is off.
          </p>
          <ul className="mt-8 space-y-4">
            {symptoms.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 mt-1 inline-flex items-center justify-center"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: "#FFFFFF",
                    color: "var(--brand-cta)",
                    border: "1px solid var(--c-border-on-light)",
                  }}
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-base" style={{ color: "#1A1A1A", fontFamily: "Inter, sans-serif" }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: How it works (mobile shown first) */}
        <div className="order-1 md:order-2">
          {eyebrow("The Fix")}
          {heading("Here's how it works in one visit")}

          <div className="mt-8 flex flex-col gap-6">
            {steps.map((s, i) => {
              const isFinal = i === steps.length - 1;
              return (
                <div key={s.num} className="flex gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isFinal ? "var(--brand-cta)" : "#000033",
                      boxShadow: isFinal ? "0 0 0 3px rgba(232,103,10,0.18)" : "0 0 0 2px rgba(232,103,10,0.18)",
                    }}
                  >
                    <span className="font-bold text-base" style={{ color: "#FFFFFF", fontFamily: "Oswald, sans-serif" }}>
                      {s.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: "#000033", fontFamily: "Inter, sans-serif" }}>
                      {s.title}
                    </h3>
                    <p className="text-base mt-1 leading-relaxed" style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={scrollToForm}
            className="mt-10 inline-flex items-center justify-center rounded-full px-8 py-4 font-bold cursor-pointer transition-colors duration-200"
            style={{
              background: "var(--brand-cta)",
              color: "#FFFFFF",
              fontSize: 19,
              letterSpacing: "0.08em",
              fontFamily: "Inter, sans-serif",
              border: "none",
            }}
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
