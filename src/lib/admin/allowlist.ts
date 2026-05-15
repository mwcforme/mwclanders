/**
 * Hardcoded admin allowlist (frontend mirror).
 *
 * MUST be kept in sync with the Postgres function `public.is_admin_email`
 * (defined in the latest admin-allowlist migration). The DB function is the
 * authoritative gate — this list only drives the frontend redirect/flash so
 * non-admins don't briefly see admin chrome before bouncing.
 *
 * To add or remove an admin:
 *   1. Edit this array (keep entries lowercase).
 *   2. Edit `public.is_admin_email` via a new migration.
 */
export const ADMIN_EMAILS: readonly string[] = [
  "eobrien@mwcforme.com",
  "hammad@mwcforme.com",
];

export const isAdminEmail = (email: string | null | undefined): boolean =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());
