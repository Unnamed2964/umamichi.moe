import { initSiteAppearanceBeforeSwap } from './site-appearance-before-swap';
import { initSiteAppearanceControls } from './site-appearance-client';
import { initSiteHeaderOffset } from './site-header-offset-client';
import { initSiteMobileMenu } from './site-mobile-menu-client';
import { initSiteMobileMenuRouteDefer } from './site-mobile-menu-route-defer';
import { initSiteThemeColorSync } from './site-theme-color-client';
import { initViewTransitionLifecycle } from './view-transition-lifecycle';

export function initSiteChromeClients(): void {
	initViewTransitionLifecycle();
	initSiteAppearanceControls();
	initSiteAppearanceBeforeSwap();
	initSiteThemeColorSync();
	initSiteHeaderOffset();
	initSiteMobileMenu();
	initSiteMobileMenuRouteDefer();
}
