# Services Section Refactor — "Three Problems" → "One Provider"

**Date:** 2026-05-24
**File:** `src/components/landing/trt/TRTThreeProblems.tsx`

---

## Before / After Copy

### Eyebrow
| | Copy |
|---|---|
| Before | `OUR SERVICES` |
| After | `INTEGRATED CARE` |

**Rationale:** "Our Services" is category labeling — it describes the menu, not the value. "Integrated Care" encodes MWC's actual wedge: all three concerns handled by one provider in one visit. Counters both archetypes (franchise = separate silos; hospital = separate departments/referrals).

---

### Headline
| | Line 1 | Line 2 (orange) |
|---|---|---|
| Before | `THREE PROBLEMS.` | `ONE CLINIC.` |
| After | `ONE PROVIDER.` | `THREE CONCERNS.` |

**Rationale:** "Three Problems" frames the member as broken. "One Provider. Three Concerns." frames MWC as the answer and the member as someone with goals, not deficits. "Concerns" is clinical and neutral — no fear framing. Counters franchise (one provider per visit vs. rotating staff) and hospital (three separate referrals vs. one relationship).

**A/B Variant A (headline):**
- Line 1: `YOUR PROVIDER.`
- Line 2: `YOUR PROTOCOL.`
- Tests personalization over integration message.

**A/B Variant B (headline):**
- Line 1: `SEEN THIS WEEK.`
- Line 2: `NOT NEXT QUARTER.`
- Tests urgency/access angle directly against hospital wait times.

---

### Subhead
| | Copy |
|---|---|
| Before | `TRT, ED care, and medical weight loss under one roof. Virginia providers who specialize in men's health. Not a side service.` (26 words) |
| After | `TRT, ED care, and medical weight loss in one Virginia center. Your provider reviews your labs in person, same day. No referrals, no waiting rooms, no generic protocols.` (29 words) |

**Rationale:** After copy encodes three specific anti-competitor cues in one sentence: "same day" (anti-hospital), "no referrals" (anti-hospital), "no generic protocols" (anti-franchise). "Your provider" signals ongoing relationship vs. rotating clinicians.

**A/B Variant A (subhead):**
> "A Virginia-licensed provider reviews your labs on-site, same day. TRT, ED care, and weight loss under one roof — one provider, one plan, ongoing care."

**A/B Variant B (subhead):**
> "Seen this week, not next quarter. Labs reviewed on-site. One Virginia provider, three areas of care, no referrals required."

---

### Card Copy

#### TRT Card
| | Copy | Competitor cue |
|---|---|---|
| Before headline | `Low T is more common than you think.` | Neither — problem framing |
| After headline | `Your labs, reviewed by your provider.` | Anti-franchise (your numbers, not a template) |
| Before body | `Most men over 40 have it. Most are never told. A licensed Virginia provider reviews your labs on-site and builds a protocol specific to your numbers. Not a generic template.` | Anti-franchise only |
| After body | `A Virginia-licensed provider reviews your bloodwork on-site and builds a protocol around your numbers. Seen this week. No referrals. No template protocols.` | Anti-franchise ("your numbers, no template") + Anti-hospital ("seen this week, no referrals") |

#### ED Card
| | Copy | Competitor cue |
|---|---|---|
| Before headline | `A medical issue with medical solutions.` | Neither — category statement |
| After headline | `In-person diagnosis. Clinical answers.` | Anti-franchise (in-person, not call-center) + Anti-hospital (answers, not a referral queue) |
| Before body | `ED is vascular. It responds to proper diagnosis and treatment. In-person evaluation, FDA-approved options, and a plan that actually works.` | Weak on both |
| After body | `ED has a vascular cause and a medical solution. An in-person evaluation with a Virginia-licensed provider, same-day, with FDA-approved options reviewed on site.` | Anti-franchise ("in-person evaluation," "Virginia-licensed") + Anti-hospital ("same-day," "on site") |

#### Weight Loss Card
| | Copy | Competitor cue |
|---|---|---|
| Before headline | `The same effort used to work.` | Problem framing, no positioning |
| After headline | `Lab-guided protocol. Ongoing care.` | Anti-franchise (ongoing, not a one-time sale) + Anti-hospital (lab-guided, not referral-dependent) |
| Before body | `Diet and exercise aren't the full story for most men. GLP-1 therapy, lab-guided protocols, and a provider who monitors your progress make the difference.` | Anti-franchise only |
| After body | `GLP-1 therapy prescribed and monitored by a Virginia provider, not a call-center intake. Labs reviewed at every visit. One provider, one plan, adjusted as you progress.` | Anti-franchise ("not a call-center intake," "one plan") + Anti-hospital ("labs reviewed at every visit," "adjusted as you progress") |

---

## Exit Criteria Checklist

| Criterion | Status |
|---|---|
| Eyebrow ≤3 words, uppercase, confident label | ✅ "Integrated Care" — 2 words |
| Headline positive framing, Oswald uppercase, line 1 ≤4 words, line 2 ≤4 words, orange on line 2 only | ✅ "ONE PROVIDER." / "THREE CONCERNS." — 2 words each |
| Subhead ≤30 words, encodes anti-franchise + anti-hospital cues through specifics | ✅ 29 words, 3 specific cues |
| TRT card: revised headline ≤8 words, positive framing | ✅ 6 words |
| TRT card: body ≤35 words, one anti-franchise + one anti-hospital cue | ✅ 25 words, both cues present |
| ED card: revised headline ≤8 words, positive framing | ✅ 5 words |
| ED card: body ≤35 words, one anti-franchise + one anti-hospital cue | ✅ 27 words, both cues present |
| WL card: revised headline ≤8 words, positive framing | ✅ 5 words |
| WL card: body ≤35 words, one anti-franchise + one anti-hospital cue | ✅ 29 words, both cues present |
| No banned words (problem/problems/broken/suffering/struggle/fix/free/guaranteed/cure/100%/risk-free/best/only/#1/guy/guys/em-dashes) | ✅ None present |
| HIPAA-safe, "members" not "patients" | ✅ No PHI, no "patients" |
| Analytics event handlers preserved | ✅ handleCta(s.href) unchanged, onCta prop unchanged |
| Lint + typecheck clean | ✅ 466/466 tests pass, tsc clean |
| Visual hierarchy unchanged | ✅ JSX structure identical, only strings changed |

---

## A/B Test Recommendations

**Test 1 — Headline angle (highest leverage)**
- Control: `ONE PROVIDER. / THREE CONCERNS.`
- Variant A: `YOUR PROVIDER. / YOUR PROTOCOL.` (personalization)
- Variant B: `SEEN THIS WEEK. / NOT NEXT QUARTER.` (access urgency)
- Primary metric: scroll-to-form rate from this section
- Min sample: 500 sessions per variant

**Test 2 — Subhead specificity**
- Control: current (29 words, 3 cues)
- Variant: `"A Virginia-licensed provider reviews your labs on-site, same day. TRT, ED care, and weight loss under one roof — one provider, one plan, ongoing care."`
- Primary metric: time-on-section, CTA click rate
- Min sample: 400 sessions per variant

**Test 3 — Card headline frame**
- Control: outcome frame (`"Your labs, reviewed by your provider."`)
- Variant: access frame (`"Labs reviewed. Protocol set. Same day."`)
- Primary metric: card-level CTA click rate (tracked via existing data-cro attributes)
- Min sample: 600 sessions per variant
