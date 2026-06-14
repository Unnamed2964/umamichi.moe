const INIT_KEY = '__articleSidebarScrollInit';

const PANEL_SELECTOR = 'nav[aria-label="文章列表"]';
const SCROLL_SELECTOR = '.site-sidebar-scroll';
const CURRENT_SELECTOR = '.site-sidebar-link--current, [aria-current="page"]';

const DEFAULT_SIDEBAR_FADE_MS = 200;

function parseCssDurationMs(value: string): number {
	const trimmed = value.trim();

	if (!trimmed) {
		return 0;
	}

	if (trimmed.endsWith('ms')) {
		return Number.parseFloat(trimmed);
	}

	if (trimmed.endsWith('s')) {
		return Number.parseFloat(trimmed) * 1000;
	}

	const parsed = Number.parseFloat(trimmed);
	return Number.isFinite(parsed) ? parsed : 0;
}

function readCssVarMs(variableName: string, fallbackMs: number): number {
	const raw = getComputedStyle(document.documentElement).getPropertyValue(variableName);
	const parsed = parseCssDurationMs(raw);
	return parsed > 0 ? parsed : fallbackMs;
}

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isPanelVisible(panel: HTMLElement): boolean {
	if (panel.offsetParent === null) {
		return false;
	}

	const style = getComputedStyle(panel);

	if (style.display === 'none' || style.visibility === 'hidden') {
		return false;
	}

	const scroll = panel.querySelector(SCROLL_SELECTOR);

	if (!(scroll instanceof HTMLElement)) {
		return false;
	}

	return scroll.clientHeight > 0;
}

export function scrollArticleSidebarCurrentIntoView(): void {
	for (const panel of document.querySelectorAll(PANEL_SELECTOR)) {
		if (!(panel instanceof HTMLElement) || !isPanelVisible(panel)) {
			continue;
		}

		const current = panel.querySelector(CURRENT_SELECTOR);

		if (!(current instanceof HTMLElement)) {
			continue;
		}

		current.scrollIntoView({
			block: 'nearest',
			inline: 'nearest',
			behavior: prefersReducedMotion() ? 'instant' : 'smooth',
		});
		return;
	}
}

function runAfterLayout(afterRouteSwap: boolean): void {
	const run = () => {
		scrollArticleSidebarCurrentIntoView();
	};

	if (afterRouteSwap) {
		const fadeMs = readCssVarMs('--site-route-sidebar-fade-duration', DEFAULT_SIDEBAR_FADE_MS);
		window.setTimeout(() => {
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(run);
			});
		}, fadeMs);
		return;
	}

	window.requestAnimationFrame(() => {
		window.requestAnimationFrame(run);
	});
}

export function initArticleSidebarScroll(): void {
	if (typeof window === 'undefined') {
		return;
	}

	const windowState = window as unknown as Record<string, boolean>;

	if (windowState[INIT_KEY]) {
		return;
	}

	windowState[INIT_KEY] = true;

	document.addEventListener('astro:after-swap', () => {
		runAfterLayout(true);
	});

	runAfterLayout(false);
}
