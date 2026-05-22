/**
 * AffordabilityTestimonials — member voice quote cards for /pricing.
 */
import { Quote } from "lucide-react";
import { eyebrow, TESTIMONIALS } from "@/data/affordabilityContent";

export const AffordabilityTestimonials = () => (
  <section className="py-16 md:py-20" style={{ background: "var(--brand-cream)" }}>
    <div className="max-w-[1100px] mx-auto px-6">
      <p style={eyebrow}>Member Voices</p>
      <h2 className="font-bold uppercase" style={{
        fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 3.5vw, 40px)",
        color: "var(--c-text-on-light)", fontWeight: 700, lineHeight: 1.1, marginTop: 0, marginBottom: 40,
      }}>
        WHAT MEMBERS SAY ABOUT THE PROCESS.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map(({ quote, attr, since }) => (
          <div key={attr} style={{
            background: "var(--bg-white)", borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)", padding: "28px 24px",
            display: "flex", flexDirection: "column",
          }}>
            <Quote size={28} strokeWidth={1.75}
              style={{ color: "var(--brand-cta)", marginBottom: 16, flexShrink: 0 }} aria-hidden />
            <p style={{
              fontFamily: "Inter, sans-serif", fontSize: 16, fontStyle: "italic",
              color: "var(--c-text-on-light)", lineHeight: 1.65, marginTop: 0, marginBottom: 20, flex: 1,
            }}>
              {quote}
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--c-text-on-light)", margin: 0, marginBottom: 2 }}>{attr}</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "var(--c-text-on-light-muted)", margin: 0, marginBottom: 8 }}>{since}</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "var(--c-text-on-light-muted)", margin: 0, fontStyle: "italic" }}>
              Verified Google review. Individual experiences vary.
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
