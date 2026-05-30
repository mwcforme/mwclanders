import { useRef, useState, useEffect } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { Eyebrow, OrangeCTA } from "@/components/landing/trt/TRTProductHelpers";

const TIMELINE_STEPS = [
  {
    num: 1,
    title: "Book in Under 5 Minutes",
    time: "5 min online",
    desc: "Choose your location and time. No waiting rooms.",
  },
  {
    num: 2,
    title: "Full Labs Drawn Here",
    time: "20 min",
    desc: "Not at a separate lab. Everything done at your appointment.",
  },
  {
    num: 3,
    title: "Your Provider Reads Every Number With You",
    time: "Same visit",
    desc: "In plain language. No waiting for a portal. No guessing.",
  },
  {
    num: 4,
    title: "Walk Out With a Written Plan",
    time: "Same day",
    desc: "Or know exactly why not. Either way, you leave with answers.",
  },
];

export const TRTVisualTimeline = ({ onSchedule }: { onSchedule: () => void }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ background: "linear-gradient(135deg, #0B1029 0%, #111B3A 100%)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
            <Eyebrow>HOW IT WORKS</Eyebrow>
          </div>
          <h2 style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(26px, 4vw, 42px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: 8,
          }}>
            Everything Done In One Visit
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 500, margin: "0 auto" }}>
            Start to finish, here is exactly what your first appointment looks like.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={gridRef}
          className="timeline-grid"
          style={{ display: "flex", gap: 0, position: "relative", alignItems: "flex-start" }}
        >
          {TIMELINE_STEPS.map((step, i) => (
            <div key={step.num} className={`tl-step${visible ? " tl-visible" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              {/* Connector line between circles */}
              {i < TIMELINE_STEPS.length - 1 && (
                <div
                  className="tl-connector"
                  style={{
                    position: "absolute",
                    top: 28,
                    left: "calc(50% + 28px)",
                    right: "calc(-50% + 28px)",
                    height: 2,
                    background: "linear-gradient(90deg, var(--brand-cta), rgba(232,103,10,0.30))",
                    zIndex: 0,
                  }}
                />
              )}

              {/* Step circle */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--brand-cta)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                flexShrink: 0,
                boxShadow: "0 4px 20px rgba(232,103,10,0.45)",
                marginBottom: 20,
              }}>
                <span style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#fff",
                  lineHeight: 1,
                }}>
                  {step.num}
                </span>
              </div>

              {/* Step content */}
              <div style={{ textAlign: "center", padding: "0 12px" }}>
                <h3 style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#fff",
                  marginBottom: 8,
                  lineHeight: 1.2,
                }}>
                  {step.title}
                </h3>
                {/* Time badge */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(232,103,10,0.15)",
                  border: "1px solid rgba(232,103,10,0.30)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  marginBottom: 12,
                }}>
                  <Clock size={12} strokeWidth={2} style={{ color: "var(--brand-cta)" }} />
                  {/* a11y: dark pill bg → use brand-cta (#E8670A, 4.87:1 on pill ✅) not accessible variant */}
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-cta)", letterSpacing: "0.04em" }}>
                    {step.time}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <OrangeCTA onClick={onSchedule} style={{ borderRadius: 999, height: 56, fontSize: 17, justifyContent: "center" }}>
            Book My No-Cost Lab Visit <ArrowRight size={18} strokeWidth={2.5} />
          </OrangeCTA>
        </div>
      </div>
    </section>
  );
};
