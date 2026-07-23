import {
	isTransitionBeforePreparationEvent,
	isTransitionBeforeSwapEvent,
} from 'astro:transitions/client';

const INIT_KEY = '__siteSameDocumentTraverseInit';

/**
 * Overlay / menu history entries use same-URL `pushState` + `history.back()`.
 * Astro ClientRouter treats that popstate as a route traverse and replays the
 * main slide-in transition. Keep the DOM and skip VT for same-href traverses.
 *
 * Prefer no-op loader/swap over `preventDefault()` — the latter falls through
 * to a hard `location.href` navigation in Astro's router.
 */
export function initSiteSameDocumentTraverseGuard(): void {
	if (typeof window === 'undefined' || (window as unknown as Record<string, boolean>)[INIT_KEY]) {
		return;
	}
	(window as unknown as Record<string, boolean>)[INIT_KEY] = true;

	document.addEventListener('astro:before-preparation', (event) => {
		if (!isTransitionBeforePreparationEvent(event)) {
			return;
		}

		if (event.navigationType !== 'traverse') {
			return;
		}

		if (event.from.href !== event.to.href) {
			return;
		}

		event.loader = async () => {};

		document.addEventListener(
			'astro:before-swap',
			(swapEvent) => {
				if (!isTransitionBeforeSwapEvent(swapEvent)) {
					return;
				}

				swapEvent.swap = () => {};
				swapEvent.viewTransition?.skipTransition?.();
			},
			{ once: true },
		);
	});
}
