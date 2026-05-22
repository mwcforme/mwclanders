/**
 * CROOptimized page data — copy, config, and static content.
 * No JSX. No side effects. Pure data.
 */
import type { FaqItem } from "@/data/faqs";

export const ROTATING_SERVICES = ["TESTOSTERONE", "ED THERAPY", "WEIGHT LOSS", "MEN'S HEALTH"] as const;

export const SYMPTOMS = [
  "Tired by noon. Coffee stopped working.",
  "Six months of training. Your body doesn't look like it.",
  "Sex drive is down. She\u2019s noticed too.",
  "Labs are fine. You\u2019re not.",
  "Brain fog. Can\u2019t find the word.",
] as const;

export const VALID_LOCATIONS = ["richmond", "virginia-beach", "newport-news"] as const;
export type LocationKey = typeof VALID_LOCATIONS[number];

export const LOCATIONS: { key: LocationKey; label: string }[] = [
  { key: "richmond",       label: "Richmond"      },
  { key: "virginia-beach", label: "Virginia Beach" },
  { key: "newport-news",   label: "Newport News"   },
];

export const CRO_STATS = [
  { value: "10,000+", label: "Men Treated\nSince 2015",      slug: "cro_cb_count",        scrollTo: "results"    as const },
  { value: "3",       label: "Virginia\nCenters",             slug: "cro_cb_locations",    scrollTo: "locations"  as const },
  { value: "4.9\u2605", label: "Google Rating\n200+ Reviews", slug: "cro_cb_reviews",      href: "https://www.google.com/maps/search/Men%27s+Wellness+Centers" },
  { value: "Today",   label: "Same-Day\nAvailability",        slug: "cro_cb_availability", scrollTo: "hero-form"  as const },
];

export const CRO_EXTRA_FAQS: FaqItem[] = [
  {
    q: "Do I need a referral?",
    a: "No referral needed. Call or book online and come in. We handle all lab work on-site during your first visit. Most men walk out the same day with a clear picture of what their labs mean and, if appropriate, a treatment plan.",
  },
  {
    q: "What if my labs are borderline?",
    a: "Borderline results are often where men fall through the cracks of standard care. Our providers are trained to look at your full picture, not just whether a number clears a threshold. We discuss what your levels mean in context of your symptoms, history, and goals.",
  },
];

export const formatPhone = (v: string): string => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export const getLocationFromUrl = (): LocationKey | "" => {
  if (typeof window === "undefined") return "";
  const p = new URLSearchParams(window.location.search).get("location") ?? "";
  return (VALID_LOCATIONS as readonly string[]).includes(p) ? (p as LocationKey) : "";
};
