import { COPY } from "@/data/copy";

const steps = [
  {
    num: "1",
    title: "Book Online In Under 5 Minutes",
    desc: "Pick the location and time that works for you. No referral, no phone tag.",
  },
  {
    num: "2",
    title: "A Provider Who Actually Explains Your Labs",
    desc: "A licensed provider who specializes in men's health sits with you, goes over every number, and tells you exactly what's driving your symptoms.",
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
      className="uppercase mb-4 inline-flex"
      style={{
        color: "var(--brand-cta)",
        fontFamily: "Inter, sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        background: "rgba(232,103,10,0.10)",
        border: "1px solid rgba(232,103,10,0.25)",
        borderRadius: 999,
        padding: "4px 12px",
      }}
    >
      {text}
    </div>
  );

  const heading = (text: string) => (
    <h2
      className="font-bold uppercase"
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: "clamp(28px, 4vw, 44px)",
        color: "var(--brand-navy)",
        fontWeight: 700,
        lineHeight: 1.05,
        letterSpacing: "-0.01em",
      }}
    >
      {text}
    </h2>
  );

  return (
    <section id="how-it-works" className="py-12 md:py-20" style={{ background: "var(--brand-cream)", scrollMarginTop: 64 }} aria-label="Symptoms and how it works">
      {/* How It Works — full width, left column removed */}
      <div className="max-w-[720px] mx-auto px-6">
        <div>
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
                      background: isFinal ? "var(--brand-cta)" : "var(--brand-navy)",
                      boxShadow: isFinal
                        // hardcoded-color-allow-next-line
                        ? "0 0 0 4px rgba(232,103,10,0.20), 0 8px 24px rgba(232,103,10,0.30)"
                        // hardcoded-color-allow-next-line
                        : "0 0 0 3px rgba(11,16,41,0.12), 0 4px 16px rgba(0,0,0,0.15)",
                    }}
                  >
                    <span className="font-bold text-base" style={{ color: "var(--c-text-on-dark)", fontFamily: "Oswald, sans-serif" }}>
                      {s.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: "var(--brand-navy)", fontFamily: "Inter, sans-serif" }}>
                      {s.title}
                    </h3>
                    {/* hardcoded-color-allow-next-line */}
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
              color: "var(--c-text-on-dark)",
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
