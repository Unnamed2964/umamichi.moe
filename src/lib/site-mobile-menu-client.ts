import { isMobileMenuViewport, waitForPaneClose } from './site-mobile-menu-pane.ts';
import { acquirePreservedScrollbar, releasePreservedScrollbar } from './site-preserve-scrollbar.ts';
import { dispatchSiteNavLayoutChange } from './site-events';
import { registerAfterSwap } from './view-transition-lifecycle';

const INIT_KEY = '__siteMobileMenuInit';
const PRESERVE_SCROLLBAR_REASON = 'mobile-menu';

declare global {
	interface Window {
		__siteMobileMenuCloseForNavigation?: () => void | Promise<void>;
	}
}

function isMenuOpen(): boolean {
	return document.documentElement.dataset.mobileMenuOpen === 'true';
}

function isMenuClosing(): boolean {
	return document.documentElement.dataset.mobileMenuClosing === 'true';
}

function syncMobileHeaderPlaceholder(keepPlaceholder: boolean): void {
	const header = document.querySelector('[data-site-header]');

	if (keepPlaceholder && isMobileMenuViewport() && header instanceof HTMLElement) {
		const headerHeight = Math.ceil(header.getBoundingClientRect().height);
		document.documentElement.style.setProperty('--site-header-placeholder-height', `${headerHeight}px`);
		dispatchSiteNavLayoutChange();
		return;
	}

	document.documentElement.style.removeProperty('--site-header-placeholder-height');
}

function syncMenuToggleButtons(isOpen: boolean): void {
	for (const button of document.querySelectorAll('[data-site-menu-toggle]')) {
		button.setAttribute('aria-expanded', String(isOpen));
		button.setAttribute('aria-label', isOpen ? '关闭菜单' : '打开菜单');
	}
}

export function initSiteMobileMenu(): void {
	if (typeof window === 'undefined' || (window as unknown as Record<string, boolean>)[INIT_KEY]) {
		return;
	}
	(window as unknown as Record<string, boolean>)[INIT_KEY] = true;

	let menuHistoryPushed = false;
	let menuClosePromise: Promise<void> | null = null;

	const finishMenuClose = () => {
		if (isMenuOpen()) {
			return;
		}

		delete document.documentElement.dataset.mobileMenuClosing;
		syncMobileHeaderPlaceholder(false);
		releasePreservedScrollbar(PRESERVE_SCROLLBAR_REASON);
		menuClosePromise = null;
	};

	const applyMenuClosedState = (mobileMenu: HTMLElement) => {
		mobileMenu.setAttribute('aria-hidden', 'true');
		syncMenuToggleButtons(false);
		dispatchSiteNavLayoutChange();
	};

	const applyMenuOpenState = (mobileMenu: HTMLElement) => {
		mobileMenu.hidden = false;
		mobileMenu.setAttribute('aria-hidden', 'false');
		document.documentElement.dataset.mobileMenuOpen = 'true';
		delete document.documentElement.dataset.mobileMenuClosing;
		syncMenuToggleButtons(true);
		dispatchSiteNavLayoutChange();
	};

	const setMenuOpenImmediate = (isOpen: boolean) => {
		const mobileMenu = document.querySelector('[data-site-mobile-menu]');

		if (!(mobileMenu instanceof HTMLElement)) {
			return;
		}

		menuClosePromise = null;
		delete document.documentElement.dataset.mobileMenuClosing;

		if (isOpen) {
			syncMobileHeaderPlaceholder(true);
			acquirePreservedScrollbar(PRESERVE_SCROLLBAR_REASON);
			applyMenuOpenState(mobileMenu);
			return;
		}

		delete document.documentElement.dataset.mobileMenuOpen;
		syncMobileHeaderPlaceholder(false);
		releasePreservedScrollbar(PRESERVE_SCROLLBAR_REASON);
		applyMenuClosedState(mobileMenu);
	};

	const beginMenuClose = (): Promise<void> => {
		const mobileMenu = document.querySelector('[data-site-mobile-menu]');

		if (!(mobileMenu instanceof HTMLElement)) {
			return Promise.resolve();
		}

		if (!isMenuOpen() && !isMenuClosing()) {
			return Promise.resolve();
		}

		if (menuClosePromise) {
			return menuClosePromise;
		}

		delete document.documentElement.dataset.mobileMenuOpen;
		document.documentElement.dataset.mobileMenuClosing = 'true';
		applyMenuClosedState(mobileMenu);

		if (!isMobileMenuViewport()) {
			finishMenuClose();
			return Promise.resolve();
		}

		menuClosePromise = waitForPaneClose().then(finishMenuClose);
		return menuClosePromise;
	};

	const openMenu = () => {
		if (isMenuClosing()) {
			menuClosePromise = null;
			delete document.documentElement.dataset.mobileMenuClosing;
		}

		const mobileMenu = document.querySelector('[data-site-mobile-menu]');

		if (!(mobileMenu instanceof HTMLElement)) {
			return;
		}

		syncMobileHeaderPlaceholder(true);
		acquirePreservedScrollbar(PRESERVE_SCROLLBAR_REASON);
		applyMenuOpenState(mobileMenu);

		if (!isMobileMenuViewport() || menuHistoryPushed) {
			return;
		}

		history.pushState({ siteMobileMenu: true }, '', window.location.href);
		menuHistoryPushed = true;
	};

	const releaseMenuHistoryEntry = () => {
		if (!menuHistoryPushed) {
			return;
		}

		menuHistoryPushed = false;

		if (history.state?.siteMobileMenu) {
			history.replaceState(null, '', window.location.href);
		}
	};

	const closeMenu = ({ fromPopstate = false, immediate = false } = {}) => {
		if (!isMenuOpen() && !isMenuClosing()) {
			return;
		}

		if (immediate) {
			setMenuOpenImmediate(false);
		} else {
			void beginMenuClose();
		}

		if (fromPopstate) {
			menuHistoryPushed = false;
		} else {
			releaseMenuHistoryEntry();
		}
	};

	window.__siteMobileMenuCloseForNavigation = () => beginMenuClose();

	const resetMobileMenuAfterNavigation = () => {
		releaseMenuHistoryEntry();
		setMenuOpenImmediate(false);
	};

	window.addEventListener('popstate', () => {
		if (!isMenuOpen()) {
			return;
		}

		// Same-URL traverse is neutralized by initSiteSameDocumentTraverseGuard.
		closeMenu({ fromPopstate: true });
	});

	document.addEventListener('click', (event) => {
		const target = event.target;

		if (!(target instanceof Element)) {
			return;
		}

		const toggleButton = target.closest('[data-site-menu-toggle]');
		const dimmer = target.closest('[data-site-mobile-dimmer]');
		const pageHeader = target.closest('[data-site-header]');
		const pageMain = target.closest('main');
		const pageFooter = target.closest('footer');

		if (toggleButton) {
			const isCurrentlyOpen = toggleButton.getAttribute('aria-expanded') === 'true';

			if (isCurrentlyOpen) {
				closeMenu();
			} else {
				openMenu();
			}

			return;
		}

		if (
			isMenuOpen()
			&& (dimmer || pageHeader || pageMain || pageFooter)
		) {
			closeMenu();
			return;
		}

		if (target.closest('[data-site-menu-link]') && isMenuOpen()) {
			const menuLink = target.closest('a[href]');

			if (menuLink instanceof HTMLAnchorElement) {
				try {
					const url = new URL(menuLink.href, window.location.href);

					if (
						url.origin === window.location.origin
						&& (
							url.pathname !== window.location.pathname
							|| url.search !== window.location.search
							|| url.hash !== window.location.hash
						)
					) {
						return;
					}
				} catch {
					// Fall through to close the menu.
				}
			}

			closeMenu();
			return;
		}

		if (target.closest('[data-site-menu-close]')) {
			closeMenu();
		}
	});

	window.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && isMenuOpen()) {
			closeMenu();
		}
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth >= 768) {
			closeMenu({ immediate: true });
			return;
		}

		if (isMenuOpen() || isMenuClosing()) {
			syncMobileHeaderPlaceholder(true);
		}
	}, { passive: true });

	window.addEventListener('pageshow', (event) => {
		if (event.persisted) {
			menuHistoryPushed = false;
			setMenuOpenImmediate(false);
		}
	});

	registerAfterSwap(resetMobileMenuAfterNavigation, true);
}
