# `umamichi.config` schema

> 以下内容为 Composer 生成，未经过人工检查，请谨慎对待

站点身份、源码链接、评论、遥测与内容相关选项的配置入口。权威类型：[`umamichi.config.d.ts`](../umamichi.config.d.ts)；默认值：[`umamichi.config.mjs`](../umamichi.config.mjs)；读取与派生：[`src/lib/site-config.ts`](../src/lib/site-config.ts)。

形态参考 [hexo-theme-arknights](https://github.com/Yue-plus/hexo-theme-arknights)，并受 [MkDocs 配置](https://www.mkdocs.org/user-guide/configuration/) 影响。部署与密钥不在本文件（见 `wrangler.jsonc` / 环境变量）。

## 顶层

| 键 | 类型 | 说明 |
|----|------|------|
| `site` | object | 站点身份与页脚文案 |
| `source` | object \| 省略 | 源码浏览 URL 前缀；省略则无源码链 |
| `comments` | object \| 省略 | 评论集成 |
| `telemetry` | object \| 省略 | 客户端遥测 |
| `content` | object | 内容树与 redirect |
| `imageOptimization` | object | 构建期图片优化 |

约定：手写完整字符串；`comments.giscus.repo` 不从 `source.baseUrl` 派生。布尔开关省略时默认 `true`。

## `site`

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 站点标题（页头、RSS、文档标题后缀） |
| `description` | `string` | 默认描述 |
| `url` | `string` | 规范 origin，无尾 `/`（Astro `site`、canonical） |
| `author` | `string` | 作者显示名 |
| `copyright` | `string` | 页脚版权行；可用 `{year}` 占位，由模板替换为当前年份 |

代码派生（非配置项）：`siteId = hostname(site.url)`（遥测 `siteId`、复制归因前缀）。

## `source`

| 字段 | 类型 | 说明 |
|------|------|------|
| `baseUrl` | `string` | 源码根，例如 `https://github.com/org/repo/blob/main`。文章源码 URL = `baseUrl + '/' + path` |

与 Giscus 仓库无关。

## `comments.giscus`

字段对齐 [giscus.app](https://giscus.app/) 常用项。`theme` 由运行时 `getGiscusThemeUrl()` 提供，不进配置。

| 字段 | 类型 | 说明 |
|------|------|------|
| `enabled` | `boolean` | 省略或 `true` 为启用；`false` 关闭 |
| `repo` | `string` | `owner/repo` |
| `repoId` | `string` | |
| `category` | `string` | |
| `categoryId` | `string` | |
| `mapping` | `string` | 建议 `pathname` |
| `strict` | `string` | `'0'` \| `'1'` |
| `reactionsEnabled` | `string` | |
| `emitMetadata` | `string` | |
| `inputPosition` | `'top' \| 'bottom'` | |
| `lang` | `string` | |
| `loading` | `string` | |
| `origin` | `string` | 可选；Giscus 客户端域名限制（与 `telemetry.allowedOrigins` 无关） |

## `telemetry`

| 字段 | 类型 | 说明 |
|------|------|------|
| `tikkun` | `boolean` | 浏览遥测；省略为 `true`。单页可用 `BaseHead` 的 `disableTikkun` 关闭 |
| `hester` | `boolean` | 错误页遥测；省略为 `true` |
| `allowedOrigins` | `string[]` | POST `/api/tikkun`、`/api/hester` 的 `Origin` 白名单；省略时为 `[site.url, https://www.<hostname>]` |

## `content`

| 字段 | 类型 | 说明 |
|------|------|------|
| `excludeDocGlobs` | `string[]` | 内容收集时排除的 glob（相对内容根） |
| `redirect_maps` | `Record<string, string>` | 键与内部值为相对 `src/content` 的 Markdown 路径；值也可为绝对 `http(s)` URL |

## `imageOptimization`

| 字段 | 类型 | 说明 |
|------|------|------|
| `enabled` | `boolean` | 构建期图片优化开关 |
