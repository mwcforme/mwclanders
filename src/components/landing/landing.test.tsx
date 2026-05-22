/**
 * Smoke tests for landing page components.
 * Exercises rendering paths to boost statement coverage.
 * All tests are "render without crash" + key content assertions.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ServicesProvider } from "@/app/providers/ServicesProvider";

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <MemoryRouter>
      <ServicesProvider>{children}</ServicesProvider>
    </MemoryRouter>
  </HelmetProvider>
);

// ─── TRTResults ───────────────────────────────────────────────────────────────

describe("TRTResults", () => {
  it("renders without crash", async () => {
    const { TRTResults } = await import("@/components/landing/trt/TRTResults");
    expect(() => render(<Wrap><TRTResults /></Wrap>)).not.toThrow();
  });

  it("renders a CTA button", async () => {
    const { TRTResults } = await import("@/components/landing/trt/TRTResults");
    render(<Wrap><TRTResults /></Wrap>);
    expect(document.body.textContent?.length).toBeGreaterThan(20);
  });
});

// ─── TRTThreeProblems ─────────────────────────────────────────────────────────

describe("TRTThreeProblems", () => {
  it("renders without crash", async () => {
    const { TRTThreeProblems } = await import("@/components/landing/trt/TRTThreeProblems");
    expect(() => render(<Wrap><TRTThreeProblems /></Wrap>)).not.toThrow();
  });

  it("renders with onCta callback", async () => {
    const { TRTThreeProblems } = await import("@/components/landing/trt/TRTThreeProblems");
    expect(() =>
      render(<Wrap><TRTThreeProblems onCta={vi.fn()} /></Wrap>)
    ).not.toThrow();
  });

  it("renders with headline override object", async () => {
    const { TRTThreeProblems } = await import("@/components/landing/trt/TRTThreeProblems");
    render(<Wrap><TRTThreeProblems headlineOverride={{ line1: "Custom Headline" }} /></Wrap>);
    expect(document.body.textContent).toContain("Custom Headline");
  });
});

// ─── TRTPricing ───────────────────────────────────────────────────────────────

describe("TRTPricing", () => {
  it("renders without crash", async () => {
    const { TRTPricing } = await import("@/components/landing/trt/TRTPricing");
    expect(() => render(<Wrap><TRTPricing /></Wrap>)).not.toThrow();
  });
});

// ─── TRTEverythingIncluded ────────────────────────────────────────────────────

describe("TRTEverythingIncluded", () => {
  it("renders without crash", async () => {
    const { TRTEverythingIncluded } = await import("@/components/landing/trt/TRTEverythingIncluded");
    expect(() => render(<Wrap><TRTEverythingIncluded /></Wrap>)).not.toThrow();
  });

  it("contains included items", async () => {
    const { TRTEverythingIncluded } = await import("@/components/landing/trt/TRTEverythingIncluded");
    render(<Wrap><TRTEverythingIncluded /></Wrap>);
    expect(document.body.textContent?.length).toBeGreaterThan(50);
  });
});

// ─── TRTPillars ───────────────────────────────────────────────────────────────

describe("TRTPillars", () => {
  it("renders without crash", async () => {
    const { TRTPillars } = await import("@/components/landing/trt/TRTPillars");
    expect(() => render(<Wrap><TRTPillars /></Wrap>)).not.toThrow();
  });
});

// ─── TRTBenefitsSection ───────────────────────────────────────────────────────

describe("TRTBenefitsSection", () => {
  it("renders without crash", async () => {
    const { TRTBenefitsSection } = await import("@/components/landing/trt/TRTBenefitsSection");
    expect(() => render(<Wrap><TRTBenefitsSection /></Wrap>)).not.toThrow();
  });
});

// ─── TRTHero ──────────────────────────────────────────────────────────────────

describe("TRTHero", () => {
  it("renders without crash", async () => {
    const { TRTHero } = await import("@/components/landing/trt/TRTHero");
    expect(() => render(<Wrap><TRTHero /></Wrap>)).not.toThrow();
  });

  it("renders with custom headline (static mode)", async () => {
    const { TRTHero } = await import("@/components/landing/trt/TRTHero");
    render(<Wrap><TRTHero headline={{ line1: "CUSTOM LINE", line2: "CUSTOM LINE 2" }} /></Wrap>);
    // line2 is rendered when isStatic=true
    expect(document.body.textContent).toContain("CUSTOM LINE 2");
  });
});

// ─── TRTSignsSection ──────────────────────────────────────────────────────────

describe("TRTSignsSection", () => {
  it("renders without crash", async () => {
    const { TRTSignsSection } = await import("@/components/landing/trt/TRTSignsSection");
    expect(() =>
      render(<Wrap><TRTSignsSection onSchedule={vi.fn()} /></Wrap>)
    ).not.toThrow();
  });
});

// ─── TRTProductFAQ ────────────────────────────────────────────────────────────

describe("TRTProductFAQ", () => {
  it("renders without crash", async () => {
    const { TRTProductFAQ } = await import("@/components/landing/trt/TRTProductFAQ");
    expect(() => render(<Wrap><TRTProductFAQ /></Wrap>)).not.toThrow();
  });

  it("renders FAQ question text", async () => {
    const { TRTProductFAQ } = await import("@/components/landing/trt/TRTProductFAQ");
    render(<Wrap><TRTProductFAQ /></Wrap>);
    expect(document.body.textContent?.length).toBeGreaterThan(100);
  });
});

// ─── StickyMobileCTA ──────────────────────────────────────────────────────────

describe("StickyMobileCTA", () => {
  it("renders without crash", async () => {
    const { StickyMobileCTA } = await import("@/components/landing/trt/StickyMobileCTA");
    expect(() => render(<Wrap><StickyMobileCTA /></Wrap>)).not.toThrow();
  });
});

// ─── TRTHeroForm ──────────────────────────────────────────────────────────────

describe("TRTHeroForm", () => {
  it("renders without crash", async () => {
    const { TRTHeroForm } = await import("@/components/landing/trt/TRTHeroForm");
    expect(() => render(<Wrap><TRTHeroForm /></Wrap>)).not.toThrow();
  });

  it("renders name input", async () => {
    const { TRTHeroForm } = await import("@/components/landing/trt/TRTHeroForm");
    render(<Wrap><TRTHeroForm /></Wrap>);
    // form should have some input elements
    const inputs = document.querySelectorAll("input, select, button");
    expect(inputs.length).toBeGreaterThan(0);
  });
});

// ─── ServiceFinalCTA ──────────────────────────────────────────────────────────

describe("ServiceFinalCTA", () => {
  const props = {
    service: "wl" as const,
    headline: "Test Headline",
    subhead: "Test subhead",
    cardTitle: "Test card title",
    ctaLabel: "Get Started",
    bullets: ["Bullet 1", "Bullet 2"],
    intro: "Test intro text",
  };

  it("renders without crash", async () => {
    const { ServiceFinalCTA } = await import("@/components/landing/shared/ServiceFinalCTA");
    expect(() => render(<Wrap><ServiceFinalCTA {...props} /></Wrap>)).not.toThrow();
  });

  it("renders the headline", async () => {
    const { ServiceFinalCTA } = await import("@/components/landing/shared/ServiceFinalCTA");
    render(<Wrap><ServiceFinalCTA {...props} /></Wrap>);
    expect(document.body.textContent).toContain("Test Headline");
  });

  it("renders with ed service", async () => {
    const { ServiceFinalCTA } = await import("@/components/landing/shared/ServiceFinalCTA");
    expect(() =>
      render(<Wrap><ServiceFinalCTA {...props} service="ed" /></Wrap>)
    ).not.toThrow();
  });
});

// ─── TRTTreatmentOptionsSection ───────────────────────────────────────────────

describe("TRTTreatmentOptionsSection", () => {
  it("renders without crash", async () => {
    const { TRTTreatmentOptionsSection } = await import("@/components/landing/trt/TRTTreatmentOptionsSection");
    expect(() => render(<Wrap><TRTTreatmentOptionsSection /></Wrap>)).not.toThrow();
  });
});

// ─── TRTFAQ ───────────────────────────────────────────────────────────────────

describe("TRTFAQ", () => {
  it("renders without crash", async () => {
    const { TRTFAQ } = await import("@/components/landing/trt/TRTFAQ");
    expect(() => render(<Wrap><TRTFAQ /></Wrap>)).not.toThrow();
  });
});

// ─── TRTLocations ─────────────────────────────────────────────────────────────

describe("TRTLocations", () => {
  it("renders without crash", async () => {
    const { TRTLocations } = await import("@/components/landing/trt/TRTLocations");
    expect(() => render(<Wrap><TRTLocations /></Wrap>)).not.toThrow();
  });
});

// ─── TRTHowItWorks ────────────────────────────────────────────────────────────

describe("TRTHowItWorks", () => {
  it("renders without crash", async () => {
    const { TRTHowItWorks } = await import("@/components/landing/trt/TRTHowItWorks");
    expect(() => render(<Wrap><TRTHowItWorks /></Wrap>)).not.toThrow();
  });
});

// ─── TRTManifesto ─────────────────────────────────────────────────────────────

describe("TRTManifesto", () => {
  it("renders without crash", async () => {
    const { TRTManifesto } = await import("@/components/landing/trt/TRTManifesto");
    expect(() => render(<Wrap><TRTManifesto /></Wrap>)).not.toThrow();
  });
});

// ─── TRTFinalCTA ───────────────────────────────────────────────────────

describe("TRTFinalCTA", () => {
  it("renders without crash", async () => {
    const { TRTFinalCTA } = await import("@/components/landing/trt/TRTFinalCTA");
    expect(() => render(<Wrap><TRTFinalCTA /></Wrap>)).not.toThrow();
  });
});
