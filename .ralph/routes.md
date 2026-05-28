# Route Inventory — src/App.tsx

## Landing Pages
| Path | Component | Lazy |
|------|-----------|------|
| `/` | NewLandingPage | **EAGER** (PPC entry point) |
| `/optimize` | OptimizeLP | lazy |
| `/trt` | TRTLandingPage | lazy |
| `/ed` | NewED | lazy |
| `/wl` | NewWeightLoss | lazy |
| `/pricing` | Affordability | lazy |
| `/trt-education` | TRTEducation | lazy |

## Product / TRT Funnel
| Path | Component | Lazy |
|------|-----------|------|
| `/product/trt` | ProductTRT | lazy |
| `/product/trt/get-started` | TRTGetStarted | lazy |
| `/product/trt/questionnaire` | TRTQuestionnaire | lazy |
| `/product/trt/success` | TRTSuccess | lazy |

## Quiz Funnel
| Path | Component | Lazy |
|------|-----------|------|
| `/quiz` | TRTQuiz | lazy |
| `/quiz/approved` | TRTQuizApproved | lazy |

## Booking Funnel (guarded by BookingRouteGuard)
| Path | Component | Lazy | Guard |
|------|-----------|------|-------|
| `/book` | Navigate → `/book/location` | N/A | No |
| `/book/entry` | BookEntry | lazy | No |
| `/book/location` | BookLocation | lazy | BookingRouteGuard |
| `/book/symptom` | BookSymptom | lazy | BookingRouteGuard |
| `/book/duration` | BookDuration | lazy | BookingRouteGuard |
| `/book/schedule` | BookSchedule | lazy | BookingRouteGuard |
| `/book/confirmed` | BookConfirmed | lazy | BookingRouteGuard |
| `/book/lets-talk` | BookLetsTalk | lazy | BookingRouteGuard |

## Legal
| Path | Component | Lazy |
|------|-----------|------|
| `/privacy-policy` | PrivacyPolicy | lazy |
| `/terms-of-service` | TermsOfService | lazy |
| `/tcpa` | TcpaDisclosure | lazy |
| `/prescribing-policy` | PrescribingPolicy | lazy |
| `/form` | FormEmbed | lazy |

## Admin
| Path | Component | Lazy | Guard |
|------|-----------|------|-------|
| `/admin` | AdminLogin | lazy | No |
| `/admin/login` | Navigate → `/admin` | N/A | No |
| `/admin/overview` | AdminOverview | lazy | RequireAdmin |
| `/admin/leads` | AdminLeads | lazy | RequireAdmin |
| `/admin/events` | AdminEvents | lazy | RequireAdmin |
| `/admin/analytics` | AdminAnalytics | lazy | RequireAdmin |

## Catch-all
| Path | Component | Lazy |
|------|-----------|------|
| `*` | NotFound | lazy |

## Total Routes: 28 (26 unique paths + 2 redirects)
