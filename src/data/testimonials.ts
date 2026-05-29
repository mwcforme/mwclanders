/**
 * Real verified Google reviews — sourced from Trustindex widget on menswellnesscenters.com.
 * Profile photos loaded from Google's CDN (lh3.googleusercontent.com).
 * All reviews are 5-star, verified by Trustindex as original Google reviews.
 * Last updated: May 2026
 *
 * Selection criteria: specific outcomes mentioned, named providers, recent (within 7 days),
 * differentiate from chain clinics, no generic filler phrases.
 */

export type TestimonialSource = "google";

export interface Testimonial {
  name: string;
  city: string;
  monthYear: string;
  rating: 5;
  quote: string;
  source: TestimonialSource;
  /** Google profile photo URL from lh3.googleusercontent.com — public CDN, reliable */
  photoUrl?: string;
  /** Platform where review was posted */
  platform: "Google";
  /** Relative time label from Trustindex */
  relativeTime: string;
}

export const TESTIMONIALS: Testimonial[] = [
  // ORDER RATIONALE: Card 1 addresses the #1 objection ("my doctor said I'm fine").
  // Card 2 shows outcomes (energy/sleep/workouts). Card 3 shows same-day access + named provider.
  // Cards 4-5 reinforce warmth and staff consistency.
  {
    name: "Jared C.",
    city: "Virginia",
    monthYear: "May 2026",
    rating: 5,
    source: "google",
    platform: "Google",
    relativeTime: "3 days ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjUDZ-kjhld5Ar0gs7jvWzWDMlbYFwPLjyI8EyTLSxNy8rAiLqY-=w80-h80-c-rp-mo-br100",
    quote:
      "Very streamlined. People that actually listen and care about getting you healthy. They focus on symptoms, not just numbers, and getting you to a point where you feel your best. Ryan was easy to talk to and I'm excited to start.",
  },
  {
    name: "Clarke M.",
    city: "Virginia",
    monthYear: "May 2026",
    rating: 5,
    source: "google",
    platform: "Google",
    relativeTime: "5 days ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocJ7abOwzDd2NUVrtPpWct5U-fTyx139sPIyjlw1uh3LVItVUg=w80-h80-c-rp-mo-br100",
    quote:
      "Have been going for about 6 months now and feel way better: energy throughout the day, better workouts, better sleep. Meredith is very knowledgeable and helpful.",
  },
  {
    name: "Jeremiah N.",
    city: "Virginia",
    monthYear: "May 2026",
    rating: 5,
    source: "google",
    platform: "Google",
    relativeTime: "1 day ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocIXWOuLtodaCLb6b8qKM4ASsrTHe0vBT8VsjVBaKKhg60qo7g=w80-h80-c-rp-mo-br100",
    quote:
      "10/10. I was able to make a same-day appointment online. Reception was friendly and made for a comfortable setting. I was promptly called back at the prescribed time and had my vitals and blood work taken. Dr. Papariello listened to my concerns, addressed the underlying issues, and discussed options before we came to a very acceptable conclusion. Take back your health. Don't suffer in silence.",
  },
  {
    name: "Bobby M.",
    city: "Virginia",
    monthYear: "May 2026",
    rating: 5,
    source: "google",
    platform: "Google",
    relativeTime: "2 days ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocL8NOWXCAi7d1Jbw0uqehn2zNTvhA8v0cOEBabJtM5r8s9ddA=w80-h80-c-rp-mo-br100",
    quote:
      "Excellent service and I'm always greeted by name, which makes me feel like it's a personal visit, not a doctor's office.",
  },
  {
    name: "Floyd K.",
    city: "Virginia",
    monthYear: "May 2026",
    rating: 5,
    source: "google",
    platform: "Google",
    relativeTime: "5 days ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjVZ-7BAy_Lq-9Z_IVb5EDn1xh2YRPgN4nF2jYgTY4mKFlUYW8hJ4Q=w80-h80-c-rp-mo-br100",
    quote:
      "There is a fantastic consistency that always works. Mel welcomes me and Charlene has my visit done before I knew I was even there. Truly, everybody here is a pleasure to deal with.",
  },
];

/** Google Business Profile — link to leave a review or read all 191 reviews */
export const GBP_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Men%27s+Wellness+Centers+Glen+Allen+VA";
