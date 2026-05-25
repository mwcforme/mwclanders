export const TRTEduWhatIsLowT = () => (
  <section
    style={{
      background: "#111111",
      padding: "80px 24px",
    }}
  >
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <p style={{ color: "#E8670A", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>
        The Science, Simply Explained
      </p>
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(36px, 7vw, 60px)",
          color: "#FFFFFF",
          lineHeight: 1.05,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        WHAT ACTUALLY HAPPENS<br />WHEN TESTOSTERONE DROPS
      </h2>

      <div style={{ display: "grid", gap: 24 }}>
        {[
          {
            step: "01",
            title: "Production Slows With Age",
            body: "After 30, most men lose about 1-2% of their testosterone per year. This isn't unusual. But when levels drop below the range your body needs to function well, symptoms emerge.",
          },
          {
            step: "02",
            title: "The Cascade Begins",
            body: "Testosterone regulates dozens of biological functions: muscle protein synthesis, fat metabolism, red blood cell production, brain chemistry, and libido signaling. When T drops, all of these begin to shift.",
          },
          {
            step: "03",
            title: "Symptoms Feel Like 'Just Getting Older'",
            body: "Most men, and many doctors, attribute these changes to stress, poor sleep, or aging. But when the underlying cause is hormonal, lifestyle adjustments alone won't fully fix it.",
          },
          {
            step: "04",
            title: "A Simple Blood Test Reveals the Truth",
            body: "Total testosterone, free testosterone, SHBG, estradiol. A proper hormone panel takes 20 minutes and gives you real data. No guessing. No assuming. Just answers.",
          },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 12,
              padding: "24px 28px",
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 42,
                color: "rgba(232,103,10,0.35)",
                lineHeight: 1,
                flexShrink: 0,
                width: 56,
              }}
            >
              {item.step}
            </div>
            <div>
              <h3 style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 700, marginBottom: 8, margin: "0 0 8px" }}>
                {item.title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 16, lineHeight: 1.7, margin: 0 }}>
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
