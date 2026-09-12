import { initSiteAppearanceBeforeSwap } from './site-appearance-before-swap';
import { initSiteAppearanceControls } from './site-appearance-client';
import { initSiteCopyTools } from './site-copy-tools-client';
import { initSiteHeaderOffset } from './site-header-offset-client';
import { initSiteLensBorder } from './site-lens-border-client';
import { initSiteMobileMenu } from './site-mobile-menu-client';
import { initSiteNavRunningLine } from './site-nav-running-line-client';
import { initSiteRouteLoading } from './site-route-loading-client';
import { initSiteThemeColorSync } from './site-theme-color-client';
import { initViewTransitionLifecycle } from './view-transition-lifecycle';

export function initSiteChromeClients(): void {
	initViewTransitionLifecycle();
	initSiteAppearanceControls();
	initSiteAppearanceBeforeSwap();
	initSiteThemeColorSync();
	initSiteHeaderOffset();
	initSiteMobileMenu();
	initSiteRouteLoading();
	initSiteLensBorder();
	initSiteCopyTools();
	initSiteNavRunningLine();
}
