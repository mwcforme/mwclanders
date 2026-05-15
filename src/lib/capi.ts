// Client helper: fire a server-side conversion via the meta-capi edge function.
// Always pair with a client-side dataLayer push that uses the same event_id
// so Meta + GA4 dedupe browser and server events.
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";

export type CapiEventName =
  | "Lead"
  | "Schedule"
  | "InitiateCheckout"
  | "ViewContent"
  | "CompleteRegistration"
  | "Contact"
  | "SubmitApplication";

export interface CapiUserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  external_id?: string;
}

export interface CapiCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  lp_slug?: string;
}

export function makeEventId() {
  return crypto.randomUUID();
}

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export async function trackConversion(
  event_name: CapiEventName,
  opts: {
    event_id?: string;
    user_data?: CapiUserData;
    custom_data?: CapiCustomData;
  } = {}
) {
  const event_id = opts.event_id ?? makeEventId();
  const attr = getAttribution();
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");

  // Mirror client-side via dataLayer for GTM / Meta Pixel browser events.
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: event_name.toLowerCase(),
      event_id,
      ...opts.custom_data,
      utm_source: attr.utm_source,
      utm_campaign: attr.utm_campaign,
      lp_slug: opts.custom_data?.lp_slug,
    });
  }

  try {
    await supabase.functions.invoke("meta-capi", {
      body: {
        event_name,
        event_id,
        event_source_url:
          typeof window !== "undefined" ? window.location.href : "https://menswellnesscenters.com/",
        action_source: "website",
        user_data: {
          ...opts.user_data,
          fbp,
          fbc,
        },
        custom_data: {
          ...opts.custom_data,
          source: attr.utm_source,
          medium: attr.utm_medium,
          campaign: attr.utm_campaign,
        },
      },
    });
  } catch (err) {
    // Never block UX on tracking.
    console.warn("[capi] failed", err);
  }

  return event_id;
}
