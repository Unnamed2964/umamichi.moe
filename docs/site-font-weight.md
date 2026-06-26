# 站点字重尺度

> 以下内容为 Cursor Auto 编写，未经人工检查，请谨慎对待。

本站通过 CSS 自定义属性统一控制字重。壳层 UI 变量定义于 `src/styles/site-layout.css`；正文排版字重由 `@umamichi-ui/common-css/article.css` 的 `--article-weight-*` 提供，站点在 `site-layout.css` 将其映射到 `--site-weight-*`。

## 变量

### 壳层与正文共用

| 变量 | 值 | 语义 |
|------|-----|------|
| `--site-weight-light` | 300 | 轻标题：文章页顶大标题、正文 `h1`/`h2`、出站确认页标题、版权声明标题 |
| `--site-weight-regular` | 400 | 默认 UI 与正文：按钮、未选中导航/侧栏、顶栏站点名、标签、元信息 |
| `--site-weight-medium` | 500 | 选中态：当前导航、当前目录项 |
| `--site-weight-semibold` | 600 | 正文 `b`/`strong`；出站警告等需强调的文案 |

别名（与上表同值，供文章映射使用）：

| 变量 | 映射 |
|------|------|
| `--site-weight-page-title` | `light` |
| `--site-weight-content-h1-h2` | `light` |
| `--site-weight-content-h3-h6` | `regular` |

调整字重时，优先改上表四个主 token 的值，而不是在各选择器里写死数字。

## 原则

- 文章标题层级除字重外，还依赖字号、颜色与下边框（`h1`/`h2`）；`h1`/`h2` 与 `h3`–`h6` 使用不同字重 token。
- 「当前页 / 当前目录项」用水色 accent 区分，并升到 `medium`（500）。
- 正文强调（`strong`）重于 `h1`/`h2`（300）是刻意的：标题靠大字与边框，段内强调靠字重。

## 各文件映射

### `src/styles/site-layout.css`

| 选择器 | 变量 |
|--------|------|
| `.site-route-main` | `regular` |
| `.site-button` | `regular` |
| `.site-sidebar-panel__title` | `regular` |
| `.site-sidebar-link--section` / `--item`（未选中） | `regular` |
| `.site-sidebar-link--current`、`[aria-current='location']` | `medium` |
| `.article-header__date` | `regular` |
| `.article-header__title` | `page-title`（`light`） |
| `.article-tag` | `regular` |
| `.article-prev-next__label` | `regular` |
| `.article-prev-next__title` | `regular` |
| `.article-copyright__heading` | `light` |
| `.site-header__title` | `regular` |
| `.site-footer__line` | `regular` |

### `src/styles/global.css`

| 选择器 | 变量 |
|--------|------|
| `.site-copy-toast` | `regular` |
| `[data-nav-item]` / `[data-mobile-nav-item]`（未选中） | `regular` |
| `[data-nav-active-item]` / `[data-mobile-nav-active-item]` | `medium` |

### `@umamichi-ui/common-css/article.css`

站点经 `site-layout.css` 映射 `--article-weight-*`。选择器使用 `--article-weight-h1-h2` / `h3-h6` / `body` / `emphasis`。

| 选择器 | token |
|--------|-------|
| `.article-content` | `body`（`regular`） |
| `.article-content h1`、`h2` | `h1-h2`（`light`） |
| `.article-content h3`–`h6` | `h3-h6`（`regular`） |
| `.article-content b`、`strong` | `emphasis`（`semibold`） |

### `src/pages/out-of-site.astro`

| 选择器 | 变量 |
|--------|------|
| `.out-of-site-title` | `light` |
| `.out-of-site-status.is-warning` | `semibold` |

## 未纳入尺度的样式

以下仍使用独立字重，不在 `--site-weight-*` 体系内：

- `src/components/ErrorRecoveryExperience.astro`：错误恢复页刻意使用 200–300 的轻字重。
- `src/lib/probe-decoys.ts`：反爬诱饵内联样式。
- `src/components/HeaderLink.astro`：遗留组件，`bolder` 未接入本站壳层。

新增 UI 时，应使用上表中的 `--site-weight-*` 之一，避免再引入裸的 `600` / `700`。

## 相关

- 讨论过程：`docs/site-font-weight-conversation-transcript.md`
- 全局 UI 约定：Umamichi UI conventions（水色 accent、少装饰）
