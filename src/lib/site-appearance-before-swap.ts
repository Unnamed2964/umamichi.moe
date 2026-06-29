import { sitePaletteStorageKey } from './site-palette';

const INIT_KEY = '__siteAppearanceBeforeSwapInit';
const THEME_STORAGE_KEY = 'site-theme';

declare global {
	interface Window {
		[INIT_KEY]?: boolean;
	}
}

type ThemePreference = 'light' | 'dark' | 'system';

function getStoredThemePreference(): ThemePreference {
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	return stored === 'light' || stored === 'dark' ? stored : 'system';
}

function getResolvedTheme(preference: ThemePreference): 'light' | 'dark' {
	if (preference === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	return preference;
}

export function applyStoredAppearanceToRoot(root: HTMLElement): void {
	const preference = getStoredThemePreference();
	const resolved = getResolvedTheme(preference);

	root.classList.toggle('dark', resolved === 'dark');
	root.classList.toggle('light', resolved === 'light');
	root.dataset.themePreference = preference;
	root.dataset.themeResolved = resolved;
	root.style.colorScheme = resolved;

	const storedPalette = localStorage.getItem(sitePaletteStorageKey);

	if (!storedPalette || storedPalette === 'default') {
		delete root.dataset.palette;
		return;
	}

	root.dataset.palette = storedPalette;
}

export function syncThemeColorMetaToDocument(sourceDocument: Document, targetDocument: Document): void {
	const header = sourceDocument.querySelector('[data-site-header]');

	if (!(header instanceof HTMLElement)) {
		return;
	}

	const color = getComputedStyle(header).backgroundColor;

	if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
		return;
	}

	let meta = targetDocument.querySelector('meta[name="theme-color"]');

	if (!meta) {
		meta = targetDocument.createElement('meta');
		meta.setAttribute('name', 'theme-color');
		targetDocument.head.append(meta);
	}

	meta.setAttribute('content', color);
}

export function initSiteAppearanceBeforeSwap(): void {
	if (window[INIT_KEY]) {
		return;
	}

	window[INIT_KEY] = true;

	document.addEventListener('astro:before-swap', (event) => {
		const newDocument = (event as CustomEvent & { newDocument?: Document }).newDocument;

		if (!newDocument) {
			return;
		}

		applyStoredAppearanceToRoot(newDocument.documentElement);
		syncThemeColorMetaToDocument(document, newDocument);
	});
}
