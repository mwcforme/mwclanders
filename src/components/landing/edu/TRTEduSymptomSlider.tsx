import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { trackCro } from "@/hooks/useAnalytics";

const SYMPTOMS = [
  {
    icon: "💪",
    title: "Difficulty Building & Maintaining Muscle",
    body: "Optimal testosterone supports protein synthesis, helping muscle fibers recover and grow.",
    bullets: [
      "Lower levels make strength gains slower and muscle loss more likely.",
      "You may train hard, but still struggle to hold size, strength, and definition.",
    ],
  },
  {
    icon: "🔋",
    title: "Chronic Fatigue That Sleep Doesn't Fix",
    body: "Testosterone plays a key role in red blood cell production and mitochondrial energy.",
    bullets: [
      "You wake up tired no matter how many hours you sleep.",
      "Afternoon energy crashes that used to never happen become daily.",
    ],
  },
  {
    icon: "🧠",
    title: "Brain Fog & Difficulty Concentrating",
    body: "Testosterone receptors exist throughout the brain — including regions controlling memory and focus.",
    bullets: [
      "Forgetting words mid-sentence. Losing track of tasks. Feeling 'off.'",
      "Many men attribute this to stress or aging — when the real cause is hormonal.",
    ],
  },
  {
    icon: "📉",
    title: "Low Sex Drive",
    body: "Testosterone is the primary hormone driving libido in men.",
    bullets: [
      "Disinterest in sex that didn't used to be there.",
      "This isn't about your relationship — it's about your biochemistry.",
    ],
  },
  {
    icon: "😶",
    title: "Mood Changes & Irritability",
    body: "Testosterone and estrogen balance directly impact neurotransmitter levels.",
    bullets: [
      "Shorter fuse, less patience, harder to feel motivated or positive.",
      "Flat emotional affect — not quite depression, but not yourself either.",
    ],
  },
  {
    icon: "⚖️",
    title: "Unexplained Weight Gain (Especially Belly Fat)",
    body: "Low testosterone shifts your body composition toward fat storage.",
    bullets: [
      "Belly fat increases even without changes in diet or activity.",
      "This creates a cycle — belly fat converts testosterone to estrogen, lowering T further.",
    ],
  },
];

export const TRTEduSymptomSlider = () => {
  const [active, setActive] = useState(0);
  const symptom = SYMPTOMS[active];

  return (
    <section
      id="symptoms"
      style={{
        background: "#0D0D0D",
        padding: "80px 0",
        scrollMarginTop: 64,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: "#E8670A", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Know the Signs
          </p>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(36px, 7vw, 64px)",
              color: "#FFFFFF",
              lineHeight: 1.05,
              margin: "0 auto 16px",
            }}
          >
            LOW T DOESN'T HAPPEN ALL AT ONCE
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, maxWidth: 540, margin: "0 auto" }}>
            It creeps in. One symptom at a time. Until one day you wonder what happened to you.
          </p>
        </div>

        {/* Tab pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {SYMPTOMS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); trackCro(`edu_symptom_tab_${i}`); }}
              style={{
                padding: "8px 16px",
                borderRadius: 100,
                border: i === active ? "1px solid #E8670A" : "1px solid rgba(255,255,255,0.15)",
                background: i === active ? "rgba(232,103,10,0.18)" : "transparent",
                color: i === active ? "#E8670A" : "rgba(255,255,255,0.55)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{s.icon}</span>
              <span style={{ display: "none" }} className="sm-show">{s.title.split(" ").slice(0, 3).join(" ")}</span>
            </button>
          ))}
        </div>

        {/* Active card */}
        <div
          key={active}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(232,103,10,0.25)",
            borderRadius: 16,
            padding: "clamp(28px, 5vw, 48px)",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "rgba(232,103,10,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
              }}
            >
              {symptom.icon}
            </div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(24px, 4vw, 36px)",
                color: "#FFFFFF",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {symptom.title}
            </h3>
          </div>

          <p style={{ color: "rgba(255,255,255,0.70)", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
            {symptom.body}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {symptom.bullets.map((b, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <ChevronRight size={18} color="#E8670A" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: "rgba(255,255,255,0.80)", fontSize: 15, lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nav dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          {SYMPTOMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Symptom ${i + 1}`}
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                borderRadius: 100,
                background: i === active ? "#E8670A" : "rgba(255,255,255,0.20)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
