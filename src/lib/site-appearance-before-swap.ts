import { applyAppearanceToRoot, readAppearanceFromStorage } from './site-appearance';
import { onBeforeSwap } from './view-transition-lifecycle';

const INIT_KEY = '__siteAppearanceBeforeSwapInit';

declare global {
	interface Window {
		[INIT_KEY]?: boolean;
	}
}

export function initSiteAppearanceBeforeSwap(): void {
	if (window[INIT_KEY]) {
		return;
	}

	window[INIT_KEY] = true;

	onBeforeSwap((event) => {
		const newDocument = (event as CustomEvent & { newDocument?: Document }).newDocument;

		if (!newDocument) {
			return;
		}

		applyAppearanceToRoot(newDocument.documentElement, readAppearanceFromStorage());
	});
}
