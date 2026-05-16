<?php
/**
 * MWC — Gravity Forms → Booking Funnel Handoff
 *
 * After any qualifying Gravity Forms submission, POSTs lead data to the
 * Supabase lead-intake edge function, then redirects the user into the
 * Men's Wellness Centers booking funnel at /book/symptom.
 *
 * Install via WPCode (recommended) or functions.php.
 *
 * Config: update the constants below.
 */

// ── Config ────────────────────────────────────────────────────────────────

// Supabase lead-intake endpoint (prod)
define( 'MWC_INTAKE_URL', 'https://stmyztkmioobdbxliktn.supabase.co/functions/v1/lead-intake' );

// Shared secret set in Supabase env as LEAD_INTAKE_TOKEN (leave empty to skip auth)
define( 'MWC_INTAKE_TOKEN', '' );

// Funnel base URL
define( 'MWC_FUNNEL_BASE', 'https://book.menswellnesscenters.com' );

// Form IDs to intercept. Add all qualifying consultation forms here.
// Set to null to intercept ALL forms.
define( 'MWC_FORM_IDS', array( 1, 2, 3 ) );

// Field ID mapping — update to match your Gravity Forms field IDs.
// Find field IDs in GF > Form Editor > field settings.
define( 'MWC_FIELD_MAP', array(
    'name'     => 'input_23',   // Full name (or use first/last combo below)
    'email'    => 'input_3',
    'phone'    => 'input_4',
    'location' => 'input_5',
    'consent'  => 'input_26_1', // Checkbox — value present = checked
    'source'   => 'input_11',   // Hidden field: form source label
    'utm_source'      => 'input_12',
    'utm_medium'      => 'input_13',
    'utm_campaign'    => 'input_14',
    'gclid'           => 'input_16',
    'fbclid'          => 'input_17',
    'page_url'        => 'input_20',
) );

// ── Hook ─────────────────────────────────────────────────────────────────

add_action( 'gform_after_submission', 'mwc_handle_gf_submission', 10, 2 );

function mwc_handle_gf_submission( $entry, $form ) {
    // Only intercept configured form IDs
    if ( MWC_FORM_IDS !== null && ! in_array( (int) $form['id'], MWC_FORM_IDS, true ) ) {
        return;
    }

    $field_map = MWC_FIELD_MAP;

    // Build payload from entry
    $payload = array(
        'fullName'        => rgar( $entry, str_replace( 'input_', '', $field_map['name'] ) ),
        'email'           => rgar( $entry, str_replace( 'input_', '', $field_map['email'] ) ),
        'phone'           => rgar( $entry, str_replace( 'input_', '', $field_map['phone'] ) ),
        'location'        => rgar( $entry, str_replace( 'input_', '', $field_map['location'] ) ),
        'consent'         => ! empty( rgar( $entry, '26.1' ) ) ? true : false,
        'source'          => rgar( $entry, str_replace( 'input_', '', $field_map['source'] ) ) ?: 'wordpress-gf',
        'utm_source'      => rgar( $entry, str_replace( 'input_', '', $field_map['utm_source'] ) ),
        'utm_medium'      => rgar( $entry, str_replace( 'input_', '', $field_map['utm_medium'] ) ),
        'utm_campaign_id' => rgar( $entry, str_replace( 'input_', '', $field_map['utm_campaign'] ) ),
        'gclid'           => rgar( $entry, str_replace( 'input_', '', $field_map['gclid'] ) ),
        'fbclid'          => rgar( $entry, str_replace( 'input_', '', $field_map['fbclid'] ) ),
        'landing_page_url'=> rgar( $entry, str_replace( 'input_', '', $field_map['page_url'] ) ) ?: $entry['source_url'],
        '__env'           => 'prod',
        '__form_id'       => $form['id'],
    );

    // Remove empty values
    $payload = array_filter( $payload, function( $v ) {
        return $v !== '' && $v !== null && $v !== false;
    } );
    // Re-add consent explicitly (false is valid)
    $payload['consent'] = ! empty( rgar( $entry, '26.1' ) );

    $headers = array(
        'Content-Type'  => 'application/json',
        'x-intake-token' => MWC_INTAKE_TOKEN,
    );

    $response = wp_remote_post( MWC_INTAKE_URL, array(
        'method'  => 'POST',
        'timeout' => 10,
        'headers' => $headers,
        'body'    => wp_json_encode( $payload ),
    ) );

    if ( is_wp_error( $response ) ) {
        error_log( '[MWC] lead-intake request failed: ' . $response->get_error_message() );
        // Fallback: redirect to funnel without token
        wp_redirect( MWC_FUNNEL_BASE . '/book/symptom' );
        exit;
    }

    $body = json_decode( wp_remote_retrieve_body( $response ), true );
    $code = wp_remote_retrieve_response_code( $response );

    if ( $code === 200 && ! empty( $body['funnel_url'] ) ) {
        // Happy path: redirect to token-exchange URL
        wp_redirect( $body['funnel_url'] );
        exit;
    }

    // Degraded: intake succeeded but no token (e.g. token table unavailable)
    // Still redirect to funnel — user can re-enter info
    error_log( '[MWC] lead-intake response: ' . wp_json_encode( $body ) );
    wp_redirect( MWC_FUNNEL_BASE . '/book/symptom' );
    exit;
}
