export const MOBILE_MENU_BREAKPOINT_PX = 768;

export function isMobileMenuViewport(): boolean {
	return window.innerWidth < MOBILE_MENU_BREAKPOINT_PX;
}

function getPaneShiftSurface(): HTMLElement {
	const shiftSurface = document.querySelector('[data-site-pane-shift]');

	if (!(shiftSurface instanceof HTMLElement)) {
		throw new Error('Missing [data-site-pane-shift]');
	}

	return shiftSurface;
}

function parsePaneDurationMs(shiftSurface: HTMLElement): number {
	const duration = getComputedStyle(shiftSurface).transitionDuration;
	const first = duration.split(',')[0]?.trim();

	if (first?.endsWith('ms')) {
		return Number.parseFloat(first);
	}

	if (first?.endsWith('s')) {
		return Number.parseFloat(first) * 1000;
	}

	return 500;
}

export function waitForPaneClose(): Promise<void> {
	if (!isMobileMenuViewport()) {
		return Promise.resolve();
	}

	const shiftSurface = getPaneShiftSurface();
	const fallbackMs = parsePaneDurationMs(shiftSurface) + 50;

	return new Promise((resolve) => {
		let settled = false;

		const finish = () => {
			if (settled) {
				return;
			}

			settled = true;
			shiftSurface.removeEventListener('transitionend', onTransitionEnd);
			resolve();
		};

		const onTransitionEnd = (event: TransitionEvent) => {
			if (event.target === shiftSurface && event.propertyName === 'transform') {
				finish();
			}
		};

		shiftSurface.addEventListener('transitionend', onTransitionEnd);
		window.setTimeout(finish, fallbackMs);
	});
}
