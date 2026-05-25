import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { COPY } from "@/data/copy";
import { useScrollToForm } from "@/hooks/useScrollToForm";

const faqs = [
  {
    q: "Is the visit really discreet?",
    a: "Yes. You check in like any other appointment, you meet your provider one-on-one in a private room, and the conversation never leaves that room. We do not bill insurance, so there is no claim trail. Treatment is dispensed on-site or through a licensed pharmacy under a code, not a label.",
  },
  {
    q: "What treatments do you offer?",
    a: "FDA-approved oral medications including Sildenafil and Tadalafil, plus injectable options like TriMix and PT-141 for men who do not respond to oral therapy. Your provider chooses based on labs, medical history, and what has and has not worked for you in the past.",
  },
  {
    q: "I tried pills from an online site and they did nothing.",
    a: "That is one of the most common things we hear. Online pills assume the cause is mechanical. ED is often a hormone or vascular issue, and the standard pill at the standard dose just does not address it. A real visit and real labs change what we prescribe and how it works.",
  },
  {
    q: "How is this different from Hims, BlueChew, or online ED?",
    a: "We are an in-person Virginia center, not a chat-and-ship pharmacy. You see the same provider at the same center, your labs are drawn on-site, and your treatment includes options online services do not carry, like TriMix and PT-141.",
  },
  {
    q: "Does insurance cover this?",
    a: "Consultations and labs are always complimentary. We do not bill insurance, which means no claim trail and no record filed with your employer or insurer. We accept FSA and HSA cards.",
  },
  {
    q: "Will I leave my first visit with treatment?",
    a: "When clinically appropriate, yes. Many men begin treatment the same day after labs and the provider visit are complete.",
  },
  {
    q: "Are these treatments safe?",
    a: "All medications we prescribe are FDA-approved and dispensed under provider supervision. Like any prescription treatment, they have potential side effects, which your provider will review with you. Ongoing follow-up is part of every plan.",
  },
];

export const EDFAQ = () => {
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
                  type="button"
                  onClick={() => handleToggle(i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
                  style={{ color: "var(--brand-navy)", fontFamily: "Inter, sans-serif" }}
                  aria-expanded={isOpen}
                  aria-controls={`ed-faq-panel-${i}`}
                >
                  <span className="font-semibold" style={{ fontSize: 17 }}>{f.q}</span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0 transition-transform duration-200" style={{ color: "var(--brand-cta)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                {isOpen && (
                  <div id={`ed-faq-panel-${i}`} className="px-5 pb-5 leading-relaxed" style={{ color: "var(--bg-charcoal)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
                    <p>{f.a}</p>
                    <button
                      type="button"
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
