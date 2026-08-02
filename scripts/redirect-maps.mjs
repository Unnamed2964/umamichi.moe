import { stripLeadingSlashes, stripTrailingSlashes } from '../src/lib/path-slashes.mjs';

/**
 * MkDocs-style content doc path → site route (directory URL with trailing slash).
 * @param {string} docPath relative to src/content, e.g. `blog/post.md`
 */
export function contentDocPathToRoutePath(docPath) {
	const normalized = docPath.replaceAll('\\', '/').replace(/^\.\//, '');
	const withoutExt = normalized.replace(/\.mdx?$/u, '');

	if (withoutExt === 'index') {
		return '/';
	}

	if (withoutExt.endsWith('/index')) {
		const folder = withoutExt.slice(0, -'/index'.length);
		return folder ? `/${folder}/` : '/';
	}

	return `/${withoutExt}/`;
}

/**
 * Encode each path segment for Cloudflare `_redirects` (space-separated tokens).
 * Literal spaces would otherwise split one destination into multiple tokens.
 * @param {string} routePath site path, e.g. `/blog/yanji-hambuk intercity/post/`
 */
export function encodeRoutePathForRedirects(routePath) {
	return routePath
		.split('/')
		.map((segment) => (segment === '' ? '' : encodeURIComponent(segment)))
		.join('/');
}

/**
 * @param {string} target redirect target (content-relative .md/.mdx path or http(s) URL)
 */
export function isExternalRedirectTarget(target) {
	return /^https?:\/\//iu.test(target);
}

/**
 * Join content root with a content-relative path using `/` separators.
 * @param {string} contentRoot
 * @param {string} relativePath
 */
export function resolveContentPath(contentRoot, relativePath) {
	const root = stripTrailingSlashes(contentRoot.replaceAll('\\', '/'));
	const rel = stripLeadingSlashes(relativePath.replaceAll('\\', '/'));
	return `${root}/${rel}`;
}

/**
 * Build Astro `redirects` from MkDocs-style `redirect_maps`.
 * Keys/values for internal targets are Markdown paths relative to `src/content`.
 *
 * @param {Record<string, string>} redirectMaps
 * @param {{
 *   contentRoot: string;
 *   exists: (absolutePath: string) => boolean;
 *   status?: number;
 * }} options
 * @returns {Record<string, string | { status: number; destination: string }>}
 */
export function buildAstroRedirectsFromMaps(redirectMaps, options) {
	const { contentRoot, exists, status = 301 } = options;
	/** @type {Record<string, string | { status: number; destination: string }>} */
	const redirects = {};

	for (const [fromDoc, toTarget] of Object.entries(redirectMaps)) {
		const fromRoute = encodeRoutePathForRedirects(contentDocPathToRoutePath(fromDoc));
		const destination = isExternalRedirectTarget(toTarget)
			? toTarget
			: encodeRoutePathForRedirects(contentDocPathToRoutePath(toTarget));

		if (!isExternalRedirectTarget(toTarget)) {
			const targetAbs = resolveContentPath(contentRoot, toTarget);
			if (!exists(targetAbs)) {
				throw new Error(
					`redirect_maps target does not exist: '${toTarget}' (from '${fromDoc}')`,
				);
			}
		}

		const sourceAbs = resolveContentPath(contentRoot, fromDoc);
		if (exists(sourceAbs)) {
			throw new Error(
				`redirect_maps source still exists as a content file and would take precedence over the redirect: '${fromDoc}'`,
			);
		}

		redirects[fromRoute] = status === 301 ? destination : { status, destination };
	}

	return redirects;
}
