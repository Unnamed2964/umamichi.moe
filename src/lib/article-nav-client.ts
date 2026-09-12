import { registerAfterSwap } from './view-transition-lifecycle';

let initialized = false;

function isCurrentLinkVisible(scrollContainer: HTMLElement, currentLink: HTMLElement): boolean {
	const containerRect = scrollContainer.getBoundingClientRect();
	const linkRect = currentLink.getBoundingClientRect();

	return linkRect.top >= containerRect.top && linkRect.bottom <= containerRect.bottom;
}

function scrollArticleNavToCurrent(): void {
	for (const nav of document.querySelectorAll('nav[aria-label="文章列表"]')) {
		const scrollContainer = nav.querySelector('.site-sidebar-scroll');
		const currentLink = nav.querySelector('[aria-current="page"]');

		if (!(scrollContainer instanceof HTMLElement) || !(currentLink instanceof HTMLElement)) {
			continue;
		}

		if (isCurrentLinkVisible(scrollContainer, currentLink)) {
			continue;
		}

		const containerRect = scrollContainer.getBoundingClientRect();
		const linkRect = currentLink.getBoundingClientRect();
		const targetScrollTop =
			scrollContainer.scrollTop +
			(linkRect.top - containerRect.top) -
			(scrollContainer.clientHeight - linkRect.height) / 2;

		scrollContainer.scrollTop = Math.max(0, targetScrollTop);
	}
}

export function initArticleNavClient(): void {
	if (initialized) {
		return;
	}
	initialized = true;

	registerAfterSwap(scrollArticleNavToCurrent);
}
