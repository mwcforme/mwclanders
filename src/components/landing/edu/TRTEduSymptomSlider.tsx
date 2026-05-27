import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { trackCro } from "@/hooks/useAnalytics";

const SYMPTOMS = [
  {
    icon: "💪",
    label: "Muscle Loss",
    title: "Difficulty Building & Maintaining Muscle",
    body: "Optimal testosterone supports protein synthesis, helping muscle fibers recover and grow.",
    bullets: [
      "Lower levels make strength gains slower and muscle loss more likely.",
      "You may train hard, but still struggle to hold size, strength, and definition.",
    ],
    stat: null,
    visual: null,
  },
  {
    icon: "🔋",
    label: "Fatigue",
    title: "Chronic Fatigue That Sleep Doesn't Fix",
    body: "Testosterone plays a key role in red blood cell production and mitochondrial energy.",
    bullets: [
      "You wake up tired no matter how many hours you sleep.",
      "Afternoon energy crashes that didn't use to happen become your new normal.",
    ],
    stat: null,
    visual: null,
  },
  {
    icon: "😶",
    label: "Mood",
    title: "Mood & Emotional Instability",
    body: "When testosterone drops, some men notice more sadness, anxiety, irritability, or emotional instability.",
    bullets: [
      { highlight: "22%", text: "of men with sub-optimal T developed & were diagnosed with depression." },
      { highlight: "7%", text: "Only 7% of men with optimal levels developed depression." },
    ],
    stat: "Mood changes may be a hormone signal. Not a personal failing.",
    visual: "mood",
  },
  {
    icon: "🫃",
    label: "Visceral Fat",
    title: "Stubborn Accumulation of Visceral Fat",
    body: "Low testosterone can drive visceral fat buildup, raising the risk of metabolic strain and long-term harm.",
    bullets: [
      { label: "Visceral Fat", text: "Deep belly fat around organs, linked to higher metabolic health risk." },
      { label: "Subcutaneous Fat", text: "Fat stored beneath the skin, visible and easier to pinch around the waist." },
    ],
    stat: null,
    visual: "fat",
  },
  {
    icon: "❤️",
    label: "Libido",
    title: "Drop in Libido & Sexual Performance",
    body: "Testosterone supports libido by activating androgen receptors in the brain.",
    bullets: [
      "Lower testosterone levels can make sex feel less frequent or less satisfying.",
      "This is a biological signal. Not a reflection of your relationship.",
    ],
    stat: null,
    visual: "libido",
  },
  {
    icon: "🧠",
    label: "Brain Fog",
    title: "Brain Fog & Difficulty Concentrating",
    body: "Testosterone receptors exist throughout the brain, including regions controlling memory and focus.",
    bullets: [
      "Forgetting words mid-sentence. Losing track of tasks. Feeling 'off.'",
      "Many men attribute this to stress or aging. The real cause is often hormonal.",
    ],
    stat: null,
    visual: null,
  },
];

// Libido by age chart data
const LIBIDO_DATA = [
  { age: "20s", val: 72 },
  { age: "30s", val: 78 },
  { age: "40s", val: 82 },
  { age: "50s", val: 76 },
  { age: "60s", val: 72 },
  { age: "70s", val: 64 },
  { age: "80s", val: 55 },
];

const LibidoChart = () => {
  const max = 100;
  const width = 280;
  const height = 100;
  const padL = 28, padR = 16, padT = 12, padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const pts = LIBIDO_DATA.map((d, i) => ({
    x: padL + (i / (LIBIDO_DATA.length - 1)) * innerW,
    y: padT + (1 - d.val / max) * innerH,
    ...d,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: "16px 12px", marginBottom: 16 }}>
      <div style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
        Male Libido Index by Age
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {[60, 80, 100].map(v => {
          const y = padT + (1 - v / max) * innerH;
          return <line key={v} x1={padL} x2={padL + innerW} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />;
        })}
        {/* Line */}
        <path d={pathD} fill="none" stroke="rgba(232,103,10,0.7)" strokeWidth={2} strokeLinejoin="round" />
        {/* Points + labels */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="#0A0A0A" stroke="var(--brand-cta)" strokeWidth={1.5} />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={9}>{p.val}</text>
            <text x={p.x} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9}>{p.age}</text>
          </g>
        ))}
        {/* Peak label */}
        <rect x={pts[2].x - 22} y={pts[2].y - 26} width={44} height={16} rx={8} fill="rgba(232,103,10,0.25)" />
        <text x={pts[2].x} y={pts[2].y - 15} textAnchor="middle" fill="var(--brand-cta)" fontSize={9} fontWeight="bold">PEAK</text>
      </svg>
    </div>
  );
};

interface MoodBullet { highlight: string; text: string }
const MoodStats = ({ bullets }: { bullets: MoodBullet[] }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {bullets.map((b, i) => (
      <div key={i} style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: 10, padding: "14px 16px",
      }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "var(--brand-cta)", lineHeight: 1, flexShrink: 0, width: 52 }}>
          {b.highlight}
        </span>
        <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.5 }}>{b.text}</span>
      </div>
    ))}
  </div>
);

interface FatBullet { label: string; text: string }
const FatCards = ({ bullets }: { bullets: FatBullet[] }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {bullets.map((b, i) => (
      <div key={i} style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: 10, padding: "14px 16px",
      }}>
        <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{b.label}</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.5 }}>{b.text}</div>
      </div>
    ))}
  </div>
);

const DefaultBullets = ({ bullets }: { bullets: string[] }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {bullets.map((b, i) => (
      <div key={i} style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: 10, padding: "14px 16px",
      }}>
        <ChevronRight size={18} color="var(--brand-cta)" style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ color: "rgba(255,255,255,0.80)", fontSize: 16, lineHeight: 1.6 }}>{b}</span>
      </div>
    ))}
  </div>
);

export const TRTEduSymptomSlider = () => {
  const [active, setActive] = useState(0);
  const s = SYMPTOMS[active];

  return (
    <section id="symptoms" style={{ background: "#0D0D0D", padding: "80px 0", scrollMarginTop: 64 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "var(--brand-cta)", fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
            Know the Signs
          </p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 7vw, 64px)", color: "#FFFFFF", lineHeight: 1.05, margin: "0 auto 16px" }}>
            LOW T DOESN'T HAPPEN ALL AT ONCE
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, maxWidth: 540, margin: "0 auto" }}>
            It creeps in. One symptom at a time. Until one day you wonder what happened to you.
          </p>
        </div>

        {/* Tab pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 36 }}>
          {SYMPTOMS.map((sym, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); trackCro(`edu_symptom_tab_${i}`); }}
              style={{
                padding: "8px 18px", borderRadius: 100,
                border: i === active ? "1px solid var(--brand-cta)" : "1px solid rgba(255,255,255,0.35)",
                background: i === active ? "rgba(232,103,10,0.18)" : "transparent",
                color: i === active ? "var(--brand-cta)" : "rgba(255,255,255,0.55)",
                fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              <span>{sym.icon}</span>
              <span>{sym.label}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div
          key={active}
          style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(232,103,10,0.70)",
            borderRadius: 16, padding: "clamp(28px, 5vw, 48px)",
            maxWidth: 720, margin: "0 auto",
          }}
        >
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 18 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: "rgba(232,103,10,0.15)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px, 4vw, 34px)", color: "#FFFFFF", lineHeight: 1.1, margin: 0 }}>
              {s.title}
            </h3>
          </div>

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7, marginBottom: 20 }}>
            {s.body}
          </p>

          {/* Visual / bullets */}
          {s.visual === "libido" && <LibidoChart />}

          {s.visual === "mood"
            ? <MoodStats bullets={s.bullets as MoodBullet[]} />
            : s.visual === "fat"
            ? <FatCards bullets={s.bullets as FatBullet[]} />
            : s.visual !== "libido"
            ? <DefaultBullets bullets={s.bullets as string[]} />
            : null}

          {s.visual === "libido" && (
            <DefaultBullets bullets={s.bullets as string[]} />
          )}

          {/* Stat callout */}
          {s.stat && (
            <div style={{
              marginTop: 18, background: "rgba(232,103,10,0.10)",
              border: "1px solid rgba(232,103,10,0.25)", borderRadius: 10,
              padding: "14px 18px", color: "rgba(255,255,255,0.80)", fontSize: 14,
              fontStyle: "italic", lineHeight: 1.6,
            }}>
              {s.stat}
            </div>
          )}
        </div>

        {/* Nav dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {SYMPTOMS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Symptom ${i + 1}`}
              style={{
                width: i === active ? 24 : 8, height: 8, borderRadius: 100,
                background: i === active ? "var(--brand-cta)" : "rgba(255,255,255,0.20)",
                border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
