/**
 * Admin auth utilities — shared session helpers.
 * Separated from AdminLogin component to satisfy react-refresh lint rules.
 */

export const ADMIN_SESSION_KEY = "mwc_admin_v2";

export function isAdminUnlocked(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok";
  } catch {
    return false;
  }
}

export function setAdminUnlocked(): void {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
  } catch { /* ignore */ }
}
