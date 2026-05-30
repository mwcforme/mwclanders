/**
 * Approved wording map for CTAs, badges, and offer copy.
 *
 * SINGLE SOURCE OF TRUTH for all on-page CTA labels, badge text, and offer
 * phrasing on landing pages (TRT, ED, WL) and shared landing components.
 *
 * Rules:
 *  - The word "free" (any case) is BANNED. Use "no-cost", "no obligation",
 *    "no commitment", or "at no charge" only.
 *  - Components must NOT hardcode CTA/badge labels. Import from COPY instead.
 *  - To add a new label, add a key here so wording is reviewed in one place.
 */

export const COPY = {
  cta: {
    /** Primary booking CTA. Header, hero submit, locations, sticky bar, final CTA. */
    bookConsult: "Book My No-Cost Consultation",
    /** Results section CTA. */
    startConsult: "Book My No-Cost Consultation",
    /** Inline link variant inside FAQ answers. */
    bookConsultInline: "book a no-cost consultation",
    /** ED service final-CTA + ED form card title. */
    bookDiscreetVisit: "Book My No-Cost Consultation",
    /** WL service final-CTA + WL manifesto. */
    seeIfIQualify: "Book My No-Cost Consultation",
    /** TRT manifesto secondary CTA. */
    seeIfYouQualify: "Book My No-Cost Consultation",
    /** Phone CTA prefix. */
    callNow: "Call Now",
    /** Sticky mobile bar primary action — short, action-oriented. */
    getLabsChecked: "Get My Labs Checked",
    /** Pricing/affordability page CTA — emphasizes no-cost first visit. */
    bookNoCostVisit: "Book My No-Cost Visit",
  },
  badge: {
    /** Hero pill / trust chip describing the offer. */
    noCostConsult: "No-cost consultation",
    /** Stat-card value used in CredibilityBand. */
    offerValue: "No-Cost",
    /** Stat-card label paired with offerValue. */
    offerLabel: "60-Min Physician Assessment\nNo Insurance Needed",
  },
  offer: {
    /** Hero subhead under the H1. */
    /** Final CTA / WL / ED subhead. */
    finalSubhead: "No-cost consultation. Same-day availability.",
    /** Manifesto / proof closer. */
    manifestoTag: "No-obligation consult. Individual results vary.",
    /** Reschedule reassurance bullet. */
    cancelReschedule: "Cancel or reschedule at no charge, anytime.",
  },
} as const;

export type CopyMap = typeof COPY;
