/**
 * AffordabilityFaq — accordion FAQ section for the /pricing page.
 */
import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS, eyebrow } from "@/data/affordabilityContent";

const FaqItem = ({ q, a, isOpen, onToggle, index }: { q: string; a: string; isOpen: boolean; onToggle: () => void; index: number }) => {
  const panelId = `pricing-faq-panel-${index}`;
  const itemRef = useRef<HTMLDivElement>(null);
  const handleToggle = () => {
    onToggle();
    if (!isOpen) window.setTimeout(() => itemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };
  return (
    <div ref={itemRef} className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-white)", border: "1px solid var(--c-border-on-light)" }}>
      <button type="button" onClick={handleToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
        style={{ color: "var(--brand-navy)", fontFamily: "Inter, sans-serif", background: "none", border: "none" }}
        aria-expanded={isOpen} aria-controls={panelId}>
        <span className="font-semibold" style={{ fontSize: 17 }}>{q}</span>
        <ChevronDown className="h-5 w-5 flex-shrink-0 transition-transform duration-200" strokeWidth={1.75}
          style={{ color: "var(--brand-cta)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      {isOpen && (
        <div id={panelId} className="px-5 pb-5 leading-relaxed"
          style={{ color: "var(--c-text-on-light-muted)", fontFamily: "Inter, sans-serif", fontSize: 16 }}>
          <p style={{ margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  );
};

export const AffordabilityFaq = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <section id="faq" className="py-16 md:py-24"
      style={{ background: "var(--bg-white)", scrollMarginTop: 64 }}>
      <div className="max-w-[820px] mx-auto px-6">
        <p style={eyebrow}>Pricing FAQ</p>
        <h2 className="font-bold uppercase text-center" style={{
          fontFamily: "Oswald, sans-serif", color: "var(--brand-navy)",
          fontSize: "clamp(26px, 3vw, 38px)", letterSpacing: "0.02em", marginTop: 0, marginBottom: 40,
        }}>
          COMMON QUESTIONS ABOUT PRICING.
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a}
              isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
