const CELEBRATION_STYLES = `
  @keyframes starBurst {
    0%   { opacity: 1; transform: scale(0) translate(0, 0) rotate(0deg); }
    60%  { opacity: 0.9; }
    100% { opacity: 0; transform: scale(1) translate(var(--tx), var(--ty)) rotate(var(--rot)); }
  }
  .star-burst-particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    animation: starBurst 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    pointer-events: none;
  }
`;

const BURST_COLORS = [
  "#E8670A", "#C9A961", "#ffffff", "rgba(232,103,10,0.7)", "#F5F0EB",
];

interface Props {
  active: boolean;
}

export function CelebrationBurst({ active }: Props) {
  if (!active) return null;
  const particles = Array.from({ length: 20 }, (_, idx) => {
    const angle = (idx / 20) * 360;
    const dist = 45 + (idx % 3) * 18;
    const tx = `${(Math.cos((angle * Math.PI) / 180) * dist).toFixed(1)}px`;
    const ty = `${(Math.sin((angle * Math.PI) / 180) * dist).toFixed(1)}px`;
    const rot = `${idx * 18}deg`;
    const color = BURST_COLORS[idx % BURST_COLORS.length];
    const delay = `${idx * 25}ms`;
    return { tx, ty, rot, color, delay, idx };
  });

  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 10 }}>
      <style>{CELEBRATION_STYLES}</style>
      {particles.map((p) => (
        <div
          key={p.idx}
          className="star-burst-particle"
          style={{
            background: p.color,
            // @ts-expect-error CSS custom props
            "--tx": p.tx,
            "--ty": p.ty,
            "--rot": p.rot,
            animationDelay: p.delay,
            top: 0,
            left: 0,
          }}
        />
      ))}
    </div>
  );
}
