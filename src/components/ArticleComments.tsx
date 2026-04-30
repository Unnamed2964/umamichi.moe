import Giscus from "@giscus/react"

export default function ArticleComments() {
  return (
    <section aria-label="评论区" style={{ marginTop: "3rem" }}>
      <div
        aria-hidden="true"
        style={{
          borderTop: "1px solid #d9d9d9",
          marginBottom: "1.5rem",
          width: "100%",
        }}
      />
      <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 1rem" }}>评论</h2>
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
        loading="lazy"
      />
    </section>
  )
}