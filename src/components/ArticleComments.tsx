import Giscus from "@giscus/react"

export default function ArticleComments() {
  return (
    <section aria-label="评论区" style={{ marginTop: "3rem" }}>
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
        theme="light"
        lang="zh-CN"
        loading="eager"
      />
    </section>
  )
}