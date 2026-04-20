import { Box, Link, Stack, Text } from "@chakra-ui/react"
import type { SidebarFolderNode, SidebarNode } from "../../lib/docs"

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
  if (node.kind === "folder") {
    const isCurrent = isCurrentLink(node.href, currentPath)
    const headingSize = node.level <= 1 ? "sm" : "xs"
    const childPadding = node.level <= 1 ? "3" : "4"

    return (
      <Stack key={node.routePath || node.href} gap="1.5">
        <Link
          href={node.href}
          aria-current={isCurrent ? "page" : undefined}
          display="block"
          color={isCurrent ? "var(--site-accent)" : "var(--article-fg)"}
          fontSize={headingSize}
          fontWeight="700"
          lineHeight="1.6"
          _hover={{ color: "var(--site-accent)", textDecoration: "none" }}
        >
          {node.title}
        </Link>

        {node.children.length > 0 && (
          <Stack gap="1.5" ps={childPadding}>
            {node.children.map((child) => renderTreeNode(child, currentPath, currentPostId))}
          </Stack>
        )}
      </Stack>
    )
  }

  const isCurrent = isCurrentLink(node.href, currentPath, currentPostId, node.id)
  const fontSize = node.level <= 2 ? "sm" : "xs"

  return (
    <Link
      key={node.id}
      href={node.href}
      aria-current={isCurrent ? "page" : undefined}
      display="block"
      color={isCurrent ? "var(--site-accent)" : "var(--site-muted-fg)"}
      fontSize={fontSize}
      fontWeight={isCurrent ? "700" : "500"}
      lineHeight="1.6"
      transition="color 0.2s ease, font-weight 0.2s ease"
      _hover={{ color: "var(--site-accent)", textDecoration: "none" }}
    >
      {node.title}
    </Link>
  )
}

export function ArticlePostList({ currentPath, currentPostId, tree, variant = "desktop" }: ArticlePostListProps) {
  if (!tree) {
    return null
  }

  const isMobileVariant = variant === "mobile"

  return (
    <Box
      as="nav"
      aria-label="文章列表"
      rounded={isMobileVariant ? "2xl" : "xl"}
      bg="var(--site-surface)"
      borderWidth="1px"
      borderColor="var(--site-border)"
      maxH={isMobileVariant ? "10rem" : "calc(100vh - var(--site-header-offset) - 4rem)"}
      overflowX="hidden"
      display="flex"
      flexDirection="column"
      px={isMobileVariant ? "4" : "5"}
      pt={isMobileVariant ? "3" : "4"}
      pb={isMobileVariant ? "4" : "5"}
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
        <Stack gap="2.5">
          {renderTreeNode(tree, currentPath, currentPostId)}
        </Stack>
      </Box>
    </Box>
  )
}