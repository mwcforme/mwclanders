# lead-intake

Headless HTTP endpoint that accepts lead form submissions from external
sources (WordPress + Gravity Forms, partner sites, Zapier, plain cURL).

- **URL**: `https://stmyztkmioobdbxliktn.supabase.co/functions/v1/lead-intake`
- **Methods**: `POST`, `OPTIONS`
- **Auth**: optional shared secret via `X-Intake-Token` header (set the
  `LEAD_INTAKE_TOKEN` Supabase secret to enable; leave unset for open access).
- **Content-Types accepted**:
  - `application/json`
  - `application/x-www-form-urlencoded` (Gravity Forms postback)
  - `multipart/form-data` (Gravity Forms with files/checkboxes)

## Behavior

1. Validates and normalizes the payload (Gravity `input_*` IDs or generic JSON).
2. Inserts a row into `lead_captures` (zero-data-loss).
3. Forwards to GHL `contacts/upsert`.
4. Updates the capture row with the CRM result.

Responses:
- `200 { ok: true, capture_id, crm_contact_id }` — saved + synced.
- `502 { ok: false, capture_id, error }` — saved but CRM forward failed
  (lead is still recoverable from `lead_captures`).
- `400 / 401 / 429` — validation, auth, or rate-limit failure.

## Field mapping

| Canonical          | Gravity Forms | JSON keys                           |
|--------------------|---------------|-------------------------------------|
| fullName           | `input_23`    | `fullName`, `name`, `full_name`     |
| email              | `input_3`     | `email`, `emailAddress`             |
| phone              | `input_4`     | `phone`, `phoneNumber`              |
| location           | `input_5`     | `location`, `city`                  |
| consent            | `input_26.1`  | `consent`, `tcpa`                   |
| utm_source         | `input_12`    | `utm_source`                        |
| utm_medium         | `input_13`    | `utm_medium`                        |
| utm_campaign_id    | `input_14`    | `utm_campaign`, `utm_campaign_id`   |
| utm_adgroup_id     | `input_15`    | `utm_adgroup_id`                    |
| gclid              | `input_16`    | `gclid`                             |
| fbclid             | `input_17`    | `fbclid`                            |
| landing_page_url   | `input_20`    | `page_url`, `landing_page_url`      |
| form_source_label  | `input_11`    | `source`                            |
| (honeypot — drop)  | `input_27`    | `phone_hp`, `website_hp`            |

Unknown fields are preserved verbatim under `attribution.raw`.

## WordPress / Gravity Forms wiring

### Option A — Gravity Forms Webhooks Add-On (recommended)

1. Install the Gravity Forms **Webhooks** add-on on the WordPress site.
2. On the form, add a Webhook feed:
   - **Request URL**: the function URL above.
   - **Request Method**: `POST`
   - **Request Format**: `Form Data`
   - **Request Headers** (optional, only if `LEAD_INTAKE_TOKEN` is set):
     `X-Intake-Token: <token>`
3. Save. New submissions will POST directly here, no field remapping needed.

### Option B — Front-end JS shim

Drop this on the WP page that hosts the form (e.g. via Custom HTML or a
child-theme `functions.php`):

```html
<script>
document.addEventListener('submit', async (e) => {
  const form = e.target;
  if (!form.id?.startsWith('gform_')) return;
  // Mirror the submission to our intake (don't block Gravity's own POST).
  const fd = new FormData(form);
  const body = new URLSearchParams();
  for (const [k, v] of fd.entries()) body.append(k, String(v));
  navigator.sendBeacon(
    'https://stmyztkmioobdbxliktn.supabase.co/functions/v1/lead-intake',
    new Blob([body.toString()], { type: 'application/x-www-form-urlencoded' })
  );
});
</script>
```

`sendBeacon` fires the request without delaying the page navigation Gravity
performs after submit.

## Test with cURL

```bash
curl -X POST \
  https://stmyztkmioobdbxliktn.supabase.co/functions/v1/lead-intake \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Test Patient",
    "email": "test@example.com",
    "phone": "(757) 555-0123",
    "location": "Virginia Beach, VA",
    "utm_source": "google",
    "utm_medium": "paid_search",
    "source": "wordpress-test"
  }'
```

Or simulating a Gravity postback:

```bash
curl -X POST \
  https://stmyztkmioobdbxliktn.supabase.co/functions/v1/lead-intake \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'input_23=Test Patient' \
  --data-urlencode 'input_3=test@example.com' \
  --data-urlencode 'input_4=(757) 555-0123' \
  --data-urlencode 'input_5=Richmond, VA' \
  --data-urlencode 'input_12=google' \
  --data-urlencode 'input_13=paid_search' \
  --data-urlencode 'input_11=8828' \
  --data-urlencode 'input_26.1=I consent...'
```
