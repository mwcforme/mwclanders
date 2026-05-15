import { X } from "lucide-react";

const symptoms = [
  "Performance is not what it used to be.",
  "Pills from online sites stopped working or never did.",
  "Embarrassing conversations you have been avoiding for years.",
  "Anxiety in the moment that makes it worse.",
  "A relationship that is starting to feel the strain.",
];

const steps = [
  {
    num: "1",
    title: "Book A Discreet, In-Person Visit",
    desc: "Pick a Virginia center and time. No referral. No insurance hoops. Private, in-person visit.",
  },
  {
    num: "2",
    title: "A Real Physician Diagnoses The Cause",
    desc: "ED is often a symptom, not the disease. We test hormones, cardiovascular markers, and more so we treat what is actually happening.",
  },
  {
    num: "3",
    title: "Treatment That Fits You, From Day One",
    desc: "FDA-approved oral and injectable treatments when clinically appropriate. Personalized dosing and ongoing follow-up, not a 30-day pill drop.",
  },
];

export const EDHowItWorks = () => {
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
          {heading("What we hear from men every week")}
          <p className="mt-5 text-base leading-relaxed" style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif", maxWidth: 520 }}>
            Most men wait years before bringing this up. By the time they do, the issue has already changed how they feel about themselves and their relationship. It does not have to.
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
          {heading("How ED treatment works here")}
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
            className="mt-10 inline-flex items-center justify-center rounded-full px-8 py-4 font-bold text-sm uppercase cursor-pointer transition-colors duration-200"
            style={{ background: "#E8670A", color: "#FFFFFF", letterSpacing: "0.08em", fontFamily: "Inter, sans-serif", border: "none" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#CF5B09"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#E8670A"; }}
          >
            Book My Discreet Visit
          </button>
        </div>
      </div>
    </section>
  );
};
