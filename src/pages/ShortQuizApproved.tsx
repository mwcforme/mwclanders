/**
 * /short-quiz/approved — Results confirmation page for the short-quiz funnel.
 * Shows next steps and encourages booking.
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Phone, CheckCircle2, Star } from "lucide-react";
import { RESULTS_TESTIMONIALS } from "@/data/quizContent";

const PHONE_DISPLAY = "(866) 344-4955";
const PHONE_HREF = "tel:+18663444955";
const NAVY = "#0B1029"; // brand navy
const CREAM = "var(--brand-cream)";
const ORANGE = "var(--brand-cta)";
// hardcoded-color-allow-next-line
const CREAM_85 = "rgba(245,240,235,0.85)";
// hardcoded-color-allow-next-line
const CREAM_55 = "rgba(245,240,235,0.55)";
// hardcoded-color-allow-next-line
const WHITE_06 = "rgba(255,255,255,0.06)";
// hardcoded-color-allow-next-line
const WHITE_12 = "rgba(255,255,255,0.12)";

export default function ShortQuizApproved() {
  return (
    <div style={{ background: NAVY, color: CREAM, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <SEO
        title="Results Received · Men's Wellness Centers"
        description="Your TRT assessment has been received. A licensed Virginia provider will review your results and reach out shortly."
      />

      {/* Header */}
      <div style={{
        // hardcoded-color-allow-next-line
        background: "rgba(11,16,41,0.95)", borderBottom: `1px solid ${WHITE_12}`,
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <img src="/logos/Text_Logo_white.webp"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
          alt="Men's Wellness Centers" style={{ height: 22, width: "auto" }} width={140} height={22} loading="eager" decoding="async" />
        <a href={PHONE_HREF} style={{
          fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700,
          // hardcoded-color-allow-next-line
          color: "var(--brand-cta-accessible)", textDecoration: "none",
        }}>
          {PHONE_DISPLAY}
        </a>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px 80px" }}>

        {/* Confirmation banner */}
        <div style={{
          textAlign: "center",
          // hardcoded-color-allow-next-line
          background: "rgba(34,197,94,0.08)", border: "1.5px solid rgba(34,197,94,0.30)",
          borderRadius: 16, padding: "36px 24px", marginBottom: 48,
        }}>
          <CheckCircle2 size={48} style={{ color: "#22C55E", marginBottom: 16 }} />
          <h1 style={{
            fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 6vw, 48px)",
            fontWeight: 700, textTransform: "uppercase", lineHeight: 1.05,
            color: CREAM, marginBottom: 16,
          }}>
            RESULTS <span style={{ color: ORANGE }}>RECEIVED</span>
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.6, color: CREAM_85 }}>
            A licensed Virginia provider will review your assessment and reach out within one business day. You don't need to do anything else right now.
          </p>
        </div>

        {/* What happens next */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "Oswald, sans-serif", fontSize: 22, fontWeight: 700,
            textTransform: "uppercase", color: CREAM, marginBottom: 20,
          }}>
            What Happens Next
          </h2>
          {[
            {
              num: "1",
              title: "Provider Reviews Your Results",
              desc: "A licensed Virginia provider reads your symptom scores and flags key patterns.",
            },
            {
              num: "2",
              title: "We Reach Out",
              desc: "Expect a call or text within one business day to discuss your results and answer questions.",
            },
            {
              num: "3",
              title: "Same-Day Lab + Consult",
              desc: "If you're a candidate, we book you in for on-site bloodwork and a face-to-face provider visit.",
            },
            {
              num: "4",
              title: "Your Protocol, Same Visit",
              desc: "Labs read on-site. If TRT or another treatment is appropriate, you leave with a plan.",
            },
          ].map(step => (
            <div key={step.num} style={{
              display: "flex", gap: 16, marginBottom: 20,
              // hardcoded-color-allow-next-line
              background: WHITE_06, border: `1px solid ${WHITE_12}`,
              borderRadius: 12, padding: "16px 18px",
            }}>
              <div style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
                background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 700, color: "#fff",
              }}>{step.num}</div>
              <div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 700, color: CREAM, marginBottom: 4 }}>{step.title}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: CREAM_85, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          // hardcoded-color-allow-next-line
          background: "rgba(232,103,10,0.08)", border: `1.5px solid rgba(232,103,10,0.30)`,
          borderRadius: 16, padding: "28px 24px", marginBottom: 48, textAlign: "center",
        }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 8 }}>
            Don't want to wait?
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: CREAM_85, marginBottom: 20 }}>
            Book directly and skip the callback — same-day appointments available at all Virginia locations.
          </p>
          <Link to="/book" style={{
            display: "inline-block", padding: "14px 32px", borderRadius: 12,
            background: ORANGE, color: "#fff", textDecoration: "none",
            fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 800,
            letterSpacing: "0.05em", textTransform: "uppercase",
            // hardcoded-color-allow-next-line
            boxShadow: "0 12px 32px rgba(232,103,10,0.40)",
          }}>
            Book My Consult →
          </Link>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: CREAM_55, marginTop: 10 }}>
            No cost. No insurance needed. Same- or next-day availability.
          </p>
        </div>

        {/* Phone */}
        <div style={{
          // hardcoded-color-allow-next-line
          background: WHITE_06, border: `1px solid ${WHITE_12}`,
          borderRadius: 12, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 48,
        }}>
          <Phone size={18} style={{ color: ORANGE, flexShrink: 0 }} />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: CREAM_85 }}>
            Prefer to speak with someone now?{" "}
            <a href={PHONE_HREF} style={{ color: "var(--brand-cta-accessible)", fontWeight: 700, textDecoration: "underline" }}>
              Call {PHONE_DISPLAY}
            </a>
          </p>
        </div>

        {/* Testimonials */}
        <h2 style={{
          fontFamily: "Oswald, sans-serif", fontSize: 20, fontWeight: 700,
          textTransform: "uppercase", color: CREAM, marginBottom: 16,
        }}>
          What Members Say
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 48 }}>
          {RESULTS_TESTIMONIALS.slice(0, 3).map(t => (
            <div key={t.name} style={{
              // hardcoded-color-allow-next-line
              background: WHITE_06, border: `1px solid ${WHITE_12}`,
              borderRadius: 12, padding: "16px 18px",
            }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#C9A961" stroke="#C9A961" />)}
              </div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: CREAM_85, lineHeight: 1.6, marginBottom: 10 }}>
                "{t.quote}"
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: CREAM_55 }}>
                — {t.name} · {t.date}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <img src="/logos/Text_Logo_white.webp"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
            alt="Men's Wellness Centers" style={{ height: 20, width: "auto", margin: "0 auto 12px" }} loading="lazy" decoding="async" />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 16px", marginBottom: 10 }}>
            <a href="/privacy-policy" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: CREAM_55, textDecoration: "underline" }}>Privacy Policy</a>
            <a href="/terms-of-service" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: CREAM_55, textDecoration: "underline" }}>Terms of Service</a>
            <a href="/tcpa" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: CREAM_55, textDecoration: "underline" }}>TCPA Disclosure</a>
          </div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: CREAM_55 }}>
            © {new Date().getFullYear()} Men's Wellness Centers · CLIA Certified · LegitScript Certified · HIPAA Compliant
          </p>
        </div>
      </div>
    </div>
  );
}
