import { Link } from "react-router-dom";

/**
 * Common footer used across landing pages (/, /wl, /ed).
 * Mirrors the structure and dark-navy aesthetic of menswellnesscenters.com,
 * trimmed to required links only.
 */
export const TRTFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#000033", color: "rgba(255,255,255,0.78)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-10">
        {/* Top: Brand + 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <img
              src="/logos/Text_Logo_white.png"
              alt="Men's Wellness Centers"
              className="h-10 w-auto"
            />
            <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Copyright © {year}
            </p>
            <a
              href="tel:8663444955"
              className="block mt-4 text-sm hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              866-344-4955
            </a>
          </div>

          {/* Contact */}
          <div>
            <div
              className="text-xs font-semibold uppercase mb-4"
              style={{ color: "#FFFFFF", letterSpacing: "0.12em" }}
            >
              Contact
            </div>
            <ul className="space-y-3 text-sm">
              <li><a href="tel:8663444955" className="hover:text-white transition-colors">866-344-4955</a></li>
              <li><a href="mailto:info@menswellnesscenters.com" className="hover:text-white transition-colors">info@menswellnesscenters.com</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div
              className="text-xs font-semibold uppercase mb-4"
              style={{ color: "#FFFFFF", letterSpacing: "0.12em" }}
            >
              Legal
            </div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/prescribing-policy" className="hover:text-white transition-colors">Safety Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms &amp; Agreement</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Notice of Privacy Practices</Link></li>
              <li><Link to="/tcpa" className="hover:text-white transition-colors">TCPA Disclosure</Link></li>
            </ul>
          </div>
        </div>

        {/* Clinic locations */}
        <div className="mt-10 pt-8 border-t" style={{ borderColor: "var(--c-border-on-dark)" }}>
          <div
            className="text-xs font-semibold uppercase mb-4"
            style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em" }}
          >
            Our Virginia Locations
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs" style={{ color: "rgba(255,255,255,0.60)", fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, marginBottom: 2 }}>Richmond</div>
              <div>4050 Innslake Dr, Suite 360</div>
              <div>Glen Allen, VA 23060</div>
              <a href="tel:8043464636" style={{ color: "rgba(255,255,255,0.60)", textDecoration: "none" }}>(804) 346-4636</a>
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, marginBottom: 2 }}>Newport News</div>
              <div>827 Diligence Drive, Suite 206</div>
              <div>Newport News, VA 23606</div>
              <a href="tel:7578066263" style={{ color: "rgba(255,255,255,0.60)", textDecoration: "none" }}>(757) 806-6263</a>
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, marginBottom: 2 }}>Virginia Beach</div>
              <div>996 First Colonial Road</div>
              <div>Virginia Beach, VA 23454</div>
              <a href="tel:7578066263" style={{ color: "rgba(255,255,255,0.60)", textDecoration: "none" }}>(757) 806-6263</a>
            </div>
          </div>
        </div>

        {/* Badge row */}
        <div className="mt-10 flex justify-center">
          <a
            href="https://www.legitscript.com/websites/?checker_keywords=menswellnesscenters.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Verify LegitScript Certification"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <img
              src="/images/badges/legitscript.png"
              alt="LegitScript Certified"
              className="h-16 w-auto"
              loading="lazy"
            />
          </a>
        </div>

        {/* Disclaimers */}
        <div className="mt-10 pt-8 border-t" style={{ borderColor: "var(--c-border-on-dark)" }}>
          <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-on-dark-subtle)" }}>
            The information presented on this website is provided for general informational purposes only and is not intended to constitute medical advice, diagnosis, or treatment. Men's Wellness Centers does not provide medical advice through this website. All content is informational in nature only. Men's Wellness Centers operates physical center locations only. Medical services are provided exclusively in person following an individualized evaluation and are rendered by licensed medical professionals exercising independent clinical judgment. Testimonials and reviews reflect individual experiences only and are not intended to represent typical outcomes. Individual results vary.
          </p>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-6 border-t text-xs uppercase text-center"
          style={{ borderColor: "var(--c-border-on-dark)", color: "var(--c-text-on-dark-subtle)", letterSpacing: "0.12em" }}
        >
          © {year} Men's Wellness Centers. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
