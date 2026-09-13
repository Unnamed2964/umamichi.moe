import {
	applyAppearanceToRoot,
	getStoredPaletteId,
	readAppearanceFromStorage,
	sitePaletteStorageKey,
} from './site-appearance';
import { dispatchSiteAppearanceChange } from './site-events';
import { getAllowedSitePaletteIds, paletteManifest } from './site-palette-catalog';

export { sitePaletteStorageKey };
export { getAllowedSitePaletteIds, paletteManifest };
export type { SitePaletteManifest } from './site-palette-catalog';

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
