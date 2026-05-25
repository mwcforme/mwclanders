import { useRef, useState, useEffect } from "react";

const STAT_DISPLAY = [
  { isNum: true,  suffix: "+", label: "Men Treated" },
  { isNum: true,  suffix: "",  label: "Virginia Locations" },
  { isNum: false, display: "Same Day", label: "Lab Results" },
];

export const TRTStatStrip = () => {
  const stripRef = useRef<HTMLDivElement>(null);
  const [statCounts, setStatCounts] = useState([0, 0, 0]);
  const stripStarted = useRef(false);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stripStarted.current) {
          stripStarted.current = true;
          obs.disconnect();
          const duration = 1200;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - elapsed, 3);
            setStatCounts([
              Math.round(10000 * ease),
              Math.round(3 * ease),
              0,
            ]);
            if (elapsed < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={stripRef} style={{
      background: "rgba(232,103,10,0.10)",
      borderTop: "1px solid rgba(232,103,10,0.20)",
      padding: "20px 24px",
    }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        flexWrap: "wrap",
      }}>
        {STAT_DISPLAY.map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", padding: "8px 32px" }}>
              <div
                className="stat-value"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(22px, 3vw, 30px)",
                  color: "var(--brand-cta)",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {item.isNum
                  ? `${statCounts[i].toLocaleString()}${item.suffix}`
                  : item.display}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.60)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {item.label}
              </div>
            </div>
            {i < 2 && (
              <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
