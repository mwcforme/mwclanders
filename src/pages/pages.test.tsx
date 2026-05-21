/**
 * Tests for simple pages: NotFound, legal pages, etc.
 * These render pure markup with minimal dependencies.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "@/pages/NotFound";
import { LegalPage } from "@/pages/legal/LegalPage";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import TermsOfService from "@/pages/legal/TermsOfService";
import TcpaDisclosure from "@/pages/legal/TcpaDisclosure";
import PrescribingPolicy from "@/pages/legal/PrescribingPolicy";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </HelmetProvider>
);

// ─── NotFound ─────────────────────────────────────────────────────────────────

describe("NotFound", () => {
  it("renders 404 heading", () => {
    render(<Wrapper><NotFound /></Wrapper>);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders a link back to home", () => {
    render(<Wrapper><NotFound /></Wrapper>);
    const link = screen.getByRole("link", { name: /return to home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders page not found text", () => {
    render(<Wrapper><NotFound /></Wrapper>);
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});

// ─── LegalPage ────────────────────────────────────────────────────────────────

describe("LegalPage", () => {
  it("renders legal page shell without crashing", () => {
    expect(() =>
      render(
        <Wrapper>
          <LegalPage
            title="Test Legal Page"
            updated="2024-01-01"
          >
            <p>Legal content here.</p>
          </LegalPage>
        </Wrapper>,
      ),
    ).not.toThrow();
  });

  it("renders the title", () => {
    render(
      <Wrapper>
        <LegalPage title="Privacy Policy" updated="2024-01-01">
          <p>Content</p>
        </LegalPage>
      </Wrapper>,
    );
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders last updated date", () => {
    render(
      <Wrapper>
        <LegalPage title="TOS" updated="January 1, 2024">
          <p>Content</p>
        </LegalPage>
      </Wrapper>,
    );
    expect(screen.getByText(/January 1, 2024/)).toBeInTheDocument();
  });
});

// ─── Legal pages ──────────────────────────────────────────────────────────────

describe("PrivacyPolicy", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<Wrapper><PrivacyPolicy /></Wrapper>)
    ).not.toThrow();
  });

  it("contains privacy-related content", () => {
    render(<Wrapper><PrivacyPolicy /></Wrapper>);
    expect(document.body.textContent).toMatch(/privacy|information/i);
  });
});

describe("TermsOfService", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<Wrapper><TermsOfService /></Wrapper>)
    ).not.toThrow();
  });
});

describe("TcpaDisclosure", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<Wrapper><TcpaDisclosure /></Wrapper>)
    ).not.toThrow();
  });
});

describe("PrescribingPolicy", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<Wrapper><PrescribingPolicy /></Wrapper>)
    ).not.toThrow();
  });
});
