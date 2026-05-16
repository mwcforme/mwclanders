import { Star } from "lucide-react";
import { COPY } from "@/data/copy";
import { TESTIMONIALS, GBP_REVIEWS_URL } from "@/data/testimonials";

const GoogleG = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.5 0 19.5-7.6 19.5-19.5 0-1.2-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.4 4.5 9.8 8.7 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5.1c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.7 39.2 16.3 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.9 5l6 5.1c4.2-3.9 6.6-9.6 6.6-16 0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
);

export const TRTResults = () => {
  const scrollToForm = () => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="results" style={{ background: "#F5F0EB" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-24">
        <h2
          className="font-bold uppercase text-center"
          style={{ fontFamily: "Oswald, sans-serif", color: "#000033", fontSize: "clamp(26px, 3vw, 38px)", letterSpacing: "0.02em" }}
        >
          Real Members. Real Experiences.
        </h2>
        <p className="text-center mt-2" style={{ color: "#5A6072", fontFamily: "Inter, sans-serif", fontSize: 15 }}>
          Verified patient experiences.{" "}
          <a
            href={GBP_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: "#000033" }}
          >
            See all reviews on Google →
          </a>
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: "#FFFFFF", border: "1px solid rgba(11,16,41,0.08)", boxShadow: "0 2px 16px rgba(11,16,41,0.07), 0 8px 32px rgba(11,16,41,0.05)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4" fill="#E8670A" stroke="#E8670A" />
                  ))}
                  {t.rating < 5 && [...Array(5 - t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4" fill="none" stroke="#D1D5DB" />
                  ))}
                </div>
                {t.source === "google" && (
                  <span className="flex items-center gap-1" title="Google review">
                    <GoogleG size={14} />
                  </span>
                )}
              </div>
              <p className="italic flex-1" style={{ color: "#1a1a2e", fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.65 }}>
                "{t.quote}"
              </p>
              <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--c-border-on-light)" }}>
                <div>
                  <div className="font-semibold" style={{ color: "#000033", fontFamily: "Inter, sans-serif", fontSize: 16 }}>{t.name}</div>
                  <div style={{ color: "var(--c-text-on-light-muted)", fontFamily: "Inter, sans-serif", fontSize: 14 }}>{t.city}</div>
                </div>
                <div style={{ color: "var(--c-text-on-light-muted)", fontFamily: "Inter, sans-serif", fontSize: 14 }}>{t.monthYear}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="mb-4" style={{ fontSize: 14, color: "#5A6072", fontFamily: "Inter, sans-serif", fontStyle: "italic" }}>
            Testimonials reflect individual experiences. Individual results vary.
          </p>
          <button
            onClick={scrollToForm}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer border-none"
            style={{ height: 56, minHeight: 56, background: "var(--brand-cta)", color: "#FFFFFF", fontSize: "clamp(15px, 3.5vw, 19px)", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}
          >
            {COPY.cta.startConsult}
          </button>
        </div>
      </div>
    </section>
  );
};
