import { lazy, Suspense } from "react";
import { PHONE } from "@/lib/constants";
import { Component, type ReactNode } from "react";
// Toaster removed — toast() only called in LpDirectory (internal admin), replaced with inline state
// TooltipProvider removed — no Tooltip components are used anywhere in the app
// @tanstack/react-query removed — QueryClientProvider wrapped App but zero useQuery calls exist in codebase
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ServicesProvider } from "@/app/providers/ServicesProvider";
import { MobileFooterBar } from "./components/shared/MobileFooterBar";
import { BookingRouteGuard } from "./domain/booking/bookingRouteGuard";

// ─── EAGER: TRT landing page is the PPC entry point — zero delay ───────────
import NewLandingPage from "./pages/NewLandingPage";

// ─── LAZY: everything else splits into separate chunks automatically ────────
// CRO-optimized LP — paid media, no nav
const CROOptimized    = lazy(() => import("./pages/CROOptimized"));

// WL + ED — secondary LPs, load on route match
const NewWeightLoss   = lazy(() => import("./pages/NewWeightLoss"));
const NewED           = lazy(() => import("./pages/NewED"));
const TRTLandingPage  = lazy(() => import("./pages/TRTLandingPage"));
const TRTEducation    = lazy(() => import("./pages/TRTEducation"));
const Affordability   = lazy(() => import("./pages/Affordability"));
const ProductTRT         = lazy(() => import("./pages/ProductTRT"));
const ProductTRTSchedule = lazy(() => import("./pages/ProductTRTSchedule"));

// TRT funnel — loads on route match
const TRTGetStarted          = lazy(() => import("./pages/product/TRTGetStarted"));
const TRTMedicalProtocol     = lazy(() => import("./pages/product/TRTMedicalProtocol"));
const TRTQuestionnaire       = lazy(() => import("./pages/product/TRTQuestionnaire"));
const TRTIdentityVerification = lazy(() => import("./pages/product/TRTIdentityVerification"));
const TRTBloodwork           = lazy(() => import("./pages/product/TRTBloodwork"));
const TRTLabRequisition      = lazy(() => import("./pages/product/TRTLabRequisition"));
const TRTSuccess             = lazy(() => import("./pages/product/TRTSuccess"));

// Quiz funnel — only loads when user hits /quiz
const TRTQuiz         = lazy(() => import("./pages/TRTQuiz"));
const TRTQuizApproved = lazy(() => import("./pages/TRTQuizApproved"));

// Booking funnel — only loads after lead form submit
const BookLocation    = lazy(() => import("./pages/book/BookLocation"));
const BookSymptom     = lazy(() => import("./pages/book/BookSymptom"));
const BookDuration    = lazy(() => import("./pages/book/BookDuration"));
const BookSchedule    = lazy(() => import("./pages/book/BookSchedule"));
const BookSchedule2   = lazy(() => import("./pages/book/BookSchedule2"));
const BookConfirmed   = lazy(() => import("./pages/book/BookConfirmed"));
const BookLetsTalk    = lazy(() => import("./pages/book/BookLetsTalk"));
const BookEntry        = lazy(() => import("./pages/book/BookEntry"));
const BookDevConfirmed = lazy(() => import("./pages/book/BookDevPreview").then(m => ({ default: m.BookDevConfirmed })));
const BookDevSchedule  = lazy(() => import("./pages/book/BookDevPreview").then(m => ({ default: m.BookDevSchedule })));



// Legal — rarely visited, no rush
const PrivacyPolicy     = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService    = lazy(() => import("./pages/legal/TermsOfService"));
const TcpaDisclosure    = lazy(() => import("./pages/legal/TcpaDisclosure"));
const PrescribingPolicy = lazy(() => import("./pages/legal/PrescribingPolicy"));

// Admin — never visited by PPC traffic
const AdminLogin    = lazy(() => import("./pages/admin/AdminLogin"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminLeads    = lazy(() => import("./pages/admin/AdminLeads"));
const AdminEvents   = lazy(() => import("./pages/admin/AdminEvents"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const RequireAdmin = lazy(() =>
  import("./components/admin/RequireAdmin").then((m) => ({ default: m.RequireAdmin }))
);

// Internal
const LpDirectory = lazy(() => import("./pages/internal/LpDirectory"));
const FormEmbed   = lazy(() => import("./pages/FormEmbed"));
const NotFound    = lazy(() => import("./pages/NotFound"));

// ─── Suspense fallback: dark screen matches brand, no layout shift ──────────
const PageLoader = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#0B1029",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    aria-label="Loading"
  >
    <div
      style={{
        width: 36,
        height: 36,
        border: "3px solid rgba(232,103,10,0.25)",
        borderTopColor: "#E8670A",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);


const ErrorFallback = ({ resetError }: { resetError: () => void }) => (
  <div
    role="alert"
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#000814",
      color: "var(--c-text-on-dark)",
      fontFamily: "Inter, sans-serif",
      padding: "24px",
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 32, marginBottom: 12 }}>
        Something went wrong
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Please refresh the page or call us at{" "}
        <a href={PHONE.tel} style={{ color: "#E8670A" }}>{PHONE.display}</a>.
      </p>
      <button
        type="button"
        onClick={resetError}
        style={{
          background: "#E8670A",
          color: "var(--c-text-on-dark)",
          border: "none",
          borderRadius: 999,
          padding: "12px 28px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  </div>
);

// Lightweight React error boundary — replaces Sentry.ErrorBoundary
class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <ErrorFallback resetError={() => this.setState({ error: null })} />
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <AppErrorBoundary>
    <>
      <>
        <BrowserRouter>
          <ServicesProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Primary TRT LP — eager, zero delay ── */}
                <Route path="/" element={<NewLandingPage />} />

                {/* ── CRO LP ── */}
                <Route path="/cro-op" element={<CROOptimized />} />

                {/* ── Secondary LPs ── */}
                <Route path="/trt" element={<TRTLandingPage />} />
                <Route path="/trt-education" element={<TRTEducation />} />
                <Route path="/product/trt" element={<ProductTRT />} />
                <Route path="/product/trt/schedule" element={<ProductTRTSchedule />} />
                <Route path="/product/trt/get-started" element={<TRTGetStarted />} />
                <Route path="/product/trt/medical-protocol" element={<TRTMedicalProtocol />} />
                <Route path="/product/trt/questionnaire" element={<TRTQuestionnaire />} />
                <Route path="/product/trt/identity-verification" element={<TRTIdentityVerification />} />
                <Route path="/product/trt/bloodwork" element={<TRTBloodwork />} />
                <Route path="/product/trt/bloodwork/lab-requisition" element={<TRTLabRequisition />} />
                <Route path="/product/trt/success" element={<TRTSuccess />} />
                <Route path="/wl" element={<NewWeightLoss />} />
                <Route path="/ed" element={<NewED />} />
                <Route path="/pricing" element={<Affordability />} />
                <Route path="/new" element={<Navigate to="/" replace />} />
                <Route path="/new-wl" element={<Navigate to="/wl" replace />} />
                <Route path="/new-ed" element={<Navigate to="/ed" replace />} />

                {/* ── Quiz funnel ── */}
                <Route path="/quiz" element={<TRTQuiz />} />
                <Route path="/quiz/approved" element={<TRTQuizApproved />} />

                {/* ── Booking funnel ── */}
                <Route path="/book" element={<Navigate to="/book/location" replace />} />
                {/* Legacy contact route — redirect to location */}
                <Route path="/book/contact" element={<Navigate to="/book/location" replace />} />
                {/* WordPress handoff — token exchange, no BookingRouteGuard */}
                <Route path="/book/entry"         element={<BookEntry />} />
                {/* Ralph QA routes — seeded state, bypass guard, remove pre-launch */}
                <Route path="/book/dev-confirmed"  element={<BookDevConfirmed />} />
                <Route path="/book/dev-schedule"   element={<BookDevSchedule />} />


                <Route element={<BookingRouteGuard />}>
                  <Route path="/book/location"  element={<BookLocation />} />
                  <Route path="/book/schedule"  element={<BookSchedule />} />
                  <Route path="/book/confirmed" element={<BookConfirmed />} />
                  <Route path="/book/lets-talk" element={<BookLetsTalk />} />
                  {/* Legacy routes kept for WP-entry flow */}
                  <Route path="/book/symptom"   element={<BookSymptom />} />
                  <Route path="/book/duration"  element={<BookDuration />} />
                  <Route path="/book/schedule2" element={<BookSchedule2 />} />
                </Route>

                {/* ── Legal ── */}
                <Route path="/lp"                element={<LpDirectory />} />
                <Route path="/form"              element={<FormEmbed />} />
                <Route path="/privacy-policy"    element={<PrivacyPolicy />} />
                <Route path="/terms-of-service"  element={<TermsOfService />} />
                <Route path="/tcpa"              element={<TcpaDisclosure />} />
                <Route path="/prescribing-policy" element={<PrescribingPolicy />} />

                {/* ── Admin ── */}
                <Route path="/admin"          element={<AdminLogin />} />
                <Route path="/admin/login"    element={<Navigate to="/admin" replace />} />
                <Route path="/admin/overview" element={<RequireAdmin><AdminOverview /></RequireAdmin>} />
                <Route path="/admin/leads"    element={<RequireAdmin><AdminLeads /></RequireAdmin>} />
                <Route path="/admin/events"   element={<RequireAdmin><AdminEvents /></RequireAdmin>} />
                <Route path="/admin/analytics" element={<RequireAdmin><AdminAnalytics /></RequireAdmin>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <MobileFooterBar />

          </ServicesProvider>
        </BrowserRouter>
      </>
    </>
  </AppErrorBoundary>
);

export default App;
