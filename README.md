# MWC Pre-Visit Intake

A standalone, mobile-first medical intake survey for **Men's Wellness Centers**.
Lives at `/intake` (and `/intake/thanks` after submission). Patients are already
booked — this collects health history before their visit.

Stack: Vite + React + TypeScript + Tailwind + Framer Motion + Lucide + Zustand.

---

## Environment variables

Set these in your hosting environment (e.g. Lovable project secrets, Netlify,
Vercel). All are optional **except** the webhook URL when you go live.

| Variable | Purpose |
|---|---|
| `VITE_WEBHOOK_URL` | POST endpoint that receives the intake JSON. If unset, submissions are logged to the browser console (demo mode). |
| `VITE_GOOGLE_PLACES_KEY` | Optional. Enables Google Places autocomplete on the Address step (Step 3). When unset, the step falls back to four manual fields. |
| `VITE_SMS_FROM` | Optional. Display phone number shown in the sticky header. Defaults to `(757) 937-9990`. |

---

## Submission payload (POSTed to `VITE_WEBHOOK_URL`)

The intake submits the entire `IntakeState` object as `application/json`. Shape:

```jsonc
{
  "contact_id": "abc123",                       // string | null (from URL)
  "submitted_at": "2026-04-19T17:32:11.000Z",   // ISO timestamp, set on submit
  "intake_version": "v1",
  "about_you": {
    "full_legal_name": "John Smith",
    "phone": "(757) 555-1234",
    "email": "john@example.com",
    "dob": "01/01/1965"
  },
  "address": { "street": "", "city": "", "state": "", "postal_code": "" },
  "occupation": "",
  "emergency_contact": { "name": "", "relationship": "", "phone": "" },
  "primary_care_provider": {
    "provider_name": "",
    "clinic_name": "",
    "may_contact": "yes" | "no" | "urgent_only" | null,
    "none": false
  },
  "medical_history": {
    "diagnoses": ["High blood pressure", "Sleep apnea"],
    "diagnosis_details": ""
  },
  "medications": "",
  "allergies": "",
  "lifestyle": {
    "tobacco": "yes" | "no" | "former" | null,
    "alcohol": "yes" | "no" | "occasionally" | null
  },
  "hormone_therapy": { "used_before": true | false | null, "details": "" },
  "symptoms": {
    "physical": [], "psychological": [], "sexual": []
  },
  "visit": {
    "primary_reason": "Initial hormone evaluation",
    "primary_reason_other": "",
    "symptom_duration": "3–6 months"
  },
  "referral_source": "Social Media",
  "consents": {
    "info_accurate": true,
    "authorize_treatment": true,
    "telemedicine": true,
    "privacy_practices": true
  },
  "signature": {
    "typed_name": "John Smith",
    "signed_at": "2026-04-19T17:32:11.000Z"
  }
}
```

Any 2xx response is treated as success. On network error or non-2xx, the
client retries **once** after 1s before showing an error banner on Step 19.

---

## GHL (GoHighLevel) integration

### Outbound SMS link

Send patients a deep link from a GHL workflow that pre-fills About You and
skips that step:

```
https://YOUR-DOMAIN/intake
  ?contact_id={{contact.id}}
  &first_name={{contact.first_name}}
  &last_name={{contact.last_name}}
  &phone={{contact.phone}}
  &email={{contact.email}}
  &dob={{contact.date_of_birth}}
```

Accepted `dob` formats: `MM/DD/YYYY` or ISO `YYYY-MM-DD`. When all four of
`first_name`+`last_name`, `phone`, `email`, and `dob` are present, the user
lands on Step 3 (Address) and never sees the About You screen.

### Inbound webhook → GHL custom field mapping

In your GHL inbound webhook step, suggested mappings:

| GHL contact custom field | Source | Transform |
|---|---|---|
| `intake_diagnoses` | `medical_history.diagnoses` | join with `, ` |
| `intake_symptoms_physical` | `symptoms.physical` | join with `, ` |
| `intake_symptoms_psychological` | `symptoms.psychological` | join with `, ` |
| `intake_symptoms_sexual` | `symptoms.sexual` | join with `, ` |
| `intake_visit_reason` | `visit.primary_reason` | string |
| `intake_visit_duration` | `visit.symptom_duration` | string |
| `intake_referral_source` | `referral_source` | string |
| `intake_signed_at` | `signature.signed_at` | string (ISO) |
| `intake_pcp_name` | `primary_care_provider.provider_name` | string |

Recommended: also store the entire JSON payload as a contact note or as a PDF
attachment via a downstream GHL workflow step.

### Sticky contact behavior

`contact_id` from the URL is stored in `IntakeState.contact_id` and POSTed
back with the submission, so GHL can match the inbound webhook to the
originating contact without relying on email/phone matching alone.

---

## Analytics (optional)

The intake fires the following events to `window.dataLayer` (no-op when GTM
isn't loaded):

| Event | Payload | When |
|---|---|---|
| `intake_step_view` | `{ step: 1..20 }` | every step mount |
| `intake_submitted` | `{}` | successful POST to webhook |
| `intake_submit_error` | `{ error: string }` | retry exhausted |

---

## Local development

```sh
npm i
npm run dev
```

Open http://localhost:5173/intake — submission runs in demo mode (logs to
console) when `VITE_WEBHOOK_URL` is unset.

---

## Deploying

The app is a static Vite SPA. Any host with rewrite-to-`index.html` works.

### Vercel

1. Import the repo in Vercel.
2. Framework preset: **Vite**. Build: `npm run build`. Output: `dist`.
3. **Project → Settings → Environment Variables** — add for Production + Preview:
   - `VITE_WEBHOOK_URL` — your GHL inbound webhook URL
   - `VITE_GOOGLE_PLACES_KEY` *(optional)*
   - `VITE_SMS_FROM` *(optional)*
4. Add a `vercel.json` rewrite so client-side routing works:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

### Netlify

1. Build command: `npm run build`. Publish directory: `dist`.
2. **Site settings → Build & deploy → Environment** — add the same env vars.
3. Add `public/_redirects` with:
   ```
   /*    /index.html   200
   ```

### Lovable Cloud

Use the **Publish** button. Set env vars in the Lovable project settings
before publishing. The custom domain set in Lovable becomes the base for
your GHL SMS link template.

---

## Original Lovable scaffold

Project URL: https://lovable.dev/projects/a131a39a-032a-4c81-ad7b-242d363ccd55
