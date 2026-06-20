import path from 'node:path';

const CONTENT_DIR_SEGMENT = '/src/content/';
const SKIP_URL_PATTERN = /^(?:[a-z+]+:|\/|#)/i;

/** @param {import('vfile').Vfile | { history?: string[], path?: string }} file */
export function extractContentRelativePath(file) {
	const filePath = file?.path ?? file?.history?.[0];
	if (typeof filePath !== 'string') {
		return null;
	}

	const normalized = filePath.replace(/\\/g, '/');
	const markerIndex = normalized.indexOf(CONTENT_DIR_SEGMENT);
	if (markerIndex >= 0) {
		return normalized.slice(markerIndex + CONTENT_DIR_SEGMENT.length);
	}

	return null;
}

/** @param {string} contentRelativePath e.g. `blog/post.md` */
export function getContentFolderPath(contentRelativePath) {
	const dir = path.posix.dirname(contentRelativePath);
	return dir === '.' ? '' : dir;
}

/**
 * Rewrite `imgs/...` or `files/...` links to the public URL under the content folder.
 * @param {string} url
 * @param {string} contentRelativePath
 */
export function resolveContentAssetPublicUrl(url, contentRelativePath) {
	if (!url || !contentRelativePath || SKIP_URL_PATTERN.test(url)) {
		return url;
	}

	const trimmed = url.trim();
	const normalized = trimmed.startsWith('./') ? trimmed.slice(2) : trimmed;
	if (!normalized.startsWith('imgs/') && !normalized.startsWith('files/')) {
		return url;
	}

	const folderPath = getContentFolderPath(contentRelativePath);
	const joined = folderPath ? `${folderPath}/${normalized}` : normalized;
	return `/${joined.split('/').filter(Boolean).join('/')}`;
}

/** @param {import('mdast').Root} node @param {(node: import('mdast').Root | import('mdast').Content) => void} fn */
function visitMdast(node, fn) {
	fn(node);
	if ('children' in node && Array.isArray(node.children)) {
		for (const child of node.children) {
			visitMdast(child, fn);
		}
	}
}

/** @param {import('hast').Root} node @param {(node: import('hast').Root | import('hast').Element | import('hast').Text) => void} fn */
function visitHast(node, fn) {
	fn(node);
	if (node.type === 'element' && Array.isArray(node.children)) {
		for (const child of node.children) {
			visitHast(child, fn);
		}
	}
}

export function remarkContentAssetUrls() {
	return (
		/** @type {import('mdast').Root} */ tree,
		/** @type {import('vfile').VFile} */ file,
	) => {
		const contentRelativePath = extractContentRelativePath(file);
		if (!contentRelativePath) {
			return;
		}

		visitMdast(tree, (node) => {
			if (node.type !== 'image' && node.type !== 'link') {
				return;
			}

			if (typeof node.url === 'string') {
				node.url = resolveContentAssetPublicUrl(node.url, contentRelativePath);
			}
		});
	};
}

export function rehypeContentAssetUrls() {
	return (
		/** @type {import('hast').Root} */ tree,
		/** @type {import('vfile').VFile} */ file,
	) => {
		const contentRelativePath = extractContentRelativePath(file);
		if (!contentRelativePath) {
			return;
		}

		visitHast(tree, (node) => {
			if (node.type !== 'element') {
				return;
			}

			if (node.tagName === 'img' && node.properties?.src != null) {
				node.properties.src = resolveContentAssetPublicUrl(String(node.properties.src), contentRelativePath);
			}

			if (node.tagName === 'a' && node.properties?.href != null) {
				node.properties.href = resolveContentAssetPublicUrl(String(node.properties.href), contentRelativePath);
			}
		});
	};
}
