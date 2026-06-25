const INIT_KEY = '__siteThemeColorSyncInit';

declare global {
	interface Window {
		[INIT_KEY]?: boolean;
	}
}

export function syncSiteThemeColor(): void {
	const header = document.querySelector('[data-site-header]');

	if (!(header instanceof HTMLElement)) {
		return;
	}

	const color = getComputedStyle(header).backgroundColor;

	if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
		return;
	}

	let meta = document.querySelector('meta[name="theme-color"]');

	if (!meta) {
		meta = document.createElement('meta');
		meta.setAttribute('name', 'theme-color');
		document.head.appendChild(meta);
	}

	meta.setAttribute('content', color);
}

export function initSiteThemeColorSync(): void {
	if (window[INIT_KEY]) {
		return;
	}

	window[INIT_KEY] = true;

	const runSync = () => {
		syncSiteThemeColor();
	};

	document.addEventListener('site:theme-change', runSync);
	document.addEventListener('site:palette-change', runSync);

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', runSync, { once: true });
	} else {
		runSync();
	}
}
