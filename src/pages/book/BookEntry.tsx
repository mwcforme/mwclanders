/**
 * /book/entry?t=<token>
 *
 * Token-exchange handoff page for WordPress → booking funnel.
 *
 * Flow:
 *  1. WordPress Gravity Form submits to lead-intake edge function
 *  2. Edge function creates GHL contact + issues a 15-min signed token
 *  3. WP redirects user to /book/entry?t=<token>
 *  4. This page exchanges the token for identity, seeds the booking store,
 *     then redirects to /book/symptom — no PHI ever in the URL beyond this point
 *
 * Security:
 *  - Token is single-use (consumed on exchange)
 *  - 15-minute TTL
 *  - Exchange happens server-side via Supabase edge function
 *  - No identity written to URL, history, or analytics
 */
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// supabase loaded lazily inside exchangeToken — not needed at module parse time
import { useBookingStore } from "@/domain/booking/bookingStore";
import { PHONE } from "@/lib/constants";

const BookEntry = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = params.get("t");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // Strip the token from the URL immediately (PHI hygiene)
    window.history.replaceState(null, "", "/book/entry");

    exchangeToken(token).then((identity) => {
      if (!identity) {
        // Token invalid/expired — send back to LP
        navigate("/", { replace: true });
        return;
      }

      // Seed booking store exactly like enterBookingFunnel
      const store = useBookingStore.getState();
      store.reset();
      store.patch({
        identity: {
          firstName: identity.first_name,
          lastName: identity.last_name ?? undefined,
          email: identity.email ?? "",
          phone: identity.phone,
          ghlContactId: identity.contact_id,
        },
        service: identity.service ?? undefined,
        location: identity.location ?? undefined,
        source: identity.source ?? "wordpress-intake",
      });

      navigate("/book/symptom", { replace: true });
    });
  }, [navigate, params]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B1029",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        gap: 16,
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid rgba(232,103,10,0.25)",
          borderTopColor: "#E8670A",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 14 }}>
        Setting up your visit…
      </p>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
        Having trouble?{" "}
        <a href={PHONE.tel} style={{ color: "#E8670A", textDecoration: "none" }}>
          {PHONE.display}
        </a>
      </p>
    </div>
  );
};

// ── Token exchange via Supabase edge function ──────────────────────────────

interface TokenPayload {
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone: string;
  contact_id: string;
  location?: string | null;
  service?: string | null;
  source?: string | null;
}

async function exchangeToken(token: string): Promise<TokenPayload | null> {
  try {
    const supabase = await import("@/integrations/supabase/client").then(m => m.supabase);
    const { data, error } = await supabase.functions.invoke("wp-token-exchange", {
      body: { token },
    });
    if (error || !data?.ok) {
      console.warn("[book-entry] token exchange failed", error ?? data);
      return null;
    }
    return data.identity as TokenPayload;
  } catch (e) {
    console.error("[book-entry] exchange error", e);
    return null;
  }
}

export default BookEntry;
