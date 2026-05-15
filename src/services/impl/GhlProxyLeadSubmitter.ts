import { upsertContact } from "@/lib/ghlCalendars";
import type { ILeadSubmitter, LeadInput, LeadResult } from "@/services/contracts/ILeadSubmitter";

export class GhlProxyLeadSubmitter implements ILeadSubmitter {
  async submitLead(input: LeadInput): Promise<LeadResult> {
    const contactId = await upsertContact(input);
    return { contactId };
  }
}
