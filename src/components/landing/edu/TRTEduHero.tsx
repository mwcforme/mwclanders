import { ArrowDown } from "lucide-react";
import { trackCro } from "@/hooks/useAnalytics";

export const TRTEduHero = () => {
  const scrollToSymptoms = () => {
    document.getElementById("symptoms")?.scrollIntoView({ behavior: "smooth" });
    trackCro("edu_hero_scroll_cta");
  };

  const scrollToCTA = () => {
    document.getElementById("edu-cta")?.scrollIntoView({ behavior: "smooth" });
    trackCro("edu_hero_check_levels_cta");
  };

  return (
    <section
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(232,103,10,0.18) 0%, rgba(10,10,10,0) 70%), #0A0A0A",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "96px 24px 64px",
        position: "relative",
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(232,103,10,0.15)",
          border: "1px solid rgba(232,103,10,0.35)",
          borderRadius: 100,
          padding: "6px 16px",
          marginBottom: 28,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8670A", display: "inline-block" }} />
        <span style={{ color: "#E8670A", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          TRT Education
        </span>
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(48px, 11vw, 96px)",
          fontWeight: 400,
          letterSpacing: "0.02em",
          lineHeight: 1.0,
          color: "#FFFFFF",
          margin: "0 auto 24px",
          maxWidth: 900,
        }}
      >
        YOUR BODY ISN'T<br />
        <span style={{ color: "#E8670A" }}>FAILING.</span><br />
        YOUR TESTOSTERONE IS.
      </h1>

      {/* Sub */}
      <p
        style={{
          fontSize: "clamp(16px, 2.2vw, 20px)",
          color: "rgba(255,255,255,0.70)",
          maxWidth: 620,
          margin: "0 auto 40px",
          lineHeight: 1.65,
        }}
      >
        Low testosterone doesn't announce itself with a single dramatic symptom. It quietly changes who you are — your energy, your strength, your focus, your drive — until one day you barely recognize the man in the mirror.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={scrollToCTA}
          style={{
            height: 56,
            padding: "0 32px",
            background: "#E8670A",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Check My Testosterone Levels
        </button>
        <button
          onClick={scrollToSymptoms}
          style={{
            height: 56,
            padding: "0 28px",
            background: "transparent",
            color: "rgba(255,255,255,0.75)",
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          See the Symptoms <ArrowDown size={16} />
        </button>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToSymptoms}
        aria-label="Scroll down"
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          opacity: 0.4,
          animation: "bounce 2s infinite",
        }}
      >
        <ArrowDown size={24} color="#fff" />
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  );
};
