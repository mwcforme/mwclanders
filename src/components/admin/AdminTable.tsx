/**
 * AdminTable — Reusable table primitives for admin pages.
 * Th, Td, and StatusPill (B&W accessible).
 */
import React from "react";
import { STATUS_CLASSES, STATUS_LABEL, DEFAULT_STATUS_CLASSES } from "@/lib/admin/adminUtils";

export const Th = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-3 font-semibold ${className ?? ""}`}>{children}</th>
);

export const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>
);

/**
 * StatusPill — accessible in both color and B&W.
 * Shows a symbol prefix (✓ / ✗ / ○ / ◐) so color is never the only indicator.
 */
export function StatusPill({ status }: { status: string }) {
  const classes = STATUS_CLASSES[status] ?? DEFAULT_STATUS_CLASSES;
  const meta = STATUS_LABEL[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {meta ? (
        <>
          <span aria-hidden="true" className="font-mono leading-none">
            {meta.symbol}
          </span>
          {meta.label}
        </>
      ) : (
        status
      )}
    </span>
  );
}
