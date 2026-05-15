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
  tags?: string[];
  /** PHI-safe structured fields written to GHL contact custom fields only. */
  customFields?: MwcCustomFields;
}

export interface LeadResult {
  contactId: string;
}

export interface ILeadSubmitter {
  submitLead(input: LeadInput): Promise<LeadResult>;
}
