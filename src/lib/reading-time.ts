/** Leisure reading pace for Chinese prose (characters per minute). */
const CJK_CHARS_PER_MINUTE = 350;
/** Leisure reading pace for Latin words (words per minute). */
const LATIN_WORDS_PER_MINUTE = 230;

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const FENCED_CODE_RE = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
const INLINE_CODE_RE = /`[^`\r\n]+`/g;
const HTML_TAG_RE = /<[^>\r\n]+>/g;
const HEADING_MARK_RE = /^#{1,6}\s+/gm;
const BLOCKQUOTE_MARK_RE = /^>\s?/gm;
const EMPHASIS_MARK_RE = /[*_~]+/g;
const FOOTNOTE_REF_RE = /\[\^[^\]]*?\]/g;
const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const LATIN_WORD_RE = /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)*/g;

/**
 * Strip `![alt](url)` and replace `[label](url)` with `label` without regex backtracking.
 */
function stripMarkdownImagesAndLinks(text: string): string {
	let out = '';
	let i = 0;

	while (i < text.length) {
		if (text.startsWith('![', i)) {
			const closeAlt = text.indexOf(']', i + 2);
			if (closeAlt !== -1 && text[closeAlt + 1] === '(') {
				const closeUrl = text.indexOf(')', closeAlt + 2);
				if (closeUrl !== -1) {
					out += ' ';
					i = closeUrl + 1;
					continue;
				}
			}
		}

		if (text[i] === '[' && text[i + 1] !== '^') {
			const closeLabel = text.indexOf(']', i + 1);
			if (closeLabel !== -1 && text[closeLabel + 1] === '(') {
				const closeUrl = text.indexOf(')', closeLabel + 2);
				if (closeUrl !== -1) {
					out += text.slice(i + 1, closeLabel);
					i = closeUrl + 1;
					continue;
				}
			}
		}

		out += text[i];
		i += 1;
	}

	return out;
}

export function stripMarkdownForReading(rawMarkdown: string): string {
	return stripMarkdownImagesAndLinks(
		rawMarkdown
			.replace(FRONTMATTER_RE, '')
			.replace(FENCED_CODE_RE, ' ')
			.replace(INLINE_CODE_RE, ' ')
			.replace(HTML_TAG_RE, ' ')
			.replace(HEADING_MARK_RE, '')
			.replace(BLOCKQUOTE_MARK_RE, '')
			.replace(EMPHASIS_MARK_RE, '')
			.replace(FOOTNOTE_REF_RE, ' '),
	);
}

export function countReadableUnits(text: string): { cjkCount: number; wordCount: number } {
	const cjkChunks = text.match(CJK_RE);
	const cjkCount = cjkChunks?.reduce((sum, chunk) => sum + chunk.length, 0) ?? 0;
	const latinOnly = text.replace(CJK_RE, ' ');
	const wordCount = latinOnly.match(LATIN_WORD_RE)?.length ?? 0;
	return { cjkCount, wordCount };
}

export function estimateReadingTimeSeconds(rawMarkdown: string): number {
	const text = stripMarkdownForReading(rawMarkdown);
	const { cjkCount, wordCount } = countReadableUnits(text);
	const minutes =
		cjkCount / CJK_CHARS_PER_MINUTE + wordCount / LATIN_WORDS_PER_MINUTE;
	return Math.max(0, Math.ceil(minutes * 60));
}

export function formatReadingTimeDuration(totalSeconds: number): string {
	if (totalSeconds < 60) {
		return `${totalSeconds} 秒`;
	}

	const totalMinutes = Math.floor(totalSeconds / 60);
	if (totalMinutes < 60) {
		return `${totalMinutes} 分`;
	}

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (minutes === 0) {
		return `${hours} 小时`;
	}

	return `${hours} 小时 ${minutes} 分`;
}

export function formatReadingTimeLabel(rawMarkdown: string): string | undefined {
	const totalSeconds = estimateReadingTimeSeconds(rawMarkdown);
	if (totalSeconds <= 0) {
		return undefined;
	}

	return `本文预计阅读时长 ${formatReadingTimeDuration(totalSeconds)}`;
}
