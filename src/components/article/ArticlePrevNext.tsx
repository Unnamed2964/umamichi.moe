import type { AdjacentArticleLink } from '../../lib/article';

type ArticlePrevNextProps = {
	previousPost?: AdjacentArticleLink;
	nextPost?: AdjacentArticleLink;
	showDivider?: boolean;
};

function ArticleNavCard({
	href,
	title,
	direction,
}: AdjacentArticleLink & { direction: 'previous' | 'next' }) {
	const isNext = direction === 'next';

	return (
		<a
			href={href}
			className={`article-prev-next__card${isNext ? ' article-prev-next__card--next' : ''}`}
			data-site-button
		>
			<span className="article-prev-next__label">{isNext ? '下一篇' : '上一篇'}</span>
			<span className="article-prev-next__title">{title}</span>
		</a>
	);
}

export function ArticlePrevNext({
	previousPost,
	nextPost,
	showDivider = true,
}: ArticlePrevNextProps) {
	if (!previousPost && !nextPost) {
		return null;
	}

	return (
		<nav
			aria-label="上一篇和下一篇"
			className={`article-prev-next${showDivider ? ' article-prev-next--divider' : ''}`}
		>
			<div className="article-prev-next__row">
				<div className="article-prev-next__slot article-prev-next__slot--previous">
					{previousPost ? <ArticleNavCard {...previousPost} direction="previous" /> : null}
				</div>
				<div className="article-prev-next__slot article-prev-next__slot--next">
					{nextPost ? <ArticleNavCard {...nextPost} direction="next" /> : null}
				</div>
			</div>
		</nav>
	);
}
