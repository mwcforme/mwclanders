import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TRT_FAQS } from "@/data/faqs";
import { COPY } from "@/data/copy";

export const TRTFAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  const scrollToForm = () => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="faq" style={{ background: "#F5F0EB" }}>
      <div className="max-w-[820px] mx-auto px-6 py-16 md:py-24">
        <h2
          className="font-bold uppercase text-center"
          style={{
            fontFamily: "Oswald, sans-serif",
            color: "#000033",
            fontSize: "clamp(26px, 3vw, 38px)",
            letterSpacing: "0.02em",
          }}
        >
          Frequently Asked Questions
        </h2>

        <div className="mt-10 space-y-3">
          {TRT_FAQS.map((f, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            return (
              <div
                key={f.q}
                className="rounded-xl overflow-hidden"
                style={{ background: "#FFFFFF", border: "1px solid var(--c-border-on-light)" }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
                  style={{ color: "#000033", fontFamily: "Inter, sans-serif" }}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="font-semibold" style={{ fontSize: 17 }}>{f.q}</span>
                  <ChevronDown
                    className="h-5 w-5 flex-shrink-0 transition-transform duration-200"
                    style={{
                      color: "var(--brand-cta)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    className="px-5 pb-5 leading-relaxed" style={{ fontSize: 16 }}
                    style={{ color: "#1a1a2e", fontFamily: "Inter, sans-serif" }}
                  >
                    <p>{f.a}</p>
                    {i === 0 ? (
                      // First FAQ is the insurance/cost objection — highest intent after reading this answer.
                      // Full CTA button, not a text link.
                      <button
                        onClick={scrollToForm}
                        className="mt-4 w-full font-bold cursor-pointer inline-flex items-center justify-center rounded-lg"
                        style={{
                          height: 52,
                          background: "var(--brand-cta)",
                          color: "#FFFFFF",
                          fontSize: 15,
                          letterSpacing: "0.07em",
                          fontFamily: "Inter, sans-serif",
                          border: "none",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
                      >
                        {COPY.cta.bookConsult}
                      </button>
                    ) : (
                      <p className="mt-3">
                        <button
                          onClick={scrollToForm}
                          className="inline-flex items-center gap-1 font-bold cursor-pointer underline underline-offset-4"
                          style={{
                            color: "#000033",
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontFamily: "Inter, sans-serif",
                            fontSize: "inherit",
                          }}
                        >
                          <span aria-hidden="true" style={{ color: "var(--brand-cta)" }}>→</span> {COPY.cta.bookConsultInline}
                        </button>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
