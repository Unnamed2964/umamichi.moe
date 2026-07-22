export const MOBILE_MENU_BREAKPOINT_PX = 768;

export function isMobileMenuViewport(): boolean {
	return window.innerWidth < MOBILE_MENU_BREAKPOINT_PX;
}

function getPaneShiftSurface(): HTMLElement | null {
	const shiftSurface = document.querySelector('.site-pane-shift.wpm-pane-shift')
		?? document.querySelector('.site-route-main.wpm-pane-shift')
		?? document.querySelector('[data-site-mobile-menu]');

	return shiftSurface instanceof HTMLElement ? shiftSurface : null;
}

function parsePaneDurationMs(): number {
	const shiftSurface = getPaneShiftSurface();

	if (shiftSurface) {
		const duration = getComputedStyle(shiftSurface).transitionDuration;
		const first = duration.split(',')[0]?.trim();

		if (first?.endsWith('ms')) {
			return Number.parseFloat(first);
		}

		if (first?.endsWith('s')) {
			return Number.parseFloat(first) * 1000;
		}
	}

	return 500;
}

export function waitForPaneClose(): Promise<void> {
	if (!isMobileMenuViewport()) {
		return Promise.resolve();
	}

	const shiftSurface = getPaneShiftSurface();

	if (!shiftSurface) {
		return Promise.resolve();
	}

	const fallbackMs = parsePaneDurationMs() + 50;

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
