# 001 — 站点浮层 reduced-motion

- **状态**：DONE
- **提交**：61f817f
- **严重度**：MEDIUM
- **类别**：无障碍
- **预估范围**：2 个文件，约 20 行

## 问题

复制 toast 与文章脚注预览对 `opacity` 和 `transform` 做过渡，但没有 `prefers-reduced-motion` 处理。WPM 包（`reduced-motion.css`）与 `global.css` 的 view-transition 规则仅覆盖路由/侧栏动效。

当前代码：

```css
/* src/styles/global.css:100-126 — 当前 */
.site-copy-toast {
	/* ... */
	opacity: 0;
	transform: translateY(2px);
	transition: opacity 90ms ease, transform 90ms ease;
}

.site-copy-toast.is-visible {
	opacity: 1;
	transform: translateY(0);
}
```

```css
/* src/styles/article-content-site.css:91-117 — 当前 */
.article-footnote-preview {
	/* ... */
	opacity: 0;
	transform: translateY(4px);
	transition: opacity 160ms ease, transform 160ms ease;
}

.article-footnote-preview.is-visible {
	opacity: 1;
	transform: translateY(0);
}
```

启用 `prefers-reduced-motion: reduce` 的用户在每次复制/脚注交互时仍会看到垂直位移。

## 目标

在 reduced motion 下：保留短 opacity 过渡以利于理解；移除 transform 位移。对齐 `common-css` `primitives.css` 的模式（下拉在 reduce 下去掉 `transform`，保留 opacity）。

```css
@media (prefers-reduced-motion: reduce) {
	.site-copy-toast,
	.site-copy-toast.is-visible {
		transform: none;
	}

	.article-footnote-preview,
	.article-footnote-preview.is-visible {
		transform: none;
	}
}
```

可选：后续将基础时长对齐 `--transition-fast`（120ms ease）；本计划不要求。

## 须遵循的仓库约定

- WPM 预设：`node_modules/@umamichi-ui/windows-phone-motion/styles/presets/reduced-motion.css` — 侧栏使用 `transition-duration: 1ms`；站点浮层应更温和（保留 opacity、去掉位移），见 AUDIT.md 第 6 节。
- 范例：`node_modules/@umamichi-ui/common-css/dist/primitives.css:387-391` — reduce 下下拉 `transform: none`。

## 步骤

1. 在 `src/styles/global.css` 中，于 `.site-copy-toast.is-visible { ... }` 之后，添加 `@media (prefers-reduced-motion: reduce)` 块，对 `.site-copy-toast` 与 `.site-copy-toast.is-visible` 设置 `transform: none`。
2. 在 `src/styles/article-content-site.css` 中，于 `.article-footnote-preview.is-visible { ... }` 之后，对 `.article-footnote-preview` 与 `.article-footnote-preview.is-visible` 添加相同模式。

## 边界

- 不要修改 `SiteChromeScripts.astro` 或 `ArticleFootnotePreviewScript.astro` 的时序逻辑。
- 不要改动 WPM 路由/侧栏 CSS 或 view-transition 规则。
- 不要新增依赖。

## 验证

- **机械检查**：`npx astro check` — 仅保留既有错误；开发服务器可启动。
- **手感检查**：
  - 复制代码块 → toast 淡入无滑动（DevTools Rendering 中开启 reduced motion）。
  - 悬停脚注引用 → 预览淡入无 `translateY` 跳动。
  - reduced motion **关闭** 时行为不变（仍有 2px / 4px 滑动）。
- **完成标准**：两个浮层在 `prefers-reduced-motion: reduce` 下仅以 opacity 反馈。
