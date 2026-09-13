/** Parse a CSS time (first list item) to milliseconds. */
export function parseCssDurationToMs(value: string): number | null {
	const first = value.split(',')[0]?.trim();

	if (!first) {
		return null;
	}

	if (first.endsWith('ms')) {
		return Number.parseFloat(first);
	}

	if (first.endsWith('s')) {
		return Number.parseFloat(first) * 1000;
	}

	return null;
}

export function readRootCssDurationMs(customProperty: string): number | null {
	return parseCssDurationToMs(
		getComputedStyle(document.documentElement).getPropertyValue(customProperty),
	);
}

/** Used px of `--site-floating-inset`. */
export function readFloatingInsetPx(): number {
	return Number.parseFloat(
		getComputedStyle(document.documentElement).getPropertyValue('--site-floating-inset'),
	);
}
