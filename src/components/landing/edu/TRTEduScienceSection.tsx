const STATS = [
  { value: "1 in 4", label: "Men over 30 have clinically low testosterone" },
  { value: "72%", label: "Go undiagnosed because symptoms are written off as aging" },
  { value: "300 ng/dL", label: "Below this total T level, symptoms are common" },
  { value: "20 min", label: "Time for a full hormone panel at Men's Wellness Centers" },
];

export const TRTEduScienceSection = () => (
  <section
    style={{
      background: "radial-gradient(ellipse at 50% 100%, rgba(232,103,10,0.12) 0%, rgba(10,10,10,0) 70%), #0A0A0A",
      padding: "80px 24px",
    }}
  >
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <p style={{ color: "#E8670A", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          By the Numbers
        </p>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(36px, 7vw, 60px)",
            color: "#FFFFFF",
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          THIS IS MORE COMMON<br />
          <span style={{ color: "#E8670A" }}>THAN MOST MEN KNOW</span>
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#0D0D0D",
              padding: "36px 28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(40px, 6vw, 60px)",
                color: "#E8670A",
                lineHeight: 1,
                marginBottom: 12,
              }}
            >
              {s.value}
            </div>
            <div style={{ color: "rgba(255,255,255,0.60)", fontSize: 14, lineHeight: 1.5 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.50)",
          fontSize: 12,
          marginTop: 20,
        }}
      >
        Statistics sourced from American Urological Association and peer-reviewed endocrinology literature.
      </p>
    </div>
  </section>
);
