import { isTransitionBeforePreparationEvent } from 'astro:transitions/client';

const MOBILE_BREAKPOINT_PX = 768;

declare global {
	interface Window {
		__siteMobileMenuCloseForNavigation?: () => void;
	}
}

function isMenuOpen(): boolean {
	return document.documentElement.dataset.mobileMenuOpen === 'true';
}

function isMobileViewport(): boolean {
	return window.innerWidth < MOBILE_BREAKPOINT_PX;
}

function resolveUrl(value: unknown): URL | null {
	if (value instanceof URL) {
		return value;
	}

	if (typeof value === 'string') {
		try {
			return new URL(value, window.location.href);
		} catch {
			return null;
		}
	}

	return null;
}

function isSameOriginInternalUrl(url: URL): boolean {
	return url.origin === window.location.origin;
}

function isDifferentPage(from: URL, to: URL): boolean {
	return (
		from.pathname !== to.pathname
		|| from.search !== to.search
		|| from.hash !== to.hash
	);
}

function isInternalNavigationSource(sourceElement: EventTarget | null | undefined): boolean {
	if (sourceElement == null) {
		return true;
	}

	if (!(sourceElement instanceof Element)) {
		return false;
	}

	const anchor = sourceElement.closest('a[href]');

	if (!(anchor instanceof HTMLAnchorElement)) {
		return false;
	}

	if (anchor.target && anchor.target !== '_self') {
		return false;
	}

	if (anchor.hasAttribute('download')) {
		return false;
	}

	const href = anchor.getAttribute('href');

	if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
		return false;
	}

	try {
		return new URL(anchor.href, window.location.href).origin === window.location.origin;
	} catch {
		return false;
	}
}

function parsePaneDurationMs(): number {
	const shiftSurface = document.querySelector('.site-route-main.wpm-pane-shift')
		?? document.querySelector('[data-site-mobile-menu]');

	if (shiftSurface instanceof HTMLElement) {
		const duration = getComputedStyle(shiftSurface).transitionDuration;
		const first = duration.split(',')[0]?.trim();

		if (first?.endsWith('ms')) {
			return Number.parseFloat(first);
		}

		if (first?.endsWith('s')) {
			return Number.parseFloat(first) * 1000;
		}
	}

	return 500;
}

function waitForPaneClose(): Promise<void> {
	if (!isMobileViewport()) {
		return Promise.resolve();
	}

	const shiftSurface = document.querySelector('.site-route-main.wpm-pane-shift')
		?? document.querySelector('[data-site-mobile-menu]');

	if (!(shiftSurface instanceof HTMLElement)) {
		return Promise.resolve();
	}

	const fallbackMs = parsePaneDurationMs() + 50;

	return new Promise((resolve) => {
		let settled = false;

		const finish = () => {
			if (settled) {
				return;
			}

			settled = true;
			resolve();
		};

		const onTransitionEnd = (event: TransitionEvent) => {
			if (event.target === shiftSurface && event.propertyName === 'transform') {
				finish();
			}
		};

		shiftSurface.addEventListener('transitionend', onTransitionEnd);
		window.setTimeout(finish, fallbackMs);
	});
}

function shouldDeferMenuNavigation(event: Event): boolean {
	if (!isTransitionBeforePreparationEvent(event)) {
		return false;
	}

	if (!isMenuOpen() || !isMobileViewport()) {
		return false;
	}

	if (!isInternalNavigationSource(event.sourceElement)) {
		return false;
	}

	const from = resolveUrl(event.from) ?? resolveUrl(window.location.href);
	const to = resolveUrl(event.to);

	if (!from || !to) {
		return false;
	}

	return isSameOriginInternalUrl(to) && isDifferentPage(from, to);
}

export function initSiteMobileMenuRouteDefer(): void {
	document.addEventListener(
		'astro:before-preparation',
		(event) => {
			if (!shouldDeferMenuNavigation(event)) {
				return;
			}

			if (!isTransitionBeforePreparationEvent(event)) {
				return;
			}

			const originalLoader = event.loader;

			event.loader = async () => {
				window.__siteMobileMenuCloseForNavigation?.();
				await waitForPaneClose();
				await originalLoader();
			};
		},
		{ capture: true },
	);
}
