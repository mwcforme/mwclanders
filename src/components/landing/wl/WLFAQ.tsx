import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";

const faqs = [
  {
    q: "How much weight can I expect to lose?",
    a: "In manufacturer trials, GLP-1 medications like semaglutide and tirzepatide produced an average of 15-20% body weight loss when paired with diet and exercise changes. Your physician will set a realistic target based on your starting labs and health history. Individual results vary.",
    cta: true,
  },
  {
    q: "Which medications do you prescribe?",
    a: "When clinically appropriate, we prescribe FDA-approved GLP-1 medications including semaglutide and tirzepatide, plus supporting tools like lipotropic injections and metabolic protocols. Selection is based on your labs, history, and goals.",
    cta: true,
  },
  {
    q: "Does insurance cover this?",
    a: "Consults with our providers are always complimentary, including labs and your care plan. We don't bill insurance directly, but we accept FSA and HSA. Many men find our straightforward cash-pay process simpler than navigating insurance approvals.",
  },
  {
    q: "How is this different from Hims, Ro, or online weight loss programs?",
    a: "We are an in-person Virginia center, not a telehealth app. Your labs are drawn on-site, you see the same physician each visit, and your dose is adjusted based on real bloodwork, not a self-reported form.",
  },
  {
    q: "Are GLP-1 medications safe?",
    a: "GLP-1 medications are FDA-approved for weight management when prescribed and monitored by a licensed provider. Like any prescription, they carry potential side effects, which your physician will review with you. Ongoing lab monitoring is part of every plan.",
  },
  {
    q: "How soon will I see results?",
    a: "Many men notice reduced appetite within the first one to two weeks and meaningful weight loss within the first month. Sustainable progress builds over the first three to six months. Individual results vary based on baseline labs, adherence, and lifestyle.",
  },
  {
    q: "What happens after I lose the weight?",
    a: "We build a maintenance plan together. For some men that means continued low-dose GLP-1 therapy. For others it means transitioning off with structured nutrition and lab follow-up. Your physician decides with you, based on your numbers.",
  },
];

export const WLFAQ = () => {
  const [open, setOpen] = useState<number | null>(0);
  const scrollToBooking = () => {
    const el = document.getElementById("booking") || document.getElementById("final-cta");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="faq" style={{ background: "#F5F0EB" }}>
      <div className="max-w-[820px] mx-auto px-6 py-16 md:py-24">
        <h2 className="font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif", color: "#000033", fontSize: "clamp(26px, 3vw, 38px)", letterSpacing: "0.02em" }}>
          Frequently Asked Questions
        </h2>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E5E5EA" }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
                  style={{ color: "#000033", fontFamily: "Inter, sans-serif" }}
                >
                  <span className="font-semibold text-base">{f.q}</span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0 transition-transform duration-200" style={{ color: "#E8670A", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "#1a1a2e", fontFamily: "Inter, sans-serif" }}>
                    <p>{f.a}</p>
                    {f.cta && (
                      <button
                        onClick={scrollToBooking}
                        className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase cursor-pointer"
                        style={{ background: "#E8670A", color: "#FFFFFF", letterSpacing: "0.08em", border: "none" }}
                      >
                        See If I Qualify <ArrowRight className="h-3.5 w-3.5" />
                      </button>
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
