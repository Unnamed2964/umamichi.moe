import type { PropsWithChildren, ReactNode } from "react"
import { Box, Stack } from "@chakra-ui/react"
import { ArticleHeader } from "../article/ArticleHeader"
import { ArticleHeroImage } from "../article/ArticleHeroImage"
import ArticleSourceActions from "../article/ArticleSourceActions"
import { ArticleTags } from "../article/ArticleTags"
import { ArticleCopyright } from "../article/ArticleCopyright"
import { ArticlePostList, type ArticleSidebarTree } from "../article/ArticlePostList"
import { ArticlePrevNext } from "../article/ArticlePrevNext"
import { ArticleToc } from "../article/ArticleToc"
import { SiteFrame } from "./SiteFrame"
import type { AdjacentArticleLink, ArticleTag } from "../../lib/article"
import type { ArticleTocHeading } from "../../lib/article-toc"
import { ARTICLE_SIDEBAR_FIXED_INSET, SITE_MAIN_MAX_W } from "../../lib/site-layout"
import type { CopyrightConfig } from "../../lib/copyright"
import { filterArticleTocHeadings } from "../../lib/article-toc"
import type { TopLevelNavItem } from "../../lib/docs"

const ARTICLE_SIDEBAR_W = "var(--site-article-sidebar-w)"

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
  navItems: TopLevelNavItem[]
  sidebarTree?: ArticleSidebarTree
  sourceMarkdown?: string
  sourceUrl?: string
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
    <SiteFrame currentPath={currentPath} navItems={navItems}>
      <Box maxW={SITE_MAIN_MAX_W} mx="auto" position="relative">
        {sidebarTree && (
          <Box
            as="aside"
            display={{ base: "none", xl: "block" }}
            position="fixed"
            top="calc(var(--site-header-offset) + 2rem)"
            left={ARTICLE_SIDEBAR_FIXED_INSET}
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
            right={ARTICLE_SIDEBAR_FIXED_INSET}
            w={ARTICLE_SIDEBAR_W}
            zIndex="1"
          >
            <div className="article-sidebar-rail">
              {sourceUrl && sourceMarkdown && (
                <ArticleSourceActions sourceMarkdown={sourceMarkdown} sourceUrl={sourceUrl} />
              )}
              <ArticleToc
                headings={tocHeadings}
                maxH={sourceUrl && sourceMarkdown ? "calc(100vh - var(--site-header-offset) - 9rem)" : undefined}
              />
            </div>
          </Box>
        )}

        <Stack as="article" gap="10" w="full">
          <Stack gap="6" w="full">
            {sidebarTree && (
              <Box
                display={{ base: "block", xl: "none" }}
              >
                <ArticlePostList
                  currentPath={currentPath}
                  currentPostId={currentPostId}
                  tree={sidebarTree}
                  variant="mobile"
                />
              </Box>
            )}

            <Box w="full">
              <ArticleHeader title={title} pubDate={pubDate} updatedDate={updatedDate} />
            </Box>

            {tags.length > 0 && (
              <Box w="full">
                <ArticleTags tags={tags} />
              </Box>
            )}

            {sourceUrl && sourceMarkdown && (
              <Box display={{ base: "block", xl: "none" }} w="full">
                <ArticleSourceActions sourceMarkdown={sourceMarkdown} sourceUrl={sourceUrl} />
              </Box>
            )}

            {heroImage && (
              <Box w="full">
                <ArticleHeroImage src={heroImage.src} />
              </Box>
            )}

            <div className="article-content">{children}</div>

            {copyright && (
              <Box w="full">
                <ArticleCopyright copyright={copyright} />
              </Box>
            )}

            {(previousPost || nextPost) && (
              <Box w="full">
                <ArticlePrevNext previousPost={previousPost} nextPost={nextPost} showDivider={!copyright} />
              </Box>
            )}

            {commentSlot}
          </Stack>
        </Stack>
      </Box>
    </SiteFrame>
  )
}