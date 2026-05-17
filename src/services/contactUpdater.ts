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

export interface ContactFields {
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

const env = (): string =>
  typeof import.meta !== "undefined"
    ? ((import.meta as { env?: { VITE_APP_ENV?: string } }).env?.VITE_APP_ENV ?? "stage")
    : "stage";

async function invokeGhlProxy(
  path: string,
  method: "PUT" | "POST",
  body: Record<string, unknown>,
): Promise<void> {
  const { supabase } = await import("@/integrations/supabase/client");
  supabase.functions
    .invoke("ghl-proxy", { body: { path, method, body, __env: env() } })
    .catch(() => { /* non-blocking — UX must never depend on this */ });
}

export const contactUpdater: IContactUpdater = {
  updateContact(contactId, fields) {
    return invokeGhlProxy(`/contacts/${contactId}`, "PUT", fields as Record<string, unknown>);
  },

  addTag(contactId, tag) {
    return invokeGhlProxy(`/contacts/${contactId}/tags`, "POST", { tags: [tag] });
  },
};
