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
    // hardcoded-color-allow-next-line
    <section style={{ background: "#0A1628" }}>
      {/*
        2-col grid on mobile (2×2), 4-col on md+.
        Dividers: right border on col 0 (both rows), bottom border on top row mobile.
        On md+: right border on all except last.
      */}
      <div
        className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 text-center"
        style={{ paddingTop: 0, paddingBottom: 0 }}
      >
        {stats.map((s, i) => {
          const inner = (
            <div className="flex flex-col items-center gap-2 px-2 py-5 md:py-7">
              <div
                className="font-bold uppercase"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: "var(--c-text-on-dark)",
                  fontSize: "clamp(26px, 4vw, 44px)",
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
                  // hardcoded-color-allow-next-line
                color: "rgba(255,255,255,0.70)",
                  fontSize: 11,
                  letterSpacing: "0.10em",
                  fontWeight: 700,
                  lineHeight: 1.45,
                }}
              >
                {s.label}
              </div>
            </div>
          );

          // Mobile 2×2: right border on items 0,2; bottom border on items 0,1
          // Desktop 1×4: right border on items 0,1,2
          const col = i % 2; // 0 or 1
          const row = Math.floor(i / 2); // 0 or 1
          const dividerStyle: React.CSSProperties = {};
          const wrapStyle: React.CSSProperties = {};

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
            <div
              key={s.slug}
              style={dividerStyle}
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
};
