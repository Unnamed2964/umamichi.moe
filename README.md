# umamichi.moe

[![Astro](https://img.shields.io/badge/Astro-6.1.3-111111?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb)](https://react.dev)
[![Chakra%20UI](https://img.shields.io/badge/Chakra%20UI-3.34-1a202c?logo=chakraui&logoColor=4fd1c5)](https://chakra-ui.com)
[![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare-f38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12.0-43853d?logo=nodedotjs&logoColor=white)](https://nodejs.org)

> 以下内容为 GPT 5.4 生成，但已经过人工检查，可以作为参考。

这是 umamichi.moe 的站点仓库。

## 项目概览

- 站点框架：Astro
- UI 组件：React + Chakra UI
- 内容来源：src/content 下的 Markdown 和 MDX
- 部署目标：Cloudflare Workers / Pages 兼容运行时
- 线上地址：https://umamichi.moe

## 本地开发

要求：Node.js 22.12.0 或更高版本。

```sh
npm install
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
- `src/content/`：站点内容
- `public/`：静态资源
- `functions/`：Cloudflare 相关函数代码
- `docs/`：项目内部说明文档