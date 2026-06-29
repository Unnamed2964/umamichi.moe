export function syncSiteThemeColor(targetDocument: Document = document): void {
	const header = targetDocument.querySelector('[data-site-header]');

	if (!(header instanceof HTMLElement)) {
		return;
	}

	const color = getComputedStyle(header).backgroundColor;

	if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
		return;
	}

	let meta = targetDocument.querySelector('meta[name="theme-color"]');

	if (!meta) {
		meta = targetDocument.createElement('meta');
		meta.setAttribute('name', 'theme-color');
		targetDocument.head.append(meta);
	}

	meta.setAttribute('content', color);
}
