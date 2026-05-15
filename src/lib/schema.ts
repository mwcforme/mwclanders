import { LOCATIONS, type Location } from "@/data/locations";
import { TRT_FAQS, type FaqItem } from "@/data/faqs";

const ORIGIN = "https://book.menswellnesscenters.com";

/**
 * Build LocalBusiness JSON-LD for one center.
 * Saturday MUST be in dayOfWeek per business rules.
 */
export function buildLocalBusinessJsonLd(loc: Location) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `${ORIGIN}/#${loc.slug}`,
    name: loc.name,
    url: ORIGIN,
    telephone: loc.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.address,
      addressLocality: loc.city,
      addressRegion: "VA",
      postalCode: loc.cityStateZip.match(/\d{5}/)?.[0],
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: loc.geo.latitude,
      longitude: loc.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: loc.weeklyOpens,
        closes: loc.weeklyCloses,
      },
    ],
    priceRange: "$$",
  };
}

export function buildAllLocationsJsonLd() {
  return LOCATIONS.map(buildLocalBusinessJsonLd);
}

export function buildFaqJsonLd(faqs: FaqItem[] = TRT_FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}
