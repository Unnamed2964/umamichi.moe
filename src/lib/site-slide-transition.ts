/**
 * Site-wide route transitions: main uses Windows Phone Toolkit slide keyframes
 * (`wpm-slide-*` from @umamichi-ui/windows-phone-motion); article sidebars use
 * site-local opacity fades (`site-route-fade-*`).
 */

/** Stable scope id for the route `<main>` surface (matches `data-astro-transition-scope`). */
export const SITE_ROUTE_TRANSITION_SCOPE = 'site-route-root';

/** Desktop article nav sidebar (sibling of `<main>`). */
export const SITE_ARTICLE_SIDEBAR_LEFT_TRANSITION_SCOPE = 'article-sidebar-left';

/** Desktop article TOC panel in the right sidebar (sibling of `<main>`). */
export const SITE_ARTICLE_SIDEBAR_RIGHT_TRANSITION_SCOPE = 'article-sidebar-right';

/** Matches `data-astro-transition-persist` on {@link SiteFrame} header. */
export const SITE_HEADER_PERSIST_ID = 'header';

const siteChromeHeaderVtName = 'site-chrome-header';

const slideDuration = 'var(--wpm-slide-horizontal-duration)';
const slideEasing = 'var(--wpm-ease-out-exp6)';
const sidebarFadeDuration = 'var(--site-route-sidebar-fade-duration)';
const sidebarFadeEasing = 'var(--site-route-sidebar-fade-easing)';

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

type ScopedTransitionAnimations = {
	backNew: string;
	backOld: string;
	forwardNew: string;
	forwardOld: string;
};

function buildScopedViewTransitionStyles(
	scope: string,
	vtName: string,
	{ forwardOld, forwardNew, backOld, backNew }: ScopedTransitionAnimations,
): string {
	return `
[data-astro-transition-scope="${scope}"] {
	view-transition-name: ${vtName};
}

@supports (view-transition-name: none) {
	::view-transition-group(${vtName}) {
		animation: none !important;
	}

	::view-transition-image-pair(${vtName}) {
		animation: none !important;
	}

	html:not([data-astro-transition=back])::view-transition-old(${vtName}) {
		animation: ${forwardOld} ${slideDuration} ${slideEasing} both !important;
	}

	html:not([data-astro-transition=back])::view-transition-new(${vtName}) {
		animation: ${forwardNew} ${slideDuration} ${slideEasing} both !important;
	}

	html[data-astro-transition=back]::view-transition-old(${vtName}) {
		animation: ${backOld} ${slideDuration} ${slideEasing} both !important;
	}

	html[data-astro-transition=back]::view-transition-new(${vtName}) {
		animation: ${backNew} ${slideDuration} ${slideEasing} both !important;
	}
}

[data-astro-transition-fallback=old] [data-astro-transition-scope="${scope}"],
[data-astro-transition-fallback=old][data-astro-transition-scope="${scope}"] {
	animation: ${forwardOld} ${slideDuration} ${slideEasing} both;
}

[data-astro-transition-fallback=new] [data-astro-transition-scope="${scope}"],
[data-astro-transition-fallback=new][data-astro-transition-scope="${scope}"] {
	animation: ${forwardNew} ${slideDuration} ${slideEasing} both;
}

[data-astro-transition=back][data-astro-transition-fallback=old] [data-astro-transition-scope="${scope}"],
[data-astro-transition=back][data-astro-transition-fallback=old][data-astro-transition-scope="${scope}"] {
	animation: ${backOld} ${slideDuration} ${slideEasing} both;
}

[data-astro-transition=back][data-astro-transition-fallback=new] [data-astro-transition-scope="${scope}"],
[data-astro-transition=back][data-astro-transition-fallback=new][data-astro-transition-scope="${scope}"] {
	animation: ${backNew} ${slideDuration} ${slideEasing} both;
}`;
}

function buildScopedFadeTransitionStyles(scope: string, vtName: string): string {
	const fadeOut = `site-route-fade-out ${sidebarFadeDuration} ${sidebarFadeEasing} both`;
	const fadeIn = `site-route-fade-in ${sidebarFadeDuration} ${sidebarFadeEasing} both`;

	return `
[data-astro-transition-scope="${scope}"] {
	view-transition-name: ${vtName};
}

@supports (view-transition-name: none) {
	::view-transition-group(${vtName}) {
		animation: none !important;
	}

	::view-transition-image-pair(${vtName}) {
		animation: none !important;
	}

	html::view-transition-old(${vtName}) {
		animation: ${fadeOut} !important;
	}

	html::view-transition-new(${vtName}) {
		animation: ${fadeIn} !important;
	}
}

[data-astro-transition-fallback=old] [data-astro-transition-scope="${scope}"],
[data-astro-transition-fallback=old][data-astro-transition-scope="${scope}"] {
	animation: ${fadeOut};
}

[data-astro-transition-fallback=new] [data-astro-transition-scope="${scope}"],
[data-astro-transition-fallback=new][data-astro-transition-scope="${scope}"] {
	animation: ${fadeIn};
}`;
}

const routeSlideAnimations: ScopedTransitionAnimations = {
	forwardOld: 'wpm-slide-forward-out',
	forwardNew: 'wpm-slide-forward-in',
	backOld: 'wpm-slide-back-out',
	backNew: 'wpm-slide-back-in',
};

/**
 * Persisted header: own view-transition layer, no size morph or cross-fade.
 * Keeps the site title bar out of the root VT group during route swaps.
 */
function buildPersistedHeaderTransitionStyles(persistId: string, vtName: string): string {
	return `
[data-astro-transition-persist="${persistId}"] {
	view-transition-name: ${vtName};
}

@supports (view-transition-name: none) {
	::view-transition-group(${vtName}) {
		animation: none !important;
		overflow: clip;
	}

	::view-transition-image-pair(${vtName}) {
		animation: none !important;
	}

	::view-transition-old(${vtName}),
	::view-transition-new(${vtName}) {
		animation: none !important;
		mix-blend-mode: normal;
	}
}`;
}

const siteRouteSidebarFadeKeyframes = `
@keyframes site-route-fade-in {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

@keyframes site-route-fade-out {
	from {
		opacity: 1;
	}

	to {
		opacity: 0;
	}
}`;

/**
 * Scoped view-transition CSS for persisted header, sliding main,
 * and fading article sidebars (TOC panel only on the right). Do not use `@layer astro`.
 */
export const siteRouteSlideTransitionStyles = [
	siteRouteSidebarFadeKeyframes,
	buildPersistedHeaderTransitionStyles(SITE_HEADER_PERSIST_ID, siteChromeHeaderVtName),
	buildScopedViewTransitionStyles(
		SITE_ROUTE_TRANSITION_SCOPE,
		'site-route',
		routeSlideAnimations,
	),
	buildScopedFadeTransitionStyles(
		SITE_ARTICLE_SIDEBAR_LEFT_TRANSITION_SCOPE,
		'article-sidebar-left',
	),
	buildScopedFadeTransitionStyles(
		SITE_ARTICLE_SIDEBAR_RIGHT_TRANSITION_SCOPE,
		'article-sidebar-right',
	),
].join('\n');
