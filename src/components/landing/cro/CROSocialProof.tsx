/**
 * CROSocialProof — 4-stat credibility band for /cro-op.
 */
import { trackCro } from "@/hooks/useAnalytics";
import { CRO_STATS } from "@/data/croContent";

const StatInner = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center gap-2 px-2 py-5 md:py-7">
    <div className="font-bold uppercase" style={{
      fontFamily: "Oswald, sans-serif",
      color: "var(--c-text-on-dark)",
      fontSize: "clamp(26px, 4vw, 44px)",
      lineHeight: 1,
      letterSpacing: "-0.01em",
    }}>
      {value}
    </div>
    <div className="uppercase whitespace-pre-line" style={{
      fontFamily: "Inter, sans-serif",
      // hardcoded-color-allow-next-line
      color: "rgba(255,255,255,0.70)",
      fontSize: 11,
      letterSpacing: "0.10em",
      fontWeight: 700,
      lineHeight: 1.45,
    }}>
      {label}
    </div>
  </div>
);

export const CROSocialProof = () => (
  <section style={{ background: "#0A1628" }}>
    <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 text-center">
      {CRO_STATS.map((s) => {
        const inner = <StatInner value={s.value} label={s.label} />;
        if ("href" in s && s.href) {
          return (
            <a key={s.slug} href={s.href} target="_blank" rel="noopener noreferrer"
              data-cro={s.slug} onClick={() => trackCro(s.slug)}
              className="block hover:opacity-80 transition-opacity cursor-pointer"
              style={{ textDecoration: "none" }}>
              {inner}
            </a>
          );
        }
        if ("scrollTo" in s && s.scrollTo) {
          return (
            <button key={s.slug} type="button" data-cro={s.slug}
              onClick={() => { trackCro(s.slug); document.getElementById(s.scrollTo!)?.scrollIntoView({ behavior: "smooth" }); }}
              className="hover:opacity-80 transition-opacity cursor-pointer w-full border-none bg-transparent">
              {inner}
            </button>
          );
        }
        return <div key={s.slug}>{inner}</div>;
      })}
    </div>
  </section>
);
