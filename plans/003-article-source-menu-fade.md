# 003 — 文章源码菜单进出场

- **状态**：TODO
- **提交**：61f817f
- **严重度**：LOW
- **类别**：遗漏机会
- **预估范围**：2 个文件，约 40 行

## 问题

文章「复制 Markdown / 源码」格式菜单通过 `hidden` 切换，没有 opacity/transform 过渡，会瞬间弹出/消失。

```javascript
/* src/components/SiteChromeScripts.astro:344-345 — 当前 */
toggle.setAttribute('aria-expanded', String(!isOpen));
menu.hidden = isOpen;
```

```css
/* src/styles/site-layout.css:256-270 — 当前 */
.article-source-actions__menu[hidden] {
	display: none !important;
}
```

## 目标

对齐 `common-css` 现有 `dropdown-menu-panel` 动效（偶发浮层，200ms）：

```css
.article-source-actions__menu {
	opacity: 0;
	transform: translateY(-4px);
	visibility: hidden;
	pointer-events: none;
	transition:
		opacity var(--transition-overlay),
		transform var(--transition-overlay),
		visibility 0s linear var(--transition-overlay);
}

.article-source-actions__menu.is-open {
	opacity: 1;
	transform: translateY(0);
	visibility: visible;
	pointer-events: auto;
	transition:
		opacity var(--transition-overlay),
		transform var(--transition-overlay),
		visibility 0s;
}

.article-source-actions__menu[hidden] {
	display: block !important; /* 由 visibility 负责隐藏；去掉 display:none 冲突 */
}

@media (prefers-reduced-motion: reduce) {
	.article-source-actions__menu,
	.article-source-actions__menu.is-open {
		transform: none;
	}
}
```

JS：切换 `is-open` 类与 `aria-expanded`；关闭时在 `transitionend` 之后再设 `hidden`（参照 `useOverlayPresence` / 脚注预览 `closePreview`，见 `ArticleFootnotePreviewScript.astro:160-173`）。

## 须遵循的仓库约定

- 范例：`node_modules/@umamichi-ui/common-css/dist/primitives.css:352-391` — `dropdown-menu-panel` + `.is-open` + reduced-motion。
- 退出等待：`ArticleFootnotePreviewScript.astro:172-173` — `transitionend` + 超时兜底。

## 步骤

1. 按「目标」更新 `src/styles/site-layout.css` 中 `.article-source-actions__menu` 规则（调整 `[hidden]` 策略以便过渡能执行）。
2. 在 `src/components/SiteChromeScripts.astro` 中，将瞬时 `menu.hidden = true/false` 替换为：
   - 打开：移除 `hidden`，`requestAnimationFrame` → 添加 `is-open`。
   - 关闭：移除 `is-open`，监听 `transitionend`（opacity 或 transform），再设 `hidden` 并清理监听。
3. 更新 `closeArticleSourceMenu` 使用相同关闭路径。

## 边界

- 不要重排菜单项或按钮组布局样式。
- 不要新增依赖；仅 CSS transition。
- 保持菜单在 `.article-source-actions` 下 `position: absolute` — 不要改为 portal。

## 验证

- **机械检查**：`npx astro check`；在显示源码工具的文章页测试。
- **手感检查**：
  - 打开格式菜单 — 约 200ms 淡入并向下滑入 4px。
  - 关闭 — 反向；快速连点不会卡在可见状态。
  - `prefers-reduced-motion: reduce` — 仅淡入，无位移。
- **完成标准**：菜单开闭肉眼可见地变平滑，与下拉菜单时序家族一致。
