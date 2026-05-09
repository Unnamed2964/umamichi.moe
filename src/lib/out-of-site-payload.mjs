/**
 * Canonical UTF-8 string: Ed25519 (`sig`, `kind=ssr` only) and symmetric HMAC-SHA256 (`hash`, both kinds) use the same message.
 * Keep in sync with `rehype-out-of-site-links.mjs` and `/out-of-site` verification.
 */
export const OUT_OF_SITE_SCHEME_VERSION = 'v1';

/** @param {{ kind: string; toHref: string }} parts */
export function buildCanonicalOutOfSiteMessage(parts) {
	return `${OUT_OF_SITE_SCHEME_VERSION}|${parts.kind}|${parts.toHref}`;
}
