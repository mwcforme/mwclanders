/**
 * BookHeader — minimal funnel header matching the landing page nav style.
 * Logo left · phone number right. No CTA, no nav links.
 */
import { Link } from "react-router-dom";
import { PHONE } from "@/lib/constants";

export function BookHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        // hardcoded-color-allow-next-line — matches TRTHeader landing page style
        background: "rgba(11,16,41,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: 64,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Logo */}
        <Link to="/" aria-label="Men's Wellness Centers home">
          <img
            src="/logos/Text_Logo_white.webp"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png";
            }}
            alt="Men's Wellness Centers"
            style={{ height: 32, width: "auto" }}
            width={160}
            height={32}
          />
        </Link>

        {/* Phone number */}
        <a
          href={PHONE.tel}
          style={{
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          866-344-4955
        </a>
      </div>
    </header>
  );
}
