# 动效与设计审计 — umamichi.moe

撰写审计时的提交：`61f817f`

2026-07-17 对本仓库运行了三项只读审计 skill：

| Skill | 范围 | 产出 |
| --- | --- | --- |
| `improve-animations` | 现有动效代码（八个类别） | 发现项表格 + 计划 `001`–`003` |
| `find-animation-opportunities` | 本可动效但尚未动效的位置 | 机会项 + 否决项（见本 README） |
| `redesign-existing-projects` | 视觉/设计模式（仅诊断） | 缩写诊断（见本 README） |

**权威来源：** Umamichi UI 约定（`umamichi-ui-conventions.mdc`）优先于通用 redesign skill 默认值（无渐变、无装饰性阴影、内容优先）。

## 计划

| # | 标题 | 严重度 | 状态 | 依赖 |
| --- | --- | --- | --- | --- |
| 001 | 站点浮层 reduced-motion | MEDIUM | DONE | — |
| 002 | 侧栏链接 font-weight 过渡 | MEDIUM | TODO | — |
| 003 | 文章源码菜单进出场 | LOW | TODO | — |

**建议执行顺序：** 001 → 002 → 003（彼此独立；001 对无障碍收益最高）。

---

## improve-animations — 摸底

| 项目 | 详情 |
| --- | --- |
| 技术栈 | Astro 6、React 19、纯 CSS、View Transitions API、`@umamichi-ui/windows-phone-motion` |
| 动效库 | `src/` 中无 Framer Motion / GSAP |
| 动效所在位置 | `global.css`、`site-layout.css`、`article-content-site.css`、`site-slide-transition.ts`、`SiteChromeScripts.astro`、`common-css` 基础组件（下拉）、WPM 预设 |
| 气质 | 编辑型博客；刻意的 Windows Phone 风格路由滑入；克制的站点 chrome |
| 频率图 | 路由滑入：每次站内导航；移动侧栏：偶尔；复制 toast / 脚注：偶尔；色板下拉：偶尔；导航 running line：每次点击导航 |

### 已核实发现项（按收益排序）

| # | 严重度 | 类别 | 位置 | 发现 | 修复摘要 |
| --- | --- | --- | --- | --- | --- |
| 1 | MEDIUM | 无障碍 | `global.css:100-126`、`article-content-site.css:91-117` | 复制 toast 与脚注预览对 `transform` 做过渡，但无 `prefers-reduced-motion` 分支；WPM reduced-motion 仅覆盖侧栏/路由 | 在 `reduce` 下保留 opacity 过渡，去掉 `translateY` |
| 2 | MEDIUM | 性能 | `site-layout.css:126-133` | 侧栏 TOC 链接过渡 `font-weight` — 触发布局/绘制，非仅合成层 | 从 `transition` 中移除字重；字重瞬时切换，或仅用颜色表示当前态 |
| 3 | LOW | 一致性与 token | `site-layout.css:40-56`、`global.css:119-120` | 站点 chrome 按钮使用零散的 `0.2s ease` / `90ms ease`，未用 `common-css` 的 `--transition-fast` / `--transition-overlay` | 时长对齐共享 token |
| 4 | LOW | 遗漏机会 | `SiteChromeScripts.astro:345`、`site-layout.css:256-270` | 文章源码格式菜单通过 `hidden` 瞬时切换 | 可选：淡入 + `translateY(-4px)`，对齐 `dropdown-menu-panel` |
| 5 | — | 目的（有意为之） | `site-slide-transition.ts`、WPM `--wpm-slide-horizontal-duration: 500ms` | 路由滑入超过通用 300ms UI 预算，但属于刻意品牌动效 | 无明确产品决策前勿缩短 |
| 6 | — | 目的（有意为之） | `site-layout.css:64-66`、`835-888` | `.site-button` / `.site-icon-button` 的 `:active` 仅改背景（无 scale），与 `common-css` 的 `.icon-button` 不同 | 可能是有意针对高频 header 控件；不算缺陷 |

### 遗漏机会（增量，来自 improve-animations 第 8 类）

见下方 `find-animation-opportunities` 表格 — 第 4 项与之重叠。

---

## find-animation-opportunities

### 第一部分 — 机会项

| # | 位置 | 现状 | 目的 | 频率 | 建议动效 |
| --- | --- | --- | --- | --- | --- |
| 1 | `site-layout.css:256-270` + `SiteChromeScripts.astro:345` | 源码菜单通过 `hidden` 出现/消失 | 避免突兀变化 | 偶尔 | 对齐 `common-css` 下拉：`opacity 0; transform: translateY(-4px)` → 稳定态，`transition: opacity 200ms ease, transform 200ms ease`（`var(--transition-overlay)`），`prefers-reduced-motion: reduce` 下 `transform: none` |
| 2 | `site-layout.css:337-361` | 上一篇/下一篇卡片：`:active` 仅背景变化 | 反馈 | 每天数十次（文章导航） | **可选 / 仅 subtle：** 若添加，`:active { transform: scale(0.98) }`，`transition: transform 100ms cubic-bezier(0.1, 0.9, 0.2, 1)`，使用现有 `--site-button-press-*` token — 若与路由滑入叠在一起显得过重则跳过 |

### 第二部分 — 否决候选

| 位置 | 原因 |
| --- | --- |
| `site-slide-transition.ts` / Astro ClientRouter | 路由过渡已有动效；再加一层会在每次导航叠动效（**频率：每次会话数十次以上**）。 |
| `global.css:147-155` 导航当前项颜色/字重 | 桌面导航每项每页都会看到；hover/active 颜色已足够（**频率：每天数十次**）。 |
| `PaletteDropdown` / `FloatingMenu` | 已使用 `common-css` 的 `dropdown-menu-panel` 淡入（**已有动效**）。 |
| `site-icon-button` header 控件 | 打开移动菜单、主题切换、色板 — 高频 chrome；按压缩放会增加感知延迟（部分用户 **频率：每天 100+ 次**）。 |
| `article-content-site.css:59-61` 代码复制按钮 hover 显示 | 功能性阅读面；hover 时 opacity 已足够克制；每个代码块 hover 再加动效属于装饰（**功能：干扰密集内容**）。 |

### 第三部分 — 结论

对本站这种日常使用的博客而言，动效**大体已经合适**：WPM 路由滑入与左侧栏是主角；浮层动效很短。收益最高的缺口是**无障碍一致性**（计划 001），而非「更多动画」。唯一真正「该动但没动」的接缝是**文章源码菜单**（计划 003）。交接：`improve-animations execute 003`，或在 Agent 模式下按计划文件执行。

---

## redesign-existing-projects — 仅诊断（未应用修复）

对照 Umamichi UI 权威文档扫描 — 许多 redesign skill 默认项**不适用**（渐变、着色阴影、背景纹理、卡片堆砌布局）。

### 符合约定

- 白/灰 + 主题水色；扁平表面；灰色分隔线（`article-prev-next--divider`）
- 以内容为中心的文章排版（`--site-main-max-w: 56rem`，标题层级清晰）
- `:focus-visible` 轮廓；导航当前态标记；主题/色板持久化
- chrome 无全站渐变/阴影装饰

### 次要备注（可选打磨，非「AI 味」）

| 区域 | 观察 |
| --- | --- |
| 排版 | 标题层级强；正文宽度受控 — 无 Inter 默认字体问题 |
| 表面 | `article-prev-next__card` 使用 `border-radius: 1rem` — 导航用软圆角卡片；作为功能控件可接受，非内容区卡片滥用 |
| 交互 | `site-button` / `site-icon-button` 相比 `common-css` 基础组件缺少按压缩放 — 在站点 chrome 内一致，非缺少「高级感」阴影 hover |
| 状态 | 错误页（`ErrorRecoveryExperience`）有 reduced-motion 处理；主 chrome 浮层落后（见计划 001） |

**有意跳过的 redesign-skill 项：** 紫色渐变、噪点纹理、着色阴影、不对称营销布局 — 与 Umamichi UI 规则冲突。
