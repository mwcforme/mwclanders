/**
 * contactUpdater — abstraction over GHL contact mutations.
 *
 * All calls are fire-and-forget (non-blocking).  Callers should not
 * `await` the returned Promises for UX-critical paths; they are returned
 * only so callers can optionally attach error handlers.
 *
 * Previously these calls were scattered as inline `supabase.functions.invoke`
 * calls across BookLocation, BookSchedule, and BookConfirmed.  Centralising
 * them here makes the service layer testable and the call sites readable.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactFields {
  email?: string;
  customFields?: Record<string, string>;
  [key: string]: unknown;
}

export interface IContactUpdater {
  /** Fire-and-forget: PUT /contacts/:id with the provided fields. */
  updateContact(contactId: string, fields: Partial<ContactFields>): Promise<void>;
  /** Fire-and-forget: POST /contacts/:id/tags with a single tag. */
  addTag(contactId: string, tag: string): Promise<void>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

async function invokeGhlProxy(
  path: string,
  method: "PUT" | "POST",
  body: Record<string, unknown>,
): Promise<void> {
  // Lazy-import both supabase and the runtime env to keep this module lean.
  const [{ supabase }, { APP_ENV }] = await Promise.all([
    import("@/integrations/supabase/client"),
    import("@/lib/env"),
  ]);
  supabase.functions
    .invoke("ghl-proxy", { body: { path, method, body, __env: APP_ENV } })
    .catch(() => { /* non-blocking - UX must never depend on this */ });
}

export const contactUpdater: IContactUpdater = {
  updateContact(contactId, fields) {
    return invokeGhlProxy(`/contacts/${contactId}`, "PUT", fields as Record<string, unknown>);
  },

  addTag(contactId, tag) {
    return invokeGhlProxy(`/contacts/${contactId}/tags`, "POST", { tags: [tag] });
  },
};
