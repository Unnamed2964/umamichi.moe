import { isAppearanceChangeForSubscribers } from './site-events';
import { syncSiteThemeColor } from './site-theme-color';

const INIT_KEY = '__siteThemeColorSyncInit';

declare global {
	interface Window {
		[INIT_KEY]?: boolean;
	}
}

export function initSiteThemeColorSync(): void {
	if (window[INIT_KEY]) {
		return;
	}

	window[INIT_KEY] = true;

	document.addEventListener('site:appearance-change', (event) => {
		if (!isAppearanceChangeForSubscribers(event.detail.reason)) {
			return;
		}

		syncSiteThemeColor();
	});

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => syncSiteThemeColor(), { once: true });
	} else {
		syncSiteThemeColor();
	}
}

export { syncSiteThemeColor } from './site-theme-color';
