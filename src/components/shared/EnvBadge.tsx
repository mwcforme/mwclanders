import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { APP_ENV } from "@/lib/env";
import { hasEnvOverride, setEnvOverride } from "@/lib/envOverride";

/** Route prefixes where the badge is allowed to render. */
const ALLOWED_PREFIXES = ["/", "/wl", "/ed", "/quiz", "/book", "/lp"];

function isAllowed(pathname: string): boolean {
  const path = pathname.toLowerCase();
  if (path.startsWith("/admin")) return false;
  if (path === "/") return true;
  return ALLOWED_PREFIXES.some(
    (p) => p !== "/" && (path === p || path.startsWith(`${p}/`)),
  );
}

/**
 * Floating ENV badge for non-prod environments. Visible on funnels and landing
 * pages, click opens a small popover to flip Stage / Prod / Auto.
 */
export function EnvBadge() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Visible whenever we're not on prod GHL, or when a manual override is set
  // (so admins forcing prod from a stage host can still flip back).
  const visible = isAllowed(pathname) && (APP_ENV !== "prod" || hasEnvOverride());

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!visible) return null;

  const isStage = APP_ENV === "stage";
  const pillBg = isStage ? "#10b981" : "#ef4444"; // emerald for stage, red for prod-on-non-prod
  const label = isStage ? "ENV: STAGE" : "ENV: PROD";

  return (
    <div
      ref={wrapRef}
      className="fixed z-[60] left-3 bottom-3 md:bottom-3"
      style={{
        // lift above MobileFooterBar (56px) on mobile
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
    >
      <div className="md:hidden" style={{ height: 0 }} aria-hidden="true" />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Environment switcher"
        aria-expanded={open}
        className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-lg transition-opacity hover:opacity-90"
        style={{
          background: pillBg,
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.08em",
          // ensure it sits above mobile footer bar (56px)
          marginBottom:
            typeof window !== "undefined" && window.innerWidth < 768 ? 56 : 0,
        }}
      >
        {label}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-2 rounded-lg border border-white/10 bg-[#0B1029] p-2 shadow-2xl"
          style={{
            bottom: "100%",
            marginBottom: 8,
            minWidth: 140,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div className="px-2 pb-1 text-[9px] uppercase tracking-wider text-white/50">
            Switch env
          </div>
          {(["stage", "prod", "auto"] as const).map((key) => {
            const active = key !== "auto" && APP_ENV === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setEnvOverride(key)}
                className="block w-full rounded px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:bg-white/10"
                style={active ? { background: "rgba(255,255,255,0.12)", color: "#fff" } : undefined}
              >
                {key}
                {active && <span className="ml-1 text-white/50">•</span>}
              </button>
            );
          })}
          <div className="mt-1 border-t border-white/10 px-2 pt-1.5 text-[9px] uppercase tracking-wider text-white/40">
            Active: {APP_ENV}
          </div>
        </div>
      )}
    </div>
  );
}
