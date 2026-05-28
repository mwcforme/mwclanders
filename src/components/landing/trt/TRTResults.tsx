/**
 * TRTResults — Real verified Google reviews section.
 *
 * Reviews sourced from Trustindex widget, verified by Trustindex as original Google reviews.
 * Profile photos from Google's CDN. "Verified Google Review" badge on each card.
 * 191 total reviews, 5-star average.
 */
import { Star, ArrowUpRight, CheckCircle } from "lucide-react";
import { COPY } from "@/data/copy";
import { TESTIMONIALS, GBP_REVIEWS_URL } from "@/data/testimonials";
import { useScrollToForm } from "@/hooks/useScrollToForm";
import { Eyebrow } from "@/components/landing/shared/primitives";

/** Google G logo SVG — official brand colors */
const GoogleG = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.5 0 19.5-7.6 19.5-19.5 0-1.2-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.4 4.5 9.8 8.7 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5.1c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.7 39.2 16.3 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.9 5l6 5.1c4.2-3.9 6.6-9.6 6.6-16 0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
);

export const TRTResults = () => {
  const scrollToForm = useScrollToForm();

  return (
    <section id="results" style={{ background: "var(--brand-cream)" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-14 md:py-20">

        {/* Section header */}
        <div className="text-center mb-10 md:mb-12">
          <Eyebrow center>Member Outcomes</Eyebrow>
          <h2
            className="font-bold uppercase"
            style={{
              fontFamily: "Oswald, sans-serif",
              color: "var(--brand-navy)",
              fontSize: "clamp(26px, 3vw, 38px)",
              letterSpacing: "0.02em",
              marginBottom: 10,
            }}
          >
            Real Members. Real Experiences.
          </h2>

          {/* Aggregate rating strip */}
          <div
            className="inline-flex items-center gap-3 flex-wrap justify-center"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-[18px] w-[18px]" fill="var(--brand-cta)" stroke="var(--brand-cta)" />
              ))}
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: "var(--brand-navy)" }}>4.9</span>
            <span style={{ fontSize: 14, color: "var(--c-text-on-light-muted)" }}>·</span>
            <a
              href={GBP_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: "var(--brand-navy)", fontSize: 14, textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              191 verified Google reviews
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Review cards — 5 reviews, responsive grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-6 flex flex-col"
              style={{
                background: "var(--bg-white)",
                border: "1px solid rgba(11,16,41,0.08)",
                boxShadow: "0 2px 16px rgba(11,16,41,0.06), 0 8px 32px rgba(11,16,41,0.04)",
              }}
            >
              {/* Card header: profile photo + name + date + Google icon */}
              <div className="flex items-start gap-3 mb-4">
                {/* Profile photo from Google CDN */}
                {t.photoUrl ? (
                  <img
                    src={t.photoUrl}
                    alt={`${t.name} profile`}
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                      border: "2px solid rgba(11,16,41,0.08)",
                    }}
                    onError={(e) => {
                      // Fallback to initials if photo fails to load
                      const img = e.currentTarget;
                      const parent = img.parentElement;
                      if (parent) {
                        img.style.display = "none";
                        const fallback = document.createElement("div");
                        fallback.style.cssText =
                          "width:44px;height:44px;border-radius:50%;background:var(--brand-navy);color:#fff;display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-weight:700;font-size:16px;flex-shrink:0";
                        fallback.textContent = t.name.charAt(0);
                        parent.insertBefore(fallback, img.nextSibling);
                      }
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--brand-navy)",
                      color: "var(--c-text-on-dark)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                )}

                {/* Name + time */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--brand-navy)",
                      lineHeight: 1.2,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "var(--c-text-on-light-muted)",
                      marginTop: 2,
                    }}
                  >
                    {t.relativeTime}
                  </div>
                </div>

                {/* Google G */}
                <GoogleG size={18} />
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-[15px] w-[15px]" fill="var(--brand-cta)" stroke="var(--brand-cta)" />
                ))}
              </div>

              {/* Quote */}
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: "var(--c-text-on-light)",
                  flex: 1,
                  marginBottom: 16,
                }}
              >
                "{t.quote}"
              </p>

              {/* Verified badge */}
              <div
                className="inline-flex items-center gap-1.5 mt-auto"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#1a73e8",
                  letterSpacing: "0.02em",
                }}
              >
                <CheckCircle size={13} strokeWidth={2} style={{ color: "#1a73e8", flexShrink: 0 }} />
                Verified Google Review
              </div>
            </div>
          ))}
        </div>

        {/* Footer: disclaimer + CTA */}
        <div className="mt-10 text-center">
          <p
            className="mb-5"
            style={{
              fontSize: 13,
              color: "var(--c-text-on-light-muted)",
              fontFamily: "Inter, sans-serif",
              fontStyle: "italic",
            }}
          >
            Reviews reflect individual experiences. Individual results vary.{" "}
            <a
              href={GBP_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--brand-navy)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              See all 191 reviews →
            </a>
          </p>
          <button
            type="button"
            onClick={scrollToForm}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer border-none"
            style={{
              height: 56,
              minHeight: 56,
              background: "var(--brand-cta)",
              color: "var(--c-text-on-dark)",
              fontSize: "clamp(16px, 3.5vw, 19px)",
              letterSpacing: "0.06em",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--brand-cta-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--brand-cta)";
            }}
          >
            {COPY.cta.startConsult}
          </button>
        </div>
      </div>
    </section>
  );
};
