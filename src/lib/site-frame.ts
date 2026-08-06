import { stripTrailingSlashes } from './path-slashes.mjs';

export type MetroNavIconTone = 'past' | 'current' | 'future';

function decodePathname(path: string): string {
	try {
		return decodeURI(path);
	} catch {
		return path;
	}
}

/** Normalize a site path for active-link comparison (decode %xx, strip trailing `/`). */
export function normalizeNavPath(path: string): string {
	const trimmed = stripTrailingSlashes(decodePathname(path));
	return trimmed || '/';
}

export function isActiveLink(href: string, currentPath: string): boolean {
	const normalizedHref = normalizeNavPath(href);
	const normalizedCurrentPath = normalizeNavPath(currentPath);

	if (normalizedHref === '/') {
		return normalizedCurrentPath === '/';
	}

	return (
		normalizedCurrentPath === normalizedHref ||
		normalizedCurrentPath.startsWith(`${normalizedHref}/`)
	);
}

export function getMetroNavIconTone(
	index: number,
	activeNavIndex: number,
): MetroNavIconTone {
	if (index === activeNavIndex) {
		return 'current';
	}

	if (activeNavIndex !== -1 && index > activeNavIndex) {
		return 'future';
	}

	return 'past';
}

export function getActiveNavIndex(
	navItems: ReadonlyArray<{ href: string }>,
	currentPath: string,
): number {
	return navItems.findIndex((item) => isActiveLink(item.href, currentPath));
}
