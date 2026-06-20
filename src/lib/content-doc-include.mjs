import umamichiConfig from '../../umamichi.config.mjs';

/** @type {string[]} */
export const excludeDocGlobs = umamichiConfig.content.excludeDocGlobs;

/** @param {string} glob */
function globToRegExp(glob) {
	const normalized = glob.replace(/\\/g, '/');
	const escaped = normalized
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*\*/g, '<<<GLOBSTAR>>>')
		.replace(/\*/g, '[^/]*')
		.replace(/<<<GLOBSTAR>>>/g, '.*');

	return new RegExp(`^${escaped}$`);
}

/** @type {RegExp[]} */
const excludeDocPatterns = excludeDocGlobs.map(globToRegExp);

/**
 * Whether a path under src/content should participate in the docs collection and site routing.
 * @param {string} relativePath path relative to src/content, e.g. `blog/post.md`
 */
export function isIncludedContentDoc(relativePath) {
	const normalized = relativePath.replace(/\\/g, '/');
	return !excludeDocPatterns.some((pattern) => pattern.test(normalized));
}
