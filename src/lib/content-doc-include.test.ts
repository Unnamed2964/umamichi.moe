import { describe, expect, it } from 'vitest';
import { shouldGenerateGitHistoryForContentDoc } from '../../scripts/generate-git-history.mjs';
import { excludeDocGlobs, isIncludedContentDoc } from './content-doc-include.mjs';

describe('isIncludedContentDoc', () => {
	it('uses excludeDocGlobs from umamichi.config.mjs', () => {
		expect(excludeDocGlobs).toEqual(['**/imgs/**', '**/files/**']);
	});

	it('excludes markdown under imgs/ and files/', () => {
		expect(isIncludedContentDoc('blog/post.md')).toBe(true);
		expect(isIncludedContentDoc('blog/imgs/readme.md')).toBe(false);
		expect(isIncludedContentDoc('blog/files/notes.mdx')).toBe(false);
		expect(isIncludedContentDoc('tools/index.md')).toBe(true);
	});
});

describe('shouldGenerateGitHistoryForContentDoc', () => {
	it('matches the routed content docs boundary', () => {
		expect(shouldGenerateGitHistoryForContentDoc('blog/post.md')).toBe(true);
		expect(shouldGenerateGitHistoryForContentDoc('blog/post.mdx')).toBe(true);
		expect(shouldGenerateGitHistoryForContentDoc('blog/imgs/private-notes.md')).toBe(false);
		expect(shouldGenerateGitHistoryForContentDoc('blog/files/draft.mdx')).toBe(false);
		expect(shouldGenerateGitHistoryForContentDoc('blog/files/data.json')).toBe(false);
	});
});
