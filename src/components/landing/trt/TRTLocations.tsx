import { useState } from "react";
import { MapPin, Phone, Clock, ChevronDown } from "lucide-react";
import { COPY } from "@/data/copy";

const locations = [
  {
    slug: "richmond-va",
    name: "Men's Wellness Centers, Richmond",
    city: "Glen Allen",
    address: "4050 Innslake Dr, Suite 360",
    cityStateZip: "Glen Allen, VA 23060",
    phone: "(804) 346-4636",
    phoneHref: "tel:8043464636",
    hours: "Mon–Fri 8:00 AM – 6:00 PM · Sat 8:00 AM – 4:00 PM",
    driveTime: "5 min from I-64",
  },
  {
    slug: "newport-news-va",
    name: "Men's Wellness Centers, Newport News",
    city: "Newport News",
    address: "827 Diligence Drive, Suite 206",
    cityStateZip: "Newport News, VA 23606",
    phone: "(757) 806-6263",
    phoneHref: "tel:7578066263",
    hours: "Mon–Fri 8:00 AM – 6:00 PM · Sat 8:00 AM – 4:00 PM",
    driveTime: "3 min from I-64, Exit 258A",
  },
  {
    slug: "virginia-beach-va",
    name: "Men's Wellness Centers, Virginia Beach",
    city: "Virginia Beach",
    address: "996 First Colonial Road",
    cityStateZip: "Virginia Beach, VA 23454",
    phone: "(757) 806-6263",
    phoneHref: "tel:7578066263",
    hours: "Mon–Fri 8:00 AM – 6:00 PM · Sat 8:00 AM – 4:00 PM",
    driveTime: "5 min from I-264",
  },
];

export const TRTLocations = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const bookAt = (slug: string) => () => {
    const el = document.getElementById("booking") || document.getElementById("final-cta");
    el?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("lp_trt_cta_click", { detail: { location: "locations", clinic: slug } }));
  };

  return (
    <section id="locations" style={{ background: "#FFFFFF" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <h2 className="font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif", color: "#000033", fontSize: "clamp(26px, 3vw, 38px)", letterSpacing: "0.02em" }}>
          3 Virginia Centers
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {locations.map((l, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={l.slug} className="rounded-2xl p-6 flex flex-col" style={{ border: "1px solid var(--c-border-on-light)", background: "#FFFFFF" }}>
                <div className="font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif", color: "#000033", fontSize: 22, letterSpacing: "0.02em" }}>
                  {l.city}
                </div>
                <div className="text-xs mt-1 mb-3" style={{ color: "var(--c-text-on-light-muted)", fontFamily: "Inter, sans-serif" }}>{l.name}</div>
                <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase" style={{ color: "#000033", fontFamily: "Inter, sans-serif", letterSpacing: "0.06em" }}>
                  <MapPin className="h-3.5 w-3.5" style={{ color: "var(--brand-cta)" }} /> {l.driveTime}
                </div>

                {/* Mobile: collapsed by default */}
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="md:hidden flex items-center justify-between w-full text-sm font-semibold uppercase py-2 mb-2 cursor-pointer"
                  style={{ color: "#000033", fontFamily: "Inter, sans-serif", background: "none", border: "none", letterSpacing: "0.06em" }}
                >
                  <span>Address &amp; Hours</span>
                  <ChevronDown className="h-4 w-4 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }} />
                </button>

                <div className={`space-y-2.5 text-sm ${isOpen ? "block" : "hidden"} md:block`} style={{ color: "#1a1a2e", fontFamily: "Inter, sans-serif" }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.name}, ${l.address}, ${l.cityStateZip}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 hover:opacity-70 transition-opacity"
                    style={{ color: "#1a1a2e", textDecoration: "none" }}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--brand-cta)" }} />
                    <div className="underline underline-offset-2">{l.address}<br />{l.cityStateZip}</div>
                  </a>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0" style={{ color: "var(--brand-cta)" }} />
                    <span>{l.hours}</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t flex flex-col gap-2" style={{ borderColor: "var(--c-border-on-light)" }}>
                  <a
                    href={l.phoneHref}
                    className="text-xs font-semibold uppercase text-center rounded-full inline-flex items-center justify-center gap-2"
                    style={{ height: 48, minHeight: 48, color: "#000033", border: "1px solid #000033", letterSpacing: "0.08em", fontFamily: "Inter, sans-serif", textDecoration: "none" }}
                  >
                    <Phone className="h-4 w-4" /> Call {l.phone}
                  </a>
                  <button
                    onClick={bookAt(l.slug)}
                    className="font-bold uppercase text-center rounded-full cursor-pointer inline-flex items-center justify-center"
                    style={{ height: 48, minHeight: 48, background: "var(--brand-cta)", color: "#FFFFFF", fontSize: 15, letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", border: "none" }}
                  >
                    Book No-Cost Consult
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
