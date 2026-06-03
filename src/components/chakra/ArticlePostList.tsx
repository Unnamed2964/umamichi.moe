import { Box, Link, Stack, Text } from "@chakra-ui/react"
import type { SidebarFolderNode, SidebarNode } from "../../lib/docs"
import {
  ARTICLE_NAV_BASE_DEPTH,
  type ArticleSidebarLinkKind,
  getArticleSidebarIndentStyle,
  getArticleSidebarLinkClassName,
  getArticleSidebarLinkTier,
} from "../../lib/article-sidebar-link"

export type ArticleSidebarTree = SidebarFolderNode

type ArticlePostListProps = {
  currentPath: string
  currentPostId?: string
  tree?: ArticleSidebarTree
  variant?: "desktop" | "mobile"
}

function isCurrentLink(href: string, currentPath: string, currentPostId?: string, nodeId?: string) {
  if (currentPostId && nodeId) {
    return currentPostId === nodeId
  }

  if (href === "/") {
    return currentPath === "/"
  }

  return currentPath === href || currentPath.startsWith(`${href}/`)
}

function renderTreeNode(node: SidebarNode, currentPath: string, currentPostId?: string): JSX.Element {
  const kind: ArticleSidebarLinkKind = node.kind === "folder" ? "section" : "item"
  const tier = getArticleSidebarLinkTier(node.level, ARTICLE_NAV_BASE_DEPTH, kind)
  const isCurrent =
    node.kind === "folder"
      ? isCurrentLink(node.href, currentPath)
      : isCurrentLink(node.href, currentPath, currentPostId, node.id)
  const linkClassName = getArticleSidebarLinkClassName(kind, tier, isCurrent)
  const indentStyle = getArticleSidebarIndentStyle(node.level, ARTICLE_NAV_BASE_DEPTH)

  if (node.kind === "folder") {
    return (
      <Stack key={node.routePath || node.href} gap="2">
        <Link
          href={node.href}
          aria-current={isCurrent ? "page" : undefined}
          className={linkClassName}
          style={indentStyle}
        >
          {node.title}
        </Link>

        {node.children.length > 0 && (
          <Stack gap="2">
            {node.children.map((child) => renderTreeNode(child, currentPath, currentPostId))}
          </Stack>
        )}
      </Stack>
    )
  }

  return (
    <Link
      key={node.id}
      href={node.href}
      aria-current={isCurrent ? "page" : undefined}
      className={linkClassName}
      style={indentStyle}
    >
      {node.title}
    </Link>
  )
}

export function ArticlePostList({ currentPath, currentPostId, tree, variant = "desktop" }: ArticlePostListProps) {
  if (!tree) {
    return null
  }

  return (
    <Box
      as="nav"
      aria-label="文章列表"
      className="site-sidebar-panel"
      maxH={variant === "mobile" ? "10rem" : "calc(100vh - var(--site-header-offset) - 4rem)"}
    >
      <Text className="site-sidebar-panel__title">
        导航
      </Text>

      <Box className="site-sidebar-scroll">
        <Stack className="site-sidebar-links" gap="2">
          {renderTreeNode(tree, currentPath, currentPostId)}
        </Stack>
      </Box>
    </Box>
  )
}
