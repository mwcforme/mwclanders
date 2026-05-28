import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { COPY } from "@/data/copy";
import { useScrollToForm } from "@/hooks/useScrollToForm";
import { Eyebrow } from "@/components/landing/shared/primitives";

const faqs = [
  {
    q: "How much weight can I expect to lose?",
    a: "In manufacturer trials, GLP-1 medications like semaglutide and tirzepatide produced an average of 15-20% body weight loss when paired with diet and exercise changes. Your provider will set a realistic target based on your starting labs and health history. Individual results vary.",
  },
  {
    q: "Which medications do you prescribe?",
    a: "When clinically appropriate, we prescribe FDA-approved GLP-1 medications including semaglutide and tirzepatide, plus supporting tools like lipotropic injections and metabolic protocols. Selection is based on your labs, history, and goals.",
  },
  {
    q: "Does insurance cover this?",
    a: "Consultations and labs are always complimentary. GLP-1 medications are a separate cost, but most men find our straightforward pricing simpler than dealing with insurance prior authorizations, which typically run 2 to 4 weeks and are frequently denied on first submission. We accept FSA and HSA cards.",
  },
  {
    q: "How is this different from Hims, Ro, or online weight loss programs?",
    a: "We are an in-person Virginia center, not a telehealth app. Your labs are drawn on-site, you see the same provider each visit, and your dose is adjusted based on real bloodwork, not a self-reported form.",
  },
  {
    q: "Are GLP-1 medications safe?",
    a: "GLP-1 medications are FDA-approved for weight management when prescribed and monitored by a licensed provider. Like any prescription, they carry potential side effects, which your provider will review with you. Ongoing lab monitoring is part of every plan.",
  },
  {
    q: "How soon will I see results?",
    a: "Many men notice reduced appetite within the first one to two weeks and meaningful weight loss within the first month. Sustainable progress builds over the first three to six months. Individual results vary based on baseline labs, adherence, and lifestyle.",
  },
  {
    q: "What happens after I lose the weight?",
    a: "We build a maintenance plan together. For some men that means continued low-dose GLP-1 therapy. For others it means transitioning off with structured nutrition and lab follow-up. Your provider decides with you, based on your numbers.",
  },
];

export const WLFAQ = () => {
  const [open, setOpen] = useState<number | null>(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToBooking = useScrollToForm();

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
        <Eyebrow center>Common Questions</Eyebrow>
        <h2 className="font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif", color: "var(--brand-navy)", fontSize: "clamp(26px, 3vw, 38px)", letterSpacing: "0.02em" }}>
          Frequently Asked Questions
        </h2>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-white)",
                  // hardcoded-color-allow-next-line
                  border: "1px solid #E5E5EA",
                }}
              >
                <button
                  onClick={() => handleToggle(i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
                  style={{ color: "var(--brand-navy)", fontFamily: "Inter, sans-serif" }}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold" style={{ fontSize: 17 }}>{f.q}</span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0 transition-transform duration-200" style={{ color: "var(--brand-cta)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 leading-relaxed" style={{ color: "var(--bg-charcoal)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
                    <p>{f.a}</p>
                    <button
                      onClick={scrollToBooking}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#cf5a08";
                      }}
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
