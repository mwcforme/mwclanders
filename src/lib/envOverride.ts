/**
 * Shared helpers for reading/writing the manual env override used by both
 * the admin EnvSwitcher and the public-facing floating EnvBadge.
 */

const STORAGE_KEY = "mwc_env_override";

export function setEnvOverride(next: "prod" | "stage" | "auto"): void {
  try {
    if (next === "auto") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  window.location.reload();
}

export function hasEnvOverride(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "prod" || v === "stage";
  } catch {
    return false;
  }
}
