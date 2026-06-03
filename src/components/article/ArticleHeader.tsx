type ArticleHeaderProps = {
	title: string;
	pubDate?: string;
	updatedDate?: string;
};

export function ArticleHeader({ title, pubDate, updatedDate }: ArticleHeaderProps) {
	return (
		<header className="article-header">
			{pubDate && <p className="article-header__date">{pubDate}</p>}
			{updatedDate && (
				<p className="article-header__updated">最后更新于 {updatedDate}</p>
			)}
			<h1 className="article-header__title">{title}</h1>
			<div className="article-header__title-bar" aria-hidden="true"></div>
		</header>
	);
}
