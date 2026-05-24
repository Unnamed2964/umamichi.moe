/**
 * Root view-transition animations for Astro ClientRouter.
 * Keyframes live in @umamichi-ui/windows-phone-motion; slide routes override via data-wpm-route.
 */
const easeIn = 'var(--wpm-ease-in-exp6)';
const easeOut = 'var(--wpm-ease-out-exp6)';

export const siteRootViewTransition = {
	forwards: {
		old: {
			name: 'wpm-turnstile-forward-out',
			duration: 'var(--wpm-turnstile-out-duration)',
			easing: easeIn,
			fillMode: 'both',
		},
		new: {
			name: 'wpm-turnstile-forward-in',
			duration: 'var(--wpm-turnstile-in-duration)',
			easing: easeOut,
			fillMode: 'both',
		},
	},
	backwards: {
		old: {
			name: 'wpm-turnstile-backward-out',
			duration: 'var(--wpm-turnstile-out-duration)',
			easing: easeIn,
			fillMode: 'both',
		},
		new: {
			name: 'wpm-turnstile-backward-in',
			duration: 'var(--wpm-turnstile-in-duration)',
			easing: easeOut,
			fillMode: 'both',
		},
	},
} as const;
