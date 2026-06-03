import { FaGithub } from 'react-icons/fa6';
import { LuChevronDown, LuCopy } from 'react-icons/lu';

type ArticleSourceActionsProps = {
	sourceMarkdown: string;
	sourceUrl: string;
};

export default function ArticleSourceActions({
	sourceMarkdown,
	sourceUrl,
}: ArticleSourceActionsProps) {
	return (
		<div className="article-source-actions" data-article-source-tools>
			<div className="article-source-actions__row">
				<a
					href={sourceUrl}
					target="_blank"
					rel="noreferrer"
					className="article-source-actions__github-link site-button"
					data-site-button
				>
					<FaGithub className="article-source-actions__icon" aria-hidden="true" />
					<span>GitHub 源文件</span>
				</a>

				<button
					type="button"
					className="article-source-actions__menu-toggle site-button"
					data-article-source-menu-toggle
					data-site-button
					aria-label="展开 Markdown 操作"
					aria-haspopup="menu"
					aria-expanded="false"
				>
					<LuChevronDown
						className="article-source-actions__icon"
						data-article-source-menu-chevron
						aria-hidden="true"
					/>
				</button>
			</div>

			<div
				className="article-source-actions__menu site-button"
				data-article-source-menu
				data-site-button
				role="menu"
				hidden
			>
				<button
					type="button"
					className="article-source-actions__menu-item site-button"
					data-article-copy-markdown
					role="menuitem"
				>
					<LuCopy className="article-source-actions__icon" aria-hidden="true" />
					<span>复制 Markdown</span>
				</button>
			</div>

			<textarea
				className="article-source-actions__source"
				data-article-markdown-source
				readOnly
				value={sourceMarkdown}
				tabIndex={-1}
				aria-hidden="true"
			></textarea>
		</div>
	);
}
