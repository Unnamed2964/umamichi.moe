# 002 — 侧栏链接 font-weight 过渡

- **状态**：TODO
- **提交**：61f817f
- **严重度**：MEDIUM
- **类别**：性能
- **预估范围**：1 个文件，约 8 行

## 问题

文章侧栏 TOC 链接在 hover/当前态时对 `font-weight` 做过渡。字重变化会触发布局与文字重栅格化；不像 `transform`/`opacity` 那样可由 GPU 合成。

```css
/* src/styles/site-layout.css:122-134 — 当前 */
.site-sidebar-link--item.site-sidebar-link--primary {
	color: var(--site-muted-fg);
	font-size: 0.875rem;
	font-weight: var(--site-weight-regular);
	transition: color 0.2s ease, font-weight 0.2s ease;
}

.site-sidebar-link--item.site-sidebar-link--nested {
	color: var(--site-muted-fg);
	font-size: 0.75rem;
	font-weight: var(--site-weight-regular);
	transition: color 0.2s ease, font-weight 0.2s ease;
}
```

当前态规则（`.site-sidebar-link--current`、`[aria-current='location']`）会立即将字重切到 medium；过渡主要影响离开 hover 时，但阅读时滚动 TOC 仍会频繁触发颜色/字重更新。

## 目标

仅过渡颜色；当前态应用时字重瞬时切换。

```css
.site-sidebar-link--item.site-sidebar-link--primary {
	transition: color var(--transition-fast);
}

.site-sidebar-link--item.site-sidebar-link--nested {
	transition: color var(--transition-fast);
}
```

（`--transition-fast` 来自 `@umamichi-ui/common-css` token，值为 `120ms ease`。）

## 须遵循的仓库约定

- `node_modules/@umamichi-ui/common-css/dist/tokens.css` — `--transition-fast: 120ms ease`
- 其他站点按钮仅过渡颜色/背景，不过渡布局属性 — `site-layout.css:40-56`。

## 步骤

1. 打开 `src/styles/site-layout.css`。
2. 对 `.site-sidebar-link--item.site-sidebar-link--primary` 与 `.site-sidebar-link--item.site-sidebar-link--nested`，将 `transition: color 0.2s ease, font-weight 0.2s ease` 替换为 `transition: color var(--transition-fast)`。

## 边界

- 不要修改当前态的颜色或字重。
- 不要给 section 级侧栏链接加动效，除非它们已有相同模式（目前它们不过渡字重）。
- 不要改动 TOC 标记或滚动行为。

## 验证

- **机械检查**：`npx astro check`；在开发环境打开带 TOC 的文章。
- **手感检查**：
  - 滚动文章 — 当前 TOC 项仍**瞬时**变为强调色 + medium 字重；仅 hover 时颜色可能缓变。
  - 在 Performance 面板确认快速滚过多个标题时无反复 layout thrash。
- **完成标准**：侧栏 item 链接的 `transition` 中不再包含 `font-weight`。
