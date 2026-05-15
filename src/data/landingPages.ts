export type LpStatus = "live" | "draft" | "scaffold";
export type LpService = "trt" | "ed" | "weight-loss" | "general";

export interface LandingPageEntry {
  slug: string;
  name: string;
  service: LpService;
  status: LpStatus;
  primaryCta: string;
  notes?: string;
  updatedAt: string; // ISO date
}

/**
 * Internal directory of every paid-traffic landing page and funnel surface.
 * Append a new entry whenever a new LP variant ships. Keep `slug` unique.
 */
export const LANDING_PAGES: LandingPageEntry[] = [
  {
    slug: "/",
    name: "TRT Hero (v1)",
    service: "trt",
    status: "live",
    primaryCta: "/book/schedule",
    notes: "Primary TRT funnel. Hero form posts to GHL via ghl-proxy.",
    updatedAt: "2026-05-13",
  },
  {
    slug: "/quiz",
    name: "TRT Symptom Quiz",
    service: "trt",
    status: "live",
    primaryCta: "/quiz/approved",
    notes: "3-step Low-T quiz: symptoms, safety, lead capture. Soft DQ flag tags lead.",
    updatedAt: "2026-05-13",
  },
  {
    slug: "/quiz/approved",
    name: "Low T Detected (Quiz Results)",
    service: "trt",
    status: "live",
    primaryCta: "/book",
    notes: "Personalized results + offer page after quiz. CTA bypasses symptom gate.",
    updatedAt: "2026-05-13",
  },
  {
    slug: "/wl",
    name: "Weight Loss Hero (v1)",
    service: "weight-loss",
    status: "live",
    primaryCta: "/book/symptom",
    notes: "GLP-1 medical weight loss LP. Hero form tags lead service=wl in GHL. Copy informed by Hims/Ro/Henry research.",
    updatedAt: "2026-05-13",
  },
  {
    slug: "/ed",
    name: "ED Hero (v1)",
    service: "ed",
    status: "live",
    primaryCta: "/book/symptom",
    notes: "Discreet in-person ED LP. Sildenafil/Tadalafil/TriMix/PT-141 positioning vs Hims/BlueChew. Service=ed tag.",
    updatedAt: "2026-05-13",
  },
];

export interface BookingStep {
  slug: string;
  name: string;
  description: string;
}

export const BOOKING_STEPS: BookingStep[] = [
  { slug: "/book", name: "Book (entry)", description: "Redirects directly to /book/schedule. No symptom gating." },
  { slug: "/book/symptom", name: "Symptom", description: "Optional: symptom selection. Stores to URL state." },
  { slug: "/book/duration", name: "Duration", description: "Optional: how long the user has been dealing with the issue." },
  { slug: "/book/schedule", name: "Schedule", description: "Lead form + real GHL calendar slot picker." },
  { slug: "/book/confirmed", name: "Confirmed", description: "Success page. Schedule conversion event fires here." },
  { slug: "/book/lets-talk", name: "Lets Talk", description: "Fallback when slot is taken or booking fails. Coordinator follow-up." },
];

export interface ComplianceLink {
  slug: string;
  name: string;
  required: boolean;
  exists: boolean;
  notes?: string;
}

export const COMPLIANCE_PAGES: ComplianceLink[] = [
  { slug: "/privacy-policy", name: "Privacy Policy", required: true, exists: true, notes: "Required by Meta and Google before ad approval." },
  { slug: "/terms-of-service", name: "Terms of Service", required: true, exists: true, notes: "Required by Meta and Google before ad approval." },
  { slug: "/tcpa", name: "TCPA / SMS Disclosure", required: true, exists: true, notes: "Linked from every lead form." },
  { slug: "/prescribing-policy", name: "Prescribing Policy", required: false, exists: true, notes: "Clinical compliance disclosure." },
];
