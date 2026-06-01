/**
 * FAQ accordion section for the ProductTRT page.
 * Self-contained: manages its own open/close state.
 */
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What is included in the no-cost consultation?",
    a: "Your no-cost consultation includes a face-to-face visit with a licensed Virginia provider, a complete review of your symptoms and health history, and on-site lab work. You'll get your results and a personalized recommendation during the same visit. No waiting, no runaround.",
  },
  {
    q: "What is testosterone replacement therapy (TRT)?",
    a: "Testosterone Replacement Therapy (TRT) is a clinician-supervised treatment that restores testosterone to healthy levels. It's prescribed after lab testing confirms low T and a provider determines you're a good candidate. Common delivery options include injections and topical formulations.",
  },
  {
    q: "Who is a good candidate for TRT?",
    a: "TRT may be appropriate for men experiencing persistent fatigue, reduced sex drive, loss of muscle mass, mood changes, or poor sleep. Especially when bloodwork confirms low testosterone. A licensed provider reviews your labs and symptoms before recommending any treatment.",
  },
  {
    q: "Do I need a prescription for testosterone?",
    a: "Yes. Testosterone is a controlled substance and requires a prescription from a licensed provider. At Men's Wellness Centers, your prescribing provider reviews your labs and health history in person before any treatment is considered.",
  },
  {
    q: "What results can I expect from TRT?",
    a: "Members on clinician-supervised TRT commonly report increased energy, improved body composition, better libido, sharper mental focus, and improved sleep quality. Individual results vary and depend on your baseline levels and overall health.",
  },
  {
    q: "How soon will I notice improvement?",
    a: "Many members report noticing initial changes within the first several weeks. Energy and mood often improve first, followed by body composition and overall wellbeing over time. Your provider monitors your labs regularly and adjusts your protocol as needed.",
  },
];

/** Expandable FAQ accordion for the TRT product page. */
export const TRTProductFAQ = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" style={{ background: "#F4F6FA", padding: "80px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(26px, 4vw, 42px)",
            fontWeight: 700,
            color: "var(--brand-navy)",
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          Frequently Asked Questions
        </h2>

        {/* Accordion container card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 30px rgba(11,16,41,0.09)",
            overflow: "hidden",
            border: "1px solid #e4e9f4",
          }}
        >
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openFaq === i;
            const isLast = i === FAQ_ITEMS.length - 1;
            return (
              <div
                key={i}
                style={{
                  borderBottom: isLast ? "none" : "1px solid #edf0f8",
                }}
              >
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    background: isOpen ? "#f5f7ff" : "#fff",
                    border: "none",
                    padding: "22px 28px",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    fontFamily: "Inter, sans-serif",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--brand-navy)",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.q}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      color: "var(--brand-cta)",
                      transition: "transform 0.22s",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}
                  >
                    <ChevronDown size={20} strokeWidth={2} />
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 28px 22px 44px",
                      background: "#f5f7ff",
                      fontSize: 16,
                      color: "var(--c-text-on-light-muted)",
                      lineHeight: 1.75,
                      borderLeft: "3px solid var(--brand-cta)",
                      marginLeft: 28,
                    }}
                  >
                    {item.a}
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
