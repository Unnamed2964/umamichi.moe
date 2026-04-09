import type { PropsWithChildren } from "react"
import { Stack } from "@chakra-ui/react"
import { ArticleContent } from "./ArticleContent"
import { ArticleHeader } from "./ArticleHeader"
import { ArticleHeroImage } from "./ArticleHeroImage"
import { SiteFrame } from "./SiteFrame"

type ArticleLayoutProps = PropsWithChildren<{
  currentPath: string
  title: string
  pubDate?: string
  updatedDate?: string
  heroImage?: {
    src: string
  }
}>

export function ArticleLayout({
  children,
  currentPath,
  title,
  pubDate,
  updatedDate,
  heroImage,
}: ArticleLayoutProps) {
  return (
    <SiteFrame currentPath={currentPath} mainMaxW="4xl">
      <Stack as="article" gap="10">
        <Stack gap="6" mx="auto" w="full">
          <ArticleHeader title={title} pubDate={pubDate} updatedDate={updatedDate} />

          {heroImage && <ArticleHeroImage src={heroImage.src} />}

          <ArticleContent>{children}</ArticleContent>
        </Stack>
      </Stack>
    </SiteFrame>
  )
}