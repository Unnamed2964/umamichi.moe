import {
	applyAppearanceToRoot,
	getStoredThemePreference,
	markThemeSwitchingTransition,
	readAppearanceFromStorage,
	SITE_THEME_STORAGE_KEY,
	syncMermaidMedia,
	syncThemeToggleLabels,
	type ThemePreference,
} from './site-appearance';
import { dispatchSiteAppearanceChange } from './site-events';
import { syncSiteThemeColor } from './site-theme-color';
import { registerAfterSwap } from './view-transition-lifecycle';

const INIT_KEY = '__siteAppearanceControlsInit';

declare global {
	interface Window {
		[INIT_KEY]?: boolean;
	}
}

function applyAppearanceWithChrome(state: ReturnType<typeof readAppearanceFromStorage>): void {
	applyAppearanceToRoot(document.documentElement, state);
	syncMermaidMedia(state.preference);
	syncThemeToggleLabels(state.resolved);
}

function applyStoredAppearance(notify: 'user' | 'system' | false): void {
	if (notify) {
		markThemeSwitchingTransition();
	}

	const state = readAppearanceFromStorage();
	applyAppearanceWithChrome(state);

	if (notify) {
		dispatchSiteAppearanceChange(state, notify);
	}
}

function rebindAppearanceAfterNavigation(): void {
	const state = readAppearanceFromStorage();
	applyAppearanceWithChrome(state);
	requestAnimationFrame(() => syncSiteThemeColor());
}

export function initSiteAppearanceControls(): void {
	if (window[INIT_KEY]) {
		return;
	}

	window[INIT_KEY] = true;

	const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

	document.addEventListener('click', (event) => {
		const target = event.target;

		if (!(target instanceof Element) || !target.closest('[data-site-theme-toggle]')) {
			return;
		}

		const currentResolved = document.documentElement.dataset.themeResolved === 'dark' ? 'dark' : 'light';
		const nextPreference: ThemePreference = currentResolved === 'dark' ? 'light' : 'dark';
		localStorage.setItem(SITE_THEME_STORAGE_KEY, nextPreference);
		applyStoredAppearance('user');
	});

	themeMediaQuery.addEventListener('change', () => {
		if (getStoredThemePreference() !== 'system') {
			return;
		}

		applyStoredAppearance('system');
	});

	registerAfterSwap(rebindAppearanceAfterNavigation, true);
}

export { rebindAppearanceAfterNavigation };
