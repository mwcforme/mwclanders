/**
 * Affordability page — data, copy, and shared style tokens.
 * No JSX. No side effects.
 */
import type React from "react";
import { Calendar, FlaskConical, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Left-border eyebrow — the only permitted eyebrow pattern for this page. */
export const eyebrow: React.CSSProperties = {
  display: "block",
  borderLeft: "3px solid var(--brand-cta)",
  paddingLeft: 10,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--brand-cta)",
  fontFamily: "Inter, sans-serif",
  lineHeight: 1,
  marginBottom: 12,
};

export const FAQ_ITEMS = [
  { q: "Why doesn't MWC publish prices online?", a: "Because your treatment plan is built around your labs and your provider's recommendation. A flat published rate would either be misleading or force us to offer something that isn't right for your situation. Your provider reviews every cost in writing at your no-cost consultation." },
  { q: "How much does TRT cost at MWC?", a: "Membership pricing depends on your therapy type, lab requirements, and the membership term you choose. Your provider reviews the full breakdown at your consultation. No-cost, no commitment." },
  { q: "What's included in the membership?", a: "Licensed provider oversight, in-center lab draws, FDA-approved medications when clinically appropriate, member portal access, and quarterly check-ins. No hidden fees." },
  { q: "Is the consultation really at no cost?", a: "Yes. There is no charge for your first 60-minute visit. Labs are drawn, results reviewed, and your provider walks through a complete treatment and pricing summary before you decide anything." },
  { q: "Do you accept insurance?", a: "We do not bill insurance. We do accept FSA and HSA cards. Many members find our transparent cash-pay model simpler than insurance prior authorizations." },
  { q: "Is financing available?", a: "Healthcare financing is available through third-party lenders. Many members pay as little as $179/month on a 36-month term, subject to credit approval and lender terms. Actual rate depends on creditworthiness, loan amount, and term. APR varies by lender. Not all applicants will qualify." },
  { q: "Can I cancel my membership?", a: "12-month is our minimum term. 24-, 30-, and 36-month terms have specific cancellation terms reviewed at your consultation before you commit to anything." },
  { q: "Are there military or first responder discounts?", a: "Active duty military, veterans, and first responders should ask about available discounts at their consultation." },
] as const;

export const TRUST_STATS = [
  { value: "No-Cost",     label: "First Visit"        },
  { value: "Labs Included", label: "Drawn On-Site"   },
  { value: "Same-Day",    label: "Results In-Visit"   },
  { value: "FSA / HSA",   label: "Cards Accepted"     },
] as const;

export const HOW_PRICING_CARDS: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: Calendar,     title: "Membership Length", body: "12-, 24-, 30-, or 36-month. Longer terms mean a lower effective monthly rate. Your provider explains the math at your visit." },
  { Icon: FlaskConical, title: "Therapy Type",       body: "Injectable TRT, oral TRT, or add-on therapies. Your provider recommends based on your labs." },
  { Icon: Tag,          title: "New Member Offers",  body: "Limited promotions may reduce your first-month cost. Ask at your consultation." },
];

export interface MembershipTerm { term: string; badge: string; desc: string; featured: boolean; }

export const MEMBERSHIP_TERMS: MembershipTerm[] = [
  { term: "12-Month", badge: "Most Popular",   desc: "Full lab cycle. Quarterly provider check-in included.",                                               featured: true  },
  { term: "24-Month", badge: "Lower Rate",     desc: "Lower monthly rate than 12-month. Two full lab cycles.",                                              featured: false },
  { term: "30-Month", badge: "Even Lower Rate", desc: "Lower monthly rate than 24-month. Good fit if you plan to stay on protocol.",                        featured: false },
  { term: "36-Month", badge: "Best Rate",      desc: "Lowest effective monthly rate. Three lab cycles. Priority scheduling.",                               featured: false },
];

export const TESTIMONIALS = [
  { quote: "10/10. I was able to make a same-day appointment online. Reception was friendly and made for a comfortable setting. Dr. Papariello listened to my concerns and discussed options before we came to a very acceptable conclusion.", attr: "Jeremiah N.", since: "Google Review, May 2026" },
  { quote: "Have been going for about 6 months now and feel way better. Energy throughout the day, better workouts, better sleep. Meredith is very knowledgeable and helpful.", attr: "Clarke M.", since: "Google Review, May 2026" },
  { quote: "Everyone was professional and straightforward. They went through the pricing before I had to decide anything. No pressure.", attr: "Google Reviewer", since: "Verified Google Review" },
] as const;
