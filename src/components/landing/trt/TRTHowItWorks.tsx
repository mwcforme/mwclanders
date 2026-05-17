import { COPY } from "@/data/copy";

const steps = [
  {
    num: "1",
    title: "Book Online In Under 5 Minutes",
    desc: "Pick the location and time that works for you. No referral, no phone tag.",
  },
  {
    num: "2",
    title: "A Doctor Who Actually Explains Your Labs",
    desc: "A physician who specializes in men's hormones sits with you, goes over every number, and tells you exactly what's driving your symptoms.",
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
    <section id="how-it-works" className="py-10 md:py-20" style={{ background: "#F5F0EB", scrollMarginTop: 64 }} aria-label="Symptoms and how it works">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left: Symptoms (mobile shown second) */}
        <div className="order-2 md:order-1">
          {eyebrow("Why Men Come To Us")}
          {heading("The gap between your labs and how you feel")}
          <p
            className="mt-5 text-base leading-relaxed"
            style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif", maxWidth: 520 }}
          >
            Most men who walk in have already seen their GP. They got bloodwork. They were told everything looks fine. They know it isn't.
          </p>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif", maxWidth: 520 }}
          >
            Standard bloodwork doesn't measure what we measure. A hormone panel reviewed by a physician who specializes in men's health tells a different story than a general metabolic panel flagged for abnormals.
          </p>
          <div
            className="mt-8 rounded-xl p-6"
            style={{ background: "#000033" }}
          >
            <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 44, color: "#E8670A", lineHeight: 1 }}>10,000+</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "rgba(255,255,255,0.80)", marginTop: 8, lineHeight: 1.5 }}>
              Virginia men treated since 2015. Most had been told their labs were normal.
            </div>
          </div>
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
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isFinal ? "var(--brand-cta)" : "#000033",
                      boxShadow: isFinal
                        ? "0 0 0 4px rgba(232,103,10,0.20), 0 8px 24px rgba(232,103,10,0.30)"
                        : "0 0 0 3px rgba(11,16,41,0.12), 0 4px 16px rgba(0,0,0,0.15)",
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
                    <p style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.6, marginTop: 4 }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={scrollToForm}
            className="mt-10 w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer transition-colors duration-200"
            style={{
              height: 56,
              minHeight: 56,
              background: "var(--brand-cta)",
              color: "#FFFFFF",
              fontSize: "clamp(15px, 3.5vw, 19px)",
              letterSpacing: "0.06em",
              fontFamily: "Inter, sans-serif",
              border: "none",
              whiteSpace: "nowrap",
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
