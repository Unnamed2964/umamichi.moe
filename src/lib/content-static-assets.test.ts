import { describe, expect, it } from 'vitest';
import { shouldPublishContentAsset } from '../integrations/content-static-assets.mjs';

describe('shouldPublishContentAsset', () => {
	it('publishes imgs and files under content', () => {
		expect(shouldPublishContentAsset('blog/imgs/plan.webp')).toBe(true);
		expect(shouldPublishContentAsset('blog/files/data.json')).toBe(true);
	});

	it('skips markdown and dotfiles', () => {
		expect(shouldPublishContentAsset('blog/post.md')).toBe(false);
		expect(shouldPublishContentAsset('blog/post.mdx')).toBe(false);
		expect(shouldPublishContentAsset('blog/.meta.yml')).toBe(false);
		expect(shouldPublishContentAsset('.meta.yml')).toBe(false);
	});
});
