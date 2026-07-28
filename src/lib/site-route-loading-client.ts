import { isTransitionBeforePreparationEvent } from 'astro:transitions/client';

const INIT_KEY = '__siteRouteLoadingInit';
const SHOW_DELAY_MS = 200;

let showTimer: ReturnType<typeof setTimeout> | null = null;
let loading = false;

function shouldSkipRouteLoading(event: Event): boolean {
	if (!isTransitionBeforePreparationEvent(event)) {
		return true;
	}

	if (event.navigationType === 'traverse' && event.from.href === event.to.href) {
		return true;
	}

	return false;
}

function setRouteLoading(active: boolean): void {
	document.documentElement.toggleAttribute('data-route-loading', active);

	const progress = document.querySelector('[data-site-route-progress]');

	if (!(progress instanceof HTMLElement)) {
		return;
	}

	progress.setAttribute('aria-hidden', active ? 'false' : 'true');
	progress.setAttribute('aria-busy', active ? 'true' : 'false');
}

function clearShowTimer(): void {
	if (showTimer !== null) {
		clearTimeout(showTimer);
		showTimer = null;
	}
}

function stopRouteLoading(): void {
	clearShowTimer();

	if (!loading) {
		return;
	}

	loading = false;
	setRouteLoading(false);
}

function startRouteLoadingPending(): void {
	clearShowTimer();

	showTimer = setTimeout(() => {
		showTimer = null;
		loading = true;
		setRouteLoading(true);
	}, SHOW_DELAY_MS);
}

export function initSiteRouteLoading(): void {
	if (typeof window === 'undefined' || (window as unknown as Record<string, boolean>)[INIT_KEY]) {
		return;
	}

	(window as unknown as Record<string, boolean>)[INIT_KEY] = true;

	document.addEventListener('astro:before-preparation', (event) => {
		if (shouldSkipRouteLoading(event)) {
			return;
		}

		startRouteLoadingPending();
	});

	document.addEventListener('astro:after-preparation', stopRouteLoading);
	document.addEventListener('astro:after-swap', stopRouteLoading);
	window.addEventListener('pageshow', stopRouteLoading);
}
