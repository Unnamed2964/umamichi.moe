import { describe, expect, it } from 'vitest';
import {
	extractContentRelativePath,
	getContentFolderPath,
	resolveContentAssetPublicUrl,
} from '../../scripts/content-asset-urls.mjs';

describe('resolveContentAssetPublicUrl', () => {
	it('rewrites imgs and files relative to the markdown folder', () => {
		expect(resolveContentAssetPublicUrl('imgs/plan.webp', 'blog/yanji-rail-transit-imaginary.md')).toBe(
			'/blog/imgs/plan.webp',
		);
		expect(resolveContentAssetPublicUrl('files/data.json', 'blog/post.md')).toBe('/blog/files/data.json');
		expect(resolveContentAssetPublicUrl('imgs/foo.webp', 'index.md')).toBe('/imgs/foo.webp');
		expect(resolveContentAssetPublicUrl('imgs/foo.webp', 'tools/index.md')).toBe('/tools/imgs/foo.webp');
	});

	it('accepts ./ prefix and leaves other URLs unchanged', () => {
		expect(resolveContentAssetPublicUrl('./imgs/plan.webp', 'blog/post.md')).toBe('/blog/imgs/plan.webp');
		expect(resolveContentAssetPublicUrl('/blog/imgs/plan.webp', 'blog/post.md')).toBe('/blog/imgs/plan.webp');
		expect(resolveContentAssetPublicUrl('https://example.com/x.webp', 'blog/post.md')).toBe(
			'https://example.com/x.webp',
		);
		expect(resolveContentAssetPublicUrl('../other/page/', 'blog/post.md')).toBe('../other/page/');
	});
});

describe('extractContentRelativePath', () => {
	it('reads from vfile path or history', () => {
		expect(
			extractContentRelativePath({
				path: 'C:/project/src/content/blog/post.md',
			}),
		).toBe('blog/post.md');
		expect(
			extractContentRelativePath({
				history: ['C:\\project\\src\\content\\tools\\index.md'],
			}),
		).toBe('tools/index.md');
	});
});

describe('getContentFolderPath', () => {
	it('returns empty string for content root', () => {
		expect(getContentFolderPath('index.md')).toBe('');
		expect(getContentFolderPath('blog/post.md')).toBe('blog');
	});
});
