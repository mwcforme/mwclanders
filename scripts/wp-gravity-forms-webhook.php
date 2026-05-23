<?php
/**
 * MWC — Gravity Forms → Booking Funnel Handoff
 *
 * After a qualifying Gravity Forms submission:
 *   1. POSTs the lead payload to the Supabase lead-intake edge function.
 *   2. lead-intake persists the lead, creates a GHL contact, and issues a
 *      single-use 15-minute token.
 *   3. Redirects the user to /book/entry?t=<token> on the booking funnel.
 *
 * Install via WPCode (recommended) or functions.php.
 *
 * ── SETUP CHECKLIST ──────────────────────────────────────────────────────────
 * Before this goes live, Hammad must update:
 *
 *   1. MWC_FORM_IDS      — Replace with real Gravity Forms form IDs.
 *                          Find them in GF > Forms > ID column.
 *
 *   2. MWC_FIELD_MAP     — Replace every placeholder field ID with the
 *                          actual field ID from your form.
 *                          Find field IDs in GF > Form Editor > field settings.
 *
 *   3. MWC_INTAKE_TOKEN  — Set to the value of LEAD_INTAKE_TOKEN in Supabase
 *                          project secrets. Leave empty only if the Supabase
 *                          env var is also empty (disables auth).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Config ────────────────────────────────────────────────────────────────────

/** Supabase lead-intake endpoint (production). Do not change. */
define( 'MWC_INTAKE_URL', 'https://stmyztkmioobdbxliktn.supabase.co/functions/v1/lead-intake' );

/**
 * Shared secret matching LEAD_INTAKE_TOKEN in Supabase project secrets.
 * Set this to a long random string. Leave empty only if intentionally open.
 *
 * Generate one: openssl rand -hex 32
 */
define( 'MWC_INTAKE_TOKEN', '' ); // TODO: set to match LEAD_INTAKE_TOKEN in Supabase

/** Booking funnel base URL. */
define( 'MWC_FUNNEL_BASE', 'https://book.menswellnesscenters.com' );

/**
 * Gravity Forms form IDs to intercept.
 * Replace with your real form IDs from GF > Forms > ID column.
 * Set to null to intercept ALL forms (not recommended for production).
 *
 * Example: define( 'MWC_FORM_IDS', array( 7, 12 ) );
 */
define( 'MWC_FORM_IDS', array( 1, 2, 3 ) ); // TODO: replace with real form IDs

/**
 * Field ID mapping.
 *
 * Each value is the GF entry key for that field. For simple fields this is
 * just the numeric field ID (e.g. "3"). For sub-fields it includes the
 * sub-key (e.g. "1.3" for the first-name sub-field of a Name field).
 *
 * Find field IDs: GF > Form Editor > click a field > Field ID in settings.
 * Tip: use plain Text fields for name/phone/email — avoid compound Name fields.
 */
define( 'MWC_FIELD_MAP', array(
    'name'         => '23',   // TODO: Full name text field ID
    'email'        => '3',    // TODO: Email field ID
    'phone'        => '4',    // TODO: Phone field ID
    'location'     => '5',    // TODO: Location dropdown/select field ID
    'consent'      => '26.1', // TODO: TCPA consent checkbox sub-field ID
    'source'       => '11',   // TODO: Hidden field for form source label
    'utm_source'   => '12',   // TODO: Hidden field for utm_source
    'utm_medium'   => '13',   // TODO: Hidden field for utm_medium
    'utm_campaign' => '14',   // TODO: Hidden field for utm_campaign
    'gclid'        => '16',   // TODO: Hidden field for gclid
    'fbclid'       => '17',   // TODO: Hidden field for fbclid
    'page_url'     => '20',   // TODO: Hidden field for landing page URL
) );

// ── Hook ──────────────────────────────────────────────────────────────────────

add_action( 'gform_after_submission', 'mwc_handle_gf_submission', 10, 2 );

function mwc_handle_gf_submission( $entry, $form ) {
    // Only intercept configured form IDs.
    if ( MWC_FORM_IDS !== null && ! in_array( (int) $form['id'], MWC_FORM_IDS, true ) ) {
        return;
    }

    $fm = MWC_FIELD_MAP;

    // Build the payload from entry values.
    $payload = array(
        'fullName'        => rgar( $entry, $fm['name'] ),
        'email'           => rgar( $entry, $fm['email'] ),
        'phone'           => rgar( $entry, $fm['phone'] ),
        'location'        => rgar( $entry, $fm['location'] ),
        'consent'         => ! empty( rgar( $entry, $fm['consent'] ) ),
        'source'          => rgar( $entry, $fm['source'] ) ?: 'wordpress-gf',
        'utm_source'      => rgar( $entry, $fm['utm_source'] ),
        'utm_medium'      => rgar( $entry, $fm['utm_medium'] ),
        'utm_campaign_id' => rgar( $entry, $fm['utm_campaign'] ),
        'gclid'           => rgar( $entry, $fm['gclid'] ),
        'fbclid'          => rgar( $entry, $fm['fbclid'] ),
        'landing_page_url'=> rgar( $entry, $fm['page_url'] ) ?: $entry['source_url'],
        '__env'           => 'prod',
        '__form_id'       => $form['id'],
    );

    // Strip blank strings and nulls — consent is re-added explicitly (false is valid).
    $consent = $payload['consent'];
    $payload = array_filter( $payload, function( $v ) {
        return $v !== '' && $v !== null;
    } );
    $payload['consent'] = $consent;

    $response = wp_remote_post( MWC_INTAKE_URL, array(
        'method'  => 'POST',
        'timeout' => 10,
        'headers' => array(
            'Content-Type'   => 'application/json',
            'x-intake-token' => MWC_INTAKE_TOKEN,
        ),
        'body' => wp_json_encode( $payload ),
    ) );

    if ( is_wp_error( $response ) ) {
        error_log( '[MWC] lead-intake request failed: ' . $response->get_error_message() );
        wp_redirect( MWC_FUNNEL_BASE . '/book/symptom' );
        exit;
    }

    $code = wp_remote_retrieve_response_code( $response );
    $body = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( $code === 200 && ! empty( $body['funnel_url'] ) ) {
        // Happy path — redirect to the token-bearing funnel URL.
        wp_redirect( $body['funnel_url'] );
        exit;
    }

    // Degraded — intake succeeded but no token (e.g. token table unavailable).
    // Still redirect to funnel so the user can proceed.
    error_log( '[MWC] lead-intake unexpected response (code=' . $code . '): ' . wp_json_encode( $body ) );
    wp_redirect( MWC_FUNNEL_BASE . '/book/symptom' );
    exit;
}
