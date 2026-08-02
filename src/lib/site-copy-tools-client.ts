/**
 * Selection copy attribution toast and article source menu chrome.
 */
// Migrated from inline SiteChromeScripts; keep permissive while behavior stays gold.
// @ts-nocheck
import { registerAfterSwap } from './view-transition-lifecycle';

const INIT_KEY = '__siteCopyToolsInit';

export function initSiteCopyTools(): void {
	if (typeof window === 'undefined' || (window as unknown as Record<string, boolean>)[INIT_KEY]) {
		return;
	}
	(window as unknown as Record<string, boolean>)[INIT_KEY] = true;

const siteCopyToastId = 'site-copy-toast';
const siteCopyToastViewportPadding = 16;
const siteCopyToastOffset = 12;
const siteCopyToastDuration = 700;
let siteCopyToastHideTimer = 0;
let siteCopyLastPointer = {
	x: Math.max(window.innerWidth / 2, siteCopyToastViewportPadding),
	y: Math.max(window.innerHeight / 2, siteCopyToastViewportPadding),
};

const clamp = (value, min, max) => {
	if (max <= min) {
		return min;
	}

	return Math.min(Math.max(value, min), max);
};

const getSiteCopySourceUrl = () => {
	const path = `${window.location.pathname}${window.location.search}${window.location.hash}` || '/';
	return `umamichi.moe${path.startsWith('/') ? path : `/${path}`}`;
};

const getSiteCopySuffix = () => `（来自 ${getSiteCopySourceUrl()}）`;

const escapeSiteCopyHtml = (value) => value
	.replaceAll('&', '&amp;')
	.replaceAll('<', '&lt;')
	.replaceAll('>', '&gt;')
	.replaceAll('"', '&quot;')
	.replaceAll("'", '&#39;');

const getSelectedPlainText = () => {
	const selection = window.getSelection();
	return selection ? selection.toString() : '';
};

const toAbsoluteClipboardUrl = (value) => {
	if (!value) {
		return '';
	}

	const trimmed = value.trim();

	if (!trimmed || /^[a-z][a-z\d+.-]*:/i.test(trimmed) || trimmed.startsWith('//') || trimmed.startsWith('#')) {
		return value;
	}

	try {
		return new URL(trimmed, window.location.href).href;
	} catch {
		return value;
	}
};

const absolutizeClipboardSrcset = (value) => value
	.split(',')
	.map((candidate) => {
		const trimmed = candidate.trim();

		if (!trimmed) {
			return '';
		}

		const firstWhitespaceIndex = trimmed.search(/\s/);

		if (firstWhitespaceIndex === -1) {
			return toAbsoluteClipboardUrl(trimmed);
		}

		const url = trimmed.slice(0, firstWhitespaceIndex);
		const descriptor = trimmed.slice(firstWhitespaceIndex);

		return `${toAbsoluteClipboardUrl(url)}${descriptor}`;
	})
	.filter(Boolean)
	.join(', ');

const absolutizeClipboardFragmentUrls = (container) => {
	for (const element of container.querySelectorAll('[src]')) {
		const source = element.getAttribute('src');

		if (source) {
			element.setAttribute('src', toAbsoluteClipboardUrl(source));
		}
	}

	for (const element of container.querySelectorAll('[href]')) {
		const href = element.getAttribute('href');

		if (href) {
			element.setAttribute('href', toAbsoluteClipboardUrl(href));
		}
	}

	for (const element of container.querySelectorAll('[xlink\\:href]')) {
		const href = element.getAttribute('xlink:href');

		if (href) {
			element.setAttribute('xlink:href', toAbsoluteClipboardUrl(href));
		}
	}

	for (const element of container.querySelectorAll('[poster]')) {
		const poster = element.getAttribute('poster');

		if (poster) {
			element.setAttribute('poster', toAbsoluteClipboardUrl(poster));
		}
	}

	for (const element of container.querySelectorAll('[srcset]')) {
		const srcset = element.getAttribute('srcset');

		if (srcset) {
			element.setAttribute('srcset', absolutizeClipboardSrcset(srcset));
		}
	}
};

const getSelectedHtml = () => {
	const selection = window.getSelection();

	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
		return '';
	}

	const container = document.createElement('div');

	for (let index = 0; index < selection.rangeCount; index += 1) {
		container.append(selection.getRangeAt(index).cloneContents());
	}

	absolutizeClipboardFragmentUrls(container);

	return container.innerHTML;
};

const getSiteCopyAnchorRect = () => {
	const selection = window.getSelection();

	if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
		const range = selection.getRangeAt(selection.rangeCount - 1);
		const rects = range.getClientRects();

		if (rects.length > 0) {
			return rects.item(rects.length - 1);
		}

		const rect = range.getBoundingClientRect();

		if (rect.width > 0 || rect.height > 0) {
			return rect;
		}
	}

	return null;
};

const getSiteCopyToast = () => {
	let toast = document.getElementById(siteCopyToastId);

	if (!(toast instanceof HTMLDivElement)) {
		toast = document.createElement('div');
		toast.id = siteCopyToastId;
		toast.className = 'site-copy-toast';
		toast.setAttribute('aria-live', 'polite');
		toast.setAttribute('aria-atomic', 'true');
		document.body.append(toast);
	}

	return toast;
};

const positionSiteCopyToast = (toast) => {
	const anchorRect = getSiteCopyAnchorRect();
	const toastRect = toast.getBoundingClientRect();
	const rawLeft = anchorRect
		? anchorRect.right + siteCopyToastOffset
		: siteCopyLastPointer.x + siteCopyToastOffset;
	const rawTop = anchorRect
		? anchorRect.bottom + siteCopyToastOffset
		: siteCopyLastPointer.y + siteCopyToastOffset;
	const left = clamp(
		rawLeft,
		siteCopyToastViewportPadding,
		window.innerWidth - toastRect.width - siteCopyToastViewportPadding,
	);
	const top = clamp(
		rawTop,
		siteCopyToastViewportPadding,
		window.innerHeight - toastRect.height - siteCopyToastViewportPadding,
	);

	toast.style.left = `${left}px`;
	toast.style.top = `${top}px`;
};

const showSiteCopyToast = (message) => {
	const toast = getSiteCopyToast();

	toast.textContent = message;
	toast.classList.add('is-visible');
	toast.style.visibility = 'hidden';
	toast.style.left = `${siteCopyToastViewportPadding}px`;
	toast.style.top = `${siteCopyToastViewportPadding}px`;
	positionSiteCopyToast(toast);
	toast.style.visibility = 'visible';

	if (siteCopyToastHideTimer) {
		window.clearTimeout(siteCopyToastHideTimer);
	}

	siteCopyToastHideTimer = window.setTimeout(() => {
		toast.classList.remove('is-visible');
		siteCopyToastHideTimer = 0;
	}, siteCopyToastDuration);
};

window.addEventListener('pointerdown', (event) => {
	siteCopyLastPointer = {
		x: event.clientX,
		y: event.clientY,
	};
}, { passive: true });

window.addEventListener('resize', () => {
	const toast = document.getElementById(siteCopyToastId);

	if (toast instanceof HTMLDivElement && toast.classList.contains('is-visible')) {
		positionSiteCopyToast(toast);
	}
}, { passive: true });

document.addEventListener('copy', (event) => {
	const selectedPlainText = getSelectedPlainText();

	if (!selectedPlainText || !event.clipboardData) {
		return;
	}

	const suffix = getSiteCopySuffix();
	const selectedHtml = getSelectedHtml();

	event.preventDefault();
	event.clipboardData.setData('text/plain', `${selectedPlainText}${suffix}`);

	if (selectedHtml) {
		event.clipboardData.setData('text/html', `${selectedHtml}<span>${escapeSiteCopyHtml(suffix)}</span>`);
	}

	showSiteCopyToast('已复制');
}, true);

const copyTextToClipboard = async (value) => {
	if (!value) {
		return false;
	}

	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(value);
		return true;
	}

	const fallback = document.createElement('textarea');
	fallback.value = value;
	fallback.setAttribute('readonly', '');
	fallback.style.position = 'fixed';
	fallback.style.left = '-9999px';
	fallback.style.top = '0';
	document.body.append(fallback);
	fallback.select();

	try {
		return document.execCommand('copy');
	} finally {
		fallback.remove();
	}
};

const ARTICLE_SOURCE_MENU_HIDE_MS = 220;

const clearArticleSourceMenuClose = (menu) => {
	if (menu._articleSourceMenuHideTimer) {
		window.clearTimeout(menu._articleSourceMenuHideTimer);
		menu._articleSourceMenuHideTimer = 0;
	}

	if (menu._articleSourceMenuTransitionEnd) {
		menu.removeEventListener('transitionend', menu._articleSourceMenuTransitionEnd);
		menu._articleSourceMenuTransitionEnd = null;
	}
};

const openArticleSourceMenu = (toggle, menu) => {
	clearArticleSourceMenuClose(menu);
	menu.hidden = false;
	toggle.setAttribute('aria-expanded', 'true');

	requestAnimationFrame(() => {
		menu.classList.add('is-open');
	});
};

const closeArticleSourceMenu = (container) => {
	const toggle = container.querySelector('[data-article-source-menu-toggle]');
	const menu = container.querySelector('[data-article-source-menu]');

	if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) {
		return;
	}

	if (toggle.getAttribute('aria-expanded') !== 'true') {
		return;
	}

	toggle.setAttribute('aria-expanded', 'false');
	menu.classList.remove('is-open');
	clearArticleSourceMenuClose(menu);

	const finalizeHide = () => {
		if (menu.classList.contains('is-open')) {
			return;
		}

		menu.hidden = true;
		clearArticleSourceMenuClose(menu);
	};

	const onTransitionEnd = (event) => {
		if (event.target !== menu) {
			return;
		}

		if (event.propertyName !== 'opacity' && event.propertyName !== 'transform') {
			return;
		}

		finalizeHide();
	};

	menu._articleSourceMenuTransitionEnd = onTransitionEnd;
	menu.addEventListener('transitionend', onTransitionEnd);
	menu._articleSourceMenuHideTimer = window.setTimeout(finalizeHide, ARTICLE_SOURCE_MENU_HIDE_MS);
};

const closeArticleSourceMenus = () => {
	for (const container of document.querySelectorAll('[data-article-source-tools]')) {
		closeArticleSourceMenu(container);
	}
};

document.addEventListener('click', async (event) => {
	const target = event.target;

	if (!(target instanceof Element)) {
		return;
	}

	const toggle = target.closest('[data-article-source-menu-toggle]');
	const copyButton = target.closest('[data-article-copy-markdown]');
	const gitHistoryButton = target.closest('[data-article-git-history]');

	if (toggle instanceof HTMLButtonElement) {
		event.preventDefault();
		const container = toggle.closest('[data-article-source-tools]');
		const menu = container?.querySelector('[data-article-source-menu]');

		if (!(container instanceof Element) || !(menu instanceof HTMLElement)) {
			return;
		}

		const isOpen = toggle.getAttribute('aria-expanded') === 'true';

		for (const otherContainer of document.querySelectorAll('[data-article-source-tools]')) {
			if (otherContainer !== container) {
				closeArticleSourceMenu(otherContainer);
			}
		}

		if (isOpen) {
			closeArticleSourceMenu(container);
		} else {
			openArticleSourceMenu(toggle, menu);
		}
		return;
	}

	if (copyButton instanceof HTMLButtonElement) {
		const container = copyButton.closest('[data-article-source-tools]');
		const source = container?.querySelector('[data-article-markdown-source]');
		const markdown = source instanceof HTMLTextAreaElement ? source.value : '';

		try {
			const copied = await copyTextToClipboard(markdown);

			showSiteCopyToast(copied ? '已复制 Markdown' : '复制失败');
		} catch {
			showSiteCopyToast('复制失败');
		}

		if (container instanceof Element) {
			closeArticleSourceMenu(container);
		}
		return;
	}

	if (gitHistoryButton instanceof HTMLButtonElement) {
		event.preventDefault();
		const container = gitHistoryButton.closest('[data-article-source-tools]');
		if (container instanceof Element) {
			closeArticleSourceMenu(container);
		}
		window.dispatchEvent(new CustomEvent('article:git-history-open'));
	}
});

registerAfterSwap(closeArticleSourceMenus);

document.addEventListener('pointerdown', (event) => {
	const target = event.target;

	if (!(target instanceof Node)) {
		return;
	}

	for (const container of document.querySelectorAll('[data-article-source-tools]')) {
		if (!container.contains(target)) {
			closeArticleSourceMenu(container);
		}
	}
});

window.addEventListener('keydown', (event) => {
	if (event.key !== 'Escape') {
		return;
	}

	closeArticleSourceMenus();
});
}
