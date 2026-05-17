import imgDoctor from "@/assets/lp/provider-headshot.webp";
import imgLobby from "@/assets/lp/onsite-labs-centrifuge.webp";
import imgAthletic from "@/assets/lp/man-athletic-smiling.webp";
import imgTeam from "@/assets/lp/mwc-team.webp";

const pillars = [
  {
    title: "LICENSED PROVIDERS",
    desc: "Licensed Virginia providers and nurse practitioners. A real provider, every visit.",
    image: imgDoctor,
  },
  {
    title: "ON-SITE LABS",
    desc: "CLIA-certified lab in every center. No third-party lab visit, no waiting a week for results.",
    image: imgLobby,
  },
  {
    title: "BUILT FOR MEN",
    desc: "TRT, ED, and weight loss is all we do. Dedicated focus means faster answers and better outcomes.",
    image: imgAthletic,
  },
  {
    title: "ONGOING MONITORING",
    desc: "Follow-up labs and protocol adjustments are built into your care, not sold as add-ons.",
    image: imgTeam,
  },
];

const cardStyle: React.CSSProperties = {
  // hardcoded-color-allow-next-line
  background: "rgba(255,255,255,0.07)",
  // hardcoded-color-allow-next-line
  border: "1px solid rgba(255,255,255,0.14)",
  // hardcoded-color-allow-next-line
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
};

const cardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  // hardcoded-color-allow-next-line
  e.currentTarget.style.background = "rgba(255,255,255,0.13)";
  // hardcoded-color-allow-next-line
  e.currentTarget.style.borderColor = "rgba(232,103,10,0.50)";
  // hardcoded-color-allow-next-line
  e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 1px rgba(232,103,10,0.20)";
};
const cardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  // hardcoded-color-allow-next-line
  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
  // hardcoded-color-allow-next-line
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
  // hardcoded-color-allow-next-line
  e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.08)";
};

export const TRTPillars = () => (
  <section className="py-14 md:py-20" style={{ background: "var(--brand-navy)" }}>
    <div className="max-w-[1200px] mx-auto px-6">
      <h2
        className="font-bold uppercase text-center mb-10 md:mb-12"
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(24px, 4vw, 40px)",
          color: "var(--c-text-on-dark)",
          fontWeight: 700,
        }}
      >
        Physician-Led. Virginia-Local.
        <br className="hidden sm:block" />Built for Men.
      </h2>

      {/* Desktop + tablet: grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="rounded-xl overflow-hidden text-center transition-all duration-300"
            style={cardStyle}
            onMouseEnter={cardEnter}
            onMouseLeave={cardLeave}
          >
            <div className="flex justify-center mt-6">
              <img
                src={p.image}
                alt={p.title}
                className="w-[120px] h-[120px] rounded-full object-cover"
                style={{ border: "3px solid var(--c-border-on-dark)" }}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h3
              className="font-bold text-base uppercase mt-4 tracking-wide px-3"
              style={{ fontFamily: "Oswald, sans-serif", color: "var(--c-text-on-dark)", fontWeight: 700 }}
            >
              {p.title}
            </h3>
            <p
              className="text-sm px-5 pb-6 mt-2 leading-relaxed"
              // hardcoded-color-allow-next-line
              style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif" }}
            >
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: horizontal snap-scroll strip */}
      <div
        className="sm:hidden flex gap-3 overflow-x-auto pb-3 scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          marginLeft: -24,
          marginRight: -24,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {pillars.map((p) => (
          <div
            key={p.title}
            className="rounded-xl overflow-hidden text-center flex-shrink-0"
            style={{
              width: 188,
              scrollSnapAlign: "start",
              ...cardStyle,
            }}
          >
            <div className="flex justify-center mt-5">
              <img
                src={p.image}
                alt={p.title}
                className="w-[96px] h-[96px] rounded-full object-cover"
                style={{ border: "3px solid var(--c-border-on-dark)" }}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h3
              className="font-bold text-sm uppercase mt-3 tracking-wide px-3"
              style={{ fontFamily: "Oswald, sans-serif", color: "var(--c-text-on-dark)", fontWeight: 700 }}
            >
              {p.title}
            </h3>
            <p
              className="text-xs px-4 pb-5 mt-1.5 leading-relaxed"
              // hardcoded-color-allow-next-line
              style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif" }}
            >
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
