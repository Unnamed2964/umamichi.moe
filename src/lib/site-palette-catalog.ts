import paletteManifest from '@umamichi-ui/common-css/palettes.json';

export type SitePaletteManifest = typeof paletteManifest;

export { paletteManifest };

export function getAllowedSitePaletteIds(): Set<string> {
	return new Set(paletteManifest.palettes.map((entry) => entry.id));
}
