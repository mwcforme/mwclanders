/**
 * wpHandoff.ts — WordPress → Lovable handoff token verification + partial lead capture
 *
 * Verifies an HMAC-SHA256 signed token produced by WordPress and
 * returns the verified payload so BookEntry can seed the booking store.
 *
 * Encoding contract (both sides must match exactly):
 *   payload = base64url( utf8bytes(firstName) )
 *           + "|"
 *           + base64url( utf8bytes(phone) )
 *           + "|"
 *           + unixTimestampSeconds
 *
 * base64url here means: standard base64 of the UTF-8 byte sequence,
 * with + → -, / → _, trailing = stripped.
 *
 * Using TextEncoder (not btoa) guarantees correct UTF-8 byte encoding
 * for ALL input including accented chars, unicode names, etc.
 * PHP's base64_encode() operates on raw bytes — identical result.
 *
 * Only firstName + phone are signed. Optional fields (location, service,
 * email) ride in the URL unsigned — worst-case tamper is a wrong clinic
 * pre-selection, not a data breach.
 */

// ── Config ───────────────────────────────────────────────────────────────────

const TTL_SECONDS     = 600; // 10 minutes
const CLOCK_SKEW_SEC  = 60;  // tolerate 60s of server/client clock drift
const TS_PATTERN      = /^\d{10}$/;
const SIG_PATTERN     = /^[0-9a-f]{64}$/;

// ── Types ────────────────────────────────────────────────────────────────────

export interface WpHandoffPayload {
  readonly firstName: string;
  readonly phone:     string;
  readonly location?: string;
  readonly service?:  string;
  readonly email?:    string;
}

/** Internal — shape after param extraction, before verification */
interface HandoffParams {
  readonly fn:  string;
  readonly ph:  string;
  readonly ts:  string;
  readonly sig: string;
  readonly loc: string | null;
  readonly svc: string | null;
  readonly em:  string | null;
}

type VerificationResult =
  | { ok: true;  payload: WpHandoffPayload }
  | { ok: false; reason: string };

// ── Encoding ─────────────────────────────────────────────────────────────────

/**
 * base64url-encode a string using its UTF-8 byte representation.
 *
 * Uses TextEncoder so multibyte characters (accented, unicode, etc.)
 * encode identically to PHP's base64_encode() on the same UTF-8 bytes.
 *
 * btoa() is intentionally NOT used here — it chokes on code points > 255.
 */
function b64url(value: string): string {
  const bytes  = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ── Param extraction ─────────────────────────────────────────────────────────

function extractParams(search: URLSearchParams): HandoffParams | null {
  const fn  = search.get("fn")?.trim()  ?? "";
  const ph  = search.get("ph")?.trim()  ?? "";
  const ts  = search.get("ts")?.trim()  ?? "";
  const sig = search.get("sig")?.trim() ?? "";

  // Required fields present
  if (!fn || !ph || !ts || !sig) return null;

  // Structural validation before touching crypto
  if (!TS_PATTERN.test(ts))   return null; // must be 10-digit unix timestamp
  if (!SIG_PATTERN.test(sig)) return null; // must be 64-char lowercase hex

  return {
    fn, ph, ts, sig,
    loc: search.get("loc"),
    svc: search.get("svc"),
    em:  search.get("em"),
  };
}

// ── Timestamp check ──────────────────────────────────────────────────────────

function isTimestampValid(ts: string): boolean {
  const issued = parseInt(ts, 10);
  const now    = Math.floor(Date.now() / 1000);

  if (now - issued > TTL_SECONDS)   return false; // expired
  if (issued - now > CLOCK_SKEW_SEC) return false; // too far in the future
  return true;
}

// ── HMAC verification ────────────────────────────────────────────────────────

async function verifyHmac(params: HandoffParams, secret: string): Promise<boolean> {
  const payload = `${b64url(params.fn)}|${b64url(params.ph)}|${params.ts}`;

  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,       // not extractable
    ["verify"],
  );

  // Convert 64-char hex sig → Uint8Array
  const sigBytes = Uint8Array.from(
    { length: params.sig.length / 2 },
    (_, i) => parseInt(params.sig.slice(i * 2, i * 2 + 2), 16),
  );

  return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
}

// ── Partial lead capture ─────────────────────────────────────────────────────

/**
 * Fire-and-forget: upsert a partial GHL contact immediately when a WP handoff
 * is verified. This captures the lead even if the user abandons before booking.
 *
 * Tagged source:wp-form + status:partial so coordinators can run follow-up
 * sequences on drop-offs. BookContact's upsertContact call later updates the
 * same contact (GHL deduplicates on phone number).
 *
 * Non-blocking — never throws to caller.
 */
export function pushWpPartialLead(payload: WpHandoffPayload): void {
  import("@/lib/ghlCalendars").then(({ upsertContact }) =>
    upsertContact({
      firstName: payload.firstName,
      phone:     `+1${payload.phone.replace(/\D/g, "")}`,
      ...(payload.email    ? { email: payload.email }       : {}),
      source: "wordpress-form",
      tags:   ["source:wp-form", "status:partial"],
      ...(payload.service  ? { customFields: { mwc_funnel_service: payload.service } } : {}),
    })
  ).catch((err) => {
    // Non-blocking — log in dev, silent in prod
    if (import.meta.env.DEV) console.warn("[wpHandoff] partial lead push failed", err);
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Verify and parse a WP handoff from URL search params.
 *
 * Designed to be called exactly once, immediately after the component mounts,
 * with params captured before any async gap.
 *
 * Returns a VerificationResult — caller decides how to handle failure reason.
 */
export async function verifyWpHandoff(
  search: URLSearchParams,
): Promise<VerificationResult> {
  const params = extractParams(search);
  if (!params) {
    return { ok: false, reason: "missing_or_malformed_params" };
  }

  if (!isTimestampValid(params.ts)) {
    return { ok: false, reason: "token_expired_or_future" };
  }

  const secret = (import.meta.env.VITE_WP_HANDOFF_SECRET as string | undefined) ?? "";

  if (!secret) {
    if (import.meta.env.DEV) {
      console.warn("[wpHandoff] no secret — trusting params in DEV");
    } else {
      return { ok: false, reason: "secret_not_configured" };
    }
  }

  let valid = false;
  try {
    valid = secret ? await verifyHmac(params, secret) : true; // DEV bypass
  } catch (err) {
    console.error("[wpHandoff] crypto error", err);
    return { ok: false, reason: "crypto_error" };
  }

  if (!valid) {
    return { ok: false, reason: "invalid_signature" };
  }

  return {
    ok: true,
    payload: {
      firstName: params.fn,
      phone:     params.ph,
      location:  params.loc ?? undefined,
      service:   params.svc ?? undefined,
      email:     params.em  ?? undefined,
    },
  };
}
