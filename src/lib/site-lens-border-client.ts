/**
 * Lens-style RGB fringe on opt-in gray borders (header hairline, dropdown panels).
 * Offset follows the pointer; touch / coarse pointers use eased focus.
 */

const INIT_KEY = '__siteLensBorderInit';

declare global {
	interface Window {
		[INIT_KEY]?: boolean;
	}
}

const DROPDOWN_PANEL_SELECTOR =
	'.dropdown-menu-panel.is-open, .download-format-menu-panel.is-open';
/** Floating menu overlay depth. */
const DROPDOWN_DEPTH = 1.35;
const DEFAULT_DEPTH = 1;
const MAX_OFFSET_PX = 1.75;
/** Distance at full strength ≈ this fraction of the viewport diagonal. */
const REF_DIAGONAL_FRACTION = 0.35;
const TOUCH_EASE = 0.14;
const SETTLE_EPS_SQ = 0.25;

type LensTarget = {
	element: HTMLElement;
	depth: number;
	/** Anchor on the bottom edge instead of the box center. */
	edgeBottom: boolean;
};

function clearLensVars(element: HTMLElement): void {
	element.style.removeProperty('--lens-ox');
	element.style.removeProperty('--lens-oy');
	element.style.removeProperty('--lens-main-a');
	element.style.removeProperty('--lens-ghost-a');
}

function collectLensTargets(): LensTarget[] {
	const targets: LensTarget[] = [];

	for (const element of document.querySelectorAll('[data-lens-border]')) {
		if (!(element instanceof HTMLElement)) {
			continue;
		}

		const depthRaw = element.dataset.lensDepth;
		const depth = depthRaw ? Number(depthRaw) : DEFAULT_DEPTH;

		targets.push({
			element,
			depth: Number.isFinite(depth) && depth > 0 ? depth : DEFAULT_DEPTH,
			edgeBottom: element.dataset.lensBorder === 'bottom',
		});
	}

	for (const element of document.querySelectorAll(DROPDOWN_PANEL_SELECTOR)) {
		if (!(element instanceof HTMLElement)) {
			continue;
		}

		targets.push({
			element,
			depth: DROPDOWN_DEPTH,
			edgeBottom: false,
		});
	}

	return targets;
}

function clearAllLensTargets(): void {
	for (const element of document.querySelectorAll('[data-lens-border]')) {
		if (element instanceof HTMLElement) {
			clearLensVars(element);
		}
	}

	for (const element of document.querySelectorAll(DROPDOWN_PANEL_SELECTOR)) {
		if (element instanceof HTMLElement) {
			clearLensVars(element);
		}
	}
}

export function initSiteLensBorder(): void {
	if (window[INIT_KEY]) {
		return;
	}

	window[INIT_KEY] = true;

	const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	const coarsePointerQuery = window.matchMedia('(pointer: coarse)');

	let focusX = window.innerWidth / 2;
	let focusY = window.innerHeight / 2;
	let targetX = focusX;
	let targetY = focusY;
	let useEasing = false;
	let rafId = 0;

	const applyLensVars = (targets: LensTarget[]): void => {
		const ref = Math.hypot(window.innerWidth, window.innerHeight) * REF_DIAGONAL_FRACTION;

		for (const { element, depth, edgeBottom } of targets) {
			const rect = element.getBoundingClientRect();
			const cx = rect.left + rect.width / 2;
			const cy = edgeBottom ? rect.bottom : rect.top + rect.height / 2;
			const vx = cx - focusX;
			const vy = cy - focusY;
			const dist = Math.hypot(vx, vy);
			const strength = Math.min(ref > 0 ? dist / ref : 0, 1) * depth;
			const offset = strength * MAX_OFFSET_PX;
			const nx = dist > 0 ? vx / dist : 0;
			const ny = dist > 0 ? vy / dist : 0;
			const t = Math.min(strength, 1);

			element.style.setProperty('--lens-ox', `${nx * offset}px`);
			element.style.setProperty('--lens-oy', `${ny * offset}px`);
			element.style.setProperty('--lens-main-a', String(1 - t * 0.55));
			element.style.setProperty('--lens-ghost-a', String(t * 0.4));
		}
	};

	const schedule = (): void => {
		if (rafId !== 0 || document.visibilityState === 'hidden') {
			return;
		}

		rafId = window.requestAnimationFrame(tick);
	};

	const tick = (): void => {
		rafId = 0;

		if (useEasing) {
			focusX += (targetX - focusX) * TOUCH_EASE;
			focusY += (targetY - focusY) * TOUCH_EASE;
		} else {
			focusX = targetX;
			focusY = targetY;
		}

		if (reducedMotionQuery.matches) {
			clearAllLensTargets();
			return;
		}

		const targets = collectLensTargets();

		if (targets.length === 0) {
			return;
		}

		applyLensVars(targets);

		if (useEasing) {
			const dx = targetX - focusX;
			const dy = targetY - focusY;

			if (dx * dx + dy * dy > SETTLE_EPS_SQ) {
				schedule();
			}
		}
	};

	const setPointerTarget = (event: PointerEvent): void => {
		targetX = event.clientX;
		targetY = event.clientY;
		useEasing = event.pointerType === 'touch' || coarsePointerQuery.matches;

		if (!useEasing) {
			focusX = targetX;
			focusY = targetY;
		}

		schedule();
	};

	window.addEventListener('pointermove', setPointerTarget, { passive: true });
	window.addEventListener('pointerdown', setPointerTarget, { passive: true });

	window.addEventListener(
		'resize',
		() => {
			schedule();
		},
		{ passive: true },
	);

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden' && rafId !== 0) {
			window.cancelAnimationFrame(rafId);
			rafId = 0;
			return;
		}

		if (document.visibilityState === 'visible') {
			schedule();
		}
	});

	reducedMotionQuery.addEventListener('change', () => {
		if (reducedMotionQuery.matches) {
			clearAllLensTargets();
			return;
		}

		schedule();
	});

	const observer = new MutationObserver(() => {
		schedule();
	});

	observer.observe(document.body, {
		subtree: true,
		childList: true,
		attributes: true,
		attributeFilter: ['class', 'data-lens-border', 'data-lens-depth'],
	});

	schedule();
}
