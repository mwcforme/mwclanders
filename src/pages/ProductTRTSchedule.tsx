import { useNavigate } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { TRTHeader } from "@/components/landing/trt/TRTHeader";
import { TRTFooter } from "@/components/landing/trt/TRTFooter";
import { SEO } from "@/components/SEO";

const ProductTRTSchedule = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#ffffff",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SEO
        title="Schedule Your Consultation | Men's Wellness Centers"
        description="Choose a convenient time for your no-cost TRT consultation at a Men's Wellness Centers Virginia location."
      />

      <TRTHeader minimal />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 20,
            padding: "52px 40px",
            textAlign: "center",
            boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
          }}
        >
          {/* Calendar icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(232,103,10,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
            }}
          >
            <Calendar
              size={34}
              strokeWidth={1.75}
              color="var(--brand-cta)"
              aria-hidden
            />
          </div>

          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(26px, 5vw, 36px)",
              fontWeight: 700,
              color: "var(--brand-navy)",
              marginBottom: 12,
              lineHeight: 1.15,
            }}
          >
            Schedule Your Free Consultation
          </h2>

          <p
            style={{
              fontSize: 16,
              color: "#777",
              marginBottom: 12,
              lineHeight: 1.6,
            }}
          >
            Choose a time that works for you
          </p>

          <div
            style={{
              width: 48,
              height: 3,
              background: "var(--brand-cta)",
              borderRadius: 99,
              margin: "0 auto 32px",
            }}
          />

          <p
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--brand-navy)",
              marginBottom: 10,
            }}
          >
            Great choice. Let's find your time.
          </p>

          <p
            style={{
              fontSize: 15,
              color: "#666",
              marginBottom: 36,
              lineHeight: 1.6,
            }}
          >
            Choose the location nearest you to see available appointments.
          </p>

          <button
            type="button"
            onClick={() => navigate("/book/location")}
            style={{
              background: "var(--brand-cta)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "16px 40px",
              fontSize: 17,
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.04em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--brand-cta-hover, #c85a08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--brand-cta)";
            }}
          >
            Choose My Location <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <p
            style={{
              marginTop: 20,
              fontSize: 13,
              color: "#aaa",
            }}
          >
            No-cost consultation · Same-day labs · Virginia locations
          </p>
        </div>
      </main>

      <TRTFooter />
    </div>
  );
};

export default ProductTRTSchedule;
