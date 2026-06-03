import type { CSSProperties, ReactElement } from 'react';
import type { SidebarFolderNode, SidebarNode } from '../../lib/docs';
import {
	ARTICLE_NAV_BASE_DEPTH,
	type ArticleSidebarLinkKind,
	getArticleSidebarIndentStyle,
	getArticleSidebarLinkClassName,
	getArticleSidebarLinkTier,
} from '../../lib/article-sidebar-link';

export type ArticleSidebarTree = SidebarFolderNode;

type ArticlePostListProps = {
	currentPath: string;
	currentPostId?: string;
	tree?: ArticleSidebarTree;
	variant?: 'desktop' | 'mobile';
};

function isCurrentLink(href: string, currentPath: string, currentPostId?: string, nodeId?: string) {
	if (currentPostId && nodeId) {
		return currentPostId === nodeId;
	}

	if (href === '/') {
		return currentPath === '/';
	}

	return currentPath === href || currentPath.startsWith(`${href}/`);
}

function renderTreeNode(
	node: SidebarNode,
	currentPath: string,
	currentPostId?: string,
): ReactElement {
	const kind: ArticleSidebarLinkKind = node.kind === 'folder' ? 'section' : 'item';
	const tier = getArticleSidebarLinkTier(node.level, ARTICLE_NAV_BASE_DEPTH, kind);
	const isCurrent =
		node.kind === 'folder'
			? isCurrentLink(node.href, currentPath)
			: isCurrentLink(node.href, currentPath, currentPostId, node.id);
	const linkClassName = getArticleSidebarLinkClassName(kind, tier, isCurrent);
	const indentStyle = getArticleSidebarIndentStyle(node.level, ARTICLE_NAV_BASE_DEPTH);

	if (node.kind === 'folder') {
		return (
			<div key={node.routePath || node.href} className="site-sidebar-links">
				<a
					href={node.href}
					aria-current={isCurrent ? 'page' : undefined}
					className={linkClassName}
					style={indentStyle}
				>
					{node.title}
				</a>

				{node.children.length > 0 && (
					<div className="site-sidebar-links">
						{node.children.map((child) => renderTreeNode(child, currentPath, currentPostId))}
					</div>
				)}
			</div>
		);
	}

	return (
		<a
			key={node.id}
			href={node.href}
			aria-current={isCurrent ? 'page' : undefined}
			className={linkClassName}
			style={indentStyle}
		>
			{node.title}
		</a>
	);
}

export function ArticlePostList({
	currentPath,
	currentPostId,
	tree,
	variant = 'desktop',
}: ArticlePostListProps) {
	if (!tree) {
		return null;
	}

	const panelStyle: CSSProperties = {
		maxHeight:
			variant === 'mobile'
				? '10rem'
				: 'calc(100vh - var(--site-header-offset) - 4rem)',
	};

	return (
		<nav
			aria-label="文章列表"
			className="site-sidebar-panel"
			style={panelStyle}
		>
			<p className="site-sidebar-panel__title">导航</p>

			<div className="site-sidebar-scroll">
				<div className="site-sidebar-links">{renderTreeNode(tree, currentPath, currentPostId)}</div>
			</div>
		</nav>
	);
}
