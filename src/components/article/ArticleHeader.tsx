import { LuCalendar, LuClock } from 'react-icons/lu';

type ArticleHeaderProps = {
	title: string;
	pubDate?: string;
	readingTimeLabel?: string;
	updatedDate?: string;
};

export function ArticleHeader({
	title,
	pubDate,
	readingTimeLabel,
	updatedDate,
}: ArticleHeaderProps) {
	const showParallelMeta = Boolean(pubDate && readingTimeLabel);

	return (
		<header className="article-header">
			{(pubDate || readingTimeLabel) && (
				<p className="article-header__meta">
					{pubDate && (
						<span className="article-header__meta-item">
							{showParallelMeta && (
								<LuCalendar className="article-header__meta-icon" aria-hidden="true" />
							)}
							{pubDate}
						</span>
					)}
					{readingTimeLabel && (
						<span className="article-header__meta-item">
							<LuClock className="article-header__meta-icon" aria-hidden="true" />
							{readingTimeLabel}
						</span>
					)}
				</p>
			)}
			{updatedDate && (
				<p className="article-header__updated">最后更新于 {updatedDate}</p>
			)}
			<h1 className="article-header__title">{title}</h1>
			<div className="article-header__title-bar" aria-hidden="true"></div>
		</header>
	);
}
