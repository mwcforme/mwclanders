# Fix: Fluent Forms → Booking Funnel Redirect

**Date:** 2026-05-25
**Issue:** Fluent Forms is generating old HMAC-signed URLs (`?fn=&ph=&ts=&sig=`).
BookEntry no longer accepts this format — it only accepts `?t=<token>`.

---

## What's happening

The WordPress form currently redirects to:
```
https://book.menswellnesscenters.com/book/entry?fn=Hammadullah&ph=1234567890&ts=...&sig=...
```

BookEntry ignores all those params and redirects back to `/` (homepage) because
there is no `?t=` token parameter. The lead is lost from the funnel.

---

## The correct flow

```
Fluent Form submit
  → PHP webhook POSTs to Supabase lead-intake
  → lead-intake creates GHL contact + issues 15-min token
  → Returns: { funnel_url: "https://book.menswellnesscenters.com/book/entry?t=<TOKEN>" }
  → WordPress redirects user to that URL
  → BookEntry exchanges the token → seeds booking store → /book/symptom
```

---

## What you need to do

### Option A — Use the existing PHP webhook (recommended)

The file `scripts/wp-gravity-forms-webhook.php` in the repo already does this correctly.
Adapt it for Fluent Forms:

1. Hook into Fluent Forms submission: `fluentform_submission_inserted`
2. Build the payload from your form fields (name, phone, email, location, consent)
3. POST to: `https://stmyztkmioobdbxliktn.supabase.co/functions/v1/lead-intake`
4. Read `response['funnel_url']` from the JSON response
5. `wp_redirect( $funnel_url )` and `exit`

### Option B — Use the Supabase token endpoint directly

```php
add_action('fluentform_submission_inserted', function($entryId, $formData, $form) {
    $payload = [
        'fullName' => sanitize_text_field($formData['names']['first_name'] . ' ' . $formData['names']['last_name']),
        'phone'    => sanitize_text_field($formData['phone']),
        'email'    => sanitize_email($formData['email']),
        'location' => sanitize_text_field($formData['location'] ?? ''),
        'consent'  => !empty($formData['consent']),
        'service'  => 'trt',
        'form_source_label' => 'fluent-forms',
    ];

    $response = wp_remote_post(
        'https://stmyztkmioobdbxliktn.supabase.co/functions/v1/lead-intake',
        [
            'headers' => [
                'Content-Type' => 'application/json',
                'x-intake-token' => defined('MWC_INTAKE_TOKEN') ? MWC_INTAKE_TOKEN : '',
            ],
            'body'    => json_encode($payload),
            'timeout' => 15,
        ]
    );

    if (is_wp_error($response)) return; // fail silently — lead already in Fluent Forms

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (!empty($body['funnel_url'])) {
        wp_redirect($body['funnel_url']);
        exit;
    }
    // If no funnel_url, fall through to Fluent Forms default redirect
}, 10, 3);
```

### Key points

- **Never generate the URL yourself** with fn/ph/ts/sig params — BookEntry no longer reads those
- **Always use the funnel_url** returned by lead-intake — it contains the single-use token
- The token expires in **15 minutes** — redirect must happen immediately after form submit
- `MWC_INTAKE_TOKEN` in wp-config.php must match `LEAD_INTAKE_TOKEN` in Supabase secrets

---

## Testing

1. Submit a test form
2. You should land on `https://book.menswellnesscenters.com/book/entry` briefly (spinner)
3. Then be redirected to `/book/symptom` with your name pre-populated
4. If you land on the homepage instead, the token exchange failed — add `?debug=1` to the entry URL to see why

**Debug URL format:** `https://book.menswellnesscenters.com/book/entry?t=<TOKEN>&debug=1`
