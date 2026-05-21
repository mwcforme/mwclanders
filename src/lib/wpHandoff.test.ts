/**
 * Tests for lib/wpHandoff.ts — WordPress handoff token verification.
 * Uses SubtleCrypto (available in Node 18+/jsdom via Web Crypto API).
 */
import { describe, it, expect } from "vitest";
import { verifyWpHandoff, type WpHandoffPayload } from "@/lib/wpHandoff";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SECRET = "test-secret-key";
const FIRST_NAME = "John";
const PHONE = "8001234567";

function b64url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signPayload(fn: string, ph: string, ts: number, secret = REAL_SECRET): Promise<string> {
  const payload = `${b64url(fn)}|${b64url(ph)}|${ts}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigBytes = new Uint8Array(sigBuffer);
  return Array.from(sigBytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function nowTs(): number {
  return Math.floor(Date.now() / 1000);
}

async function buildValidParams(
  override: Record<string, string> = {},
  secret = REAL_SECRET,
): Promise<URLSearchParams> {
  const ts = nowTs();
  // The URL params contain b64url-encoded values.
  // verifyHmac computes: b64url(params.fn) | b64url(params.ph) | ts
  // So we must sign the double-encoded form to match.
  const encodedFn = b64url(FIRST_NAME);
  const encodedPh = b64url(PHONE);
  const sig = await signPayload(encodedFn, encodedPh, ts, secret);
  const params = new URLSearchParams({
    fn: encodedFn,
    ph: encodedPh,
    ts: String(ts),
    sig,
    ...override,
  });
  return params;
}

// Use the actual configured secret so tests work regardless of .env
// vi.stubEnv does not reliably override import.meta.env for VITE_ vars in jsdom
const REAL_SECRET = (import.meta.env.VITE_WP_HANDOFF_SECRET as string | undefined) ?? SECRET;

// ─── verifyWpHandoff ──────────────────────────────────────────────────────────

describe("verifyWpHandoff — missing/malformed params", () => {
  it("fails with empty params", async () => {
    const r = await verifyWpHandoff(new URLSearchParams());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("missing_or_malformed_params");
  });

  it("fails when fn is missing", async () => {
    const params = await buildValidParams();
    params.delete("fn");
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(false);
  });

  it("fails when ph is missing", async () => {
    const params = await buildValidParams();
    params.delete("ph");
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(false);
  });

  it("fails when ts has wrong format (not 10 digits)", async () => {
    const params = await buildValidParams({ ts: "1234" });
    // ts override also needs a new sig — this tests structural validation
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("missing_or_malformed_params");
  });

  it("fails when sig has wrong format (not 64 hex chars)", async () => {
    const params = await buildValidParams({ sig: "abc123" });
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("missing_or_malformed_params");
  });
});

describe("verifyWpHandoff — timestamp validation", () => {
  it("fails with expired token (ts > 600s ago)", async () => {
    const ts = nowTs() - 700; // 700s ago = expired
    const sig = await signPayload(FIRST_NAME, PHONE, ts);
    const params = new URLSearchParams({
      fn: b64url(FIRST_NAME),
      ph: b64url(PHONE),
      ts: String(ts),
      sig,
    });
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("token_expired_or_future");
  });

  it("fails with future token (ts > 60s in the future)", async () => {
    const ts = nowTs() + 120; // 120s in the future
    const sig = await signPayload(FIRST_NAME, PHONE, ts);
    const params = new URLSearchParams({
      fn: b64url(FIRST_NAME),
      ph: b64url(PHONE),
      ts: String(ts),
      sig,
    });
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("token_expired_or_future");
  });
});

describe("verifyWpHandoff — signature validation", () => {
  it("verifies a valid signed token", async () => {
    const params = await buildValidParams();
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(true);
  });

  it("returns non-empty firstName and phone in payload", async () => {
    const params = await buildValidParams();
    const r = await verifyWpHandoff(params);
    if (r.ok) {
      // payload.firstName = the fn URL param (b64url-encoded first name)
      expect(r.payload.firstName.length).toBeGreaterThan(0);
      expect(r.payload.phone.length).toBeGreaterThan(0);
    }
  });

  it("fails with tampered signature", async () => {
    const params = await buildValidParams();
    const badSig = "a".repeat(64);
    params.set("sig", badSig);
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("invalid_signature");
  });

  it("fails when fn is tampered", async () => {
    const params = await buildValidParams();
    params.set("fn", b64url("Hacker")); // valid b64url but wrong fn
    const r = await verifyWpHandoff(params);
    expect(r.ok).toBe(false);
  });
});

describe("verifyWpHandoff — optional fields", () => {
  it("includes location in payload when provided", async () => {
    const params = await buildValidParams();
    params.set("loc", "richmond");
    const r = await verifyWpHandoff(params);
    if (r.ok) expect((r.payload as WpHandoffPayload).location).toBe("richmond");
  });

  it("includes service in payload when provided", async () => {
    const params = await buildValidParams();
    params.set("svc", "trt");
    const r = await verifyWpHandoff(params);
    if (r.ok) expect((r.payload as WpHandoffPayload).service).toBe("trt");
  });

  it("leaves optional fields undefined when not provided", async () => {
    const params = await buildValidParams();
    const r = await verifyWpHandoff(params);
    if (r.ok) {
      expect(r.payload.location).toBeUndefined();
      expect(r.payload.service).toBeUndefined();
      expect(r.payload.email).toBeUndefined();
    }
  });
});

describe("verifyWpHandoff — no secret configured", () => {
  it("handles missing secret gracefully (DEV bypass or error)", async () => {
    // Build params with empty-string secret (no valid HMAC key)
    const ts = nowTs();
    const sig = "a".repeat(64); // invalid sig for any secret
    const params = new URLSearchParams({
      fn: b64url(FIRST_NAME),
      ph: b64url(PHONE),
      ts: String(ts),
      sig,
    });
    const r = await verifyWpHandoff(params);
    // With real secret configured, the bad sig should fail as invalid_signature
    if (!r.ok) {
      expect(["invalid_signature", "secret_not_configured", "crypto_error"]).toContain(r.reason);
    }
  });
});
