import { Box, Link, Stack, Text } from "@chakra-ui/react"
import {
  ARTICLE_TOC_BASE_DEPTH,
  type ArticleSidebarLinkKind,
  getArticleSidebarIndentStyle,
  getArticleSidebarLinkClassName,
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
      className="site-sidebar-panel"
      maxH={maxH}
    >
      <Text className="site-sidebar-panel__title">
        目录
      </Text>

      <Box className="site-sidebar-scroll">
        <Stack className="site-sidebar-links" gap="2">
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
              className={getArticleSidebarLinkClassName(kind, tier, false)}
              style={getArticleSidebarIndentStyle(heading.depth, ARTICLE_TOC_BASE_DEPTH)}
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
