/**
 * TRT landing-page FAQ items in descending objection priority.
 * Question text is preserved verbatim from the previous TRTFAQ.tsx
 * (FAQPage JSON-LD requires exact-match — see SEO Schema Integrity memory).
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const TRT_FAQS: FaqItem[] = [
  {
    q: "Does insurance cover this?",
    a: "Your first visit is at no cost, including labs and the provider review. We don't bill insurance, but we accept FSA and HSA cards. Most men find the straightforward pricing easier than navigating insurance approvals.",
  },
  {
    q: "What does treatment typically involve?",
    a: "Treatment plans are personalized based on your labs and symptoms. Common options include clinician-prescribed hormone therapy administered through several delivery methods. Your provider will review the options that fit your situation at your appointment.",
  },
  {
    q: "Is testosterone replacement therapy safe?",
    a: "TRT is FDA-approved when prescribed and monitored by a licensed provider for men with clinically diagnosed low testosterone. Like any prescription treatment, it has potential side effects, which your provider will review with you. Ongoing lab monitoring is part of every care plan.",
  },
  {
    q: "How is this different from online or mail-order TRT services?",
    a: "We're in-person only. You see the same licensed provider at the same center, labs are drawn on-site and reviewed that day, and your provider knows your full case. No mail-order chatbots, no remote sign-offs, no waiting on shipping.",
  },
  {
    q: "How do I know if testosterone treatment is right for me?",
    a: "A diagnosis of low testosterone requires lab work and a clinical evaluation. At your first visit, we run a full hormone lab panel and review your symptoms. Treatment is only prescribed when clinically appropriate.",
  },
  {
    q: "What should I expect at my first visit, and what's included?",
    a: "Plan for 60 minutes. Your labs are drawn on-site: a full hormone panel, not a standard GP metabolic panel. Your Virginia provider then reviews every result with you in the same visit, explains what they mean in plain language, and if treatment is appropriate, you leave with a protocol that day. No-cost consultation. No obligation to proceed.",
  },
  {
    q: "How soon do members typically notice changes?",
    a: "Many members report initial changes in energy and mood within the first few weeks, with broader symptom improvements over 2 to 3 months. Individual results vary based on baseline labs, adherence, and individual health factors.",
  },
  {
    q: "Is this completely private? Will my employer or insurance find out?",
    a: "Yes, completely private. We do not bill insurance, so there are no insurance claims and nothing appears on your EOB or employer health records. Your visit, your labs, and your treatment plan stay between you and your provider. We are HIPAA-compliant and do not share your information with third parties.",
  },
  {
    q: "What if I start and decide it isn't for me?",
    a: "You are never locked in. You can pause or stop treatment at any time at no charge. Our providers will review your options, including a monitored wind-down plan if that is appropriate for your situation. Most men who stop treatment do so because their goals changed, not because of side effects. We will support whatever decision makes sense for you.",
  },
];
