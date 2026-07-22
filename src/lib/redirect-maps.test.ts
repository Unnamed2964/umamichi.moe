import { describe, expect, it } from 'vitest';
import {
	buildAstroRedirectsFromMaps,
	contentDocPathToRoutePath,
	isExternalRedirectTarget,
	resolveContentPath,
} from '../../scripts/redirect-maps.mjs';

describe('contentDocPathToRoutePath', () => {
	it('maps ordinary docs to directory URLs', () => {
		expect(contentDocPathToRoutePath('blog/post.md')).toBe('/blog/post/');
		expect(contentDocPathToRoutePath('blog/folder/post.mdx')).toBe('/blog/folder/post/');
	});

	it('maps index docs to the folder URL', () => {
		expect(contentDocPathToRoutePath('index.md')).toBe('/');
		expect(contentDocPathToRoutePath('blog/index.md')).toBe('/blog/');
	});

	it('keeps spaces in content paths', () => {
		expect(contentDocPathToRoutePath('blog/yanji-hambuk intercity/post.md')).toBe(
			'/blog/yanji-hambuk intercity/post/',
		);
	});
});

describe('isExternalRedirectTarget', () => {
	it('detects http(s) targets', () => {
		expect(isExternalRedirectTarget('https://example.com/a')).toBe(true);
		expect(isExternalRedirectTarget('http://example.com/a')).toBe(true);
		expect(isExternalRedirectTarget('blog/post.md')).toBe(false);
	});
});

describe('buildAstroRedirectsFromMaps', () => {
	const contentRoot = '/content';
	const existing = new Set([
		resolveContentPath(contentRoot, 'blog/yanji-hambuk intercity/yanji-rail-transit-imaginary.md'),
	]);

	it('builds 301 redirects for existing internal targets', () => {
		const redirects = buildAstroRedirectsFromMaps(
			{
				'blog/yanji-rail-transit-imaginary.md':
					'blog/yanji-hambuk intercity/yanji-rail-transit-imaginary.md',
			},
			{
				contentRoot,
				exists: (path) => existing.has(path),
			},
		);

		expect(redirects).toEqual({
			'/blog/yanji-rail-transit-imaginary/':
				'/blog/yanji-hambuk intercity/yanji-rail-transit-imaginary/',
		});
	});

	it('passes through external destinations', () => {
		const redirects = buildAstroRedirectsFromMaps(
			{
				'blog/gone.md': 'https://example.com/elsewhere',
			},
			{
				contentRoot,
				exists: () => false,
			},
		);

		expect(redirects).toEqual({
			'/blog/gone/': 'https://example.com/elsewhere',
		});
	});

	it('throws when an internal target is missing', () => {
		expect(() =>
			buildAstroRedirectsFromMaps(
				{
					'blog/old.md': 'blog/does-not-exist.md',
				},
				{
					contentRoot,
					exists: () => false,
				},
			),
		).toThrow(/redirect_maps target does not exist/);
	});

	it('throws when the source content file still exists', () => {
		expect(() =>
			buildAstroRedirectsFromMaps(
				{
					'blog/yanji-rail-transit-imaginary.md':
						'blog/yanji-hambuk intercity/yanji-rail-transit-imaginary.md',
				},
				{
					contentRoot,
					exists: (path) =>
						path ===
							resolveContentPath(contentRoot, 'blog/yanji-rail-transit-imaginary.md') ||
						existing.has(path),
				},
			),
		).toThrow(/source still exists/);
	});
});
