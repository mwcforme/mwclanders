import imgDoctor from "@/assets/lp/provider-headshot.webp";
import imgLobby from "@/assets/lp/onsite-labs-centrifuge.webp";
import imgAthletic from "@/assets/lp/man-athletic-smiling.webp";
import imgTeam from "@/assets/lp/mwc-team.webp";

const pillars = [
  {
    title: "LICENSED PROVIDERS",
    desc: "Licensed Virginia physicians and nurse practitioners. A real provider, every visit.",
    image: imgDoctor,
  },
  {
    title: "ON-SITE LABS",
    desc: "Full labs done in-center, with results back before you walk out.",
    image: imgLobby,
  },
  {
    title: "BUILT FOR MEN",
    desc: "TRT, ED, and weight loss is all we do. Not a side service at a general practice.",
    image: imgAthletic,
  },
  {
    title: "ONGOING MONITORING",
    desc: "Regular check-ins, labs, and protocol adjustments. We don't write a script and disappear.",
    image: imgTeam,
  },
];

export const TRTPillars = () => (
  <section className="py-14 md:py-20" style={{ background: "#000033" }}>
    <div className="max-w-[1200px] mx-auto px-6">
      <h2
        className="font-bold uppercase text-center mb-12"
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          color: "#FFFFFF",
          fontWeight: 700,
        }}
      >
        EVERYTHING YOU NEED FOR TRT, ED,<br />
        AND WEIGHT LOSS, UNDER ONE ROOF.
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="rounded-xl overflow-hidden text-center transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.14)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.10)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            }}
          >
            <div className="flex justify-center mt-6">
              <img
                src={p.image}
                alt={p.title}
                className="w-[140px] h-[140px] rounded-full object-cover"
                style={{ border: "3px solid var(--c-border-on-dark)" }}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h3
              className="font-bold text-base uppercase mt-4 tracking-wide"
              style={{ fontFamily: "Oswald, sans-serif", color: "#FFFFFF", fontWeight: 700 }}
            >
              {p.title}
            </h3>
            <p
              className="text-sm px-5 pb-6 mt-2 leading-relaxed"
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
