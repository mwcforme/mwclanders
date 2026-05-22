/**
 * AdminFeedback — Reusable loading/error/empty states for admin pages.
 */
import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export function AdminError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
    >
      <AlertCircle size={14} className="shrink-0" />
      {message}
    </div>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-2 py-6 text-white/50"
      role="status"
      aria-label={label}
    >
      <Loader2 size={16} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function AdminEmpty({
  message,
  colSpan = 6,
}: {
  message: string;
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-white/40">
        {message}
      </td>
    </tr>
  );
}
