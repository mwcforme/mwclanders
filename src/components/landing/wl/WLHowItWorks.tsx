import { X } from "lucide-react";

const symptoms = [
  "Stubborn belly fat that diet and exercise will not move.",
  "Constant cravings and energy crashes.",
  '"Normal" labs that do not match how you feel.',
  "Weight that creeps back after every diet.",
  "Sleep apnea, joint pain, or rising blood pressure.",
];

const steps = [
  {
    num: "1",
    title: "Book Online In Under 5 Minutes",
    desc: "Pick the location and time that works for you. No referral, no phone tag.",
  },
  {
    num: "2",
    title: "Labs And A Real Physician, Same Visit",
    desc: "We run metabolic labs in-center and a Virginia physician reviews them with you. No mail-order chatbot, no rotating clinicians.",
  },
  {
    num: "3",
    title: "Walk Out With A Plan And, If Right For You, Your First Dose",
    desc: "Physician-supervised weight loss medication when clinically appropriate, paired with a sustainable nutrition plan and ongoing monitoring.",
  },
];

export const WLHowItWorks = () => {
  const scrollToForm = () => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" });

  const eyebrow = (text: string) => (
    <div className="uppercase mb-3" style={{ color: "#E8670A", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" }}>
      {text}
    </div>
  );

  const heading = (text: string) => (
    <h2 className="font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif", fontSize: "clamp(28px, 4vw, 44px)", color: "#000033", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
      {text}
    </h2>
  );

  return (
    <section id="how-it-works" className="py-10 md:py-20" style={{ background: "#F5F0EB" }}>
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        <div className="order-2 md:order-1">
          {eyebrow("Sound Familiar?")}
          {heading("Why traditional weight loss stops working")}
          <p className="mt-5 text-base leading-relaxed" style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif", maxWidth: 520 }}>
            For men in their 40s and beyond, hormones, metabolism, and sleep all start working against you. Willpower alone is not the problem.
          </p>
          <ul className="mt-8 space-y-4">
            {symptoms.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <X className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={3} style={{ color: "#E8670A" }} />
                <span className="text-base" style={{ color: "#1A1A1A", fontFamily: "Inter, sans-serif" }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 md:order-2">
          {eyebrow("The Fix")}
          {heading("How medical weight loss works here")}
          <div className="mt-8 flex flex-col gap-6">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#000033" }}>
                  <span className="font-bold text-sm" style={{ color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}>{s.num}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "#000033", fontFamily: "Inter, sans-serif" }}>{s.title}</h3>
                  <p className="text-base mt-1 leading-relaxed" style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={scrollToForm}
            className="mt-10 w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-8 font-bold cursor-pointer transition-colors duration-200"
            style={{ height: 56, minHeight: 56, background: "#E8670A", color: "#FFFFFF", fontSize: 15, letterSpacing: "0.07em", fontFamily: "Inter, sans-serif", border: "none", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#CF5B09"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#E8670A"; }}
          >
            See If I Qualify
          </button>
        </div>
      </div>
    </section>
  );
};
