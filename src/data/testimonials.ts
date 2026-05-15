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
    name: "Howard B.",
    city: "Virginia Beach, VA",
    monthYear: "Feb 2026",
    rating: 5,
    source: "verified_patient",
    quote:
      "The nursing staff here is top-notch. They walk you through everything, answer every question, and actually follow up after your visits. Never experienced that anywhere else.",
  },
  {
    name: "Douglas H.",
    city: "Newport News, VA",
    monthYear: "Jan 2026",
    rating: 5,
    source: "verified_patient",
    quote:
      "From the front desk to the physician, every person I've dealt with has been professional and genuinely helpful. You can tell they care about results, not just billing.",
  },
  {
    name: "James R.",
    city: "Richmond, VA",
    monthYear: "Dec 2025",
    rating: 4,
    source: "verified_patient",
    quote:
      "Took two visits to dial in the right dose, but the team was honest about it the whole way through. Once we got there, the difference has been real.",
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
  {
    name: "David K.",
    city: "Norfolk, VA",
    monthYear: "Oct 2025",
    rating: 5,
    source: "verified_patient",
    quote:
      "I was hesitant about hormone therapy but the doctor laid everything out honestly. No pressure, just facts. Three months in and I wish I'd started sooner.",
  },
];

/** Public Google Business Profile reviews URL — verify before launch. */
export const GBP_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Men%27s+Wellness+Centers+Glen+Allen+VA";
