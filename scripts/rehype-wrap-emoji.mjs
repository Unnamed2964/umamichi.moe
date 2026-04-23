const EMOJI_PATTERN = /(?:\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:\uFE0F|\uFE0E)?(?:\u200D(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:\uFE0F|\uFE0E)?)*)/gu;

const SKIPPED_TAGS = new Set(['code', 'pre', 'script', 'style', 'textarea']);
const SKIPPED_CLASSES = new Set(['katex', 'site-emoji']);

export default function rehypeWrapEmoji() {
	return function transformer(tree) {
		visit(tree);
	};
}

function visit(node) {
	if (!node || !Array.isArray(node.children)) {
		return;
	}

	if (shouldSkipNode(node)) {
		return;
	}

	for (let index = 0; index < node.children.length; index += 1) {
		const child = node.children[index];

		if (child.type === 'text') {
			const replacement = wrapEmojiText(child.value);

			if (replacement) {
				node.children.splice(index, 1, ...replacement);
				index += replacement.length - 1;
			}

			continue;
		}

		visit(child);
	}
}

function shouldSkipNode(node) {
	if (node.type !== 'element') {
		return false;
	}

	if (SKIPPED_TAGS.has(node.tagName)) {
		return true;
	}

	const classNames = Array.isArray(node.properties?.className)
		? node.properties.className
		: typeof node.properties?.className === 'string'
			? node.properties.className.split(/\s+/)
			: [];

	return classNames.some((className) => SKIPPED_CLASSES.has(className));
}

function wrapEmojiText(value) {
	EMOJI_PATTERN.lastIndex = 0;

	const matches = Array.from(value.matchAll(EMOJI_PATTERN));

	if (matches.length === 0) {
		return null;
	}

	const nodes = [];
	let lastIndex = 0;

	for (const match of matches) {
		const [emoji] = match;
		const start = match.index ?? 0;

		if (start > lastIndex) {
			nodes.push({
				type: 'text',
				value: value.slice(lastIndex, start),
			});
		}

		nodes.push({
			type: 'element',
			tagName: 'span',
			properties: { className: ['site-emoji'] },
			children: [{ type: 'text', value: emoji }],
		});

		lastIndex = start + emoji.length;
	}

	if (lastIndex < value.length) {
		nodes.push({
			type: 'text',
			value: value.slice(lastIndex),
		});
	}

	return nodes;
}