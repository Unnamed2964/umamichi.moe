import { SITE_MD_MIN_MQ } from './site-breakpoints';
import { parseCssDurationToMs, readRootCssDurationMs } from './css-values';

export function isMobileMenuViewport(): boolean {
	return !window.matchMedia(SITE_MD_MIN_MQ).matches;
}

function getPaneShiftSurface(): HTMLElement {
	const shiftSurface = document.querySelector('[data-site-pane-shift]');

	if (!(shiftSurface instanceof HTMLElement)) {
		throw new Error('Missing [data-site-pane-shift]');
	}

	return shiftSurface;
}

function parsePaneDurationMs(shiftSurface: HTMLElement): number {
	const fromElement = parseCssDurationToMs(getComputedStyle(shiftSurface).transitionDuration);

	if (fromElement !== null) {
		return fromElement;
	}

	const fromToken = readRootCssDurationMs('--wpm-pane-duration');

	if (fromToken === null) {
		throw new Error('Missing pane close duration');
	}

	return fromToken;
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
