import { type ReactNode } from "react";

interface QuizShellProps {
  /** 0–100 progress percentage. */
  progress: number;
  children: ReactNode;
  /** Sticky CTA at bottom of viewport. Pass null to hide. */
  cta?: ReactNode;
}

/**
 * Shared frame for /quiz steps. Top progress bar + centered MWC wordmark,
 * scrollable body, optional sticky CTA at the bottom of the viewport.
 * Mobile-first, max-width 720px content column on desktop.
 */
export function QuizShell({ progress, children, cta }: QuizShellProps) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div style={{ background: "#000814", color: "#F5F0EB", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Progress bar (fixed at top, full-width) */}
      <div className="fixed top-0 left-0 right-0 z-40" style={{ background: "rgba(0,8,20,0.92)", backdropFilter: "blur(8px)" }}>
        <div className="h-1.5 w-full" style={{ background: "rgba(255,255,255,0.10)" }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%`, background: "#E8670A" }}
          />
        </div>
        <div className="flex items-center justify-between px-5 md:px-8 h-12">
          <img src="/logos/Text_Logo_white.webp" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }} alt="Men's Wellness Centers" className="h-5 md:h-6 w-auto" />
          <span className="text-[11px] md:text-xs tabular-nums font-semibold tracking-wider" style={{ color: "#E8670A" }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Body */}
      <main
        className="mx-auto px-5 md:px-8"
        style={{
          maxWidth: 720,
          paddingTop: 88,
          paddingBottom: cta ? 140 : 48,
        }}
      >
        {children}
      </main>

      {/* Sticky CTA */}
      {cta ? (
        <div
          className="fixed left-0 right-0 bottom-0 z-40 px-4 pt-4"
          style={{
            background: "linear-gradient(to top, rgba(0,8,20,1) 60%, rgba(0,8,20,0))",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="mx-auto w-full" style={{ maxWidth: 660 }}>
            {cta}
          </div>
        </div>
      ) : null}
    </div>
  );
}
