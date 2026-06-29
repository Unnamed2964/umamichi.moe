import paletteManifest from '@umamichi-ui/common-css/palettes.json';

export const SITE_THEME_STORAGE_KEY = 'site-theme';
export const SITE_PALETTE_STORAGE_KEY = 'site-palette';
export const sitePaletteStorageKey = SITE_PALETTE_STORAGE_KEY;

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export type SiteAppearanceState = {
	preference: ThemePreference;
	resolved: ResolvedTheme;
	palette: string;
};

function getAllowedSitePaletteIds(): Set<string> {
	return new Set(paletteManifest.palettes.map((entry) => entry.id));
}

export function getStoredThemePreference(): ThemePreference {
	const stored = localStorage.getItem(SITE_THEME_STORAGE_KEY);
	return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function getResolvedTheme(preference: ThemePreference): ResolvedTheme {
	if (preference === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	return preference;
}

export function getStoredPaletteId(): string | null {
	const stored = localStorage.getItem(SITE_PALETTE_STORAGE_KEY);
	if (!stored || stored === 'default') {
		return null;
	}

	return getAllowedSitePaletteIds().has(stored) ? stored : null;
}

export function readAppearanceFromStorage(): SiteAppearanceState {
	const preference = getStoredThemePreference();
	const paletteId = getStoredPaletteId();

	return {
		preference,
		resolved: getResolvedTheme(preference),
		palette: paletteId ?? 'default',
	};
}

export function applyAppearanceToRoot(root: HTMLElement, state: SiteAppearanceState): void {
	root.classList.toggle('dark', state.resolved === 'dark');
	root.classList.toggle('light', state.resolved === 'light');
	root.dataset.themePreference = state.preference;
	root.dataset.themeResolved = state.resolved;
	root.style.colorScheme = state.resolved;

	if (state.palette === 'default') {
		delete root.dataset.palette;
	} else {
		root.dataset.palette = state.palette;
	}
}

export function syncMermaidMedia(preference: ThemePreference): void {
	const mediaMap: Record<ThemePreference, string> = {
		system: '(prefers-color-scheme: dark)',
		dark: 'all',
		light: 'none',
	};

	for (const element of document.querySelectorAll('[id^="mermaid-dark"]')) {
		element.setAttribute('media', mediaMap[preference] ?? 'none');
	}
}

export function syncThemeToggleLabels(resolved: ResolvedTheme): void {
	const label = resolved === 'dark' ? '切换到浅色模式' : '切换到深色模式';

	for (const button of document.querySelectorAll('[data-site-theme-toggle]')) {
		button.setAttribute('aria-label', label);
		button.setAttribute('title', label);
	}
}

let themeTransitionResetFrame = 0;

export function markThemeSwitchingTransition(): void {
	document.documentElement.dataset.themeSwitching = 'true';

	if (themeTransitionResetFrame) {
		window.cancelAnimationFrame(themeTransitionResetFrame);
	}

	themeTransitionResetFrame = window.requestAnimationFrame(() => {
		themeTransitionResetFrame = window.requestAnimationFrame(() => {
			delete document.documentElement.dataset.themeSwitching;
			themeTransitionResetFrame = 0;
		});
	});
}
