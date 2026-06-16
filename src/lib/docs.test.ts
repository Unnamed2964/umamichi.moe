import { describe, expect, it } from 'vitest';
import {
	buildDocsStructure,
	getFolderListData,
	scanContentFromInput,
	toTagHref,
	toTagSlug,
} from './docs';
import { minimalBlogFixture, mockDocEntry } from './docs.test-fixtures';

describe('scanContentFromInput', () => {
	it('rejects duplicate entry ids', () => {
		expect(() =>
			scanContentFromInput({
				docs: [
					{ relativePath: 'blog/a.md' },
					{ relativePath: 'blog/a.mdx' },
				],
			}),
		).toThrow(/Multiple content files resolve to the same entry id blog\/a/);
	});

	it('rejects both index.md and index.mdx in one folder', () => {
		expect(() =>
			scanContentFromInput({
				docs: [
					{ relativePath: 'blog/index.md' },
					{ relativePath: 'blog/index.mdx' },
				],
			}),
		).toThrow(/cannot contain both index.md and index.mdx/);
	});
});

describe('toTagSlug / toTagHref', () => {
	it('encodes trimmed tag names', () => {
		expect(toTagSlug(' 轨道交通 ')).toBe(encodeURIComponent('轨道交通'));
		expect(toTagHref('白日梦')).toBe(`/tag/${encodeURIComponent('白日梦')}/`);
	});
});

describe('buildDocsStructure (injectable scan)', () => {
	it('builds from a minimal fake content tree without reading the full repo', () => {
		const { scan, entries } = minimalBlogFixture();
		const structure = buildDocsStructure(entries, scanContentFromInput(scan));

		expect(structure.entryRouteMap.get('blog/post-b')).toBe('blog/post-b');
		expect(structure.topLevelNavItems.map((item) => item.label)).toEqual(['主页', '文章']);
	});

	it('works with only one doc when scan is injected', () => {
		const scan = { docs: [{ relativePath: 'index.md' }] };
		const entries = [mockDocEntry('index', { title: '主页' })];

		expect(() => buildDocsStructure(entries, scanContentFromInput(scan))).not.toThrow();
	});

	it('sorts blog posts by pubDate descending', () => {
		const { scan, entries } = minimalBlogFixture();
		const structure = buildDocsStructure(entries, scanContentFromInput(scan));
		const blogList = getFolderListData(structure, 'blog');

		const titles = blogList.childItems.filter((item) => item.kind === 'doc').map((item) => item.title);

		expect(titles).toEqual(['乙', '甲']);
	});

	it('assigns folder icons only to depth-1 folders', () => {
		const { scan, entries } = minimalBlogFixture();
		const structure = buildDocsStructure(entries, scanContentFromInput(scan));
		const blogNav = structure.topLevelNavItems.find((item) => item.folderPath === 'blog');

		expect(blogNav?.icon).toBe('transfer');
	});

	it('collects trimmed tag routes', () => {
		const { scan, entries } = minimalBlogFixture();
		const structure = buildDocsStructure(entries, scanContentFromInput(scan));
		const sampleTag = structure.tagRoutes.find((route) => route.tag === '示例');

		expect(sampleTag?.items.some((item) => item.id === 'blog/post-b')).toBe(true);
	});

	it('throws when an entry id is missing from the collection', () => {
		const { scan, entries } = minimalBlogFixture();
		const incomplete = entries.filter((entry) => entry.id !== 'blog/post-b');

		expect(() => buildDocsStructure(incomplete, scanContentFromInput(scan))).toThrow(
			/Unable to resolve content entry for blog\/post-b/,
		);
	});

	it('throws on duplicate fix-order within a folder', () => {
		const scan = {
			docs: [
				{ relativePath: 'index.md' },
				{ relativePath: 'blog/index.mdx' },
				{ relativePath: 'blog/a.md' },
				{ relativePath: 'blog/b.md' },
			],
			folderMetas: [{ folderPath: 'blog', rawContent: 'fix-order: -1\n' }],
		};
		const entries = [
			mockDocEntry('index', { title: '主页' }),
			mockDocEntry('blog', { title: '文章' }),
			mockDocEntry('blog/a', { title: 'A', 'fix-order': -1 }),
			mockDocEntry('blog/b', { title: 'B', 'fix-order': -1 }),
		];

		expect(() => buildDocsStructure(entries, scanContentFromInput(scan))).toThrow(/duplicate fix-order -1/);
	});

	it('generates a folder list page when a folder has no index doc', () => {
		const scan = {
			docs: [
				{ relativePath: 'index.md' },
				{ relativePath: 'drafts/idea-a.md' },
			],
			folderMetas: [{ folderPath: 'drafts', rawContent: 'title: 草稿\n' }],
		};
		const entries = [
			mockDocEntry('index', { title: '主页' }),
			mockDocEntry('drafts/idea-a', { title: '想法 A' }),
		];
		const structure = buildDocsStructure(entries, scanContentFromInput(scan));
		const draftsList = getFolderListData(structure, 'drafts');

		expect(draftsList.childItems).toHaveLength(1);
		expect(draftsList.childItems[0]?.title).toBe('想法 A');
		expect(structure.routes.some((route) => 'generatedPage' in route && route.routePath === 'drafts')).toBe(true);
	});
});

describe('getFolderListData', () => {
	it('throws for unknown folders', () => {
		const { scan, entries } = minimalBlogFixture();
		const structure = buildDocsStructure(entries, scanContentFromInput(scan));

		expect(() => getFolderListData(structure, 'missing')).toThrow(/Unable to resolve folder list data/);
	});
});
