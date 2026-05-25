/**
 * wp-token-exchange
 *
 * Consumes a single-use 15-minute token issued by lead-intake, returns the
 * identity payload needed to seed the React booking store. Token is marked
 * used on first call — replay attacks return 410.
 *
 * Called client-side from /book/entry?t=<token>
 */
import { corsHeadersFor, jsonResponse as json, corsResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);
  if (req.method !== "POST") return json(405, { ok: false, error: "method not allowed" });

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "invalid json" });
  }

  const token = (body.token ?? "").trim();
  if (!token || token.length < 16) return json(400, { ok: false, error: "token required" });

  const db = createAdminClient();

  // Fetch + validate token in one query
  const { data: row, error } = await db
    .from("wp_intake_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !row) {
    return json(404, { ok: false, error: "token not found" });
  }

  if (row.used) {
    return json(410, { ok: false, error: "token already used" });
  }

  if (new Date(row.expires_at) < new Date()) {
    return json(410, { ok: false, error: "token expired" });
  }

  // Mark used atomically
  const { error: updateErr } = await db
    .from("wp_intake_tokens")
    .update({ used: true })
    .eq("token", token)
    .eq("used", false); // optimistic lock

  if (updateErr) {
    console.error("[wp-token-exchange] failed to mark used", updateErr);
    return json(500, { ok: false, error: "internal error" });
  }

  return json(200, {
    ok: true,
    identity: {
      first_name: row.first_name,
      last_name: row.last_name ?? null,
      email: row.email ?? null,
      phone: row.phone,
      contact_id: row.contact_id,
      location: row.location ?? null,
      service: row.service ?? null,
      source: row.source ?? "wordpress-intake",
    },
  });
});
