import Giscus from "@giscus/react"
import { useEffect, useState } from "react"
import { getGiscusThemeUrl } from "../lib/giscus-theme"

export default function ArticleComments() {
  const [giscusTheme, setGiscusTheme] = useState<string | null>(null)

  useEffect(() => {
    const syncGiscusTheme = () => setGiscusTheme(getGiscusThemeUrl())

    syncGiscusTheme()
    document.addEventListener("site:theme-change", syncGiscusTheme)
    document.addEventListener("site:palette-change", syncGiscusTheme)

    return () => {
      document.removeEventListener("site:theme-change", syncGiscusTheme)
      document.removeEventListener("site:palette-change", syncGiscusTheme)
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
