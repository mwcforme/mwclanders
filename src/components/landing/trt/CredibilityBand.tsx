import { trackCro } from "@/hooks/useAnalytics";
import { GBP_REVIEWS_URL } from "@/data/testimonials";
import { COPY } from "@/data/copy";

interface Stat {
  value: string;
  label: string;
  slug: string;
  scrollTo?: string;
  href?: string;
}

const stats: Stat[] = [
  { value: "10,000+", label: "Men Treated\nSince 2015", slug: "credibility_band_count", scrollTo: "results" },
  { value: "3", label: "Virginia\nCenters", slug: "credibility_band_locations", scrollTo: "locations" },
  { value: "4.9★", label: "Google Rating\n200+ Reviews", slug: "credibility_band_reviews", href: GBP_REVIEWS_URL },
  { value: COPY.badge.offerValue, label: COPY.badge.offerLabel, slug: "credibility_band_offer", scrollTo: "hero" },
];

export const CredibilityBand = () => {
  const handleClick = (s: Stat) => () => {
    trackCro(s.slug);
    if (s.href) return;
    if (s.scrollTo) {
      document.getElementById(s.scrollTo)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section style={{ background: "#0A1628" }}>
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4 text-center" style={{ paddingTop: 32, paddingBottom: 32 }}>
        {stats.map((s, i) => {
          const inner = (
            <div className="flex flex-col items-center gap-2 px-2">
              <div
                className="font-bold uppercase"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: "#FFFFFF",
                  fontSize: "clamp(28px, 4vw, 44px)",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                }}
              >
                {s.value}
              </div>
              <div
                className="uppercase whitespace-pre-line"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: "rgba(255,255,255,0.70)",
                  fontSize: 12,
                  letterSpacing: "0.10em",
                  fontWeight: 700,
                  lineHeight: 1.45,
                }}
              >
                {s.label}
              </div>
            </div>
          );

          const dividerStyle: React.CSSProperties = {
            borderRight: i < stats.length - 1 ? "1px solid var(--c-border-on-dark)" : "none",
          };

          if (s.href) {
            return (
              <a
                key={s.slug}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cro={s.slug}
                onClick={handleClick(s)}
                className="block hover:opacity-80 transition-opacity cursor-pointer"
                style={{ ...dividerStyle, textDecoration: "none" }}
              >
                {inner}
              </a>
            );
          }

          return (
            <button
              key={s.slug}
              type="button"
              data-cro={s.slug}
              onClick={handleClick(s)}
              className="hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
              style={dividerStyle}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
};
