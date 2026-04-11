import type { PropsWithChildren } from "react"
import { Box, Stack } from "@chakra-ui/react"
import { ArticleContent } from "./ArticleContent"
import { ArticleHeader } from "./ArticleHeader"
import { ArticleHeroImage } from "./ArticleHeroImage"
import { ArticlePostList, type ArticlePostListItem } from "./ArticlePostList"
import { ArticleToc, type ArticleTocHeading } from "./ArticleToc"
import { SiteFrame, SITE_MAIN_MAX_W } from "./SiteFrame"

type ArticleLayoutProps = PropsWithChildren<{
  currentPath: string
  title: string
  pubDate?: string
  updatedDate?: string
  heroImage?: {
    src: string
  }
  headings?: ArticleTocHeading[]
  articleList?: ArticlePostListItem[]
  currentPostId?: string
}>

export function ArticleLayout({
  children,
  currentPath,
  title,
  pubDate,
  updatedDate,
  heroImage,
  headings = [],
  articleList = [],
  currentPostId,
}: ArticleLayoutProps) {
  const tocHeadings = headings.filter((heading) => heading.depth === 2 || heading.depth === 3)
  const hasToc = tocHeadings.length > 0
  const hasArticleList = articleList.length > 0

  return (
    <SiteFrame currentPath={currentPath}>
      <Box maxW={SITE_MAIN_MAX_W} mx="auto" position="relative">
        {hasArticleList && (
          <Box
            as="aside"
            display={{ base: "none", xl: "block" }}
            position="fixed"
            top="calc(var(--site-header-offset) + 2rem)"
            left="max(1rem, calc(50vw - 24rem - 15rem - 1.5rem))"
            w="15rem"
            zIndex="1"
          >
            <ArticlePostList posts={articleList} currentPostId={currentPostId} />
          </Box>
        )}

        {hasToc && (
          <Box
            as="aside"
            display={{ base: "none", xl: "block" }}
            position="fixed"
            top="calc(var(--site-header-offset) + 2rem)"
            right="max(1rem, calc(50vw - 24rem - 15rem - 1.5rem))"
            w="15rem"
            zIndex="1"
          >
            <ArticleToc headings={tocHeadings} />
          </Box>
        )}

        <Stack as="article" gap="10" w="full">
          <Stack gap="6" w="full">
            <ArticleHeader title={title} pubDate={pubDate} updatedDate={updatedDate} />

            {heroImage && <ArticleHeroImage src={heroImage.src} />}

            <ArticleContent>{children}</ArticleContent>
          </Stack>
        </Stack>
      </Box>
    </SiteFrame>
  )
}