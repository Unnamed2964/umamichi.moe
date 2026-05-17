export const ARTICLE_TOC_MIN_DEPTH = 2;
export const ARTICLE_TOC_MAX_DEPTH = 6;

export function filterArticleTocHeadings<T extends { depth: number }>(headings: T[]): T[] {
	return headings.filter(
		(heading) => heading.depth >= ARTICLE_TOC_MIN_DEPTH && heading.depth <= ARTICLE_TOC_MAX_DEPTH,
	);
}

export function isArticleTocTopLevel(depth: number): boolean {
	return depth === ARTICLE_TOC_MIN_DEPTH;
}

/** Chakra spacing token per heading level below h2 (h3 → 4, h4 → 8, …). */
export function getArticleTocIndent(depth: number): number {
	return Math.max(0, depth - ARTICLE_TOC_MIN_DEPTH) * 4;
}
