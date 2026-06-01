import { lazy, Suspense } from "react";
import { PHONE } from "@/lib/constants";
import { Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ServicesProvider } from "@/app/providers/ServicesProvider";
import { BookingRouteGuard } from "./domain/booking/bookingRouteGuard";

// ─── EAGER: TRT landing page is the PPC entry point — zero delay ───────────
import NewLandingPage from "./pages/NewLandingPage";

// ─── LAZY: everything else splits into separate chunks automatically ────────
const NewWeightLoss   = lazy(() => import("./pages/NewWeightLoss"));
const OptimizeLP      = lazy(() => import("./pages/OptimizeLP"));
const NewED           = lazy(() => import("./pages/NewED"));
const TRTLandingPage  = lazy(() => import("./pages/TRTLandingPage"));
const TRTEducation    = lazy(() => import("./pages/TRTEducation"));
const Affordability   = lazy(() => import("./pages/Affordability"));
const ProductTRT      = lazy(() => import("./pages/ProductTRT"));

// TRT funnel
const TRTGetStarted    = lazy(() => import("./pages/product/TRTGetStarted"));
const TRTQuestionnaire = lazy(() => import("./pages/product/TRTQuestionnaire"));
const TRTSuccess       = lazy(() => import("./pages/product/TRTSuccess"));

// Quiz funnel
const TRTQuiz          = lazy(() => import("./pages/TRTQuiz"));
const TRTQuizApproved  = lazy(() => import("./pages/TRTQuizApproved"));
const HormoneQuiz      = lazy(() => import("./pages/quiz/HormoneQuiz"));
const ShortQuiz        = lazy(() => import("./pages/ShortQuiz"));
const ShortQuizApproved = lazy(() => import("./pages/ShortQuizApproved"));
const DateFirstLander   = lazy(() => import("./pages/DateFirstLander"));

// Booking funnel
const BookLocation = lazy(() => import("./pages/book/BookLocation"));
const BookSymptom  = lazy(() => import("./pages/book/BookSymptom"));
const BookDuration = lazy(() => import("./pages/book/BookDuration"));
const BookSchedule = lazy(() => import("./pages/book/BookSchedule"));
const BookConfirmed = lazy(() => import("./pages/book/BookConfirmed"));
const BookLetsTalk  = lazy(() => import("./pages/book/BookLetsTalk"));
const BookEntry     = lazy(() => import("./pages/book/BookEntry"));

// Dev / QA preview routes (seed store without real booking flow)
const BookDevConfirmed = lazy(() => import("./pages/book/BookDevPreview").then(m => ({ default: m.BookDevConfirmed })));
const BookDevSchedule  = lazy(() => import("./pages/book/BookDevPreview").then(m => ({ default: m.BookDevSchedule })));

// Legal
const PrivacyPolicy     = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService    = lazy(() => import("./pages/legal/TermsOfService"));
const TcpaDisclosure    = lazy(() => import("./pages/legal/TcpaDisclosure"));
const PrescribingPolicy = lazy(() => import("./pages/legal/PrescribingPolicy"));

// Admin
const AdminLogin    = lazy(() => import("./pages/admin/AdminLogin"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminLeads    = lazy(() => import("./pages/admin/AdminLeads"));
const AdminEvents   = lazy(() => import("./pages/admin/AdminEvents"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const RequireAdmin  = lazy(() =>
  import("./components/admin/RequireAdmin").then((m) => ({ default: m.RequireAdmin }))
);

const TRTSolution = lazy(() => import("./pages/TRTSolution"));
const EDSolution  = lazy(() => import("./pages/EDSolution"));
const WLSolution  = lazy(() => import("./pages/WLSolution"));

const FormEmbed = lazy(() => import("./pages/FormEmbed"));
const NotFound  = lazy(() => import("./pages/NotFound"));

// ─── Suspense fallback ──────────────────────────────────────────────────────
const PageLoader = () => (
  <div
    style={{ minHeight: "100vh", background: "#0B1029", display: "flex", alignItems: "center", justifyContent: "center" }}
    aria-label="Loading"
  >
    <div style={{ width: 36, height: 36, border: "3px solid rgba(255,107,44,0.25)", borderTopColor: "var(--brand-cta)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ErrorFallback = ({ resetError }: { resetError: () => void }) => (
  <div role="alert" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1029", color: "var(--c-text-on-dark)", fontFamily: "Inter, sans-serif", padding: "24px", textAlign: "center" }}>
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 32, marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Please refresh the page or call us at{" "}
        <a href={PHONE.tel} style={{ color: "var(--brand-cta)" }}>{PHONE.display}</a>.
      </p>
      <button type="button" onClick={resetError} style={{ background: "var(--brand-cta)", color: "var(--c-text-on-dark)", border: "none", borderRadius: 999, padding: "12px 28px", fontWeight: 600, cursor: "pointer" }}>  {/* was var(--brand-cta) 3.29:1 FAIL → var(--brand-cta) #B84A08 5.22:1 ✅ */}
        Try again
      </button>
    </div>
  </div>
);

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  componentDidCatch(error: Error, info: { componentStack: string }) {
    import("@sentry/react").then(({ captureException }) => {
      captureException(error, { extra: { componentStack: info.componentStack } });
    }).catch(() => {});
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }
  render() {
    if (this.state.error) return <ErrorFallback resetError={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}

const App = () => (
  <AppErrorBoundary>
    <BrowserRouter>
      <ServicesProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Landing pages ── */}
            <Route path="/"             element={<NewLandingPage />} />
            <Route path="/optimize"     element={<OptimizeLP />} />
            <Route path="/trt"          element={<TRTLandingPage />} />
            <Route path="/ed"           element={<NewED />} />
            <Route path="/wl"           element={<NewWeightLoss />} />
            <Route path="/pricing"      element={<Affordability />} />
            <Route path="/trt-education" element={<TRTEducation />} />

            {/* ── Product / TRT funnel ── */}
            <Route path="/product/trt"              element={<ProductTRT />} />
            <Route path="/product/trt/get-started"  element={<TRTGetStarted />} />
            <Route path="/product/trt/questionnaire" element={<TRTQuestionnaire />} />
            <Route path="/product/trt/success"      element={<TRTSuccess />} />

            {/* ── Quiz funnel ── */}
            <Route path="/quiz"               element={<TRTQuiz />} />
            <Route path="/quiz/approved"     element={<TRTQuizApproved />} />
            <Route path="/check"             element={<HormoneQuiz />} />
            <Route path="/short-quiz"        element={<ShortQuiz />} />
            <Route path="/short-quiz/approved" element={<ShortQuizApproved />} />
            <Route path="/book-now"           element={<DateFirstLander />} />

            {/* ── Booking funnel ── */}
            <Route path="/book"         element={<Navigate to="/book/location" replace />} />
            <Route path="/book/entry"   element={<BookEntry />} />
            {/* Dev QA routes — seed store without full booking flow */}
            <Route path="/book/dev-confirmed" element={<Suspense fallback={null}><BookDevConfirmed /></Suspense>} />
            <Route path="/book/dev-schedule"  element={<Suspense fallback={null}><BookDevSchedule /></Suspense>} />
            <Route element={<BookingRouteGuard />}>
              <Route path="/book/location"  element={<BookLocation />} />
              <Route path="/book/symptom"   element={<BookSymptom />} />
              <Route path="/book/duration"  element={<BookDuration />} />
              <Route path="/book/schedule"  element={<BookSchedule />} />
              <Route path="/book/confirmed" element={<BookConfirmed />} />
              <Route path="/book/lets-talk" element={<BookLetsTalk />} />
            </Route>

            {/* ── Legal ── */}
            <Route path="/privacy-policy"     element={<PrivacyPolicy />} />
            <Route path="/terms-of-service"   element={<TermsOfService />} />
            <Route path="/tcpa"               element={<TcpaDisclosure />} />
            <Route path="/prescribing-policy" element={<PrescribingPolicy />} />
            <Route path="/form"               element={<FormEmbed />} />

            {/* ── Admin ── */}
            <Route path="/admin"          element={<AdminLogin />} />
            <Route path="/admin/login"    element={<Navigate to="/admin" replace />} />
            <Route path="/admin/overview" element={<RequireAdmin><AdminOverview /></RequireAdmin>} />
            <Route path="/admin/leads"    element={<RequireAdmin><AdminLeads /></RequireAdmin>} />
            <Route path="/admin/events"   element={<RequireAdmin><AdminEvents /></RequireAdmin>} />
            <Route path="/admin/analytics" element={<RequireAdmin><AdminAnalytics /></RequireAdmin>} />

            <Route path="/trt-solution" element={<TRTSolution />} />
            <Route path="/ed-solution"  element={<EDSolution />} />
            <Route path="/wl-solution"  element={<WLSolution />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  </AppErrorBoundary>
);

export default App;
