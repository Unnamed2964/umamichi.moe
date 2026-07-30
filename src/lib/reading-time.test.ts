import { describe, expect, it } from 'vitest';
import {
	countReadableUnits,
	estimateReadingTimeSeconds,
	formatReadingTimeDuration,
	formatReadingTimeLabel,
	stripMarkdownForReading,
} from './reading-time';

describe('stripMarkdownForReading', () => {
	it('drops frontmatter, code, images, and link wrappers', () => {
		const raw = `---
title: t
---
正文![图](/a.webp)与[链接](https://example.com)以及\`code\`。

\`\`\`
ignore me
\`\`\`
`;
		expect(stripMarkdownForReading(raw)).toContain('正文');
		expect(stripMarkdownForReading(raw)).toContain('链接');
		expect(stripMarkdownForReading(raw)).not.toContain('ignore me');
		expect(stripMarkdownForReading(raw)).not.toContain('/a.webp');
		expect(stripMarkdownForReading(raw)).not.toContain('https://example.com');
	});
});

describe('countReadableUnits', () => {
	it('counts CJK characters and Latin words separately', () => {
		expect(countReadableUnits('你好 world 世界')).toEqual({
			cjkCount: 4,
			wordCount: 1,
		});
	});
});

describe('estimateReadingTimeSeconds / format', () => {
	it('uses on-demand units without false-precision seconds', () => {
		expect(formatReadingTimeDuration(5)).toBe('5 秒');
		expect(formatReadingTimeDuration(59)).toBe('59 秒');
		expect(formatReadingTimeDuration(60)).toBe('1 分');
		expect(formatReadingTimeDuration(80)).toBe('1 分');
		expect(formatReadingTimeDuration(3599)).toBe('59 分');
		expect(formatReadingTimeDuration(3600)).toBe('1 小时');
		expect(formatReadingTimeDuration(6576)).toBe('1 小时 49 分');
	});

	it('returns a Chinese label for real prose', () => {
		const body = '这是一段用于估算阅读时长的中文句子。'.repeat(40);
		const label = formatReadingTimeLabel(`---\ntitle: t\n---\n${body}`);
		expect(label).toMatch(/^本文预计阅读时长 (\d+ 秒|\d+ 分|\d+ 小时( \d+ 分)?)$/);
		expect(estimateReadingTimeSeconds(`---\ntitle: t\n---\n${body}`)).toBeGreaterThan(0);
	});

	it('returns undefined for empty body', () => {
		expect(formatReadingTimeLabel('---\ntitle: t\n---\n')).toBeUndefined();
	});
});
