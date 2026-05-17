import { Box, Link, Stack, Text } from "@chakra-ui/react"
import {
  filterArticleTocHeadings,
  getArticleTocIndent,
  isArticleTocTopLevel,
} from "../../lib/article-toc"

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
            const topLevel = isArticleTocTopLevel(heading.depth)

            return (
            <Link
              key={heading.slug}
              href={`#${heading.slug}`}
              data-toc-link={heading.slug}
              display="block"
              ps={getArticleTocIndent(heading.depth)}
              color={topLevel ? "var(--article-fg)" : "var(--site-muted-fg)"}
              fontSize={topLevel ? "sm" : "xs"}
              fontWeight={topLevel ? "600" : "500"}
              lineHeight="1.6"
              transition="color 0.2s ease, font-weight 0.2s ease"
              _hover={{ color: "var(--site-accent)", textDecoration: "none" }}
              _currentPage={{ color: "var(--site-accent)", fontWeight: "700" }}
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