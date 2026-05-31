/**
 * Contract for submitting a captured lead to the downstream CRM.
 */
export type MwcCustomFieldKey =
  | "mwc_symptom"
  | "mwc_symptom_duration"
  | "mwc_urgency_tier"
  | "mwc_clinical_note"
  | "mwc_funnel_service"
  | "mwc_lp_slug";

export type MwcCustomFields = Partial<Record<MwcCustomFieldKey, string>>;

export interface LeadInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  /** Location key for GHL location tag (richmond / virginia-beach / newport-news). */
  location?: string;
  tags?: string[];
  /** Marketing attribution for GHL custom fields (utm, gclid, fbclid, landing page). */
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    gclid?: string;
    fbclid?: string;
    msclkid?: string;
    landing_page_url?: string;
  };
  /** PHI-safe structured fields written to GHL contact custom fields only. */
  customFields?: MwcCustomFields;
}

export interface LeadResult {
  contactId: string;
}

export interface ILeadSubmitter {
  submitLead(input: LeadInput): Promise<LeadResult>;
}
