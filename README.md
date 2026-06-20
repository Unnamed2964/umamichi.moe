# umamichi.moe

[![Astro](https://img.shields.io/badge/Astro-6.1.3-111111?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb)](https://react.dev)
[![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare-f38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12.0-43853d?logo=nodedotjs&logoColor=white)](https://nodejs.org)

> 以下内容为 GPT 5.4 生成，但已经过人工检查，可以作为参考。

这是 umamichi.moe 的站点仓库。

## 项目概览

- 站点框架：Astro
- UI：`@umamichi-ui/common-css` + 自建 CSS；React 用于 Giscus 评论与文章侧栏组件（构建期 SSR）
- 内容来源：src/content 下的 Markdown 和 MDX
- 部署目标：Cloudflare Workers / Pages 兼容运行时
- 线上地址：https://umamichi.moe

## 特性

- 支持多级目录，支持逐文件、目录设置多种可继承的属性，包括文件按名称排序或按时间排序，版权设置，是否计入 rss，可覆写继承自上级目录的属性

## 内容资源

Markdown/MDX 正文与 `src/content/` 下的图片、附件放在一起管理：

- **图片**：放在与 `.md`/`.mdx` **同一目录**下的 `imgs/` 子文件夹。例如 `src/content/blog/imgs/plan.webp` 对应线上 `/blog/imgs/plan.webp`。
- **附件**：放在同目录下的 `files/` 子文件夹。
- **页面范围**：`imgs/`、`files/` 目录下的 `.md`/`.mdx` **不会**作为站点页面（在 [`umamichi.config.mjs`](umamichi.config.mjs) 的 `content.excludeDocGlobs` 中配置，并同步作用于 content collection 与路由扫描）。
- **引用**：在 Markdown/MDX 中使用相对路径 `imgs/...`、`files/...`（也支持 `./imgs/...`）。构建时会自动改写为站点根路径，行为类似 MkDocs。

示例（`src/content/blog/post.md`）：

```markdown
![说明](imgs/plan.webp)
[附件](files/data.json)
```

构建后 HTML 中为 `/blog/imgs/plan.webp`、`/blog/files/data.json`。若以 `/` 开头、`http(s):` 等形式已是绝对 URL，则不会二次改写。

实现：`scripts/content-asset-urls.mjs` 提供 Remark 插件（处理 `![]()`、链接）与 Rehype 插件（处理正文 HTML 中的 `<img>`、`<a>`），根据当前文件在 `src/content/` 下的路径计算公开 URL。已在 `astro.config.mjs` 的 `markdown` 与 `@astrojs/mdx` 中注册。

构建时，`src/content/` 内除 `.md`/`.mdx` 以及以 `.` 开头的文件（含各目录的 `.meta.yml`）外，其余文件会按相对路径复制到站点根（`https://umamichi.moe/...`）。开发模式下通过 Vite 中间件提供相同访问路径（见 `src/integrations/content-static-assets.mjs`）。

`public/` 中与上述资源路径重复的文件仅为**旧 URL 向后兼容**保留；新资源不应放入 `public/`。详见 [`public/README.md`](public/README.md)。

## 项目配置

根目录 [`umamichi.config.mjs`](umamichi.config.mjs) 为站点级配置。当前可用项：

- `content.excludeDocGlobs`：不参与 content collection 与站点路由的 Markdown/MDX 路径 glob（默认排除 `**/imgs/**`、`**/files/**`）。
- `imageOptimization.enabled`：是否启用 Astro 构建期图片优化（Sharp）。Cloudflare 部署下默认 `false`（透传，不处理）。

## 本地开发

要求：Node.js 22.12.0 或更高版本。

克隆仓库后，除依赖安装外还需安装 Playwright 的 Chromium（Markdown 中的 Mermaid 图在构建/渲染时由 `rehype-mermaid` 通过无头浏览器生成；未安装时含 Mermaid 的页面在 `npm run build` 会失败）：

```sh
npm install
npx playwright install chromium
npm run dev
```

默认开发服务器由 Astro 启动。

## 环境变量

本项目的环境变量模板见 `.env.example`。建议本地开发使用 `.env.local`（不要提交到仓库）。

### 出站链接校验（out-of-site）

- `PUBLIC_OUT_OF_SITE_LINK_HMAC_KEY`
  - 用途：`/out-of-site/` 页面校验 `hash`（HMAC-SHA256，对称密钥）。
  - 可见性：前端可见（`PUBLIC_` 前缀）。
  - 本地开发建议：必须设置，否则点击外链会进入 `503` 恢复页。
- `OUT_OF_SITE_ED25519_PRIVATE_KEY`
  - 用途：`astro build` 完成后扫描输出 HTML，给站外 `<a>` 写入 `data-ssr-out-of-site-sig`（Ed25519 签名）。
  - 可见性：仅构建侧使用，不应暴露到前端。
  - 可选性：可不设置；不设置时仅使用 `hash` 校验。
- `PUBLIC_OUT_OF_SITE_ED25519_SPKI_B64`
  - 用途：浏览器侧验证 `sig`（Ed25519 公钥，SPKI DER Base64）。
  - 可见性：前端可见（`PUBLIC_` 前缀）。
  - 可选性：当你启用了 `OUT_OF_SITE_ED25519_PRIVATE_KEY` 并希望前端验签时需要配置。

示例（`.env.local`）：

```env
PUBLIC_OUT_OF_SITE_LINK_HMAC_KEY=replace-with-your-local-secret
# OUT_OF_SITE_ED25519_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# PUBLIC_OUT_OF_SITE_ED25519_SPKI_B64=
```

注意：

- 若部署环境仍使用旧变量名 `PUBLIC_OUTBOUND_LINK_HMAC_KEY`，请改为 `PUBLIC_OUT_OF_SITE_LINK_HMAC_KEY` 并重新部署。
- 修改系统环境变量后，通常需要重启终端/IDE，再重新执行 `npm run dev`。
- 对于 Astro/Vite，最稳妥的方式是直接在项目内使用 `.env.local`。
- 在 `npm run dev` 下，若出现 `安全警告：未期望的未知链接。该链接可能并不来自网站原本的内容。`，常见原因包括：未配置 `OUT_OF_SITE_ED25519_PRIVATE_KEY`（开发模式不会跑构建后 HTML 扫描，故无 `sig`），或该链接来自未预渲染进 HTML 的客户端内容。

## 常用命令

```sh
npm run dev
npm run build
npm run preview
npm run deploy
```

- `npm run dev`：启动本地开发服务器
- `npm run build`：构建站点到 dist
- `npm run preview`：构建后通过 Wrangler 进行本地预览
- `npm run deploy`：构建并部署到 Cloudflare

## 仓库结构

- `src/`：页面、组件、内容配置和运行时代码
- `src/content/`：站点内容（Markdown/MDX、图片、附件、目录 `.meta.yml`）
- `public/`：站点级静态资源；与 content 重复的图片/附件副本仅用于旧 URL 兼容（见 `public/README.md`）
- `umamichi.config.mjs`：站点级项目配置
- `functions/`：Cloudflare 相关函数代码
- `docs/`：项目内部说明文档

## LLM 生成代码说明

本项目架构和大体方向由人工把控，具体代码由 GitHub Copilot、Cursor 等 LLM 生成。本项目以展示和功能为主，具体代码可能经不起推敲，请注意。