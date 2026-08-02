import umamichiConfig from '../../umamichi.config.mjs';

/** @type {string[]} */
export const excludeDocGlobs = umamichiConfig.content.excludeDocGlobs;

/** @param {string} glob */
function globToRegExp(glob) {
	const normalized = glob.replaceAll('\\', '/');
	const escaped = normalized
		.replaceAll(/[.+^${}()|[\]\\]/g, '\\$&')
		.replaceAll('**', '<<<GLOBSTAR>>>')
		.replaceAll('*', '[^/]*')
		.replaceAll('<<<GLOBSTAR>>>', '.*');

	return new RegExp(`^${escaped}$`);
}

/** @type {RegExp[]} */
const excludeDocPatterns = excludeDocGlobs.map(globToRegExp);

/**
 * Whether a path under src/content should participate in the docs collection and site routing.
 * @param {string} relativePath path relative to src/content, e.g. `blog/post.md`
 */
export function isIncludedContentDoc(relativePath) {
	const normalized = relativePath.replaceAll('\\', '/');
	return !excludeDocPatterns.some((pattern) => pattern.test(normalized));
}
