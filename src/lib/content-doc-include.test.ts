import { describe, expect, it } from 'vitest';
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
