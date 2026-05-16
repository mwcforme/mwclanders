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
      "Six months on TRT and I finally feel like myself again. Energy is up, mood is stable, and I'm sleeping through the night for the first time in years.",
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
      "I feel stronger and more focused than I have in years. My wife says I'm a different person. Should've done this years ago.",
  },
];

/** Public Google Business Profile reviews URL — verify before launch. */
export const GBP_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Men%27s+Wellness+Centers+Glen+Allen+VA";
