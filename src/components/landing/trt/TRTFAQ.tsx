import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { TRT_FAQS, type FaqItem } from "@/data/faqs";
import { COPY } from "@/data/copy";

interface TRTFAQProps {
  extraFaqs?: FaqItem[];
}

export const TRTFAQ = ({ extraFaqs }: TRTFAQProps = {}) => {
  const faqs = extraFaqs ? [...TRT_FAQS, ...extraFaqs] : TRT_FAQS;
  const [open, setOpen] = useState<number | null>(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToForm = () => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleToggle = (i: number) => {
    const isOpening = open !== i;
    setOpen(isOpening ? i : null);
    if (isOpening) {
      window.setTimeout(() => {
        itemRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  };

  return (
    <section id="faq" style={{ background: "var(--brand-cream)", scrollMarginTop: 64 }}>
      <div className="max-w-[820px] mx-auto px-6 py-16 md:py-24">
        <h2
          className="font-bold uppercase text-center"
          style={{
            fontFamily: "Oswald, sans-serif",
            color: "var(--brand-navy)",
            fontSize: "clamp(26px, 3vw, 38px)",
            letterSpacing: "0.02em",
          }}
        >
          Frequently Asked Questions
        </h2>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            return (
              <div
                key={f.q}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-white)", border: "1px solid var(--c-border-on-light)" }}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
                  style={{ color: "var(--brand-navy)", fontFamily: "Inter, sans-serif" }}
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
                    className="px-5 pb-5 leading-relaxed"
                    style={{ color: "var(--bg-charcoal)", fontFamily: "Inter, sans-serif", fontSize: 16 }}
                  >
                    <p>{f.a}</p>
                    <button
                      type="button"
                      onClick={scrollToForm}
                      className="mt-4 w-full font-bold cursor-pointer inline-flex items-center justify-center rounded-lg"
                      style={{
                        height: 52,
                        background: "var(--brand-cta)",
                        color: "var(--c-text-on-dark)",
                        fontSize: 16,
                        letterSpacing: "0.07em",
                        fontFamily: "Inter, sans-serif",
                        border: "none",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
                    >
                      {COPY.cta.bookConsult}
                    </button>
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
