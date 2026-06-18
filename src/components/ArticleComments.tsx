import Giscus from "@giscus/react"
import giscusDarkUrl from "@umamichi-ui/giscus-theme/dark.css?url"
import giscusLightUrl from "@umamichi-ui/giscus-theme/light.css?url"
import { useEffect, useState } from "react"

const giscusThemeUrls = {
  light: giscusLightUrl,
  dark: giscusDarkUrl,
} as const

type GiscusResolvedTheme = keyof typeof giscusThemeUrls

function getResolvedGiscusTheme(): GiscusResolvedTheme {
  if (typeof document === "undefined") {
    return "light"
  }

  return document.documentElement.dataset.themeResolved === "dark" ? "dark" : "light"
}

function toAbsoluteGiscusThemeUrl(assetUrl: string): string {
  if (/^https?:\/\//i.test(assetUrl)) {
    return assetUrl
  }

  return new URL(assetUrl, window.location.origin).href
}

function getGiscusThemeUrl(resolved: GiscusResolvedTheme): string {
  return toAbsoluteGiscusThemeUrl(giscusThemeUrls[resolved])
}

export default function ArticleComments() {
  const [giscusTheme, setGiscusTheme] = useState<string | null>(null)

  useEffect(() => {
    const syncGiscusTheme = () => setGiscusTheme(getGiscusThemeUrl(getResolvedGiscusTheme()))

    syncGiscusTheme()
    document.addEventListener("site:theme-change", syncGiscusTheme)

    return () => {
      document.removeEventListener("site:theme-change", syncGiscusTheme)
    }
  }, [])

  return (
    <section aria-label="评论区" data-out-of-site-ugc="giscus" style={{ marginTop: "3rem" }}>
      {giscusTheme && (
        <Giscus
          repo="Unnamed2964/umamichi.moe"
          repoId="R_kgDOR3nnpw"
          category="Announcements"
          categoryId="DIC_kwDOR3nnp84C8BSy"
          mapping="pathname"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={giscusTheme}
          lang="zh-CN"
          loading="eager"
        />
      )}
    </section>
  )
}
