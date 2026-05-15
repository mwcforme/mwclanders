/**
 * Minimal CSV exporter for admin tables. Browser-only.
 * Handles quoting and escapes embedded quotes per RFC 4180.
 */
const escapeCell = (v: unknown): string => {
  if (v == null) return "";
  let s: string;
  if (typeof v === "string") s = v;
  else if (typeof v === "object") s = JSON.stringify(v);
  else s = String(v);
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
};

export function downloadCsv<T>(
  filename: string,
  rows: T[],
  columns: { key: keyof T; header: string }[],
): void {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(",");
  const dataLines = rows.map((r) =>
    columns.map((c) => escapeCell(r[c.key])).join(","),
  );
  const csv = [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
