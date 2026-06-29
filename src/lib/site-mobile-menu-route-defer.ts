import { isTransitionBeforePreparationEvent } from 'astro:transitions/client';
import { isMobileMenuViewport } from './site-mobile-menu-pane.ts';

declare global {
	interface Window {
		__siteMobileMenuCloseForNavigation?: () => void | Promise<void>;
	}
}

function isMenuOpen(): boolean {
	return document.documentElement.dataset.mobileMenuOpen === 'true';
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

function shouldDeferMenuNavigation(event: Event): boolean {
	if (!isTransitionBeforePreparationEvent(event)) {
		return false;
	}

	if (!isMenuOpen() || !isMobileMenuViewport()) {
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

/**
 * Defers in-menu link navigation until the mobile pane close animation finishes.
 *
 * Registered with capture on `astro:before-preparation` so it runs before
 * `site-mobile-menu-client` (bubble), which may call `preventDefault()` when
 * popstate closes the menu on the same URL.
 */
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
				await window.__siteMobileMenuCloseForNavigation?.();
				await originalLoader();
			};
		},
		{ capture: true },
	);
}
