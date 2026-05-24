import {
	applyRouteTransition,
	initWindowsPhoneMotionNavigation,
	suppressMotionTemporarily,
	type WpmRoutePreset,
} from '@umamichi-ui/windows-phone-motion/navigation';

function readRoutePreset(root: HTMLElement): WpmRoutePreset {
	return root.dataset.wpmRoute === 'slide' ? 'slide' : 'turnstile';
}

function readNavDirection(root: HTMLElement): 'forward' | 'back' {
	return root.hasAttribute('data-astro-transition') ? 'back' : 'forward';
}

export function initSiteWindowsPhoneMotion() {
	initWindowsPhoneMotionNavigation({ activateFeather: true });

	document.addEventListener('astro:before-swap', (event) => {
		if (!('swap' in event) || typeof event.swap !== 'function') {
			return;
		}

		const root = document.documentElement;
		const route = readRoutePreset(root);
		const direction = readNavDirection(root);
		const originalSwap = event.swap.bind(event);

		event.swap = () => {
			originalSwap();
			applyRouteTransition(direction, route);
		};
	});

	document.addEventListener('astro:after-swap', () => {
		const root = document.documentElement;
		applyRouteTransition(readNavDirection(root), readRoutePreset(root));
	});
}

export { suppressMotionTemporarily };
