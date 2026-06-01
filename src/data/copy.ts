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
    bookConsult: "Book in-person visit online",
    /** Results section CTA. */
    startConsult: "Book in-person visit online",
    /** Inline link variant inside FAQ answers. */
    bookConsultInline: "book in-person visit online",
    /** ED service final-CTA + ED form card title. */
    bookDiscreetVisit: "Book in-person visit online",
    /** WL service final-CTA + WL manifesto. */
    seeIfIQualify: "Book in-person visit online",
    /** TRT manifesto secondary CTA. */
    seeIfYouQualify: "Book in-person visit online",
    /** Phone CTA prefix. */
    callNow: "Call Now",
    /** Sticky mobile bar primary action — short, action-oriented. */
    getLabsChecked: "Get My Labs Checked",
    /** Pricing/affordability page CTA — emphasizes no-cost first visit. */
    bookNoCostVisit: "Book in-person visit online",
  },
  badge: {
    /** Hero pill / trust chip describing the offer. */
    noCostConsult: "No-cost visit",
    /** Stat-card value used in CredibilityBand. */
    offerValue: "No-Cost",
    /** Stat-card label paired with offerValue. */
    offerLabel: "60-Min Physician Assessment\nNo Insurance Needed",
  },
  offer: {
    /** Hero subhead under the H1. */
    /** Final CTA / WL / ED subhead. */
    finalSubhead: "No-cost visit. Same-day availability.",
    /** Manifesto / proof closer. */
    manifestoTag: "No-obligation consult. Individual results vary.",
    /** Reschedule reassurance bullet. */
    cancelReschedule: "Cancel or reschedule at no charge, anytime.",
  },
} as const;

export type CopyMap = typeof COPY;
