const STEPS = [
  {
    num: "01",
    title: "Comprehensive Lab Testing",
    body: "We draw blood in-clinic and measure your full hormone panel: total testosterone, free testosterone, SHBG, estradiol, PSA, CBC, and metabolic markers. Results are reviewed with your provider the same visit.",
    badge: "Same-Day Results",
  },
  {
    num: "02",
    title: "Provider Review & Diagnosis",
    body: "Your MWC clinician reviews your labs in the context of your symptoms — not just a number on a chart. If TRT is right for you, they'll walk you through exactly what your protocol will look like.",
    badge: "No Guesswork",
  },
  {
    num: "03",
    title: "Personalized TRT Protocol",
    body: "Most patients start with testosterone cypionate injections — the gold standard for bioavailable, controllable therapy. Dosing is dialed in based on your labs, symptoms, and goals. Adjustments happen as needed.",
    badge: "Your Protocol",
  },
  {
    num: "04",
    title: "Ongoing Monitoring & Optimization",
    body: "TRT isn't set-and-forget. We monitor your levels, symptoms, and health markers every 3–6 months to keep you optimized — not just in range.",
    badge: "Long-Term Support",
  },
];

export const TRTEduHowTRTWorks = () => (
  <section
    style={{
      background: "#111111",
      padding: "80px 24px",
    }}
  >
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <p style={{ color: "#E8670A", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          The MWC Approach
        </p>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(36px, 7vw, 60px)",
            color: "#FFFFFF",
            lineHeight: 1.05,
            margin: "0 auto 16px",
            maxWidth: 640,
          }}
        >
          HOW TESTOSTERONE REPLACEMENT THERAPY ACTUALLY WORKS
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
          Not online. Not a subscription box. Real clinical care, in-person, in Virginia.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 24,
              alignItems: "stretch",
              position: "relative",
            }}
          >
            {/* Left: number + line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 56, flexShrink: 0 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(232,103,10,0.15)",
                  border: "1.5px solid rgba(232,103,10,0.40)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20,
                  color: "#E8670A",
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {step.num}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 1, flex: 1, background: "rgba(232,103,10,0.15)", margin: "4px 0" }} />
              )}
            </div>

            {/* Right: content */}
            <div style={{ paddingBottom: i < STEPS.length - 1 ? 40 : 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                <h3 style={{ color: "#FFFFFF", fontSize: 19, fontWeight: 700, margin: 0 }}>
                  {step.title}
                </h3>
                <span
                  style={{
                    background: "rgba(232,103,10,0.15)",
                    border: "1px solid rgba(232,103,10,0.30)",
                    color: "#E8670A",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    padding: "3px 10px",
                    borderRadius: 100,
                    textTransform: "uppercase",
                  }}
                >
                  {step.badge}
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
