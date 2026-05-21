/**
 * wpHandoff.ts
 *
 * Client-side verification of WordPress → Lovable handoff tokens.
 *
 * Pattern: WP signs a payload with HMAC-SHA256 using a shared secret.
 * React verifies the signature client-side via Web Crypto API.
 * No edge function. No network call. Instant.
 *
 * URL shape:
 *   /book/entry?fn=John&ph=7574441234&loc=virginia-beach&svc=trt&em=j@x.com&ts=1716299400&sig=abc123...
 *
 * Payload string (must match PHP exactly):
 *   "{fn}|{ph}|{loc}|{svc}|{ts}"
 *
 * Security notes:
 *  - Tokens expire after TOKEN_TTL_SECONDS (default 600 = 10 min)
 *  - Secret is in VITE_WP_HANDOFF_SECRET env var — never commit to git
 *  - Worst-case forgery = someone pre-fills a form with fake name/phone
 *    (not a protected resource — acceptable risk)
 *  - PHI (name, phone, email) stored in sessionStorage only, never cookies/URL
 */

const TOKEN_TTL_SECONDS = 600; // 10 minutes

export interface WpHandoffPayload {
  firstName: string;
  phone: string;
  location?: string;
  service?: string;
  email?: string;
}

interface RawParams {
  fn?: string | null;
  ph?: string | null;
  loc?: string | null;
  svc?: string | null;
  em?: string | null;
  ts?: string | null;
  sig?: string | null;
}

function getSecret(): string {
  const secret = import.meta.env.VITE_WP_HANDOFF_SECRET as string | undefined;
  return secret ?? "";
}

/** Convert a hex string to a Uint8Array */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Verify the HMAC-SHA256 signature using Web Crypto API.
 * Returns true if valid and not expired.
 */
async function verifySignature(params: RawParams): Promise<boolean> {
  const { fn, ph, loc, svc, ts, sig } = params;

  // All required fields present
  if (!fn || !ph || !ts || !sig) return false;

  // Timestamp check
  const tsNum = parseInt(ts, 10);
  if (isNaN(tsNum)) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec - tsNum > TOKEN_TTL_SECONDS) {
    console.warn("[wpHandoff] token expired", { age: nowSec - tsNum });
    return false;
  }
  // Reject future-dated tokens (clock skew tolerance: 60s)
  if (tsNum - nowSec > 60) {
    console.warn("[wpHandoff] token from future");
    return false;
  }

  const secret = getSecret();
  if (!secret) {
    // No secret configured — skip verification, trust params (dev/staging only)
    if (import.meta.env.DEV) {
      console.warn("[wpHandoff] VITE_WP_HANDOFF_SECRET not set — skipping sig check in DEV");
      return true;
    }
    console.error("[wpHandoff] VITE_WP_HANDOFF_SECRET not set in production");
    return false;
  }

  // Build payload string — must match PHP exactly
  const payload = `${fn}|${ph}|${loc ?? ""}|${svc ?? ""}|${ts}`;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = hexToBytes(sig);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(payload)
    );
    return valid;
  } catch (e) {
    console.error("[wpHandoff] crypto verify error", e);
    return false;
  }
}

/**
 * Parse and verify a WP handoff from current URL params.
 *
 * Returns the verified payload, or null if missing/invalid/expired.
 * Call this once on mount in BookEntry.
 */
export async function parseWpHandoff(
  searchParams: URLSearchParams
): Promise<WpHandoffPayload | null> {
  const raw: RawParams = {
    fn:  searchParams.get("fn"),
    ph:  searchParams.get("ph"),
    loc: searchParams.get("loc"),
    svc: searchParams.get("svc"),
    em:  searchParams.get("em"),
    ts:  searchParams.get("ts"),
    sig: searchParams.get("sig"),
  };

  const ok = await verifySignature(raw);
  if (!ok) return null;

  return {
    firstName: raw.fn!,
    phone:     raw.ph!,
    location:  raw.loc ?? undefined,
    service:   raw.svc ?? undefined,
    email:     raw.em  ?? undefined,
  };
}
