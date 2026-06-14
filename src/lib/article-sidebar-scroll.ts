const INIT_KEY = '__articleSidebarScrollInit';

const PANEL_SELECTOR = 'nav[aria-label="文章列表"]';
const SCROLL_SELECTOR = '.site-sidebar-scroll';
const CURRENT_SELECTOR = '.site-sidebar-link--current, [aria-current="page"]';

const DEFAULT_SCROLL_DURATION_MS = 350;
const DEFAULT_SIDEBAR_FADE_MS = 200;
const DEFAULT_EASE_OUT_EXP6: [number, number, number, number] = [0.19, 1, 0.22, 1];

type ScrollRun = {
	cancel: () => void;
};

let activeScrollRun: ScrollRun | null = null;

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

function parseCubicBezier(value: string): [number, number, number, number] | null {
	const match = value.trim().match(
		/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/,
	);

	if (!match) {
		return null;
	}

	return [
		Number(match[1]),
		Number(match[2]),
		Number(match[3]),
		Number(match[4]),
	];
}

function createCubicBezierEasing(x1: number, y1: number, x2: number, y2: number) {
	const NEWTON_ITERATIONS = 4;
	const NEWTON_MIN_SLOPE = 0.001;
	const SUBDIVISION_PRECISION = 1e-7;
	const SUBDIVISION_MAX_ITERATIONS = 10;

	const calcBezier = (t: number, a1: number, a2: number) => {
		const cx = 3 * a1;
		const bx = 3 * (a2 - a1) - cx;
		const ax = 1 - cx - bx;
		return ((ax * t + bx) * t + cx) * t;
	};

	const getSlope = (t: number, a1: number, a2: number) => {
		const cx = 3 * a1;
		const bx = 3 * (a2 - a1) - cx;
		const ax = 1 - cx - bx;
		return 3 * ax * t * t + 2 * bx * t + cx;
	};

	const binarySubdivide = (x: number, lower: number, upper: number) => {
		let currentX = 0;
		let currentT = 0;
		let iteration = 0;

		do {
			currentT = lower + (upper - lower) / 2;
			currentX = calcBezier(currentT, x1, x2) - x;
			if (currentX > 0) {
				upper = currentT;
			} else {
				lower = currentT;
			}
		} while (
			Math.abs(currentX) > SUBDIVISION_PRECISION
			&& ++iteration < SUBDIVISION_MAX_ITERATIONS
		);

		return currentT;
	};

	const newtonRaphsonIterate = (x: number, guess: number) => {
		let currentGuess = guess;

		for (let i = 0; i < NEWTON_ITERATIONS; i += 1) {
			const currentSlope = getSlope(currentGuess, x1, x2);

			if (currentSlope === 0) {
				return currentGuess;
			}

			const currentX = calcBezier(currentGuess, x1, x2) - x;
			currentGuess -= currentX / currentSlope;
		}

		return currentGuess;
	};

	const getTForX = (x: number) => {
		let guess = x;

		for (let i = 0; i < 4; i += 1) {
			const slope = getSlope(guess, x1, x2);

			if (slope >= NEWTON_MIN_SLOPE) {
				return newtonRaphsonIterate(x, guess);
			}

			if (slope === 0) {
				break;
			}

			guess -= calcBezier(guess, x1, x2) / slope;
		}

		return binarySubdivide(x, 0, 1);
	};

	if (x1 === y1 && x2 === y2) {
		return (t: number) => t;
	}

	return (t: number) => {
		if (t <= 0) {
			return 0;
		}

		if (t >= 1) {
			return 1;
		}

		return calcBezier(getTForX(t), y1, y2);
	};
}

function readScrollEasing() {
	const raw = getComputedStyle(document.documentElement).getPropertyValue('--site-sidebar-scroll-easing');
	const bezier = parseCubicBezier(raw) ?? DEFAULT_EASE_OUT_EXP6;
	return createCubicBezierEasing(...bezier);
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

function isInScrollRange(scrollEl: HTMLElement, itemEl: HTMLElement): boolean {
	const scrollRect = scrollEl.getBoundingClientRect();
	const itemRect = itemEl.getBoundingClientRect();

	return itemRect.top >= scrollRect.top && itemRect.bottom <= scrollRect.bottom;
}

function computeTargetScrollTop(scrollEl: HTMLElement, itemEl: HTMLElement): number {
	const scrollRect = scrollEl.getBoundingClientRect();
	const itemRect = itemEl.getBoundingClientRect();
	const currentScrollTop = scrollEl.scrollTop;

	if (itemRect.top < scrollRect.top) {
		return currentScrollTop + (itemRect.top - scrollRect.top);
	}

	if (itemRect.bottom > scrollRect.bottom) {
		return currentScrollTop + (itemRect.bottom - scrollRect.bottom);
	}

	return currentScrollTop;
}

function cancelActiveScrollRun(): void {
	activeScrollRun?.cancel();
	activeScrollRun = null;
}

function animateScrollTo(scrollEl: HTMLElement, targetScrollTop: number): Promise<void> {
	const startScrollTop = scrollEl.scrollTop;

	if (Math.abs(targetScrollTop - startScrollTop) < 1) {
		return Promise.resolve();
	}

	if (prefersReducedMotion()) {
		scrollEl.scrollTop = targetScrollTop;
		return Promise.resolve();
	}

	const durationMs = readCssVarMs('--site-sidebar-scroll-duration', DEFAULT_SCROLL_DURATION_MS);
	const ease = readScrollEasing();

	return new Promise((resolve) => {
		let cancelled = false;
		let frameId = 0;
		const startTime = performance.now();

		const finish = () => {
			window.cancelAnimationFrame(frameId);
			if (activeScrollRun?.cancel === cancel) {
				activeScrollRun = null;
			}
			resolve();
		};

		const cancel = () => {
			cancelled = true;
			finish();
		};

		activeScrollRun = { cancel };

		const step = (now: number) => {
			if (cancelled) {
				return;
			}

			const elapsed = now - startTime;
			const progress = Math.min(elapsed / durationMs, 1);
			scrollEl.scrollTop = startScrollTop + (targetScrollTop - startScrollTop) * ease(progress);

			if (progress < 1) {
				frameId = window.requestAnimationFrame(step);
				return;
			}

			finish();
		};

		frameId = window.requestAnimationFrame(step);
	});
}

export function scrollArticleSidebarCurrentIntoView(): void {
	cancelActiveScrollRun();

	for (const panel of document.querySelectorAll(PANEL_SELECTOR)) {
		if (!(panel instanceof HTMLElement) || !isPanelVisible(panel)) {
			continue;
		}

		const scroll = panel.querySelector(SCROLL_SELECTOR);
		const current = panel.querySelector(CURRENT_SELECTOR);

		if (!(scroll instanceof HTMLElement) || !(current instanceof HTMLElement)) {
			continue;
		}

		if (isInScrollRange(scroll, current)) {
			return;
		}

		const targetScrollTop = computeTargetScrollTop(scroll, current);
		void animateScrollTo(scroll, targetScrollTop);
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
