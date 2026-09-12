import { isMobileMenuViewport, waitForPaneClose } from './site-mobile-menu-pane.ts';
import { acquirePreservedScrollbar, releasePreservedScrollbar } from './site-preserve-scrollbar.ts';
import { dispatchSiteNavLayoutChange } from './site-events';
import { registerAfterSwap } from './view-transition-lifecycle';

const INIT_KEY = '__siteMobileMenuInit';
const PRESERVE_SCROLLBAR_REASON = 'mobile-menu';

interface CloseWatcherInstance extends EventTarget {
	requestClose(): void;
	close(): void;
	destroy(): void;
	oncancel: ((event: Event) => void) | null;
	onclose: ((event: Event) => void) | null;
}

type CloseWatcherConstructor = new (options?: { signal?: AbortSignal }) => CloseWatcherInstance;

declare global {
	interface Window {
		CloseWatcher?: CloseWatcherConstructor;
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

	let menuClosePromise: Promise<void> | null = null;
	let closeWatcher: CloseWatcherInstance | null = null;

	const createCloseWatcher = () => {
		if (typeof window.CloseWatcher === 'undefined' || !isMobileMenuViewport()) {
			return;
		}

		closeWatcher?.destroy();
		closeWatcher = new window.CloseWatcher();
		closeWatcher.onclose = () => {
			closeWatcher = null;
			closeMenu();
		};
	};

	const destroyCloseWatcher = () => {
		if (closeWatcher) {
			closeWatcher.destroy();
			closeWatcher = null;
		}
	};

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
		createCloseWatcher();
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

		destroyCloseWatcher();
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

		destroyCloseWatcher();

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
	};

	const closeMenu = ({ immediate = false } = {}) => {
		if (!isMenuOpen() && !isMenuClosing()) {
			return;
		}

		destroyCloseWatcher();

		if (immediate) {
			setMenuOpenImmediate(false);
		} else {
			void beginMenuClose();
		}
	};

	const resetMobileMenuAfterNavigation = () => {
		destroyCloseWatcher();
		setMenuOpenImmediate(false);
	};

	const toggleMenuFromButton = (toggleButton: Element) => {
		const isCurrentlyOpen = toggleButton.getAttribute('aria-expanded') === 'true';

		if (isCurrentlyOpen) {
			closeMenu();
			return;
		}

		openMenu();
	};

	const shouldCloseFromDismissTarget = (target: Element) => {
		if (!isMenuOpen()) {
			return false;
		}

		return Boolean(
			target.closest('[data-site-mobile-dimmer]')
			|| target.closest('[data-site-header]')
			|| target.closest('main')
			|| target.closest('footer'),
		);
	};

	document.addEventListener('click', (event) => {
		const target = event.target;

		if (!(target instanceof Element)) {
			return;
		}

		const toggleButton = target.closest('[data-site-menu-toggle]');

		if (toggleButton) {
			toggleMenuFromButton(toggleButton);
			return;
		}

		if (shouldCloseFromDismissTarget(target)) {
			closeMenu();
			return;
		}

		if (target.closest('[data-site-menu-link]') && isMenuOpen()) {
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
			destroyCloseWatcher();
			setMenuOpenImmediate(false);
		}
	});

	registerAfterSwap(resetMobileMenuAfterNavigation, true);
}
