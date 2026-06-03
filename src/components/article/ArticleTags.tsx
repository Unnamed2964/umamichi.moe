import type { ArticleTag } from '../../lib/article';

type ArticleTagsProps = {
	tags?: ArticleTag[];
};

export function ArticleTags({ tags = [] }: ArticleTagsProps) {
	if (tags.length === 0) {
		return null;
	}

	return (
		<ul className="article-tags">
			{tags.map((tag) => (
				<li key={tag.href}>
					<a href={tag.href} className="article-tag site-button" data-site-button>
						#{tag.label}
					</a>
				</li>
			))}
		</ul>
	);
}
