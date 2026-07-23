import { FullscreenOverlay, OverlayStackProvider } from '@umamichi-ui/common-components/overlay';
import { useEffect, useId, useMemo, useState } from 'react';
import type { GitHistoryCommit, GitHistoryPayload } from '../../lib/git-history';

export const ARTICLE_GIT_HISTORY_OPEN_EVENT = 'article:git-history-open';

const OVERLAY_ID = 'article-git-history';

type ArticleGitHistoryProps = {
	historyUrl: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
});

function formatCommitWhen(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return iso;
	}
	return dateTimeFormatter.format(date);
}

function shortenRepoPath(filePath: string | undefined): string {
	if (!filePath) {
		return '';
	}
	return filePath.replace(/^src\/content\//, '');
}

function hasContentHunks(patch: string): boolean {
	return /^@@/m.test(patch);
}

function DiffView({ commit }: { commit: GitHistoryCommit }) {
	const isRename =
		commit.paths.status === 'R' ||
		Boolean(commit.paths.from && commit.paths.to && commit.paths.from !== commit.paths.to);
	const fromLabel = shortenRepoPath(commit.paths.from);
	const toLabel = shortenRepoPath(commit.paths.to);
	const showHunks = hasContentHunks(commit.patch);
	const lines = useMemo(() => (showHunks ? commit.patch.split('\n') : []), [commit.patch, showHunks]);

	return (
		<div className="article-git-history__diff">
			{isRename && (
				<p className="article-git-history__rename">
					{fromLabel && toLabel
						? showHunks
							? `文件由 ${fromLabel} 移动至 ${toLabel}`
							: `文件由 ${fromLabel} 移动至 ${toLabel}（内容未变）`
						: '文件路径已变更'}
					{commit.paths.similarity !== undefined ? ` · 相似度 ${commit.paths.similarity}%` : ''}
				</p>
			)}

			{!showHunks && !isRename && (
				<p className="article-git-history__empty-diff">此次提交没有可显示的正文 diff。</p>
			)}

			{showHunks && (
				<pre className="article-git-history__patch" tabIndex={0}>
					<code>
						{lines.map((line, index) => {
							let kind = 'context';
							if (
								line.startsWith('+++') ||
								line.startsWith('---') ||
								line.startsWith('diff ') ||
								line.startsWith('index ') ||
								line.startsWith('similarity ') ||
								line.startsWith('rename ') ||
								line.startsWith('new file') ||
								line.startsWith('deleted file')
							) {
								kind = 'meta';
							} else if (line.startsWith('@@')) {
								kind = 'hunk';
							} else if (line.startsWith('+')) {
								kind = 'add';
							} else if (line.startsWith('-')) {
								kind = 'del';
							}

							return (
								<span
									key={`${commit.hash}-${index}`}
									className={`article-git-history__line article-git-history__line--${kind}`}
								>
									{line || '\u00a0'}
								</span>
							);
						})}
					</code>
				</pre>
			)}
		</div>
	);
}

function ArticleGitHistoryInner({ historyUrl }: ArticleGitHistoryProps) {
	const titleId = useId();
	const [open, setOpen] = useState(false);
	const [payload, setPayload] = useState<GitHistoryPayload | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [selectedHash, setSelectedHash] = useState<string | null>(null);

	const selectedCommit = useMemo(() => {
		if (!payload || !selectedHash) {
			return null;
		}
		return payload.commits.find((commit) => commit.hash === selectedHash) ?? null;
	}, [payload, selectedHash]);

	useEffect(() => {
		setPayload(null);
		setSelectedHash(null);
		setLoadError(null);
		setLoading(false);
	}, [historyUrl]);

	useEffect(() => {
		const onOpen = () => setOpen(true);
		window.addEventListener(ARTICLE_GIT_HISTORY_OPEN_EVENT, onOpen);
		return () => window.removeEventListener(ARTICLE_GIT_HISTORY_OPEN_EVENT, onOpen);
	}, []);

	useEffect(() => {
		if (!open) {
			return;
		}

		let cancelled = false;

		const load = async () => {
			if (payload) {
				return;
			}

			setLoading(true);
			setLoadError(null);

			try {
				const response = await fetch(historyUrl);
				if (!response.ok) {
					throw new Error(`加载失败（${response.status}）`);
				}
				const data = (await response.json()) as GitHistoryPayload;
				if (cancelled) {
					return;
				}
				setPayload(data);
				setSelectedHash(data.commits[0]?.hash ?? null);
			} catch (error) {
				if (cancelled) {
					return;
				}
				setLoadError(error instanceof Error ? error.message : '加载失败');
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		void load();

		return () => {
			cancelled = true;
		};
	}, [historyUrl, open, payload]);

	useEffect(() => {
		if (!open) {
			delete document.documentElement.dataset.gitHistoryOpen;
			return;
		}

		document.documentElement.dataset.gitHistoryOpen = 'true';

		return () => {
			delete document.documentElement.dataset.gitHistoryOpen;
		};
	}, [open]);

	useEffect(() => {
		const hideForViewTransition = () => {
			setOpen(false);
			delete document.documentElement.dataset.gitHistoryOpen;
		};

		document.addEventListener('astro:before-preparation', hideForViewTransition);
		return () => {
			document.removeEventListener('astro:before-preparation', hideForViewTransition);
		};
	}, []);

	const close = () => setOpen(false);

	return (
		<FullscreenOverlay
			open={open}
			overlayId={OVERLAY_ID}
			onDismiss={close}
			title="Git 历史记录"
			titleId={titleId}
			size="page"
			fill
			closeAriaLabel="关闭 Git 历史记录"
			panelClassName="article-git-history-panel"
			bodyClassName="article-git-history__body"
		>
			{loading && <p className="article-git-history__status">正在加载…</p>}
			{loadError && <p className="article-git-history__status">{loadError}</p>}

			{payload && payload.commits.length === 0 && (
				<p className="article-git-history__status">暂无 Git 修改记录。</p>
			)}

			{payload && payload.commits.length > 0 && (
				<>
					<nav className="article-git-history__timeline" aria-label="提交时间线">
						<ul className="article-git-history__list">
							{payload.commits.map((commit) => {
								const isSelected = commit.hash === selectedHash;
								const isRename =
									commit.paths.status === 'R' ||
									Boolean(
										commit.paths.from && commit.paths.to && commit.paths.from !== commit.paths.to,
									);

								return (
									<li key={commit.hash}>
										<button
											type="button"
											className={
												isSelected
													? 'article-git-history__commit is-selected'
													: 'article-git-history__commit'
											}
											aria-current={isSelected ? 'true' : undefined}
											onClick={() => setSelectedHash(commit.hash)}
										>
											<span className="article-git-history__commit-when">
												{formatCommitWhen(commit.committedAt)}
											</span>
											<span className="article-git-history__commit-subject">{commit.subject}</span>
											{isRename && <span className="article-git-history__commit-badge">移动</span>}
										</button>
									</li>
								);
							})}
						</ul>
					</nav>

					<div className="article-git-history__detail">
						{selectedCommit ? (
							<DiffView commit={selectedCommit} />
						) : (
							<p className="article-git-history__status">请选择一次修改。</p>
						)}
					</div>
				</>
			)}
		</FullscreenOverlay>
	);
}

export default function ArticleGitHistory(props: ArticleGitHistoryProps) {
	return (
		<OverlayStackProvider>
			<ArticleGitHistoryInner {...props} />
		</OverlayStackProvider>
	);
}
