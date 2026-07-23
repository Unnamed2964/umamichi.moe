import { initSiteAppearanceBeforeSwap } from './site-appearance-before-swap';
import { initSiteAppearanceControls } from './site-appearance-client';
import { initSiteHeaderOffset } from './site-header-offset-client';
import { initSiteLensBorder } from './site-lens-border-client';
import { initSiteMobileMenu } from './site-mobile-menu-client';
import { initSiteMobileMenuRouteDefer } from './site-mobile-menu-route-defer';
import { initSiteSameDocumentTraverseGuard } from './site-same-document-traverse';
import { initSiteThemeColorSync } from './site-theme-color-client';
import { initViewTransitionLifecycle } from './view-transition-lifecycle';

export function initSiteChromeClients(): void {
	initViewTransitionLifecycle();
	initSiteSameDocumentTraverseGuard();
	initSiteAppearanceControls();
	initSiteAppearanceBeforeSwap();
	initSiteThemeColorSync();
	initSiteHeaderOffset();
	initSiteMobileMenu();
	initSiteMobileMenuRouteDefer();
	initSiteLensBorder();
}
