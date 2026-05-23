/** Depth of the root folder node in the nav sidebar tree. */
export const ARTICLE_NAV_BASE_DEPTH = 0;

/** Markdown heading depth (h2) where the article TOC begins. */
export const ARTICLE_TOC_BASE_DEPTH = 2;

export type ArticleSidebarLinkKind = "section" | "item";

export type ArticleSidebarLinkTier = "primary" | "nested";

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

	if (kind === "section") {
		return relativeLevel <= 1 ? "primary" : "nested";
	}

	return relativeLevel <= 2 ? "primary" : "nested";
}

/** Chakra `ps` token: grows per depth so nested entries stay visually distinct. */
export function getArticleSidebarIndent(level: number, baseDepth: number): number {
	return getArticleSidebarRelativeLevel(level, baseDepth) * 4;
}

type ArticleSidebarLinkStyle = {
	display: "block";
	color: string;
	fontSize: "sm" | "xs";
	fontWeight: string;
	lineHeight: string;
	transition?: string;
	_hover: { color: string; textDecoration: string };
};

export function getArticleSidebarLinkStyle(
	kind: ArticleSidebarLinkKind,
	tier: ArticleSidebarLinkTier,
	isCurrent: boolean,
): ArticleSidebarLinkStyle {
	const fontSize = tier === "primary" ? "sm" : "xs";

	if (kind === "section") {
		return {
			display: "block",
			color: isCurrent ? "var(--site-accent)" : "var(--article-fg)",
			fontSize,
			fontWeight: "700",
			lineHeight: "1.6",
			_hover: { color: "var(--site-accent)", textDecoration: "none" },
		};
	}

	return {
		display: "block",
		color: isCurrent ? "var(--site-accent)" : "var(--site-muted-fg)",
		fontSize,
		fontWeight: isCurrent ? "700" : "500",
		lineHeight: "1.6",
		transition: "color 0.2s ease, font-weight 0.2s ease",
		_hover: { color: "var(--site-accent)", textDecoration: "none" },
	};
}
