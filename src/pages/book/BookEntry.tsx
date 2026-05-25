/**
 * BookEntry — /book/entry?t=<token>
 *
 * Receives a single-use opaque token issued by the Supabase lead-intake edge
 * function, exchanges it for an identity payload via wp-token-exchange, seeds
 * the booking store, then routes into the funnel.
 *
 * The token is an opaque 64-char hex string — no PHI ever touches the URL.
 * The token itself is stripped from history before the async exchange begins.
 *
 * Debug mode: append &debug=1 to preserve the URL and render diagnostics
 * instead of redirecting. Safe to share — the token is single-use so it
 * will already be spent by the time anyone inspects it.
 *
 * Happy path:  /book/entry?t=<token> → /book/symptom
 * Failure path: anything invalid → /  (silent unless debug=1)
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBookingStore, isKnownService } from "@/domain/booking/bookingStore";
import { PHONE }                            from "@/lib/constants";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenIdentity {
  first_name: string;
  last_name:  string | null;
  email:      string | null;
  phone:      string;
  contact_id: string;
  location:   string | null;
  service:    string | null;
  source:     string;
}

interface DebugInfo {
  reason:         string;
  tokenPresent:   boolean;
  tokenLength:    number | null;
  host:           string;
  identity?:      Partial<TokenIdentity>;
}

// ── Token exchange ────────────────────────────────────────────────────────────

async function exchangeToken(token: string): Promise<
  | { ok: true;  identity: TokenIdentity }
  | { ok: false; reason: string }
> {
  // Call the edge function directly via fetch so we get a reliable status code.
  // supabase-js functions.invoke buries HTTP errors in FunctionsHttpError without
  // a stable .status field, which made every non-2xx look like "exchange_error".
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wp-token-exchange`;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[BookEntry] network error contacting wp-token-exchange", err);
    return { ok: false, reason: "network_error" };
  }

  let data: Record<string, unknown> = {};
  try {
    data = await resp.json();
  } catch {
    // Keep going — status code is the primary signal.
  }

  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error("[BookEntry] wp-token-exchange non-2xx", { status: resp.status, body: data });
    if (resp.status === 410) return { ok: false, reason: "token_expired_or_used" };
    if (resp.status === 404) return { ok: false, reason: "token_not_found" };
    if (resp.status === 400) return { ok: false, reason: "bad_request" };
    if (resp.status === 401 || resp.status === 403) return { ok: false, reason: "unauthorized" };
    return { ok: false, reason: `exchange_error_${resp.status}` };
  }

  if (!data?.ok || !data?.identity) {
    return { ok: false, reason: "bad_response" };
  }

  return { ok: true, identity: data.identity as TokenIdentity };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BookEntry() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const processed      = useRef(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    // Strict-mode / double-mount guard
    if (processed.current) return;
    processed.current = true;

    // The <head> PHI guard in index.html strips the query string from every
    // /book/* URL *before* React mounts and stashes the original search on
    // window.__MWC_BOOK_ENTRY_SEARCH__. Prefer that, fall back to React's
    // useSearchParams (covers dev / no-guard scenarios).
    const preservedSearch =
      typeof window !== "undefined"
        ? (window as { __MWC_BOOK_ENTRY_SEARCH__?: string }).__MWC_BOOK_ENTRY_SEARCH__
        : undefined;
    const effectiveParams = preservedSearch
      ? new URLSearchParams(preservedSearch)
      : searchParams;

    const token     = effectiveParams.get("t")?.trim() ?? "";
    const debugMode = effectiveParams.get("debug") === "1";
    const host      = typeof window !== "undefined" ? window.location.host : "";

    // eslint-disable-next-line no-console
    console.info("[BookEntry] handoff start", {
      host,
      debugMode,
      tokenPresent:  Boolean(token),
      tokenLength:   token.length || null,
      sourceOfQuery: preservedSearch ? "head-guard" : "useSearchParams",
    });

    const buildDebug = (reason: string, identity?: Partial<TokenIdentity>): DebugInfo => ({
      reason,
      tokenPresent: Boolean(token),
      tokenLength:  token.length || null,
      host,
      identity,
    });

    const fail = (reason: string) => {
      // eslint-disable-next-line no-console
      console.error("[BookEntry] handoff rejected", {
        reason,
        debugMode,
        tokenPresent: Boolean(token),
        tokenLength:  token.length || null,
        host,
      });
      if (debugMode) {
        setDebugInfo(buildDebug(reason));
        return;
      }
      // Don't dump the user on the homepage — keep them in the funnel via
      // the fallback lets-talk page, with the reason flagged for support.
      navigate(`/book/lets-talk?handoff=${encodeURIComponent(reason)}`, { replace: true });
    };

    if (!token) {
      fail("missing_token");
      return;
    }

    // URL is already sanitized by the head guard in production. In dev with
    // no guard, strip the token from history ourselves (unless debugging).
    if (!debugMode && !preservedSearch && typeof window !== "undefined") {
      window.history.replaceState({}, "", "/book/entry");
    }

    exchangeToken(token).then((result) => {
      if (result.ok === false) {
        fail(result.reason);
        return;
      }

      const { identity } = result;

      // eslint-disable-next-line no-console
      console.info("[BookEntry] handoff ok", {
        host,
        hasFirstName: Boolean(identity.first_name),
        hasPhone:     Boolean(identity.phone),
        hasEmail:     Boolean(identity.email),
        hasContactId: Boolean(identity.contact_id),
        service:      identity.service ?? null,
        location:     identity.location ?? null,
        source:       identity.source ?? null,
      });

      const store = useBookingStore.getState();
      store.reset();
      store.patch({
        identity: {
          firstName:    identity.first_name,
          phone:        identity.phone,
          email:        identity.email ?? "",
          // Carry the GHL contact_id so the booking step links the appointment
          // back to the existing contact instead of creating a duplicate.
          ghlContactId: identity.contact_id,
        },
        service:  isKnownService(identity.service) ? identity.service : undefined,
        location: identity.location ?? undefined,
        source:   identity.source ?? "wordpress-handoff",
      });

      if (debugMode) {
        setDebugInfo({
          ...buildDebug("ok — would route to /book/symptom", identity),
        });
        return;
      }

      navigate("/book/symptom", { replace: true });
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[BookEntry] unexpected error", err);
      fail("unexpected_error");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (debugInfo) {
    return <DebugPanel info={debugInfo} />;
  }

  return <LoadingScreen />;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--brand-navy-deep)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          // hardcoded-color-allow-next-line
          border: "3px solid rgba(232,103,10,0.25)",
          borderTopColor: "var(--brand-cta)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "var(--c-text-on-dark-muted)", fontSize: 16, fontFamily: "Inter, sans-serif" }}>
        Setting up your visit…
      </p>
      <p style={{ color: "var(--c-footnote-on-dark)", fontSize: 14, fontFamily: "Inter, sans-serif" }}>
        Having trouble?{" "}
        <a href={PHONE.tel} style={{ color: "var(--brand-cta)", textDecoration: "none" }}>
          {PHONE.display}
        </a>
      </p>
    </div>
  );
}

const REASON_HINTS: Record<string, string> = {
  missing_token:        "No ?t= parameter in the URL. Check the redirect URL returned by lead-intake.",
  token_not_found:      "Token doesn't exist in the database. May have been issued against a different environment.",
  token_expired_or_used:"Token is either past its 15-minute TTL or was already consumed. Single-use tokens cannot be replayed.",
  exchange_error:       "wp-token-exchange returned an unexpected error. Check Supabase function logs.",
  network_error:        "Failed to reach the wp-token-exchange function. Check CORS config and Supabase project health.",
  bad_response:         "wp-token-exchange returned 200 but the response shape was unexpected.",
  unexpected_error:     "An unhandled exception occurred. Check the browser console.",
};

function DebugPanel({ info }: { info: DebugInfo }) {
  const isOk = info.reason.startsWith("ok");
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--brand-navy-deep)",
        color: "rgba(255,255,255,0.92)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, marginBottom: 16, fontFamily: "Inter, sans-serif" }}>
          BookEntry diagnostics
        </h1>
        <p style={{ marginBottom: 8 }}>
          <strong>Status: </strong>
          <span style={{ color: isOk ? "#7CFFB2" : "#FF8A8A" }}>{info.reason}</span>
        </p>
        {REASON_HINTS[info.reason] && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, marginBottom: 16 }}>
            {REASON_HINTS[info.reason]}
          </p>
        )}
        <pre
          style={{
            background: "rgba(0,0,0,0.35)",
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(info, null, 2)}
        </pre>
        <div style={{ marginTop: 20, fontFamily: "Inter, sans-serif", fontSize: 13 }}>
          <a href="/" style={{ color: "var(--brand-cta)" }}>← back home</a>
          {"  ·  "}
          <a href={PHONE.tel} style={{ color: "var(--brand-cta)" }}>{PHONE.display}</a>
        </div>
      </div>
    </div>
  );
}
