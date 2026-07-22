/** Leisure reading pace for Chinese prose (characters per minute). */
const CJK_CHARS_PER_MINUTE = 350;
/** Leisure reading pace for Latin words (words per minute). */
const LATIN_WORDS_PER_MINUTE = 230;

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const FENCED_CODE_RE = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
const INLINE_CODE_RE = /`[^`]+`/g;
const IMAGE_RE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK_RE = /\[([^\]]*)\]\([^)]*\)/g;
const HTML_TAG_RE = /<[^>]+>/g;
const HEADING_MARK_RE = /^#{1,6}\s+/gm;
const BLOCKQUOTE_MARK_RE = /^>\s?/gm;
const EMPHASIS_MARK_RE = /[*_~]+/g;
const FOOTNOTE_REF_RE = /\[\^[^\]]*\]/g;
const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const LATIN_WORD_RE = /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)*/g;

export function stripMarkdownForReading(rawMarkdown: string): string {
	return rawMarkdown
		.replace(FRONTMATTER_RE, '')
		.replace(FENCED_CODE_RE, ' ')
		.replace(INLINE_CODE_RE, ' ')
		.replace(IMAGE_RE, ' ')
		.replace(LINK_RE, '$1')
		.replace(HTML_TAG_RE, ' ')
		.replace(HEADING_MARK_RE, '')
		.replace(BLOCKQUOTE_MARK_RE, '')
		.replace(EMPHASIS_MARK_RE, '')
		.replace(FOOTNOTE_REF_RE, ' ');
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
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes} 分 ${seconds} 秒`;
}

export function formatReadingTimeLabel(rawMarkdown: string): string | undefined {
	const totalSeconds = estimateReadingTimeSeconds(rawMarkdown);
	if (totalSeconds <= 0) {
		return undefined;
	}

	return `本文预计阅读时长 ${formatReadingTimeDuration(totalSeconds)}`;
}
