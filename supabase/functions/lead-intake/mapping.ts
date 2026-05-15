// Maps inbound payloads (Gravity Forms `input_*`, generic JSON) to one
// canonical lead shape. Add a new entry here to support a new external form.

export interface CanonicalLead {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  consent: boolean;
  service?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign_id?: string;
  utm_adgroup_id?: string;
  gclid?: string;
  fbclid?: string;
  landing_page_url?: string;
  form_source_label?: string;
  honeypot?: string;
  raw: Record<string, unknown>;
}

const pick = (b: Record<string, unknown>, ...keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = b[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return undefined;
};

export function mapToCanonical(
  body: Record<string, unknown>,
  refererUrl?: string,
): CanonicalLead {
  // Gravity Forms (form id 1) field IDs are present, OR generic JSON keys.
  const fullName = pick(body, "input_23", "fullName", "name", "full_name") ?? "";
  const email = pick(body, "input_3", "email", "emailAddress");
  const phone = pick(body, "input_4", "phone", "phoneNumber", "phone_number");
  const location = pick(body, "input_5", "location", "city");

  // Gravity checkbox: input_26.1 only present when checked. JSON: consent/tcpa.
  const consentRaw = body["input_26.1"] ?? body["consent"] ?? body["tcpa"];
  const consent = Boolean(
    consentRaw && (typeof consentRaw === "string" ? consentRaw.length > 0 : consentRaw),
  );

  return {
    fullName,
    email,
    phone,
    location,
    consent,
    service: pick(body, "service"),
    utm_source: pick(body, "input_12", "utm_source"),
    utm_medium: pick(body, "input_13", "utm_medium"),
    utm_campaign_id: pick(body, "input_14", "utm_campaign", "utm_campaign_id"),
    utm_adgroup_id: pick(body, "input_15", "utm_adgroup_id"),
    gclid: pick(body, "input_16", "gclid"),
    fbclid: pick(body, "input_17", "fbclid"),
    landing_page_url: pick(body, "input_20", "page_url", "landing_page_url") ?? refererUrl,
    form_source_label: pick(body, "input_11", "source"),
    // Gravity honeypot field id 27 (per the markup: "This field is for
    // validation purposes and should be left unchanged.")
    honeypot: pick(body, "input_27", "phone_hp", "website_hp"),
    raw: body,
  };
}

export function splitName(full: string): { firstName: string; lastName?: string } {
  const trimmed = full.trim().replace(/\s+/g, " ");
  if (!trimmed) return { firstName: "Guest" };
  const [first, ...rest] = trimmed.split(" ");
  return { firstName: first, lastName: rest.length ? rest.join(" ") : undefined };
}
