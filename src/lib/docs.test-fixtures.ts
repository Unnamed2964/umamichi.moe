import type { CollectionEntry } from 'astro:content';
import type { ContentScanInput } from './docs';

type DocEntry = CollectionEntry<'docs'>;

export function mockDocEntry(
	id: string,
	data: Partial<DocEntry['data']> & Pick<DocEntry['data'], 'title'>,
): DocEntry {
	return {
		id,
		collection: 'docs',
		body: '',
		slug: id,
		data: {
			tags: [],
			...data,
		},
	} as DocEntry;
}

export function minimalBlogFixture(): {
	entries: DocEntry[];
	scan: ContentScanInput;
} {
	const scan: ContentScanInput = {
		docs: [
			{ relativePath: 'index.md', rawContent: '---\ntitle: 主页\nfix-order: -5\n---\n' },
			{ relativePath: 'blog/index.mdx', rawContent: '---\ntitle: 文章\n---\n' },
			{ relativePath: 'blog/post-a.md', rawContent: '---\ntitle: 甲\npubDate: 2026-01-01\n---\n' },
			{ relativePath: 'blog/post-b.md', rawContent: '---\ntitle: 乙\npubDate: 2026-06-01\n---\n' },
		],
		folderMetas: [
			{
				folderPath: 'blog',
				rawContent: `title: 文章
icon: transfer
fix-order: -4
`,
			},
		],
	};

	const entries = [
		mockDocEntry('index', { title: '主页', 'fix-order': -5 }),
		mockDocEntry('blog', { title: '文章' }),
		mockDocEntry('blog/post-a', { title: '甲', pubDate: new Date('2026-01-01') }),
		mockDocEntry('blog/post-b', { title: '乙', pubDate: new Date('2026-06-01'), tags: ['示例'] }),
	];

	return { scan, entries };
}
