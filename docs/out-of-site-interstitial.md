---
title: 站外链接与 /out-of-site 参数说明
rss: false
timeless: true
---

> 以下内容为 Cursor Agent 辅助编写，如需对外引用请以仓库实现与源码为准。

## 行为概览

- **Markdown / MDX（SSR 内容）**：`rehype-out-of-site-links` 仅为站外 `http` / `https` 链接设置 `target="_blank"`、`rel`（`noopener` `noreferrer`，并移除 `nofollow`）。若配置了 `OUT_OF_SITE_ED25519_PRIVATE_KEY`，还会写入可选属性 **`data-ssr-out-of-site-sig`**（Ed25519，Base64URL）。**不再使用** `data-out-of-site` 等标记属性。
- **全站外链拦截**：`src/lib/out-of-site-click-client.ts` 在捕获阶段拦截**任意**指向异源 `http` / `https` 的 `<a href>`（不依赖上述 data 属性），在**新标签页**打开 `/out-of-site/`，再由页面脚本决定是否展示「继续访问」。
- **评论区（Giscus）**：在 `ArticleComments` 根节点上设置 **`data-out-of-site-ugc="giscus"`**。落在此容器内的外链（见下文化限制）使用 **`kind=giscus`**，并附带查询参数 **`hash`**：其为**对称密钥**下的 **HMAC-SHA256**（普通对称 MAC，与 `PUBLIC_OUT_OF_SITE_LINK_HMAC_KEY` 共享同一秘密）。Giscus **不**使用非对称的 Ed25519 `sig`。

### Giscus 与 iframe 限制

Giscus 讨论内容通常在**跨域 iframe** 内渲染，父页面无法拦截 iframe 内部的点击。因此 **`kind=giscus` 与 `hash` 仅对「仍位于 `data-out-of-site-ugc="giscus"` 容器内的 `<a>`」生效**（例如该区域内未来可能出现的非 iframe 链接）。评论正文里的链接多数仍由 Giscus / GitHub 自行打开，本站脚本无法统一改写。

## 规范报文（对称 MAC 与非对称签名共用同一串）

与 `src/lib/out-of-site-payload.mjs` 中 `buildCanonicalOutOfSiteMessage` 一致；**`hash` 与 `sig` 分别在对称、非对称两套密钥下对该串做运算**：

```text
v1|<kind>|<toHref>
```

- **SSR**：`kind` 固定为 `ssr`。点击时用对称密钥对报文 **`v1|ssr|<toHref>`** 做 **HMAC-SHA256**，结果 Base64URL 写入 **`hash`**；若构建期配置了 Ed25519 私钥，还会对**同一报文**生成非对称 **`data-ssr-out-of-site-sig`**（`sig`）。
- **Giscus**：`kind` 固定为 `giscus`；仅对称 **`hash`**（报文 **`v1|giscus|<toHref>`**），无 `sig`。

## `/out-of-site/` 查询参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `to` | 是 | 目标绝对 URL，`http` / `https`。 |
| `kind` | 是 | `ssr` 或 `giscus`。 |
| `sig` | 否 | `kind=ssr` 时可选；**非对称** Ed25519，Base64URL。存在则须在浏览器内用公钥验签通过；缺失时仅校验对称 **`hash`**。 |
| `hash` | `kind=ssr` 与 `kind=giscus` 均必填 | **对称** MAC：对规范报文做 **HMAC-SHA256** 后的 Base64URL；与 `PUBLIC_OUT_OF_SITE_LINK_HMAC_KEY` 共享秘密（收发同一密钥，非公私钥对）。 |

校验失败时，脚本会以 `location.replace` 直接跳转到静态恢复页路由（**`/404/`**、**`/500/`**、**`/503/`**），不再透传额外查询参数。

大致对应：**参数或对称 MAC 不通过、目标非 http(s)** → `/404/`；**未配置对称密钥或 `sig` 存在但缺少 Ed25519 公钥** → `/503/`；**Ed25519 公钥导入或 `verify` 抛错** → `/500/`。  
当 `sig` 存在但验签结果为 `false`（非异常）时，不跳转恢复页，而是在 `/out-of-site/` 页面内显示红字警告「安全警告：未期望的未知链接。该链接可能并不来自网站原本的内容」，并保留“继续访问”。

## 环境变量

| 变量 | 可见性 | 说明 |
|------|--------|------|
| `OUT_OF_SITE_ED25519_PRIVATE_KEY` | 仅构建 | PKCS#8 PEM。未设置则 SSR 外链无 `data-ssr-out-of-site-sig`。 |
| `PUBLIC_OUT_OF_SITE_ED25519_SPKI_B64` | 前端 | SPKI DER 标准 Base64，用于浏览器内 Ed25519 验签。 |
| `PUBLIC_OUT_OF_SITE_LINK_HMAC_KEY` | 前端 | **`hash` 的对称密钥**（任意字符串）；`kind=ssr` 与 `kind=giscus` 共用。须与构建/运行环境一致。未设置则无法完成 MAC 校验，将跳转 **`/503/`** 恢复页。 |

## 相关源码

- `src/lib/rehype-out-of-site-links.mjs`
- `src/lib/out-of-site-payload.mjs`
- `src/lib/out-of-site-click-client.ts`
- `src/lib/out-of-site-giscus-hmac.ts`
- `src/lib/out-of-site-verify-client.ts`
- `src/lib/error-page.ts`
- `src/components/SiteChromeScripts.astro`
- `src/pages/out-of-site.astro`
- `src/components/ArticleComments.tsx`

## Astro 配置注意

`rehype-out-of-site-links` 须注册为 `[rehypeOutOfSiteLinks, { site }]`，勿写成 `rehypeOutOfSiteLinks({ site })` 直接插入插件数组。
