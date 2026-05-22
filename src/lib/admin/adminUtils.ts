/**
 * adminUtils.ts — Shared utilities for all admin pages.
 *
 * Centralises: status pill classes, timeAgo, loading/error UI helpers.
 * Import from here instead of duplicating across admin pages.
 */

// Status → accessible label (text + symbol, works in B&W)
export const STATUS_LABEL: Record<string, { symbol: string; label: string }> = {
  booked:   { symbol: "✓", label: "Booked" },
  synced:   { symbol: "✓", label: "Synced" },
  ok:       { symbol: "✓", label: "OK" },
  partial:  { symbol: "◐", label: "Partial" },
  pending:  { symbol: "○", label: "Pending" },
  captured: { symbol: "●", label: "Captured" },
  failed:   { symbol: "✗", label: "Failed" },
  running:  { symbol: "↻", label: "Running" },
};

// Status → Tailwind classes (color + border + bg, for dark mode)
export const STATUS_CLASSES: Record<string, string> = {
  booked:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  synced:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  ok:       "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  partial:  "bg-amber-500/15  text-amber-300  border-amber-500/30",
  pending:  "bg-amber-500/15  text-amber-300  border-amber-500/30",
  captured: "bg-blue-500/15   text-blue-300   border-blue-500/30",
  failed:   "bg-red-500/15    text-red-300    border-red-500/30",
  running:  "bg-amber-500/15  text-amber-300  border-amber-500/30",
};

export const DEFAULT_STATUS_CLASSES = "bg-white/8 text-white/60 border-white/10";

/**
 * Human-readable relative time, e.g. "3m ago", "2h ago".
 */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
