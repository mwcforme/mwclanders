import { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { trackCro } from "@/hooks/useAnalytics";
import { COPY } from "@/data/copy";

export const TRTHeader = ({ minimal = false }: { minimal?: boolean } = {}) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };


  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:bg-transparent"
      style={{
        background: scrolled ? "rgba(11,16,41,0.95)" : "rgba(11,16,41,0.85)",
        backdropFilter: "blur(12px)",
        height: 64,
      }}
    >
      <div className="flex items-center justify-between px-6 mx-auto max-w-[1200px] h-full">
        <Link to="/" aria-label="Men's Wellness Centers home" className="inline-flex">
          <img
            src="/logos/Text_Logo_white.webp" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }}
            decoding="async"
            alt="Men's Wellness Centers"
            className="h-7 w-auto"
          />
        </Link>

        {/* Desktop right */}
        {!minimal && (
        <div className="hidden md:flex items-center gap-4">
          <a
            href="tel:+18663444955"
            data-cro="header_phone_click"
            onClick={() => trackCro("header_phone_click")}
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "var(--c-text-on-dark)", fontFamily: "Inter, sans-serif" }}
          >
            866-344-4955
          </a>
          <button
            data-cro="header_book_click"
            onClick={() => { trackCro("header_book_click"); scrollTo("hero-form"); }}
            className="rounded-full px-5 py-2.5 text-xs font-bold cursor-pointer transition-colors duration-200"
            style={{
              background: "var(--brand-cta)",
              color: "var(--c-text-on-dark)",
              letterSpacing: "0.08em",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-cta-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-cta)"; }}
          >
            {COPY.cta.bookConsult}
          </button>
        </div>
        )}

        {/* Mobile: phone icon only */}
        {!minimal && (
        <div className="md:hidden flex items-center">
          <a
            href="tel:+18663444955"
            data-cro="header_phone_click_mobile"
            onClick={() => trackCro("header_phone_click_mobile")}
            aria-label="Call 866-344-4955"
            className="relative inline-flex items-center justify-center rounded-full"
            style={{
              width: 52,
              height: 52,
              background: "var(--brand-cta)",
              color: "var(--c-text-on-dark)",
              boxShadow: "0 4px 16px rgba(232,103,10,0.40)",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "var(--brand-cta)", opacity: 0.4 }}
            />
            <Phone size={22} className="relative" strokeWidth={2.5} />
          </a>
        </div>
        )}
      </div>
    </header>
  );
};
