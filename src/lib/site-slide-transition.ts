/**
 * Site-wide route slide (Windows Phone Toolkit Slide*Fade).
 * Keyframes and durations: @umamichi-ui/windows-phone-motion (`wpm-slide-*`, 500ms horizontal).
 */

/** Stable scope id for the route `<main>` surface (matches `data-astro-transition-scope`). */
export const SITE_ROUTE_TRANSITION_SCOPE = 'site-route-root';

const slideDuration = 'var(--wpm-slide-horizontal-duration)';
const slideEasing = 'var(--wpm-ease-out-exp6)';

const slideOld = {
	name: 'wpm-slide-forward-out',
	duration: slideDuration,
	easing: slideEasing,
	fillMode: 'both',
} as const;

const slideNew = {
	name: 'wpm-slide-forward-in',
	duration: slideDuration,
	easing: slideEasing,
	fillMode: 'both',
} as const;

const slideBackOld = {
	name: 'wpm-slide-back-out',
	duration: slideDuration,
	easing: slideEasing,
	fillMode: 'both',
} as const;

const slideBackNew = {
	name: 'wpm-slide-back-in',
	duration: slideDuration,
	easing: slideEasing,
	fillMode: 'both',
} as const;

/**
 * Astro `transition:animate` value (same motion as {@link siteRouteSlideTransitionStyles}).
 * Use on `.astro` route surfaces when the React tree does not need a single Provider root.
 */
export const siteSlide = {
	forwards: {
		old: slideOld,
		new: slideNew,
	},
	backwards: {
		old: slideBackOld,
		new: slideBackNew,
	},
} as const;

const routeVtName = 'site-route';

/**
 * Scoped view-transition CSS for the persisted-chrome layout (`header` / `footer` persist, `main` slides).
 * Do not use `@layer astro`.
 */
export const siteRouteSlideTransitionStyles = `
[data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	view-transition-name: ${routeVtName};
}

@supports (view-transition-name: none) {
	::view-transition-group(${routeVtName}) {
		animation: none !important;
	}

	::view-transition-image-pair(${routeVtName}) {
		animation: none !important;
	}

	html:not([data-astro-transition=back])::view-transition-old(${routeVtName}) {
		animation: wpm-slide-forward-out ${slideDuration} ${slideEasing} both !important;
	}

	html:not([data-astro-transition=back])::view-transition-new(${routeVtName}) {
		animation: wpm-slide-forward-in ${slideDuration} ${slideEasing} both !important;
	}

	html[data-astro-transition=back]::view-transition-old(${routeVtName}) {
		animation: wpm-slide-back-out ${slideDuration} ${slideEasing} both !important;
	}

	html[data-astro-transition=back]::view-transition-new(${routeVtName}) {
		animation: wpm-slide-back-in ${slideDuration} ${slideEasing} both !important;
	}
}

[data-astro-transition-fallback=old] [data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"],
[data-astro-transition-fallback=old][data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	animation: wpm-slide-forward-out ${slideDuration} ${slideEasing} both;
}

[data-astro-transition-fallback=new] [data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"],
[data-astro-transition-fallback=new][data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	animation: wpm-slide-forward-in ${slideDuration} ${slideEasing} both;
}

[data-astro-transition=back][data-astro-transition-fallback=old] [data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"],
[data-astro-transition=back][data-astro-transition-fallback=old][data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	animation: wpm-slide-back-out ${slideDuration} ${slideEasing} both;
}

[data-astro-transition=back][data-astro-transition-fallback=new] [data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"],
[data-astro-transition=back][data-astro-transition-fallback=new][data-astro-transition-scope="${SITE_ROUTE_TRANSITION_SCOPE}"] {
	animation: wpm-slide-back-in ${slideDuration} ${slideEasing} both;
}`;
