import type { CSSProperties } from 'react';
import type { ArticleTocHeading } from '../../lib/article-toc';
import {
	ARTICLE_TOC_BASE_DEPTH,
	type ArticleSidebarLinkKind,
	getArticleSidebarIndentStyle,
	getArticleSidebarLinkClassName,
	isArticleSidebarTopLevel,
} from '../../lib/article-sidebar-link';
import { filterArticleTocHeadings } from '../../lib/article-toc';

type ArticleTocProps = Readonly<{
	headings: ArticleTocHeading[];
	maxH?: string;
}>;

type ArticleTocLinksProps = Readonly<{
	headings: ArticleTocHeading[];
	onNavigate?: () => void;
}>;

export function ArticleTocLinks({ headings, onNavigate }: ArticleTocLinksProps) {
	const items = filterArticleTocHeadings(headings);

	return (
		<div className="site-sidebar-links">
			{items.map((heading) => {
				const kind: ArticleSidebarLinkKind = isArticleSidebarTopLevel(
					heading.depth,
					ARTICLE_TOC_BASE_DEPTH,
				)
					? 'section'
					: 'item';

				return (
					<a
						key={heading.slug}
						href={`#${heading.slug}`}
						data-toc-link={heading.slug}
						className={getArticleSidebarLinkClassName(kind, false)}
						style={getArticleSidebarIndentStyle(heading.depth, ARTICLE_TOC_BASE_DEPTH)}
						onClick={() => onNavigate?.()}
					>
						{heading.text}
					</a>
				);
			})}
		</div>
	);
}

export function ArticleToc({
	headings,
	maxH = 'calc(100vh - var(--site-header-offset) - 4rem)',
}: ArticleTocProps) {
	const items = filterArticleTocHeadings(headings);

	if (items.length === 0) {
		return null;
	}

	const panelStyle: CSSProperties = { maxHeight: maxH };

	return (
		<nav aria-label="文章目录" data-toc className="site-sidebar-panel" style={panelStyle}>
			<p className="site-sidebar-panel__title">目录</p>

			<div className="site-sidebar-scroll">
				<ArticleTocLinks headings={items} />
			</div>
		</nav>
	);
}
