/** Depth of the root folder node in the nav sidebar tree. */
export const ARTICLE_NAV_BASE_DEPTH = 0;

/** Markdown heading depth (h2) where the article TOC begins. */
export const ARTICLE_TOC_BASE_DEPTH = 2;

export type ArticleSidebarLinkKind = 'section' | 'item';

export function getArticleSidebarRelativeLevel(level: number, baseDepth: number): number {
	return Math.max(0, level - baseDepth);
}

export function isArticleSidebarTopLevel(level: number, baseDepth: number): boolean {
	return getArticleSidebarRelativeLevel(level, baseDepth) === 0;
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
	isCurrent: boolean,
): string {
	const classes = ['site-sidebar-link', `site-sidebar-link--${kind}`];

	if (isCurrent) {
		classes.push('site-sidebar-link--current');
	}

	return classes.join(' ');
}
