# 站点字重尺度

> 以下内容为 Cursor Auto 编写，未经人工检查，请谨慎对待。

本站通过 CSS 自定义属性统一控制字重。变量分两类：**壳层 UI**（导航、侧栏、按钮等）与 **文章排版**（页顶标题、正文标题、强调）。定义于 `src/styles/site-layout.css` 的 `html { … }` 块。

## 变量

### 壳层 UI

| 变量 | 值 | 语义 |
|------|-----|------|
| `--site-weight-body` | 400 | 正文、侧栏链接、元信息（日期、label、标签） |
| `--site-weight-ui` | 500 | 按钮、次要小标题、当前/选中导航与侧栏项 |

### 文章排版

| 变量 | 值 | 语义 |
|------|-----|------|
| `--site-weight-page-title` | 300 | 文章页顶大标题（`.article-header__title`） |
| `--site-weight-content-h1-h2` | 300 | 正文内 `h1`、`h2` |
| `--site-weight-content-h3-h6` | 400 | 正文内 `h3`–`h6` |
| `--site-weight-emphasis` | 600 | 正文内 `b`、`strong`；出站警告等需强调的文案 |

调整字重时，优先改上述变量的值，而不是在各选择器里写死数字。

## 原则

- 文章标题层级除字重外，还依赖字号、颜色与下边框（`h1`/`h2`）；`h1`/`h2` 与 `h3`–`h6`  intentionally 使用不同字重 token。
- 「当前页 / 当前目录项 / TOC 定位」优先用 `--site-accent` 水色区分；壳层字重升到 `ui` 即可。
- 正文强调（`strong`）重于 `h1`/`h2`（300）是刻意的：标题靠大字与边框，段内强调靠字重。

## 各文件映射

### `src/styles/site-layout.css`

| 选择器 | 变量 |
|--------|------|
| `.site-route-main` | `body` |
| `.site-button` | `ui` |
| `.site-sidebar-panel__title` | `ui` |
| `.site-sidebar-link--section` / `--item`（未选中） | `body` |
| `.site-sidebar-link--current`、`[aria-current='location']` | `ui` |
| `.article-header__date` | `body` |
| `.article-header__title` | `page-title` |
| `.article-tag` | `body` |
| `.article-prev-next__label` | `body` |
| `.article-prev-next__title` | `ui` |
| `.article-copyright__heading` | `ui` |
| `.site-header__title` | `ui` |
| `.site-footer__line` | `body` |

### `src/styles/global.css`

| 选择器 | 变量 |
|--------|------|
| `.site-copy-toast` | `ui` |
| `[data-nav-item]` / `[data-mobile-nav-item]`（未选中） | `body` |
| `[data-nav-active-item]` / `[data-mobile-nav-active-item]` | `ui` |

### `src/styles/article-content.css`

| 选择器 | 变量 |
|--------|------|
| `.article-content` | `body` |
| `.article-content h1`、`h2` | `content-h1-h2` |
| `.article-content h3`–`h6` | `content-h3-h6` |
| `.article-content b`、`strong` | `emphasis` |

### `src/pages/out-of-site.astro`

| 选择器 | 变量 |
|--------|------|
| `.out-of-site-title` | `ui` |
| `.out-of-site-status.is-warning` | `emphasis` |

## 未纳入尺度的样式

以下仍使用独立字重，不在 `--site-weight-*` 体系内：

- `src/components/ErrorRecoveryExperience.astro`：错误恢复页刻意使用 200–300 的轻字重。
- `src/lib/probe-decoys.ts`：反爬诱饵内联样式。
- `src/components/HeaderLink.astro`：遗留组件，`bolder` 未接入本站壳层。

新增 UI 时，应使用上表中的 `--site-weight-*` 之一，避免再引入裸的 `600` / `700`。

## 相关

- 讨论过程：`docs/site-font-weight-conversation-transcript.md`
- 全局 UI 约定：Umamichi UI conventions（水色 accent、少装饰）
