import { describe, expect, it } from 'vitest';
import {
	OUT_OF_SITE_SCHEME_VERSION,
	buildCanonicalOutOfSiteMessage,
} from './out-of-site-payload.mjs';

describe('out-of-site-payload', () => {
	it('builds the canonical v1|kind|toHref message', () => {
		expect(OUT_OF_SITE_SCHEME_VERSION).toBe('v1');
		expect(
			buildCanonicalOutOfSiteMessage({
				kind: 'ssr',
				toHref: 'https://example.com/path',
			}),
		).toBe('v1|ssr|https://example.com/path');
		expect(
			buildCanonicalOutOfSiteMessage({
				kind: 'giscus',
				toHref: 'https://example.com/',
			}),
		).toBe('v1|giscus|https://example.com/');
	});
});
