import { Box, Link, Stack, Text } from "@chakra-ui/react"
import {
  ARTICLE_TOC_BASE_DEPTH,
  type ArticleSidebarLinkKind,
  getArticleSidebarIndent,
  getArticleSidebarLinkStyle,
  getArticleSidebarLinkTier,
  isArticleSidebarTopLevel,
} from "../../lib/article-sidebar-link"
import { filterArticleTocHeadings } from "../../lib/article-toc"

export type ArticleTocHeading = {
  depth: number
  slug: string
  text: string
}

type ArticleTocProps = {
  headings: ArticleTocHeading[]
  maxH?: string
}

export function ArticleToc({ headings, maxH = "calc(100vh - var(--site-header-offset) - 4rem)" }: ArticleTocProps) {
  const items = filterArticleTocHeadings(headings)

  if (items.length === 0) {
    return null
  }

  return (
    <Box
      as="nav"
      aria-label="文章目录"
      data-toc
      rounded="none"
      bg="var(--site-sidebar-bg)"
      maxH={maxH}
      overflowX="hidden"
      display="flex"
      flexDirection="column"
    >
      <Text fontSize="sm" fontWeight="700" letterSpacing="wide" color="var(--site-subtle-fg)">
        目录
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
          {items.map((heading) => {
            const kind: ArticleSidebarLinkKind = isArticleSidebarTopLevel(
              heading.depth,
              ARTICLE_TOC_BASE_DEPTH,
            )
              ? "section"
              : "item"
            const tier = getArticleSidebarLinkTier(heading.depth, ARTICLE_TOC_BASE_DEPTH, kind)

            return (
            <Link
              key={heading.slug}
              href={`#${heading.slug}`}
              data-toc-link={heading.slug}
              ps={getArticleSidebarIndent(heading.depth, ARTICLE_TOC_BASE_DEPTH)}
              {...getArticleSidebarLinkStyle(kind, tier, false)}
              css={{
                '&[aria-current="location"]': {
                  color: 'var(--site-accent)',
                  fontWeight: 700,
                },
              }}
            >
              {heading.text}
            </Link>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}
