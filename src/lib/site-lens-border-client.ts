import { initChromaticFringe } from '@umamichi-ui/chromatic-fringe/init';

const BUTTON_SELECTOR = [
	'.site-button',
	'.site-icon-button',
	'.article-prev-next__card',
	'.article-block-copy',
	'.outline-button',
	'.primary-button',
	'.secondary-button',
	'.ghost-button',
].join(', ');

function isMobileMenuPaneActive(): boolean {
	const root = document.documentElement;
	return root.dataset.mobileMenuOpen === 'true' || root.dataset.mobileMenuClosing === 'true';
}

function isMobileMenuFocused(): boolean {
	return document.documentElement.dataset.mobileMenuOpen === 'true';
}

/** Site wiring for @umamichi-ui/chromatic-fringe. */
export function initSiteLensBorder(): void {
	initChromaticFringe({
		buttonSelector: BUTTON_SELECTOR,
		skipClosest: '[data-site-header], [data-site-mobile-menu], .article-git-history-panel',
		fadeBorderSelector: '.outline-button',
		depths: {
			dropdown: 1.35,
			button: 0.65,
			default: 1,
		},
		rootAttributeFilter: ['data-mobile-menu-open', 'data-mobile-menu-closing'],
		isMarkedTargetActive: (element) => {
			if (!element.hasAttribute('data-site-mobile-menu')) {
				return true;
			}

			return isMobileMenuPaneActive();
		},
		markedIgnoreAriaHidden: (element) => element.hasAttribute('data-site-mobile-menu'),
		isOverlayElevating: () => isMobileMenuFocused(),
	});
}
