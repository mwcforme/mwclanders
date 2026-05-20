import { useState, useEffect, useRef } from "react";
import { Phone } from "lucide-react";
import { LOCATIONS } from "@/data/locations";
import { trackCro } from "@/hooks/useAnalytics";
import { COPY } from "@/data/copy";

/**
 * Persistent mobile bottom action bar. Appears after the hero scrolls
 * out of view and hides when either lead form is in the viewport so it
 * never competes with the form. The Book button only scrolls to the
 * form card — it does NOT modify the form's DOM or props.
 */
export const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);
  const [formInView, setFormInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Default to Glen Allen / Richmond clinic for the call button.
  const nearest = LOCATIONS[0];

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      if (!hero) {
        setVisible(window.scrollY > 400);
        return;
      }
      setVisible(window.scrollY > hero.offsetHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide when either form card enters viewport.
  useEffect(() => {
    const targets = [
      document.getElementById("hero-form"),
      document.getElementById("final-cta"),
    ].filter(Boolean) as HTMLElement[];
    if (!targets.length) return;

    const seen = new WeakSet<Element>();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        });
        let any = false;
        targets.forEach((t) => { if (seen.has(t)) any = true; });
        setFormInView(any);
      },
      { threshold: 0.2 }
    );
    targets.forEach((t) => observerRef.current!.observe(t));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToForm = () => {
    trackCro("mobile_sticky_book_scroll");
    const card = document.getElementById("hero-form");
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    // Best-effort focus the existing first input — no DOM/prop changes.
    window.setTimeout(() => {
      const first = card.querySelector<HTMLElement>("input, select, textarea");
      first?.focus({ preventScroll: true });
    }, 600);
  };

  const show = visible && !formInView;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch transition-opacity duration-300"
      style={{
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        // hardcoded-color-allow-next-line
        background: "rgba(11,16,41,0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid var(--c-border-on-dark)",
        paddingBottom: "env(safe-area-inset-bottom)",
        // hardcoded-color-allow-next-line
        boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
      }}
      aria-hidden={!show}
    >
      <a
        href={nearest.phoneHref}
        data-cro="mobile_sticky_call"
        onClick={() => trackCro("mobile_sticky_call", { clinic: nearest.slug })}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 font-bold uppercase"
        style={{
          height: 72,
          background: "transparent",
          color: "var(--brand-cream)",
          textDecoration: "none",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.06em",
          fontSize: 13,
          borderRight: "1px solid var(--c-border-on-dark)",
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <Phone size={16} /> Call Us
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{nearest.phone}</span>
      </a>
      <button
        type="button"
        onClick={scrollToForm}
        data-cro="mobile_sticky_book_scroll"
        className="flex-1 flex items-center justify-center font-bold uppercase cursor-pointer border-none"
        style={{
          height: 72,
          background: "var(--brand-cta-accessible)",
          color: "var(--c-text-on-dark)",
          fontSize: 18,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.05em",
          // hardcoded-color-allow-next-line
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {COPY.cta.getLabsChecked}
      </button>
    </div>
  );
};
