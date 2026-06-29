import paletteManifest from '@umamichi-ui/common-css/palettes.json';
import { applyAppearanceToRoot, getStoredPaletteId, readAppearanceFromStorage, sitePaletteStorageKey } from './site-appearance';
import { dispatchSiteAppearanceChange } from './site-events';

export { sitePaletteStorageKey };

export type SitePaletteManifest = typeof paletteManifest;

export function getAllowedSitePaletteIds(): Set<string> {
	return new Set(paletteManifest.palettes.map((entry) => entry.id));
}

export function getStoredSitePaletteId(): string | null {
	return getStoredPaletteId();
}

export function applySitePalette(paletteId: string | null): void {
	if (paletteId) {
		localStorage.setItem(sitePaletteStorageKey, paletteId);
	} else {
		localStorage.setItem(sitePaletteStorageKey, 'default');
	}

	const state = readAppearanceFromStorage();
	applyAppearanceToRoot(document.documentElement, state);
	dispatchSiteAppearanceChange(state, 'user');
}

export { paletteManifest };
