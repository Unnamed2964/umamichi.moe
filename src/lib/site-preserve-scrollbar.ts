/**
 * Keep the viewport scrollbar visible while an overlay is open
 * (`html { overflow-y: scroll }` + fixed body), so layout width does not jump.
 * Background page scroll is frozen as a consequence of that technique—not the primary API goal.
 */

const holders = new Set<string>();
let preservedScrollY = 0;

function applyPreservedScrollbar(): void {
	preservedScrollY = window.scrollY;
	document.documentElement.style.setProperty('--site-preserve-scrollbar-y', `-${preservedScrollY}px`);
	document.documentElement.dataset.sitePreserveScrollbar = 'true';
}

function clearPreservedScrollbar(): void {
	delete document.documentElement.dataset.sitePreserveScrollbar;
	document.documentElement.style.removeProperty('--site-preserve-scrollbar-y');
	window.scrollTo(0, preservedScrollY);
}

export function acquirePreservedScrollbar(reason: string): void {
	if (typeof document === 'undefined') {
		return;
	}

	const wasEmpty = holders.size === 0;
	holders.add(reason);

	if (wasEmpty) {
		applyPreservedScrollbar();
	}
}

export function releasePreservedScrollbar(reason: string): void {
	if (typeof document === 'undefined') {
		return;
	}

	if (!holders.delete(reason) || holders.size > 0) {
		return;
	}

	clearPreservedScrollbar();
}
