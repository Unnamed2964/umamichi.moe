/**
 * Metro-style running line alignment for header and mobile nav icons.
 */
import { getMetroNavIconTone, isActiveLink, type MetroNavIconTone } from './site-frame';
import { registerAfterSwap } from './view-transition-lifecycle';

const INIT_KEY = '__siteNavRunningLineInit';

function isActiveNavHref(href: string | null, currentPath: string): boolean {
	if (!href) {
		return false;
	}

	return isActiveLink(href, currentPath);
}

function applyNavIconTone(navIcon: Element, tone: MetroNavIconTone): void {
	if (!(navIcon instanceof HTMLElement)) {
		return;
	}

	navIcon.dataset.navIconTone = tone;

	if (tone === 'current') {
		navIcon.dataset.navIconCurrent = 'true';
	} else {
		delete navIcon.dataset.navIconCurrent;
	}

	const svg = navIcon.querySelector('svg');

	if (svg instanceof SVGElement) {
		svg.style.color = tone === 'future'
			? 'var(--site-nav-future-icon)'
			: 'var(--site-nav-running-line-bg)';
	}
}

function syncLinkActiveState(
	link: HTMLAnchorElement,
	active: boolean,
	activeDatasetKey: 'navActiveItem' | 'mobileNavActiveItem',
): void {
	if (active) {
		link.dataset[activeDatasetKey] = 'true';
		link.setAttribute('aria-current', 'page');
	} else {
		delete link.dataset[activeDatasetKey];
		link.removeAttribute('aria-current');
	}

	link.style.removeProperty('color');
	link.style.removeProperty('font-weight');
}

export function initSiteNavRunningLine(): void {
	if (typeof window === 'undefined' || (window as unknown as Record<string, boolean>)[INIT_KEY]) {
		return;
	}
	(window as unknown as Record<string, boolean>)[INIT_KEY] = true;

	let navItems: Element[] = [];
	let navIcons: Element[] = [];
	let activeNavItem: Element | null = null;
	let runningLine: HTMLElement | null = null;
	let siteHeader: HTMLElement | null = null;
	let mobileNavItems: Element[] = [];
	let mobileNavIcons: Element[] = [];
	let mobileActiveNavItem: Element | null = null;
	let mobileRunningLine: HTMLElement | null = null;
	let mobileMenu: HTMLElement | null = null;
	let navUpdateFrame = 0;

	const syncPersistedHeaderNavState = (currentPath: string): void => {
		for (const link of document.querySelectorAll('[data-nav-item]')) {
			if (!(link instanceof HTMLAnchorElement)) {
				continue;
			}

			syncLinkActiveState(
				link,
				isActiveNavHref(link.getAttribute('href'), currentPath),
				'navActiveItem',
			);
		}

		for (const link of document.querySelectorAll('[data-mobile-nav-item]')) {
			if (!(link instanceof HTMLAnchorElement)) {
				continue;
			}

			syncLinkActiveState(
				link,
				isActiveNavHref(link.getAttribute('href'), currentPath),
				'mobileNavActiveItem',
			);
		}

		const desktopNavItems = Array.from(document.querySelectorAll('[data-nav-item]'));
		const activeNavIndex = desktopNavItems.findIndex(
			(item) => item instanceof HTMLElement && item.dataset.navActiveItem !== undefined,
		);

		for (const [index, navIcon] of Array.from(document.querySelectorAll('[data-nav-icon]')).entries()) {
			applyNavIconTone(navIcon, getMetroNavIconTone(index, activeNavIndex));
		}

		for (const [index, navIcon] of Array.from(document.querySelectorAll('[data-mobile-nav-icon]')).entries()) {
			const tone = getMetroNavIconTone(index, activeNavIndex);
			const svg = navIcon.querySelector('svg');

			if (svg instanceof SVGElement) {
				svg.style.color = tone === 'future'
					? 'var(--site-nav-future-icon)'
					: 'var(--site-nav-running-line-bg)';
			}
		}
	};

	const resolveNavElements = (): void => {
		navItems = Array.from(document.querySelectorAll('[data-nav-item]'));
		navIcons = Array.from(document.querySelectorAll('[data-nav-icon]'));
		activeNavItem = document.querySelector('[data-nav-active-item]');
		runningLine = document.querySelector('[data-nav-running-line]');
		siteHeader = document.querySelector('[data-site-header]');
		mobileNavItems = Array.from(document.querySelectorAll('[data-mobile-nav-item]'));
		mobileNavIcons = Array.from(document.querySelectorAll('[data-mobile-nav-icon]'));
		mobileActiveNavItem = document.querySelector('[data-mobile-nav-active-item]');
		mobileRunningLine = document.querySelector('[data-mobile-nav-running-line]');
		mobileMenu = document.querySelector('[data-site-mobile-menu]');
	};

	const updateDesktopIcons = (headerRect: DOMRect): void => {
		navIcons.forEach((navIcon, index) => {
			const navItem = navItems[index];

			if (!(navItem instanceof HTMLElement) || !(navIcon instanceof HTMLElement)) {
				return;
			}

			const rect = navItem.getBoundingClientRect();
			const anchorX = (rect.left + rect.right) / 2;
			navIcon.style.left = `${anchorX - headerRect.left}px`;
		});
	};

	const updateDesktopRunningLine = (headerRect: DOMRect): void => {
		if (!(activeNavItem instanceof HTMLElement) || !runningLine) {
			return;
		}

		const rect = activeNavItem.getBoundingClientRect();
		const anchorX = (rect.left + rect.right) / 2;
		const nextWidth = Math.max(0, anchorX - headerRect.left);
		runningLine.style.width = `${nextWidth}px`;
	};

	const updateMobileRunningLine = (): void => {
		if (!(mobileMenu instanceof HTMLElement)) {
			return;
		}

		const menuRect = mobileMenu.getBoundingClientRect();

		if (menuRect.width === 0 && menuRect.height === 0) {
			return;
		}

		mobileNavIcons.forEach((navIcon, index) => {
			const navItem = mobileNavItems[index];

			if (!(navItem instanceof HTMLElement) || !(navIcon instanceof HTMLElement)) {
				return;
			}

			const rect = navItem.getBoundingClientRect();
			const anchorY = (rect.top + rect.bottom) / 2;
			navIcon.style.top = `${anchorY - menuRect.top}px`;
		});

		if (mobileActiveNavItem instanceof HTMLElement && mobileRunningLine) {
			const rect = mobileActiveNavItem.getBoundingClientRect();
			const anchorY = (rect.top + rect.bottom) / 2;
			mobileRunningLine.style.height = `${anchorY - menuRect.top}px`;
		}
	};

	const updateNavRunningLine = (): void => {
		navUpdateFrame = 0;

		if (siteHeader) {
			const headerRect = siteHeader.getBoundingClientRect();
			updateDesktopIcons(headerRect);
			updateDesktopRunningLine(headerRect);
		}

		updateMobileRunningLine();
	};

	const scheduleNavRunningLineUpdate = (): void => {
		if (!navUpdateFrame) {
			navUpdateFrame = requestAnimationFrame(updateNavRunningLine);
		}
	};

	resolveNavElements();
	syncPersistedHeaderNavState(window.location.pathname);
	scheduleNavRunningLineUpdate();

	registerAfterSwap(() => {
		syncPersistedHeaderNavState(window.location.pathname);
		resolveNavElements();
		scheduleNavRunningLineUpdate();
	});

	document.addEventListener('site:nav-layout-change', scheduleNavRunningLineUpdate);
	window.addEventListener('resize', scheduleNavRunningLineUpdate, { passive: true });
	window.visualViewport?.addEventListener('resize', scheduleNavRunningLineUpdate, { passive: true });
}
