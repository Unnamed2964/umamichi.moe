/** Depth of the root folder node in the nav sidebar tree. */
export const ARTICLE_NAV_BASE_DEPTH = 0;

/** Markdown heading depth (h2) where the article TOC begins. */
export const ARTICLE_TOC_BASE_DEPTH = 2;

export type ArticleSidebarLinkKind = 'section' | 'item';

export type ArticleSidebarLinkTier = 'primary' | 'nested';

export function getArticleSidebarRelativeLevel(level: number, baseDepth: number): number {
	return Math.max(0, level - baseDepth);
}

export function isArticleSidebarTopLevel(level: number, baseDepth: number): boolean {
	return getArticleSidebarRelativeLevel(level, baseDepth) === 0;
}

/** sm vs xs: section titles use a shallower threshold than list items. */
export function getArticleSidebarLinkTier(
	level: number,
	baseDepth: number,
	kind: ArticleSidebarLinkKind,
): ArticleSidebarLinkTier {
	const relativeLevel = getArticleSidebarRelativeLevel(level, baseDepth);

	if (kind === 'section') {
		return relativeLevel <= 1 ? 'primary' : 'nested';
	}

	return relativeLevel <= 2 ? 'primary' : 'nested';
}

/** Spacing units (× --site-space-unit) for nested sidebar / TOC entries. */
export function getArticleSidebarIndentUnits(level: number, baseDepth: number): number {
	return getArticleSidebarRelativeLevel(level, baseDepth) * 4;
}

export function getArticleSidebarIndentStyle(
	level: number,
	baseDepth: number,
): { paddingInlineStart: string } {
	const units = getArticleSidebarIndentUnits(level, baseDepth);
	return {
		paddingInlineStart: `calc(var(--site-space-unit) * ${units})`,
	};
}

export function getArticleSidebarLinkClassName(
	kind: ArticleSidebarLinkKind,
	tier: ArticleSidebarLinkTier,
	isCurrent: boolean,
): string {
	const classes = [
		'site-sidebar-link',
		`site-sidebar-link--${kind}`,
		`site-sidebar-link--${tier}`,
	];

	if (isCurrent) {
		classes.push('site-sidebar-link--current');
	}

	return classes.join(' ');
}
