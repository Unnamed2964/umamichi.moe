# public 目录说明

本目录用于站点级静态资源（如 favicon、全局字体、Cloudflare 响应头等）。

其中与 `src/content/` 内图片、附件**路径重复**的文件，是为**旧 URL 向后兼容**而保留的副本。例如历史上曾使用 `/yanji-rail-transit-imaginary/plan.webp` 等路径，外部链接可能仍指向这些地址。

**新内容的图片与附件请勿放在此处。** 请按以下约定写入 `src/content/`：

- 图片：与 Markdown/MDX 同目录下的 `imgs/` 子文件夹
- 附件：与 Markdown/MDX 同目录下的 `files/` 子文件夹
- 正文引用：手写站点根绝对路径（如 `/blog/imgs/plan.webp`），见项目根目录 `README.md`

构建时，`src/content/` 中符合条件的非文档文件会自动复制到站点根路径（详见项目根目录 `README.md`）。
