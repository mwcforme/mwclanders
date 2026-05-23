/**
 * Static content for the /quiz funnel.
 * Categories, symptoms, safety options, FAQ, testimonials, US states.
 */
import {
  Zap, Activity, HeartPulse, Smile, Thermometer, Bone, UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "energy_mood"
  | "body_composition"
  | "sexual_health"
  | "skin_hair"
  | "circulation"
  | "pain_headaches"
  | "digestive";

export interface SymptomItem {
  id: string;
  label: string;
}
export interface CategoryDef {
  id: CategoryId;
  shortLabel: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlockAll?: boolean;
  symptoms: SymptomItem[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "energy_mood",
    shortLabel: "Energy and Mood",
    title: "Low Energy / Mood Swings / Cognitive Function",
    description: "These symptoms are often the first sign of changing testosterone levels.",
    icon: Zap,
    symptoms: [
      { id: "fatigue", label: "Fatigue" },
      { id: "depression", label: "Depression" },
      { id: "irritability", label: "Irritability" },
      { id: "anxiety", label: "Anxiety" },
      { id: "brain_fog", label: "Brain fog or poor focus" },
    ],
  },
  {
    id: "body_composition",
    shortLabel: "Weight and Muscle",
    title: "Noticeable Changes in Weight, Muscle, or Body Shape",
    description: "Testosterone plays a key role in regulating fat distribution, muscle mass, and bone density.",
    icon: Activity,
    symptoms: [
      { id: "weight_gain", label: "Weight gain" },
      { id: "weight_loss", label: "Weight loss" },
      { id: "muscle_loss", label: "Muscle loss" },
      { id: "bone_loss", label: "Bone loss" },
    ],
  },
  {
    id: "sexual_health",
    shortLabel: "Sexual Health",
    title: "Sexual Health and Reproductive Function Changes",
    description: "Testosterone drives desire, performance, and overall sexual health.",
    icon: HeartPulse,
    symptoms: [
      { id: "low_libido", label: "Low sex drive" },
      { id: "fertility", label: "Fertility challenges" },
    ],
  },
  {
    id: "skin_hair",
    shortLabel: "Skin and Hair",
    title: "Changes in Skin or Hair",
    description: "Testosterone keeps skin firm and hair full. When levels fall, it often signals change within.",
    icon: Smile,
    symptoms: [
      { id: "brittle_hair", label: "Dry or brittle hair" },
      { id: "skin_change", label: "Dry or oily skin" },
      { id: "hair_loss", label: "Thinning hair or hair loss" },
      { id: "excess_hair", label: "Excess hair growth" },
    ],
  },
  {
    id: "circulation",
    shortLabel: "Circulation",
    title: "Circulation or Body Temperature Changes",
    description: "Testosterone drives circulation and heat regulation. When it dips, you may notice colder hands, slower recovery, or reduced stamina.",
    icon: Thermometer,
    symptoms: [
      { id: "cold_body", label: "Cold body temperature" },
      { id: "cold_extremities", label: "Cold hands or feet" },
      { id: "palpitations", label: "Irregular heartbeat or palpitations" },
    ],
  },
  {
    id: "pain_headaches",
    shortLabel: "Pain and Headaches",
    title: "Chronic Pain or Headaches",
    description: "Testosterone helps regulate inflammation and pain. When it drops, discomfort tends to rise.",
    icon: Bone,
    symptoms: [
      { id: "aches", label: "Aches and pains" },
      { id: "headaches", label: "Headaches" },
    ],
  },
  {
    id: "digestive",
    shortLabel: "Digestive",
    title: "Digestive Issues",
    description: "Hormonal balance affects how efficiently your body breaks down food and absorbs nutrients. Low testosterone can slow that process down.",
    icon: UtensilsCrossed,
    unlockAll: true,
    symptoms: [
      { id: "constipation", label: "Constipation" },
      { id: "bloating", label: "Bloating" },
      { id: "upset_stomach", label: "Upset stomach" },
    ],
  },
];

export const ALL_SYMPTOM_IDS: string[] = CATEGORIES.flatMap((c) => c.symptoms.map((s) => s.id));

export interface SafetyOption {
  id: string;
  label: string;
}

export const SAFETY_NONE_ID = "none";

export const SAFETY_CONDITIONS: SafetyOption[] = [
  { id: "prostate_cancer", label: "Diagnosed with prostate cancer" },
  { id: "breast_cancer", label: "Diagnosed with breast cancer" },
  { id: "other_cancer", label: "Other cancer (active, in treatment, or remission less than 5 years; does not apply to fully removed non-melanoma skin cancers)" },
  { id: "heart_failure", label: "Severe or untreated heart failure or heart disease" },
  { id: "high_bp", label: "Uncontrolled high blood pressure (160/100 or higher)" },
  { id: "high_blood_counts", label: "High blood counts (hemoglobin over 18, hematocrit over 50%, or prior blood donation for high blood counts)" },
  { id: "sleep_apnea", label: "Severe or untreated sleep apnea" },
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What are my treatment options if I qualify?",
    a: "Injections, creams, and pellets, depending on what is clinically appropriate for you. Your provider will recommend the protocol that fits your labs and goals.",
  },
  {
    q: "How much will the medication cost?",
    a: "Most patients pay between $99 and $199 per month depending on the protocol. Your first visit and consult are on us.",
  },
  {
    q: "How fast will I see results?",
    a: "Most men report energy and libido improvements within 2 to 8 weeks. Body composition changes typically build from week 12 onward. Individual results vary.",
  },
  {
    q: "What is covered during the clinician consult?",
    a: "Review of your lab results, symptoms, medical history, and treatment plan. There is plenty of time for your questions.",
  },
  {
    q: "My testosterone level is 350 and my primary care provider said it is normal. Should I still consider treatment?",
    a: "Many men with levels in the 300 to 500 range still experience significant low testosterone symptoms. Our providers treat based on labs and symptoms, not just a single number.",
  },
  {
    q: "Should I be worried about testicular shrinkage with TRT?",
    a: "This is a known side effect that can be managed with adjunctive medications. Your provider will discuss this with you in detail before starting therapy.",
  },
  {
    q: "What about increasing estrogen?",
    a: "We monitor estradiol with every lab panel and adjust your protocol to keep it within a healthy target range.",
  },
  {
    q: "Need more help?",
    a: "Call us at (866) 344-4955 or talk with your care team during your visit.",
  },
];

export const RESULTS_TESTIMONIALS = [
  { name: "Johnathan W.", date: "Jan 6, 2026", quote: "My ED is improving. My muscles are coming back. It is only been two weeks. The depression and mental fog are finally starting to lift." },
  { name: "Bobby W.", date: "Dec 18, 2025", quote: "The treatment has given me more restful sleep, much more energy, and a clearer mind." },
  { name: "Robert L.", date: "Jan 27, 2026", quote: "Treatment quickly improved my strength, clarity, libido, and overall health." },
  { name: "Scott B.", date: "Feb 8, 2026", quote: "What I really love is the staff. They go above and beyond, regardless of who you talk to." },
  { name: "Jose R.", date: "Feb 3, 2026", quote: "I've already recommended MWC to my friends and family and will continue to confidently." },
];

// ─── Simplified quiz tiles (3-step CRO funnel) ─────────────────────────────

export const QUIZ_TILES = [
  { id: "fatigue",    label: "Low energy or fatigue",        emoji: "⚡" },
  { id: "low_libido", label: "Low sex drive or ED",           emoji: "❤️" },
  { id: "brain_fog",  label: "Brain fog or poor focus",      emoji: "🧠" },
  { id: "mood",       label: "Mood swings or irritability",  emoji: "😤" },
  { id: "body_comp",  label: "Weight gain or muscle loss",   emoji: "💪" },
  { id: "sleep",      label: "Poor sleep quality",           emoji: "😴" },
  { id: "motivation", label: "Reduced motivation or drive",  emoji: "🎯" },
  { id: "none",       label: "None of these apply",          emoji: "✓"  },
] as const;

export type QuizTileId = typeof QUIZ_TILES[number]["id"];

export const US_STATES: { code: string; name: string }[] = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],
  ["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],
  ["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],
  ["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],
  ["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],
  ["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],
  ["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],
  ["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],
  ["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],
  ["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
].map(([code, name]) => ({ code, name }));
