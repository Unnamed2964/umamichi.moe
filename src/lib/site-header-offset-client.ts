import { registerAfterSwap } from './view-transition-lifecycle';

const INIT_KEY = '__siteHeaderOffsetInit';

declare global {
	interface Window {
		[INIT_KEY]?: boolean;
	}
}

export function initSiteHeaderOffset(): void {
	if (window[INIT_KEY]) {
		return;
	}

	window[INIT_KEY] = true;

	let headerOffsetObserver: ResizeObserver | null = null;

	const syncHeaderOffset = () => {
		const header = document.querySelector('[data-site-header]');

		if (header instanceof HTMLElement) {
			const headerHeight = Math.ceil(header.getBoundingClientRect().height);
			document.documentElement.style.setProperty('--site-header-offset', `${headerHeight}px`);
		}
	};

	const observeHeaderOffset = () => {
		const header = document.querySelector('[data-site-header]');

		headerOffsetObserver?.disconnect();
		headerOffsetObserver = null;

		if (header instanceof HTMLElement) {
			headerOffsetObserver = new ResizeObserver(syncHeaderOffset);
			headerOffsetObserver.observe(header);
		}

		syncHeaderOffset();
	};

	registerAfterSwap(observeHeaderOffset, true);
	window.addEventListener('resize', syncHeaderOffset, { passive: true });
}
