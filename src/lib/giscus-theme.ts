import { getAllowedSitePaletteIds } from './site-palette';

export type GiscusColorMode = 'light' | 'dark';

export function getResolvedGiscusColorMode(): GiscusColorMode {
	if (typeof document === 'undefined') {
		return 'light';
	}

	return document.documentElement.dataset.themeResolved === 'dark' ? 'dark' : 'light';
}

export function getResolvedSitePaletteId(): string | null {
	if (typeof document === 'undefined') {
		return null;
	}

	const palette = document.documentElement.dataset.palette;
	if (!palette || !getAllowedSitePaletteIds().has(palette)) {
		return null;
	}

	return palette;
}

export function getGiscusThemePath(mode: GiscusColorMode, paletteId: string | null): string {
	if (paletteId === null) {
		return `/giscus/${mode}.css`;
	}

	return `/giscus/${mode}-${paletteId}.css`;
}

export function toAbsoluteGiscusThemeUrl(assetUrl: string): string {
	if (/^https?:\/\//i.test(assetUrl)) {
		return assetUrl;
	}

	return new URL(assetUrl, window.location.origin).href;
}

export function getGiscusThemeUrl(): string {
	return toAbsoluteGiscusThemeUrl(
		getGiscusThemePath(getResolvedGiscusColorMode(), getResolvedSitePaletteId()),
	);
}
