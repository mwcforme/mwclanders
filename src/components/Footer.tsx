import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin } from "lucide-react";

const FooterHeading = ({ children }: { children: React.ReactNode }) => (
  <h4 className="uppercase mb-4 md:mb-5 font-semibold text-[13px] tracking-[0.1em]" style={{ color: "#FFFFFF" }}>
    {children}
  </h4>
);

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="block transition-colors duration-200 text-[13px] font-normal mb-2.5 hover:text-white/90 cursor-pointer"
    style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}
  >
    {children}
  </Link>
);

const socials = [
  { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/menswellnesscenters/" },
  { icon: Facebook, label: "Facebook", url: "https://www.facebook.com/menswellnesscentersinc/" },
  { icon: Linkedin, label: "LinkedIn", url: "https://www.linkedin.com/company/menswellnesscenters/" },
];

const certBadges = [
  { image: "/images/badges/clia.webp", label: "CLIA Certified" },
  { image: "/images/badges/legitscript.png", label: "LegitScript Certified" },
  { image: "/images/badges/hipaa.webp", label: "HIPAA Compliant" },
];

const legalLinks = [
  { to: "/sitemap", label: "Site Map" },
  { to: "/prescribing-policy", label: "Safety Policy" },
  { to: "/terms-of-service", label: "Terms & Agreement" },
  { to: "/privacy-policy", label: "Notice of Privacy Practices" },
];

export const Footer = () => (
  <footer className="relative pb-16 lg:pb-0" style={{ background: "#000033" }}>
    {/* Glow divider */}
    <div
      className="absolute top-0"
      style={{
        left: "10%", right: "10%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)",
      }}
    />

    {/* Section A */}
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-10 md:pb-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
        {/* Col 1 — Brand */}
        <div className="col-span-2 md:col-span-3 lg:col-span-2">
          <img src="/logos/Text_Logo_white.webp" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logos/Text_Logo_white.png"; }} alt="Men's Wellness Centers" style={{ height: 32, width: "auto" }} className="opacity-80" loading="lazy" decoding="async" />

          <p className="mt-3 md:mt-4 text-[13px] italic leading-relaxed max-w-[280px]" style={{ color: "rgba(255,255,255,0.55)" }}>
            Giving men's sexual and restorative healthcare a good name.
          </p>

          <div className="flex gap-3 mt-4 md:mt-5">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>

          <a href="tel:8663444955" className="block mt-3 md:mt-4 text-sm cursor-pointer" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
            (866) 344-4955
          </a>
        </div>

        {/* Col 2 — Treatments */}
        <div>
          <FooterHeading>Treatments</FooterHeading>
          <FooterLink to="/services/testosterone-therapy">Testosterone Therapy</FooterLink>
          <FooterLink to="/services/weight-loss">Weight Loss</FooterLink>
          <FooterLink to="/services/sexual-health">Sexual Wellness &amp; ED</FooterLink>
          <FooterLink to="/services/wellness-vitality">Anti-Aging &amp; Longevity</FooterLink>
          <FooterLink to="/services/wellness-vitality">Peptide Therapy</FooterLink>
          <FooterLink to="/services/wellness-vitality">Labs &amp; Diagnostics</FooterLink>
        </div>

        {/* Col 3 — Locations */}
        <div>
          <FooterHeading>Locations</FooterHeading>
          {[
            { name: "Richmond, VA", phone: "(804) 346-4636", to: "/locations/richmond-va", tel: "8043464636" },
            { name: "Newport News, VA", phone: "(757) 806-6263", to: "/locations/newport-news-va", tel: "7578066263" },
            { name: "Virginia Beach, VA", phone: "(757) 806-6263", to: "/locations/virginia-beach-va", tel: "7578066263" },
          ].map((loc) => (
            <div key={loc.name} className="mb-3 md:mb-4">
              <FooterLink to={loc.to}>{loc.name}</FooterLink>
              <a href={`tel:${loc.tel}`} className="block text-[11px] -mt-1 hover:text-white/60 transition-colors cursor-pointer" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>{loc.phone}</a>
            </div>
          ))}
          <FooterLink to="/locations">View All Locations &rarr;</FooterLink>
        </div>

        {/* Col 4 — Company */}
        <div className="hidden md:block">
          <FooterHeading>Company</FooterHeading>
          <FooterLink to="/how-it-works">How It Works</FooterLink>
          <FooterLink to="/providers">Our Providers</FooterLink>
          <FooterLink to="/#team">Meet Our Team</FooterLink>
        </div>

        {/* Col 5 — Resources */}
        <div className="hidden lg:block">
          <FooterHeading>Resources</FooterHeading>
          <FooterLink to="/book">Book My Consultation</FooterLink>
          <FooterLink to="/#faq">FAQ</FooterLink>
          <FooterLink to="/book">Contact</FooterLink>
        </div>
      </div>
    </div>

    {/* Section B — Trust Badges */}
    <div className="border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 flex items-center justify-center gap-12 md:gap-20">
        {certBadges.map((b) => (
          <img key={b.label} src={b.image} alt={b.label} className="h-16 md:h-20 w-auto opacity-80" />
        ))}
      </div>
    </div>

    {/* Section C — Disclaimers */}
    <div className="border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-6 space-y-3 text-center">
        <p className="text-[11px] md:text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
          The information presented on this website is provided for general informational purposes only and is not intended to constitute medical advice, diagnosis, or treatment. Men's Wellness Centers does not provide medical advice through this website, and nothing on this website should be relied upon as a substitute for an in-person evaluation, diagnosis, or consultation with a licensed healthcare professional.
        </p>
        <p className="text-[11px] md:text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
          Men's Wellness Centers operates physical center locations only. Medical services are provided exclusively in person following an individualized evaluation and are rendered by licensed medical professionals exercising independent clinical judgment. All treatment protocols are selected based on each member's health profile, lab results, and medical history. Men's Wellness Centers makes no representations, guarantees, or warranties regarding outcomes, effectiveness, or suitability of any treatment for any individual. Individual results and responses vary.
        </p>
        <p className="text-[11px] md:text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
          Testimonials and reviews on this website reflect individual experiences only and are not intended to represent typical outcomes. Testimonials are not intended to make medical claims or to suggest that any service provided by Men's Wellness Centers diagnoses, treats, cures, mitigates, or prevents any disease or medical condition.
        </p>
      </div>
    </div>

    {/* Section D — Bottom bar */}
    <div className="border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-[12px] md:text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          © 2026 Men's Wellness Centers. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1 text-[12px] md:text-[13px]">
          {legalLinks.map((link, i) => (
            <span key={link.label}>
              {i > 0 && <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 4px" }}>·</span>}
              <Link
                to={link.to}
                className="transition-colors duration-200 hover:text-white/70 hover:underline cursor-pointer"
                style={{ color: "rgba(255,255,255,0.50)", textDecoration: "none" }}
              >
                {link.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
