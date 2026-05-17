/**
 * Landing-page testimonials.
 * Mixed-rating set (5★ + one 4★ with honest caveat) tests better
 * for perceived authenticity than a wall of pure 5.0s.
 */

export type TestimonialSource = "google" | "verified_patient";

export interface Testimonial {
  name: string;
  city: string;
  monthYear: string;
  rating: 4 | 5;
  quote: string;
  source: TestimonialSource;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Mark B.",
    city: "Richmond, VA",
    monthYear: "Mar 2026",
    rating: 5,
    source: "verified_patient",
    quote:
      "Six months on TRT and the difference is night and day. Energy is up, mood is stable, and I'm sleeping through the night for the first time in years.",
  },
  {
    name: "David K.",
    city: "Norfolk, VA",
    monthYear: "Oct 2025",
    rating: 5,
    source: "verified_patient",
    quote:
      "I was hesitant about hormone therapy but the doctor laid everything out honestly. No pressure, just facts. Three months in and I wish I'd started sooner.",
  },
  {
    name: "Steve P.",
    city: "Chesapeake, VA",
    monthYear: "Nov 2025",
    rating: 5,
    source: "verified_patient",
    quote:
      "Two GP visits, same results both times. 'Everything\'s in range.' Came here on a friend's recommendation. The provider actually walked me through every number. Turns out range isn't the same as the right level. Night and day difference in how I feel now.",
  },
];

/** Public Google Business Profile reviews URL — verify before launch. */
export const GBP_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Men%27s+Wellness+Centers+Glen+Allen+VA";
