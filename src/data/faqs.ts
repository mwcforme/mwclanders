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
    a: "Treatment plans are personalized based on your labs and symptoms. Common options include clinician-prescribed hormone therapy administered through several delivery methods. Your provider will review the options that fit your situation at your consultation.",
  },
  {
    q: "Is testosterone replacement therapy safe?",
    a: "TRT is FDA-approved when prescribed and monitored by a licensed provider for patients with clinically diagnosed low testosterone. Like any prescription treatment, it has potential side effects, which your provider will review with you. Ongoing lab monitoring is part of every care plan.",
  },
  {
    q: "How is this different from Hims, Hone, or an online TRT clinic?",
    a: "We're in-person only. You see the same physician at the same center, labs are drawn on-site and reviewed that day, and your provider knows your full case. No mail-order chatbots, no rotating clinicians, no waiting on shipping.",
  },
  {
    q: "How do I know if testosterone treatment is right for me?",
    a: "A diagnosis of low testosterone requires lab work and a clinical evaluation. At your first visit, we'll run a comprehensive hormone panel and review your symptoms. Treatment is only prescribed when clinically appropriate.",
  },
  {
    q: "What should I expect at my first visit?",
    a: "Plan for about 60 minutes. You'll have your labs drawn on-site, meet face-to-face with a licensed provider to review your symptoms and history, and leave with a personalized care plan. If treatment is clinically appropriate, it can often begin the same day.",
  },
  {
    q: "What is included in my first visit?",
    a: "A comprehensive hormone lab panel drawn on-site, a face-to-face visit with a licensed Virginia physician, and a personalized care plan based on your results. All at no cost. You decide whether to move forward with treatment.",
  },
  {
    q: "How soon do patients typically notice changes?",
    a: "Many patients report initial changes in energy and mood within the first few weeks, with broader symptom improvements over 2 to 3 months. Individual results vary based on baseline labs, adherence, and individual health factors.",
  },
];
