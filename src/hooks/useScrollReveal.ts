import { useEffect, useRef } from "react";

/**
 * Reveal content on scroll WITHOUT hiding it from crawlers, screenshot tools,
 * or reduced-motion users. Initial render is fully opaque (opacity:1). When
 * motion is allowed, we briefly dim newly-out-of-view sections to opacity:0
 * and animate them back to 1 as they enter the viewport.
 *
 * Edge cases handled:
 *  - prefers-reduced-motion → no-op, content stays at opacity:1.
 *  - Element already in viewport on mount → fires immediately (no flash).
 *  - JS disabled → content rendered visible by default (CSS untouched).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; staggerChildren?: boolean; staggerDelay?: number }
) {
  const ref = useRef<T>(null);
  const { threshold = 0.1, staggerChildren = false, staggerDelay = 100 } = options ?? {};

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    // If element is already in view at mount, skip the reveal entirely —
    // never hide content the user can already see (fast scroll / deep link).
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) return;

    const childEls = staggerChildren ? Array.from(el.children) as HTMLElement[] : [];

    el.style.opacity = "0";
    el.style.transition = `opacity 500ms cubic-bezier(0.16,1,0.3,1)`;
    // No willChange — avoids creating compositor layers on all 10 LP sections

    childEls.forEach((c, i) => {
      c.style.opacity = "0";
      c.style.transition = `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${i * staggerDelay}ms`;
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          childEls.forEach((c) => { c.style.opacity = "1"; });
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, staggerChildren, staggerDelay]);

  return ref;
}
