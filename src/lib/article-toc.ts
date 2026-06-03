import {
	ARTICLE_TOC_BASE_DEPTH,
	getArticleSidebarIndentUnits,
	isArticleSidebarTopLevel,
} from "./article-sidebar-link";

export const ARTICLE_TOC_MIN_DEPTH = ARTICLE_TOC_BASE_DEPTH;
export const ARTICLE_TOC_MAX_DEPTH = 6;

export type ArticleTocHeading = {
	depth: number;
	slug: string;
	text: string;
};

export function filterArticleTocHeadings<T extends { depth: number }>(headings: T[]): T[] {
	return headings.filter(
		(heading) => heading.depth >= ARTICLE_TOC_MIN_DEPTH && heading.depth <= ARTICLE_TOC_MAX_DEPTH,
	);
}

export function isArticleTocTopLevel(depth: number): boolean {
	return isArticleSidebarTopLevel(depth, ARTICLE_TOC_MIN_DEPTH);
}

export function getArticleTocIndent(depth: number): number {
	return getArticleSidebarIndentUnits(depth, ARTICLE_TOC_MIN_DEPTH);
}
