<?php
/**
 * Title: MWC Visit Hero
 * Slug: mwc/visit-hero
 * Categories: call-to-action, header
 * Description: Navy hero with deep-orange primary CTA, 60-minute in-person visit framing.
 *
 * INSTALL: place in <theme>/patterns/consult-hero.php. WordPress auto-registers
 * any PHP file in /patterns with this header. Color slugs come from theme.json.
 *
 * Uses palette slugs: navy (bg), cream (text), action (deep-orange button bg), on-action (white button text).
 * Button text is WHITE on the deep orange #CA4A0E (4.67:1). Accent #E8732A is for links/eyebrows.
 */
?>
<!-- wp:cover {"customOverlayColor":"#0B1029","minHeight":620,"isDark":true} -->
<div class="wp-block-cover is-dark" style="min-height:620px">
	<span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim" style="background-color:#0B1029"></span>
	<div class="wp-block-cover__inner-container">

		<!-- wp:heading {"level":1,"textColor":"cream","fontFamily":"display","style":{"typography":{"textTransform":"uppercase"}}} -->
		<h1 class="wp-block-heading has-cream-color has-text-color has-display-font-family" style="text-transform:uppercase">Find Your Edge Over Age</h1>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"textColor":"cream","fontFamily":"marketing","fontSize":"lead"} -->
		<p class="has-cream-color has-text-color has-marketing-font-family has-lead-font-size">Book your no-cost, 60-minute in-person visit with a physician at your local Men's Wellness Centers. Physician-led care, in-center labs, transparent pricing.</p>
		<!-- /wp:paragraph -->

		<!-- wp:buttons -->
		<div class="wp-block-buttons">
			<!-- wp:button {"backgroundColor":"action","textColor":"on-action","style":{"shadow":"0 4px 16px rgba(232,115,42,.40)"}} -->
			<div class="wp-block-button"><a class="wp-block-button__link has-on-action-color has-action-background-color has-text-color has-background wp-element-button">Reserve My 60-Minute Visit</a></div>
			<!-- /wp:button -->

			<!-- wp:button {"className":"is-style-outline"} -->
			<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button">Call Our Center</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->

		<!-- wp:paragraph {"textColor":"cream","fontSize":"caption"} -->
		<p class="has-cream-color has-text-color has-caption-font-size">Treatment requires a clinical evaluation and is provided only when medically appropriate. Men's Wellness Centers is LegitScript certified.</p>
		<!-- /wp:paragraph -->

	</div>
</div>
<!-- /wp:cover -->
