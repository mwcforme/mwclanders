import { useState, useEffect, useRef } from "react";
import { trackCro } from "@/hooks/useAnalytics";
import { COPY } from "@/data/copy";

/**
 * Persistent mobile bottom action bar.
 * Single orange CTA — appears after hero scrolls out of view,
 * hides when any lead form is in viewport so it never competes.
 */
export const StickyMobileCTA = () => {
  const [visible, setVisible]     = useState(false);
  const [formInView, setFormInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      // MWC-003 fix: was inverted. Bar should be HIDDEN while hero is on screen,
      // then REVEALED once hero scrolls out — and stay revealed.
      const threshold = hero
        ? hero.offsetTop + hero.offsetHeight * 0.8
        : 500;
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = [
      document.getElementById("hero-form"),
      document.getElementById("final-cta"),
    ].filter(Boolean) as HTMLElement[];
    if (!targets.length) return;

    const seen = new WeakSet<Element>();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target));
        setFormInView(targets.some(t => seen.has(t)));
      },
      { threshold: 0.2 }
    );
    targets.forEach(t => observerRef.current!.observe(t));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToForm = () => {
    const target = document.getElementById("hero-form") ?? document.getElementById("reserve");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    trackCro("mobile_sticky_book_scroll", {});
  };

  const show = visible && !formInView;

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 transition-transform duration-300"
      style={{
        transform: show ? "translateY(0)" : "translateY(110%)",
        background: "rgba(11,16,41,0.97)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 16px",
        paddingBottom: "max(14px, env(safe-area-inset-bottom))",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.40)",
      }}
      aria-hidden={!show}
    >
      <button
        type="button"
        onClick={scrollToForm}
        data-cro="mobile_sticky_book_scroll"
        className="w-full flex items-center justify-center rounded-2xl font-display font-bold uppercase tracking-[0.14em] text-base text-white cursor-pointer border-none"
        style={{
          minHeight: 52,
          background: "var(--brand-cta)",
          boxShadow: "0 8px 24px rgba(232,103,10,0.40)",
        }}
      >
        {COPY.cta.bookConsult}
      </button>
      <p className="text-center mt-1.5" style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
        60-minute in-person visit · Men&apos;s Wellness Centers
      </p>
    </div>
  );
};
