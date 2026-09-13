import { parseCssDurationToMs, readFloatingInsetPx } from './css-values';
import { registerAfterSwap } from './view-transition-lifecycle';

const previewId = 'article-footnote-preview';
const previewBodyClass = 'article-footnote-preview__body';
const offset = 8;
const showDelayMs = 150;
const hideDelayMs = 200;
const HIDE_TRANSITION_SLACK_MS = 20;

let initialized = false;
let setupAbortController: AbortController | null = null;
let showTimer = 0;
let hideTimer = 0;
let activeRef: HTMLElement | null = null;
let defById = new Map<string, HTMLElement>();

function clamp(value: number, min: number, max: number): number {
	if (max <= min) {
		return min;
	}

	return Math.min(Math.max(value, min), max);
}

function footnoteHideFallbackMs(preview: HTMLElement): number {
	const duration = parseCssDurationToMs(getComputedStyle(preview).transitionDuration);

	if (duration === null) {
		throw new Error('Missing footnote preview transition duration');
	}

	return duration + HIDE_TRANSITION_SLACK_MS;
}

function clearShowTimer(): void {
	if (showTimer) {
		window.clearTimeout(showTimer);
		showTimer = 0;
	}
}

function clearHideTimer(): void {
	if (hideTimer) {
		window.clearTimeout(hideTimer);
		hideTimer = 0;
	}
}

function stripIds(root: HTMLElement): void {
	if (root.hasAttribute('id')) {
		root.removeAttribute('id');
	}

	for (const element of root.querySelectorAll('[id]')) {
		element.removeAttribute('id');
	}
}

function getFootnoteBody(definitionItem: HTMLElement): DocumentFragment {
	const wrapper = document.createElement('div');

	for (const node of definitionItem.childNodes) {
		wrapper.append(node.cloneNode(true));
	}

	for (const backref of wrapper.querySelectorAll('[data-footnote-backref]')) {
		backref.remove();
	}

	const body = document.createDocumentFragment();

	while (wrapper.firstChild) {
		body.append(wrapper.firstChild);
	}

	return body;
}

function getPreview(): HTMLDivElement {
	const existing = document.getElementById(previewId);
	if (existing instanceof HTMLDivElement) {
		return existing;
	}

	const preview = document.createElement('div');
	preview.id = previewId;
	preview.className = 'article-footnote-preview';
	preview.setAttribute('role', 'tooltip');
	preview.hidden = true;

	const body = document.createElement('div');
	body.className = previewBodyClass;
	preview.append(body);
	document.body.append(preview);

	preview.addEventListener('pointerenter', () => {
		clearHideTimer();
	}, { passive: true });

	preview.addEventListener('pointerleave', () => {
		scheduleHide();
	}, { passive: true });

	return preview;
}

function getPreviewBody(preview: HTMLDivElement): HTMLDivElement {
	const body = preview.querySelector(`.${previewBodyClass}`);

	if (!(body instanceof HTMLDivElement)) {
		throw new Error('Article footnote preview body is missing.');
	}

	return body;
}

function positionPreview(preview: HTMLDivElement, ref: HTMLElement): void {
	const inset = readFloatingInsetPx();
	const anchorRect = ref.getBoundingClientRect();
	preview.style.visibility = 'hidden';
	preview.hidden = false;

	const previewRect = preview.getBoundingClientRect();
	const spaceBelow = window.innerHeight - anchorRect.bottom - offset - inset;
	const spaceAbove = anchorRect.top - offset - inset;
	const placeAbove = previewRect.height > spaceBelow && spaceAbove >= spaceBelow;

	let top = placeAbove
		? anchorRect.top - offset - previewRect.height
		: anchorRect.bottom + offset;
	let left = anchorRect.left;

	left = clamp(
		left,
		inset,
		window.innerWidth - previewRect.width - inset,
	);
	top = clamp(
		top,
		inset,
		window.innerHeight - previewRect.height - inset,
	);

	preview.style.left = `${left}px`;
	preview.style.top = `${top}px`;
	preview.style.visibility = 'visible';
}

function closePreview(): void {
	clearShowTimer();
	clearHideTimer();
	activeRef = null;

	const preview = document.getElementById(previewId);

	if (!(preview instanceof HTMLDivElement) || preview.hidden) {
		return;
	}

	preview.classList.remove('is-visible');

	const finalizeHide = () => {
		if (preview.classList.contains('is-visible')) {
			return;
		}

		preview.hidden = true;
		getPreviewBody(preview).replaceChildren();
		preview.removeAttribute('style');
	};

	preview.addEventListener('transitionend', finalizeHide, { once: true });
	window.setTimeout(finalizeHide, footnoteHideFallbackMs(preview));
}

function openPreview(ref: HTMLElement): void {
	const href = ref.getAttribute('href');

	if (!href?.startsWith('#')) {
		return;
	}

	const definition = defById.get(href.slice(1));

	if (!definition) {
		return;
	}

	clearShowTimer();
	clearHideTimer();

	const preview = getPreview();
	const body = getPreviewBody(preview);
	body.replaceChildren(getFootnoteBody(definition));
	stripIds(body);
	activeRef = ref;
	positionPreview(preview, ref);

	window.requestAnimationFrame(() => {
		preview.classList.add('is-visible');
	});
}

function scheduleShow(ref: HTMLElement): void {
	clearHideTimer();

	if (activeRef === ref && !getPreview().hidden) {
		return;
	}

	clearShowTimer();
	showTimer = window.setTimeout(() => {
		showTimer = 0;
		openPreview(ref);
	}, showDelayMs);
}

function scheduleHide(): void {
	clearShowTimer();
	clearHideTimer();
	hideTimer = window.setTimeout(() => {
		hideTimer = 0;
		closePreview();
	}, hideDelayMs);
}

function repositionVisiblePreview(event: Event): void {
	const preview = document.getElementById(previewId);

	if (!(preview instanceof HTMLDivElement) || preview.hidden || !activeRef) {
		return;
	}

	// Ignore scrolling inside the tooltip itself (overflow: auto).
	if (
		event.target instanceof Node &&
		preview.contains(event.target)
	) {
		return;
	}

	positionPreview(preview, activeRef);
}

function setupFootnotePreview(): void {
	setupAbortController?.abort();
	setupAbortController = new AbortController();
	const { signal } = setupAbortController;

	closePreview();
	defById = new Map();

	const contentRoot = document.querySelector('.article-content');

	if (!contentRoot) {
		return;
	}

	const footnotesRoot = contentRoot.querySelector('section[data-footnotes], section.footnotes');

	if (!footnotesRoot) {
		return;
	}

	for (const item of footnotesRoot.querySelectorAll<HTMLElement>('li[id]')) {
		defById.set(item.id, item);
	}

	const refs = contentRoot.querySelectorAll<HTMLElement>('a[data-footnote-ref]');

	for (const ref of refs) {
		ref.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			openPreview(ref);
		}, { signal });

		ref.addEventListener('pointerenter', (event) => {
			if (event.pointerType === 'touch') {
				return;
			}

			scheduleShow(ref);
		}, { signal, passive: true });

		ref.addEventListener('pointerleave', scheduleHide, { signal, passive: true });

		ref.addEventListener('focus', () => {
			scheduleShow(ref);
		}, { signal });

		ref.addEventListener('blur', scheduleHide, { signal });
	}

	document.addEventListener('pointerdown', (event) => {
		const preview = document.getElementById(previewId);

		if (!(preview instanceof HTMLDivElement) || preview.hidden) {
			return;
		}

		const target = event.target;

		if (!(target instanceof Node)) {
			return;
		}

		if (preview.contains(target) || (activeRef instanceof Node && activeRef.contains(target))) {
			return;
		}

		closePreview();
	}, { signal });

	document.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') {
			return;
		}

		const preview = document.getElementById(previewId);

		if (!(preview instanceof HTMLDivElement) || preview.hidden) {
			return;
		}

		closePreview();
	}, { signal });
}

export function initArticleFootnotePreviewClient(): void {
	if (initialized) {
		return;
	}
	initialized = true;

	window.addEventListener('resize', repositionVisiblePreview, { passive: true });
	document.addEventListener('scroll', repositionVisiblePreview, { passive: true, capture: true });
	registerAfterSwap(setupFootnotePreview);
}
