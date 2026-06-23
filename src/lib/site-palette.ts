import paletteManifest from '@umamichi-ui/common-css/palettes.json';

export const sitePaletteStorageKey = 'site-palette';

export type SitePaletteManifest = typeof paletteManifest;

export function getAllowedSitePaletteIds(): Set<string> {
	return new Set(paletteManifest.palettes.map((entry) => entry.id));
}

export function getStoredSitePaletteId(): string | null {
	const stored = localStorage.getItem(sitePaletteStorageKey);
	if (!stored || stored === 'default') {
		return null;
	}
	return getAllowedSitePaletteIds().has(stored) ? stored : null;
}

export function applySitePalette(paletteId: string | null): void {
	const root = document.documentElement;

	if (paletteId) {
		root.dataset.palette = paletteId;
		localStorage.setItem(sitePaletteStorageKey, paletteId);
	} else {
		delete root.dataset.palette;
		localStorage.setItem(sitePaletteStorageKey, 'default');
	}

	document.dispatchEvent(
		new CustomEvent('site:palette-change', {
			detail: { palette: paletteId ?? 'default' },
		}),
	);
}

export { paletteManifest };
