/**
 * wpHandoff.ts
 *
 * Client-side receiver for WordPress → Lovable booking handoff.
 *
 * SOLID principles applied:
 *  - Single Responsibility: this module only verifies + parses handoff tokens
 *  - Open/Closed: token TTL and payload shape are configurable constants
 *  - Interface Segregation: WpHandoffPayload exposes only what callers need
 *  - Dependency Inversion: crypto.subtle is the only external dependency
 *
 * Security contract:
 *  - ONLY fn (first name) + ph (phone) are signed — minimal attack surface
 *  - Optional fields (loc, svc, em) are passed but NOT included in the signature
 *    Rationale: worst case someone tampers loc/svc = wrong clinic pre-selected,
 *    not a security breach. Signing only required fields keeps PHP/JS in sync.
 *  - Token expires after TOKEN_TTL_SECONDS
 *  - PHI never written to cookies, URL history, or analytics
 *
 * Payload signed (must match PHP exactly):
 *   base64url(fn) + "|" + base64url(ph) + "|" + ts
 *
 * Both sides base64url-encode each field before joining.
 * This eliminates ALL special character / encoding mismatch issues.
 */

const TOKEN_TTL_SECONDS = 600; // 10 minutes

// ── Types ────────────────────────────────────────────────────────────────────

export interface WpHandoffPayload {
  readonly firstName: string;
  readonly phone:     string;
  readonly location?: string;
  readonly service?:  string;
  readonly email?:    string;
}

interface RawParams {
  fn:  string;
  ph:  string;
  loc: string | null;
  svc: string | null;
  em:  string | null;
  ts:  string;
  sig: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** base64url-encode a UTF-8 string — handles all unicode / special chars */
function b64url(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Hex string → Uint8Array */
function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array(0);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/** Read the shared secret from Vite env — never falls back to a default */
function getSecret(): string {
  return (import.meta.env.VITE_WP_HANDOFF_SECRET as string | undefined) ?? "";
}

// ── Validation ───────────────────────────────────────────────────────────────

function extractParams(searchParams: URLSearchParams): RawParams | null {
  const fn  = searchParams.get("fn")?.trim()  ?? "";
  const ph  = searchParams.get("ph")?.trim()  ?? "";
  const ts  = searchParams.get("ts")?.trim()  ?? "";
  const sig = searchParams.get("sig")?.trim() ?? "";

  if (!fn || !ph || !ts || !sig) return null;

  // ts must be a unix timestamp (10 digits, all numeric)
  if (!/^\d{10}$/.test(ts)) return null;

  // sig must be a 64-char lowercase hex string (SHA-256 output)
  if (!/^[0-9a-f]{64}$/.test(sig)) return null;

  return {
    fn,
    ph,
    loc: searchParams.get("loc"),
    svc: searchParams.get("svc"),
    em:  searchParams.get("em"),
    ts,
    sig,
  };
}

function checkTimestamp(ts: string): boolean {
  const tsNum  = parseInt(ts, 10);
  const nowSec = Math.floor(Date.now() / 1000);

  if (nowSec - tsNum > TOKEN_TTL_SECONDS) {
    console.warn("[wpHandoff] token expired", { ageSeconds: nowSec - tsNum });
    return false;
  }
  // Reject tokens from the future (60s clock skew tolerance)
  if (tsNum - nowSec > 60) {
    console.warn("[wpHandoff] token timestamp is in the future");
    return false;
  }
  return true;
}

// ── Signature verification ───────────────────────────────────────────────────

async function verifySignature(raw: RawParams): Promise<boolean> {
  const secret = getSecret();

  if (!secret) {
    if (import.meta.env.DEV) {
      console.warn("[wpHandoff] VITE_WP_HANDOFF_SECRET not set — skipping verification in DEV");
      return true;
    }
    console.error("[wpHandoff] VITE_WP_HANDOFF_SECRET not configured in production");
    return false;
  }

  // Payload: base64url(fn) | base64url(ph) | ts
  // Matches PHP: base64url_encode($fn) . '|' . base64url_encode($ph) . '|' . $ts
  const payload = `${b64url(raw.fn)}|${b64url(raw.ph)}|${raw.ts}`;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(raw.sig),
      encoder.encode(payload)
    );
  } catch (err) {
    console.error("[wpHandoff] crypto.subtle.verify threw", err);
    return false;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse and verify a WP handoff from the current URL search params.
 *
 * Returns a verified WpHandoffPayload, or null if params are
 * missing / malformed / signature invalid / token expired.
 *
 * Call once on mount in BookEntry. Never call twice (idempotent but wasteful).
 */
export async function parseWpHandoff(
  searchParams: URLSearchParams
): Promise<WpHandoffPayload | null> {
  const raw = extractParams(searchParams);
  if (!raw) return null;

  if (!checkTimestamp(raw.ts)) return null;

  const valid = await verifySignature(raw);
  if (!valid) return null;

  return {
    firstName: raw.fn,
    phone:     raw.ph,
    location:  raw.loc ?? undefined,
    service:   raw.svc ?? undefined,
    email:     raw.em  ?? undefined,
  };
}
