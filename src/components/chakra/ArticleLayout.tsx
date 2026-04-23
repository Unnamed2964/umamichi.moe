import type { PropsWithChildren } from "react"
import { Box, Stack } from "@chakra-ui/react"
import { ArticleContent } from "./ArticleContent"
import { ArticleHeader } from "./ArticleHeader"
import { ArticleHeroImage } from "./ArticleHeroImage"
import { ArticlePostList, type ArticleSidebarTree } from "./ArticlePostList"
import { ArticlePrevNext, type AdjacentArticleLink } from "./ArticlePrevNext"
import { ArticleTags, type ArticleTag } from "./ArticleTags"
import { ArticleToc, type ArticleTocHeading } from "./ArticleToc"
import { SiteFrame, SITE_MAIN_HALF_W, SITE_MAIN_MAX_W } from "./SiteFrame"
import type { TopLevelNavItem } from "../../lib/docs"

const ARTICLE_SIDEBAR_W = "12rem"
const ARTICLE_SIDEBAR_GAP = "0.5rem"

type ArticleLayoutProps = PropsWithChildren<{
  currentPath: string
  title: string
  tags?: ArticleTag[]
  pubDate?: string
  updatedDate?: string
  heroImage?: {
    src: string
  }
  headings?: ArticleTocHeading[]
  currentPostId?: string
  previousPost?: AdjacentArticleLink
  nextPost?: AdjacentArticleLink
  navItems: TopLevelNavItem[]
  sidebarTree?: ArticleSidebarTree
}>

export function ArticleLayout({
  children,
  currentPath,
  title,
  tags = [],
  pubDate,
  updatedDate,
  heroImage,
  headings = [],
  currentPostId,
  previousPost,
  nextPost,
  navItems,
  sidebarTree,
}: ArticleLayoutProps) {
  const tocHeadings = headings.filter((heading) => heading.depth === 2 || heading.depth === 3)
  const hasToc = tocHeadings.length > 0
  const hasSidebarTree = Boolean(sidebarTree)

  return (
    <SiteFrame currentPath={currentPath} navItems={navItems}>
      <Box maxW={SITE_MAIN_MAX_W} mx="auto" position="relative">
        {hasSidebarTree && sidebarTree && (
          <Box
            as="aside"
            display={{ base: "none", xl: "block" }}
            position="fixed"
            top="calc(var(--site-header-offset) + 2rem)"
            left={`max(1rem, calc(50vw - ${SITE_MAIN_HALF_W} - ${ARTICLE_SIDEBAR_W} - ${ARTICLE_SIDEBAR_GAP}))`}
            w={ARTICLE_SIDEBAR_W}
            zIndex="1"
          >
            <ArticlePostList currentPath={currentPath} currentPostId={currentPostId} tree={sidebarTree} />
          </Box>
        )}

        {hasToc && (
          <Box
            as="aside"
            display={{ base: "none", xl: "block" }}
            position="fixed"
            top="calc(var(--site-header-offset) + 2rem)"
            right={`max(1rem, calc(50vw - ${SITE_MAIN_HALF_W} - ${ARTICLE_SIDEBAR_W} - ${ARTICLE_SIDEBAR_GAP}))`}
            w={ARTICLE_SIDEBAR_W}
            zIndex="1"
          >
            <ArticleToc headings={tocHeadings} />
          </Box>
        )}

        <Stack as="article" gap="10" w="full">
          <Stack gap="6" w="full">
            {hasSidebarTree && sidebarTree && (
              <Box display={{ base: "block", xl: "none" }}>
                <ArticlePostList
                  currentPath={currentPath}
                  currentPostId={currentPostId}
                  tree={sidebarTree}
                  variant="mobile"
                />
              </Box>
            )}

            <ArticleHeader title={title} pubDate={pubDate} updatedDate={updatedDate} />
            <ArticleTags tags={tags} />

            {heroImage && <ArticleHeroImage src={heroImage.src} />}

            <ArticleContent>{children}</ArticleContent>
            <ArticlePrevNext previousPost={previousPost} nextPost={nextPost} />
          </Stack>
        </Stack>
      </Box>
    </SiteFrame>
  )
}