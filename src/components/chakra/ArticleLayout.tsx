import type { PropsWithChildren, ReactNode } from "react"
import { Box, Stack } from "@chakra-ui/react"
import { ArticleContent } from "./ArticleContent"
import { ArticleCopyright } from "./ArticleCopyright"
import { ArticleHeader } from "./ArticleHeader"
import { ArticleHeroImage } from "./ArticleHeroImage"
import { ArticlePostList, type ArticleSidebarTree } from "./ArticlePostList"
import { ArticlePrevNext, type AdjacentArticleLink } from "./ArticlePrevNext"
import ArticleSourceActions from "./ArticleSourceActions"
import { ArticleTags, type ArticleTag } from "./ArticleTags"
import { ArticleToc, type ArticleTocHeading } from "./ArticleToc"
import { Container } from "@chakra-ui/react"
import { SiteFrameChrome, SITE_MAIN_HALF_W, SITE_MAIN_MAX_W } from "./SiteFrame"
import type { CopyrightConfig } from "../../lib/copyright"
import { filterArticleTocHeadings } from "../../lib/article-toc"
import type { TopLevelNavItem } from "../../lib/docs"

const ARTICLE_SIDEBAR_W = "12rem"
const ARTICLE_SIDEBAR_GAP = "0.5rem"

type ArticleLayoutProps = PropsWithChildren<{
  copyright?: CopyrightConfig
  comments?: ReactNode
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
  sidebarTree?: ArticleSidebarTree
  sourceMarkdown?: string
  sourceUrl?: string
  navItems: TopLevelNavItem[]
}>

export function ArticleLayout({
  children,
  copyright,
  comments,
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
  sourceMarkdown,
  sourceUrl,
}: ArticleLayoutProps) {
  const tocHeadings = filterArticleTocHeadings(headings)
  const hasToc = tocHeadings.length > 0
  const commentSlot = comments

  return (
    <SiteFrameChrome
      currentPath={currentPath}
      navItems={navItems}
    >
      <Container
        as="main"
        maxW={SITE_MAIN_MAX_W}
        px={{ base: 6, md: 8 }}
        py={{ base: 10, md: 14 }}
        css={{
          "--site-content-font-size": "var(--chakra-font-sizes-md)",
          "--site-content-line-height": "var(--chakra-line-heights-tall)",
          "@media screen and (min-width: 48rem)": {
            "--site-content-font-size": "var(--chakra-font-sizes-lg)",
          },
        }}
      >
        <Box maxW={SITE_MAIN_MAX_W} mx="auto" position="relative">
        {sidebarTree && (
          <Box
            as="aside"
            display={{ base: "none", xl: "block" }}
            position="fixed"
            top="calc(var(--site-header-offset) + 2rem)"
            left={`max(1rem, calc(50vw - ${SITE_MAIN_HALF_W} - ${ARTICLE_SIDEBAR_W} - ${ARTICLE_SIDEBAR_GAP}))`}
            w={ARTICLE_SIDEBAR_W}
            zIndex="1"
            className="vt-sidebar"
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
            className="vt-toc"
          >
            <Stack gap="3">
              {sourceUrl && sourceMarkdown && (
                <ArticleSourceActions sourceMarkdown={sourceMarkdown} sourceUrl={sourceUrl} />
              )}
              <ArticleToc
                headings={tocHeadings}
                maxH={sourceUrl && sourceMarkdown ? "calc(100vh - var(--site-header-offset) - 9rem)" : undefined}
              />
            </Stack>
          </Box>
        )}

        <Stack as="article" gap="10" w="full" className="vt-article">
          <Stack gap="6" w="full">
            {sidebarTree && (
              <Box
                display={{ base: "block", xl: "none" }}
                className="vt-top-sidebar"
              >
                <ArticlePostList
                  currentPath={currentPath}
                  currentPostId={currentPostId}
                  tree={sidebarTree}
                  variant="mobile"
                />
              </Box>
            )}

            <Box className="vt-title" w="full">
              <ArticleHeader title={title} pubDate={pubDate} updatedDate={updatedDate} />
            </Box>

            {tags.length > 0 && (
              <Box className="vt-tags" w="full">
                <ArticleTags tags={tags} />
              </Box>
            )}

            {sourceUrl && sourceMarkdown && (
              <Box display={{ base: "block", xl: "none" }} className="vt-source-actions" w="full">
                <ArticleSourceActions sourceMarkdown={sourceMarkdown} sourceUrl={sourceUrl} />
              </Box>
            )}

            {heroImage && (
              <Box className="vt-hero-image" w="full">
                <ArticleHeroImage src={heroImage.src} />
              </Box>
            )}

            <ArticleContent>{children}</ArticleContent>

            {copyright && (
              <Box className="vt-copyright" w="full">
                <ArticleCopyright copyright={copyright} />
              </Box>
            )}

            {(previousPost || nextPost) && (
              <Box className="vt-prev-next" w="full">
                <ArticlePrevNext previousPost={previousPost} nextPost={nextPost} showDivider={!copyright} />
              </Box>
            )}

            {commentSlot}
          </Stack>
        </Stack>
      </Box>
      </Container>
    </SiteFrameChrome>
  )
}