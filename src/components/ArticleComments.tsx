import Giscus from "@giscus/react"
import { useEffect, useState } from "react"
import { getGiscusThemeUrl } from "../lib/giscus-theme"
import { isAppearanceChangeForSubscribers, type SiteAppearanceChangeDetail } from "../lib/site-events"

export default function ArticleComments() {
  const [giscusTheme, setGiscusTheme] = useState<string | null>(null)

  useEffect(() => {
    const syncGiscusTheme = () => setGiscusTheme(getGiscusThemeUrl())

    syncGiscusTheme()
    const onAppearanceChange = (event: CustomEvent<SiteAppearanceChangeDetail>) => {
      if (!isAppearanceChangeForSubscribers(event.detail.reason)) {
        return
      }

      syncGiscusTheme()
    }

    document.addEventListener("site:appearance-change", onAppearanceChange)

    return () => {
      document.removeEventListener("site:appearance-change", onAppearanceChange)
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
