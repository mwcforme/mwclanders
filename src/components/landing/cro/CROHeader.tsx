/**
 * CROHeader — minimal header for /cro-op (no nav, logo + phone only).
 */
import { Phone } from "lucide-react";
import { PHONE } from "@/lib/constants";

const ORANGE = "var(--brand-cta)";

export const CROHeader = () => (
  <header style={{
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64,
    background: "var(--brand-navy-deep)",
    // hardcoded-color-allow-next-line
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", fontFamily: "Inter, sans-serif",
  }}>
    <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
      <img
        src="/logos/Text_Logo_white.webp"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
        alt="Men's Wellness Centers"
        style={{ height: 32, width: "auto" }}
        width={160} height={32}
      />
    </a>
    <a href={PHONE.tel} style={{
      display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
      color: "var(--c-text-on-dark)", fontWeight: 600, fontSize: 15,
    }}>
      <Phone size={16} strokeWidth={1.75} style={{ color: ORANGE }} />
      {PHONE.display}
    </a>
  </header>
);
