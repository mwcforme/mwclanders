<?php
/**
 * Men's Wellness Centers — Brand enqueue + brand-locked block styles (v1.2.1)
 *
 * INSTALL (pick one):
 *   A) Paste into your (child) theme's functions.php.
 *   B) Drop this file in the theme and `require get_stylesheet_directory() . '/mwc-brand.php';`
 *      from functions.php.
 *   C) Wrap as a tiny plugin: add a plugin header and place in wp-content/plugins/.
 *
 * Expects the canonical tokens.css at: <theme>/assets/css/tokens.css
 * (copy ../css/tokens.css there). theme.json supplies the editor palette/typography.
 *
 * COLOR LAW (do not break):
 *   Primary button = deep #CA4A0E + glow + WHITE text (4.67:1). Hover -> #D35F1A.
 *   Accent (links/icons/eyebrows/focus/asterisk) = basic site orange #E8732A.
 *   Selected option = deep #CA4A0E + white text. NO GRAY (navy/cream at opacity only).
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! function_exists( 'mwc_brand_assets' ) ) {
	function mwc_brand_assets() {
		$theme_uri = get_stylesheet_directory_uri();
		$ver       = '1.2.1';

		// 1) Google Fonts: Oswald (display) + Montserrat (marketing) + Inter (UI). No Bebas.
		wp_enqueue_style(
			'mwc-fonts',
			'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap',
			array(),
			null
		);

		// 2) Canonical design tokens (the single source of truth).
		wp_enqueue_style(
			'mwc-tokens',
			$theme_uri . '/assets/css/tokens.css',
			array( 'mwc-fonts' ),
			$ver
		);

		// 3) Brand-locked overrides for core blocks (depends on tokens being loaded).
		wp_add_inline_style( 'mwc-tokens', mwc_brand_inline_css() );
	}
	add_action( 'wp_enqueue_scripts', 'mwc_brand_assets', 20 );
	// Load fonts + tokens in the block editor too, so previews match the front end.
	add_action( 'enqueue_block_editor_assets', 'mwc_brand_assets', 20 );
}

if ( ! function_exists( 'mwc_brand_inline_css' ) ) {
	function mwc_brand_inline_css() {
		return <<<CSS
/* ---- MWC core-block brand lock (v1.2.1). Uses tokens.css variables. ---- */

/* Primary button = deep orange + glow + WHITE text. Hover deepens. */
.wp-block-button__link,
.wp-element-button {
	background-color: var(--p-orange-800);
	color: var(--p-white); /* WHITE on deep orange (4.67:1) */
	font-family: var(--p-font-ui);
	font-weight: var(--p-fw-bold);
	text-transform: uppercase;
	letter-spacing: 0.06em;
	border-radius: var(--p-radius-md, 8px);
	min-height: 52px;
	padding: 14px 24px;
	box-shadow: var(--p-shadow-cta, 0 4px 16px rgba(232,115,42,.40));
	transition: background-color .2s ease;
}
.wp-block-button__link:hover,
.wp-element-button:hover {
	background-color: var(--p-orange-600);
	color: var(--p-white);
}

/* Secondary (outline) button = white fill + navy text, for dark sections. */
.wp-block-button.is-style-outline .wp-block-button__link {
	background-color: var(--p-white);
	color: var(--p-ink-900);
	border: none;
	box-shadow: var(--p-shadow-md, 0 4px 6px rgba(0,0,0,.07));
}

/* Deep variant: alias of the primary button (deep orange + white text). Add class is-style-deep. */
.wp-block-button.is-style-deep .wp-block-button__link {
	background-color: var(--p-orange-800);
	color: var(--p-white);
	box-shadow: var(--p-shadow-md, 0 4px 6px rgba(0,0,0,.07));
}

/* Links on navy = accent orange. */
a { color: var(--p-orange-500); }

/* Inputs (CF7 / Gravity / native): 56px, navy hairline, orange focus ring. NO GRAY. */
input[type=text], input[type=tel], input[type=email], input[type=number], select, textarea {
	min-height: 56px;
	background: var(--p-white);
	color: var(--p-ink-900);
	border: 1px solid var(--p-navy-25);
	border-radius: var(--p-radius-md, 8px);
	padding: 0 16px;
	font-family: var(--p-font-ui);
	font-size: 16px;
}
input::placeholder, textarea::placeholder { color: var(--p-navy-55); }
input:focus, select:focus, textarea:focus {
	outline: none;
	border-color: var(--p-orange-500);
	box-shadow: 0 0 0 3px rgba(232,115,42,0.25);
}

/* Checkbox checked = deep orange + white check (4.67:1). The one sanctioned deep fill. */
input[type=checkbox], input[type=radio] { accent-color: var(--p-orange-800); }

/* Required asterisk = accent orange. */
.wpcf7-form .required, .gfield_required { color: var(--p-orange-500); }

/* Headings = Oswald, uppercase. */
h1, h2, h3, h4 {
	font-family: var(--p-font-display);
	text-transform: uppercase;
	letter-spacing: 0.01em;
}
CSS;
	}
}

/* Register the two custom button block styles so editors can pick them. */
if ( ! function_exists( 'mwc_register_button_styles' ) ) {
	function mwc_register_button_styles() {
		register_block_style( 'core/button', array(
			'name'  => 'deep',
			'label' => __( 'MWC Deep (white text)', 'mwc' ),
		) );
	}
	add_action( 'init', 'mwc_register_button_styles' );
}
