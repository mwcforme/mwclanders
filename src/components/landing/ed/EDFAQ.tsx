import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";

const faqs = [
  {
    q: "Is the visit really discreet?",
    a: "Yes. You check in like any other appointment, you meet your physician one-on-one in a private room, and the conversation never leaves that room. We do not bill insurance, so there is no claim trail. Treatment is dispensed on-site or through a licensed pharmacy under a code, not a label.",
    cta: true,
  },
  {
    q: "What treatments do you offer?",
    a: "FDA-approved oral medications including Sildenafil and Tadalafil, plus injectable options like TriMix and PT-141 for men who do not respond to oral therapy. Your physician chooses based on labs, medical history, and what has and has not worked for you in the past.",
    cta: true,
  },
  {
    q: "I tried pills from an online site and they did nothing.",
    a: "That is one of the most common things we hear. Online pills assume the cause is mechanical. ED is often a hormone or vascular issue, and the standard pill at the standard dose just does not address it. A real visit and real labs change what we prescribe and how it works.",
  },
  {
    q: "How is this different from Hims, BlueChew, or online ED?",
    a: "We are an in-person Virginia center, not a chat-and-ship pharmacy. You see the same physician at the same center, your labs are drawn on-site, and your treatment includes options online services do not carry, like TriMix and PT-141.",
  },
  {
    q: "Does insurance cover this?",
    a: "Consults with our providers are always complimentary, including labs review and your care plan. We don't bill insurance directly, but we accept FSA and HSA.",
  },
  {
    q: "Will I leave my first visit with treatment?",
    a: "When clinically appropriate, yes. Many men begin treatment the same day after labs and the physician visit are complete.",
  },
  {
    q: "Are these treatments safe?",
    a: "All medications we prescribe are FDA-approved and dispensed under physician supervision. Like any prescription treatment, they have potential side effects, which your provider will review with you. Ongoing follow-up is part of every plan.",
  },
];

export const EDFAQ = () => {
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
                        Book My Discreet Visit <ArrowRight className="h-3.5 w-3.5" />
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
