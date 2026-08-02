/**
 * Metro-style running line alignment for header and mobile nav icons.
 */
// Migrated from inline SiteChromeScripts; keep permissive while behavior stays gold.
// @ts-nocheck
import { stripTrailingSlashes } from './path-slashes.mjs';
import { onBeforePreparation, registerAfterSwap } from './view-transition-lifecycle';

const INIT_KEY = '__siteNavRunningLineInit';

export function initSiteNavRunningLine(): void {
	if (typeof window === 'undefined' || (window as unknown as Record<string, boolean>)[INIT_KEY]) {
		return;
	}
	(window as unknown as Record<string, boolean>)[INIT_KEY] = true;

let navItems = [], navIcons = [], activeNavItem = null, runningLine = null, reverseRunningLine = null, siteHeader = null;
let mobileNavItems = [], mobileNavIcons = [], mobileActiveNavItem = null, mobileRunningLine = null, mobileReverseRunningLine = null, mobileMenu = null;
let navUpdateFrame = 0;
let pendingWidthTransition = false;
let fromWidth = null;
let toWidth = null;
let pendingNavigationPath = null;
const transferIconBaselineY = 100;

function normalizeNavPath(path) {
	const trimmed = stripTrailingSlashes(path);
	return trimmed || '/';
}

function isActiveNavHref(href, currentPath) {
	if (!href) {
		return false;
	}

	const normalizedHref = normalizeNavPath(href);
	const normalizedCurrentPath = normalizeNavPath(currentPath);

	if (normalizedHref === '/') {
		return normalizedCurrentPath === '/';
	}

	return normalizedCurrentPath === normalizedHref || normalizedCurrentPath.startsWith(`${normalizedHref}/`);
}

function syncPersistedHeaderNavState(currentPath) {
	for (const link of document.querySelectorAll('[data-nav-item]')) {
		if (!(link instanceof HTMLAnchorElement)) {
			continue;
		}

		const active = isActiveNavHref(link.getAttribute('href'), currentPath);

		if (active) {
			link.setAttribute('data-nav-active-item', 'true');
			link.setAttribute('aria-current', 'page');
		} else {
			link.removeAttribute('data-nav-active-item');
			link.removeAttribute('aria-current');
		}

		link.style.removeProperty('color');
		link.style.removeProperty('font-weight');
	}

	for (const link of document.querySelectorAll('[data-mobile-nav-item]')) {
		if (!(link instanceof HTMLAnchorElement)) {
			continue;
		}

		const active = isActiveNavHref(link.getAttribute('href'), currentPath);

		if (active) {
			link.setAttribute('data-mobile-nav-active-item', 'true');
			link.setAttribute('aria-current', 'page');
		} else {
			link.removeAttribute('data-mobile-nav-active-item');
			link.removeAttribute('aria-current');
		}

		link.style.removeProperty('color');
		link.style.removeProperty('font-weight');
	}

	const desktopNavItems = Array.from(document.querySelectorAll('[data-nav-item]'));
	const activeNavIndex = desktopNavItems.findIndex((item) => item.hasAttribute('data-nav-active-item'));

	for (const [index, navIcon] of Array.from(document.querySelectorAll('[data-nav-icon]')).entries()) {
		const tone = index === activeNavIndex
			? 'current'
			: activeNavIndex !== -1 && index > activeNavIndex
				? 'future'
				: 'past';

		navIcon.setAttribute('data-nav-icon-tone', tone);

		if (tone === 'current') {
			navIcon.setAttribute('data-nav-icon-current', 'true');
		} else {
			navIcon.removeAttribute('data-nav-icon-current');
		}

		const svg = navIcon.querySelector('svg');

		if (svg instanceof SVGElement) {
			svg.style.color = tone === 'future'
				? 'var(--site-nav-future-icon)'
				: 'var(--site-nav-running-line-bg)';
		}
	}

	for (const [index, navIcon] of Array.from(document.querySelectorAll('[data-mobile-nav-icon]')).entries()) {
		const tone = index === activeNavIndex
			? 'current'
			: activeNavIndex !== -1 && index > activeNavIndex
				? 'future'
				: 'past';

		const svg = navIcon.querySelector('svg');

		if (svg instanceof SVGElement) {
			svg.style.color = tone === 'future'
				? 'var(--site-nav-future-icon)'
				: 'var(--site-nav-running-line-bg)';
		}
	}
}

function resolveNavTargetPath(event) {
	if (event && 'to' in event && typeof event.to === 'string') {
		return new URL(event.to, window.location.href).pathname;
	}

	return pendingNavigationPath ?? window.location.pathname;
}

document.addEventListener('click', (event) => {
	const target = event.target;

	if (!(target instanceof Element)) {
		return;
	}

	const anchor = target.closest('a[href]');

	if (!(anchor instanceof HTMLAnchorElement)) {
		return;
	}

	if (anchor.hasAttribute('download')) {
		return;
	}

	const href = anchor.getAttribute('href');

	if (!href || href.startsWith('#')) {
		return;
	}

	if (anchor.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
		return;
	}

	let url;

	try {
		url = new URL(anchor.href, window.location.href);
	} catch {
		return;
	}

	if (url.origin !== window.location.origin) {
		return;
	}

	pendingNavigationPath = url.pathname;
}, true);

function resolveNavElements() {
	navItems = Array.from(document.querySelectorAll('[data-nav-item]'));
	navIcons = Array.from(document.querySelectorAll('[data-nav-icon]'));
	activeNavItem = document.querySelector('[data-nav-active-item]');
	runningLine = document.querySelector('[data-nav-running-line]');
	reverseRunningLine = document.querySelector('[data-nav-running-line-reverse]');
	siteHeader = document.querySelector('[data-site-header]');
	mobileNavItems = Array.from(document.querySelectorAll('[data-mobile-nav-item]'));
	mobileNavIcons = Array.from(document.querySelectorAll('[data-mobile-nav-icon]'));
	mobileActiveNavItem = document.querySelector('[data-mobile-nav-active-item]');
	mobileRunningLine = document.querySelector('[data-mobile-nav-running-line]');
	mobileReverseRunningLine = document.querySelector('[data-mobile-nav-running-line-reverse]');
	mobileMenu = document.querySelector('[data-site-mobile-menu]');
}

function getSvgNavAnchorScreenPoint(svg) {
	const viewBox = svg.viewBox.baseVal;
	const matrix = svg.getScreenCTM();

	if (!matrix) {
		return null;
	}

	const point = svg.createSVGPoint();
	point.x = viewBox.x + viewBox.width / 2;
	point.y = viewBox.y + transferIconBaselineY;

	return point.matrixTransform(matrix);
}

function updateNavRunningLine() {
	navUpdateFrame = 0;

	if (siteHeader) {
		const headerRect = siteHeader.getBoundingClientRect();
		const runningLineRect = runningLine instanceof HTMLElement ? runningLine.getBoundingClientRect() : null;
		const navBottomY = runningLineRect && runningLineRect.height > 0 ? runningLineRect.bottom : headerRect.bottom;

		navIcons.forEach((navIcon, index) => {
			const navItem = navItems[index];
			const svg = navIcon.querySelector('svg');

			if (!navItem || !svg) {
				return;
			}

			const rect = navItem.getBoundingClientRect();
			const anchorX = (rect.left + rect.right) / 2;

			navIcon.style.transform = '';

			const baselinePoint = getSvgNavAnchorScreenPoint(svg);

			if (baselinePoint) {
				navIcon.style.transform = `translate(${anchorX - baselinePoint.x}px, ${navBottomY - baselinePoint.y}px)`;
			}
		});
	}

	if (activeNavItem && runningLine && siteHeader) {
		const rect = activeNavItem.getBoundingClientRect();
		const headerRect = siteHeader.getBoundingClientRect();
		const anchorX = (rect.left + rect.right) / 2;
		const nextWidth = Math.max(0, anchorX - headerRect.left);

		if (pendingWidthTransition && fromWidth !== null) {
			toWidth = nextWidth;
			runningLine.style.transition = 'none';
			runningLine.style.width = `${fromWidth}px`;

			requestAnimationFrame(() => {
				const currentRunningLine = runningLine;
				if (!(currentRunningLine instanceof HTMLElement)) {
					return;
				}

				const cleanup = (event) => {
					if (event.propertyName !== 'width') {
						return;
					}
					currentRunningLine.style.removeProperty('transition');
				};

				currentRunningLine.addEventListener('transitionend', cleanup, { once: true });
				currentRunningLine.style.transition = 'width 420ms cubic-bezier(0.22, 1, 0.36, 1)';
				currentRunningLine.style.width = `${toWidth}px`;
			});

			pendingWidthTransition = false;
			fromWidth = null;
		} else {
			runningLine.style.width = `${nextWidth}px`;
		}

		if (reverseRunningLine) {
			reverseRunningLine.style.left = `${nextWidth}px`;
			reverseRunningLine.style.width = `${headerRect.right - anchorX}px`;
		}
	}

	if (mobileMenu instanceof HTMLElement) {
		const menuRect = mobileMenu.getBoundingClientRect();

		if (menuRect.width === 0 && menuRect.height === 0) {
			return;
		}

		const lineRect = mobileRunningLine?.getBoundingClientRect();
		const anchorX = lineRect && (lineRect.width > 0 || lineRect.height > 0)
			? lineRect.right
			: menuRect.right;

		mobileNavIcons.forEach((navIcon, index) => {
			const navItem = mobileNavItems[index];
			const svg = navIcon.querySelector('svg');

			if (!navItem || !svg) {
				return;
			}

			const rect = navItem.getBoundingClientRect();
			const anchorY = (rect.top + rect.bottom) / 2;

			navIcon.style.transform = '';

			const baselinePoint = getSvgNavAnchorScreenPoint(svg);

			if (baselinePoint) {
				navIcon.style.transform = `translate(${anchorX - baselinePoint.x}px, ${anchorY - baselinePoint.y}px)`;
			}
		});

		if (mobileActiveNavItem && mobileRunningLine) {
			const rect = mobileActiveNavItem.getBoundingClientRect();
			const anchorY = (rect.top + rect.bottom) / 2;

			mobileRunningLine.style.height = `${anchorY - menuRect.top}px`;

			if (mobileReverseRunningLine) {
				mobileReverseRunningLine.style.top = `${anchorY - menuRect.top}px`;
				mobileReverseRunningLine.style.height = `${menuRect.bottom - anchorY}px`;
			}
		}
	}
}

function scheduleNavRunningLineUpdate() {
	if (!navUpdateFrame) {
		navUpdateFrame = requestAnimationFrame(updateNavRunningLine);
	}
}

resolveNavElements();
syncPersistedHeaderNavState(window.location.pathname);
scheduleNavRunningLineUpdate();

onBeforePreparation((event) => {
	const targetPath = resolveNavTargetPath(event);
	pendingNavigationPath = null;
	syncPersistedHeaderNavState(targetPath);
	resolveNavElements();

	const currentWidth = runningLine instanceof HTMLElement ? runningLine.getBoundingClientRect().width : 0;
	fromWidth = Number.isFinite(currentWidth) ? currentWidth : 0;
	pendingWidthTransition = true;
});

registerAfterSwap(() => {
	syncPersistedHeaderNavState(window.location.pathname);
	resolveNavElements();
	scheduleNavRunningLineUpdate();
});
document.addEventListener('site:nav-layout-change', scheduleNavRunningLineUpdate);

window.addEventListener('resize', scheduleNavRunningLineUpdate, { passive: true });
window.visualViewport?.addEventListener('resize', scheduleNavRunningLineUpdate, { passive: true });
}
