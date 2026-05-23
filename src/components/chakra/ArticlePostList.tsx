import { Box, Link, Stack, Text } from "@chakra-ui/react"
import type { SidebarFolderNode, SidebarNode } from "../../lib/docs"
import {
  ARTICLE_NAV_BASE_DEPTH,
  type ArticleSidebarLinkKind,
  getArticleSidebarIndent,
  getArticleSidebarLinkStyle,
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
  const linkStyle = getArticleSidebarLinkStyle(kind, tier, isCurrent)
  const indent = getArticleSidebarIndent(node.level, ARTICLE_NAV_BASE_DEPTH)

  if (node.kind === "folder") {
    return (
      <Stack key={node.routePath || node.href} gap="2">
        <Link
          href={node.href}
          aria-current={isCurrent ? "page" : undefined}
          ps={indent}
          {...linkStyle}
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
      ps={indent}
      {...linkStyle}
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
      rounded="none"
      bg="var(--site-sidebar-bg)"
      maxH={variant === "mobile" ? "10rem" : "calc(100vh - var(--site-header-offset) - 4rem)"}
      overflowX="hidden"
      display="flex"
      flexDirection="column"
    >
      <Text fontSize="sm" fontWeight="700" letterSpacing="wide" color="var(--site-subtle-fg)">
        导航
      </Text>

      <Box
        mt="3"
        flex="1"
        minH="0"
        overflowY="auto"
        overflowX="hidden"
        overscrollBehavior="contain"
        css={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Stack gap="2">
          {renderTreeNode(tree, currentPath, currentPostId)}
        </Stack>
      </Box>
    </Box>
  )
}
