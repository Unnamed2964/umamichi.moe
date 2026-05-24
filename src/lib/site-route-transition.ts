/** Stable scope id shared by every page (do not use createAnimationScope's random scope). */
export const SITE_ROUTE_TRANSITION_SCOPE = 'site-route-root';

/** Named VT group for the route surface (must not be `root`; html already owns implicit root). */
export const SITE_ROUTE_VT_NAME = 'site-route';

const easeIn = 'var(--wpm-ease-in-exp6)';
const easeOut = 'var(--wpm-ease-out-exp6)';

/**
 * Route-surface view-transition styles (unlayered; do not use @layer astro).
 * Direction uses data-astro-transition=back (preserved across Astro swap).
 * Slide uses html[data-wpm-route=slide] set before navigation.
 */
export const siteRouteTransitionStyles = `
[data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	view-transition-name: ${SITE_ROUTE_VT_NAME};
}

@supports (view-transition-name: none) {
	::view-transition-group(${SITE_ROUTE_VT_NAME}) {
		perspective: var(--wpm-turnstile-perspective);
		animation: none !important;
	}

	::view-transition-image-pair(${SITE_ROUTE_VT_NAME}) {
		animation: none !important;
	}

	html:not([data-astro-transition=back]):not([data-wpm-route=slide])::view-transition-group(${SITE_ROUTE_VT_NAME}) {
		transform-origin: left center;
	}

	html[data-astro-transition=back]:not([data-wpm-route=slide])::view-transition-group(${SITE_ROUTE_VT_NAME}) {
		transform-origin: right center;
	}

	html:not([data-astro-transition=back]):not([data-wpm-route=slide])::view-transition-old(${SITE_ROUTE_VT_NAME}) {
		animation: wpm-turnstile-forward-out var(--wpm-turnstile-out-duration) ${easeIn} both !important;
		transform-origin: left center;
	}

	html:not([data-astro-transition=back]):not([data-wpm-route=slide])::view-transition-new(${SITE_ROUTE_VT_NAME}) {
		animation: wpm-turnstile-forward-in var(--wpm-turnstile-in-duration) ${easeOut} both !important;
		transform-origin: left center;
	}

	html[data-astro-transition=back]:not([data-wpm-route=slide])::view-transition-old(${SITE_ROUTE_VT_NAME}) {
		animation: wpm-turnstile-backward-out var(--wpm-turnstile-out-duration) ${easeIn} both !important;
		transform-origin: right center;
	}

	html[data-astro-transition=back]:not([data-wpm-route=slide])::view-transition-new(${SITE_ROUTE_VT_NAME}) {
		animation: wpm-turnstile-backward-in var(--wpm-turnstile-in-duration) ${easeOut} both !important;
		transform-origin: right center;
	}

	html[data-wpm-route=slide]:not([data-astro-transition=back])::view-transition-old(${SITE_ROUTE_VT_NAME}) {
		animation: wpm-slide-forward-out var(--wpm-slide-horizontal-duration) ${easeOut} both !important;
	}

	html[data-wpm-route=slide]:not([data-astro-transition=back])::view-transition-new(${SITE_ROUTE_VT_NAME}) {
		animation: wpm-slide-forward-in var(--wpm-slide-horizontal-duration) ${easeOut} both !important;
	}

	html[data-wpm-route=slide][data-astro-transition=back]::view-transition-old(${SITE_ROUTE_VT_NAME}) {
		animation: wpm-slide-back-out var(--wpm-slide-horizontal-duration) ${easeOut} both !important;
	}

	html[data-wpm-route=slide][data-astro-transition=back]::view-transition-new(${SITE_ROUTE_VT_NAME}) {
		animation: wpm-slide-back-in var(--wpm-slide-horizontal-duration) ${easeOut} both !important;
	}
}

[data-astro-transition-fallback=old] [data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"],
[data-astro-transition-fallback=old][data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	animation: wpm-turnstile-forward-out var(--wpm-turnstile-out-duration) ${easeIn} both;
}

[data-astro-transition-fallback=new] [data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"],
[data-astro-transition-fallback=new][data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	animation: wpm-turnstile-forward-in var(--wpm-turnstile-in-duration) ${easeOut} both;
}

[data-astro-transition=back][data-astro-transition-fallback=old] [data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"],
[data-astro-transition=back][data-astro-transition-fallback=old][data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	animation: wpm-turnstile-backward-out var(--wpm-turnstile-out-duration) ${easeIn} both;
}

[data-astro-transition=back][data-astro-transition-fallback=new] [data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"],
[data-astro-transition=back][data-astro-transition-fallback=new][data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	animation: wpm-turnstile-backward-in var(--wpm-turnstile-in-duration) ${easeOut} both;
}`;
