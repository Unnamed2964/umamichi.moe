/**
 * Slash trimming without regex — avoids Sonar S8786 (super-linear / ReDoS) on
 * patterns like /\/+$/ and /^\/+|\/+$/.
 */

/**
 * @param {string} value
 */
export function stripTrailingSlashes(value) {
	let end = value.length;
	while (end > 0 && value.codePointAt(end - 1) === 47 /* / */) {
		end -= 1;
	}
	return value.slice(0, end);
}

/**
 * @param {string} value
 */
export function stripLeadingSlashes(value) {
	let start = 0;
	while (start < value.length && value.codePointAt(start) === 47 /* / */) {
		start += 1;
	}
	return value.slice(start);
}

/**
 * @param {string} value
 */
export function stripEdgeSlashes(value) {
	return stripTrailingSlashes(stripLeadingSlashes(value));
}
