export type MetroNavIconTone = 'past' | 'current' | 'future';

export function isActiveLink(href: string, currentPath: string): boolean {
	if (href === '/') {
		return currentPath === '/';
	}

	const normalizedHref = href.replace(/\/+$/, '');
	const normalizedCurrentPath = currentPath.replace(/\/+$/, '');

	return (
		normalizedCurrentPath === normalizedHref ||
		normalizedCurrentPath.startsWith(`${normalizedHref}/`)
	);
}

export function getMetroNavIconTone(
	index: number,
	activeNavIndex: number,
): MetroNavIconTone {
	return index === activeNavIndex
		? 'current'
		: activeNavIndex !== -1 && index > activeNavIndex
			? 'future'
			: 'past';
}

export function getActiveNavIndex(
	navItems: ReadonlyArray<{ href: string }>,
	currentPath: string,
): number {
	return navItems.findIndex((item) => isActiveLink(item.href, currentPath));
}
