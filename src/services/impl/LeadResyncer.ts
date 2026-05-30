/**
 * LeadResyncer — isolates the GHL resync call from the UI layer.
 * AdminLeads imports this service; it does not call supabase directly.
 */
import { supabase } from "@/integrations/supabase/legacy";

export interface ResyncResult {
  ok: boolean;
  contactId?: string;
  error?: string;
}

export interface ResyncLead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  source: string | null;
}

export async function resyncLead(lead: ResyncLead): Promise<ResyncResult> {
  const [firstName, ...rest] = (lead.name ?? "Guest").trim().split(/\s+/);
  const body = {
    firstName: firstName || "Guest",
    lastName: rest.join(" ") || undefined,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    location: lead.location ?? undefined,
    source: lead.source ?? "admin-resync",
    tags: ["book_react_app"],
  };

  const { data, error } = await supabase.functions.invoke("ghl-proxy", {
    body: { path: "/contacts/upsert", method: "POST", body },
  });

  if (error || !data?.ok) {
    const msg = data?.data?.message || error?.message || "GHL upsert failed";
    await supabase
      .from("lead_captures")
      .update({ crm_status: "failed", crm_error: msg })
      .eq("id", lead.id);
    return { ok: false, error: msg };
  }

  const contactId = data?.data?.contact?.id ?? data?.data?.id;
  await supabase
    .from("lead_captures")
    .update({ crm_status: "synced", crm_contact_id: contactId ?? null, crm_error: null })
    .eq("id", lead.id);
  return { ok: true, contactId };
}
