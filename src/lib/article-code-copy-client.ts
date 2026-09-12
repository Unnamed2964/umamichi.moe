import { registerAfterSwap } from './view-transition-lifecycle';

const wrapperClass = 'article-copyable-block';
const copyButtonClass = 'article-block-copy';
const copiedLabel = '已复制';
const copyIcon =
	'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path fill="currentColor" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>';
const checkIcon =
	'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>';

let initialized = false;

async function copyTextToClipboard(value: string): Promise<boolean> {
	if (!value || !navigator.clipboard?.writeText) {
		return false;
	}

	try {
		await navigator.clipboard.writeText(value);
		return true;
	} catch {
		return false;
	}
}

function createCopyButton(getText: () => string, label: string): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = copyButtonClass;
	button.setAttribute('aria-label', label);
	button.title = label;
	button.innerHTML = copyIcon;
	button.addEventListener('click', () => {
		void (async () => {
			const copied = await copyTextToClipboard(getText());

			if (!copied) {
				return;
			}

			button.dataset.copied = copiedLabel;
			button.innerHTML = checkIcon;
			window.setTimeout(() => {
				button.style.transition = 'none';
				button.removeAttribute('data-copied');
				button.innerHTML = copyIcon;
				button.blur();
				void button.offsetWidth;
				button.style.removeProperty('transition');
			}, 1200);
		})();
	});
	return button;
}

function wrapCodeBlock(pre: HTMLPreElement): void {
	const parent = pre.parentNode;
	if (!parent) {
		return;
	}

	const wrapper = document.createElement('div');
	wrapper.className = wrapperClass;
	wrapper.dataset.copyKind = 'code';
	parent.insertBefore(wrapper, pre);
	wrapper.append(pre);
	wrapper.append(
		createCopyButton(
			() => pre.querySelector('code')?.textContent ?? pre.textContent ?? '',
			'复制代码',
		),
	);
}

function setupCodeCopyButtons(): void {
	const contentRoot = document.querySelector('.article-content');

	if (!contentRoot) {
		return;
	}

	for (const pre of contentRoot.querySelectorAll<HTMLPreElement>('pre')) {
		if (pre.closest(`.${wrapperClass}`)) {
			continue;
		}

		wrapCodeBlock(pre);
	}

	for (const block of contentRoot.querySelectorAll<HTMLElement>(`.${wrapperClass}[data-copy-kind="mermaid"]`)) {
		if (block.querySelector(`.${copyButtonClass}`)) {
			continue;
		}

		const source = block.querySelector('.article-copy-source')?.textContent ?? '';
		block.append(createCopyButton(() => source, '复制 Mermaid 源码'));
	}
}

export function initArticleCodeCopyClient(): void {
	if (initialized) {
		return;
	}
	initialized = true;

	registerAfterSwap(setupCodeCopyButtons);
}
