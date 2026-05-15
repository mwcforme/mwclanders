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
    a: "Consults with our providers are always complimentary, including labs review and your care plan. We don't bill insurance directly, but we accept FSA and HSA. Many men find our straightforward process simpler than navigating insurance approvals.",
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
    q: "How is this different from Hims, Hone, or online TRT?",
    a: "We are an in-person Virginia Center, not a telehealth app. You see the same physician at the same Center, your labs are drawn on-site, and your provider knows your case. No mail-order chatbots, no rotating clinicians, no shipping delays.",
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
    q: "What is included in my initial consult?",
    a: "Yes. Consultations with our providers are always at no cost. That includes a comprehensive hormone lab panel, a face-to-face visit with a licensed Virginia physician, and a personalized care plan based on your labs. You decide whether to begin treatment.",
  },
  {
    q: "How soon do patients typically notice changes?",
    a: "Many patients report initial changes in energy and mood within the first few weeks, with broader symptom improvements over 2 to 3 months. Individual results vary based on baseline labs, adherence, and individual health factors.",
  },
];
