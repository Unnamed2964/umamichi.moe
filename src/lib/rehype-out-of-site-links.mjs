import crypto from 'node:crypto';
import { buildCanonicalOutOfSiteMessage } from './out-of-site-payload.mjs';

/**
 * @param {string} filePath absolute or project-relative path to the markdown/mdx file
 * @param {string} siteOrigin e.g. https://umamichi.moe
 */
export function filePathToDocumentBaseUrl(filePath, siteOrigin) {
	const posix = filePath.replaceAll('\\', '/');
	const marker = '/src/content/';
	const idx = posix.indexOf(marker);
	if (idx === -1) {
		return new URL('/', siteOrigin);
	}

	let rel = posix.slice(idx + marker.length);
	rel = rel.replace(/\.(md|mdx)$/i, '');
	const segments = rel.split('/');
	const baseName = segments.pop() ?? '';
	const folderPath = segments.join('/');
	const isIndex = baseName === 'index';
	const id = isIndex ? folderPath || 'index' : folderPath ? `${folderPath}/${baseName}` : baseName;
	const routePath = id === 'index' ? '' : id;
	const pathname = routePath ? `/${routePath}/` : '/';
	return new URL(pathname, siteOrigin);
}

function mergeExternalAnchorRel(existing) {
	const relString = Array.isArray(existing) ? existing.join(' ') : String(existing ?? '');
	const tokens = new Set(
		relString
			.split(/\s+/)
			.map((t) => t.trim())
			.filter(Boolean),
	);
	tokens.delete('nofollow');
	tokens.add('noopener');
	tokens.add('noreferrer');
	return [...tokens].sort().join(' ');
}

function visitElements(node, callback) {
	if (!node || typeof node !== 'object') {
		return;
	}

	if (node.type === 'element') {
		callback(node);
	}

	const children = node.children;
	if (!Array.isArray(children)) {
		return;
	}

	for (const child of children) {
		visitElements(child, callback);
	}
}

function signEd25519Pem(message, pem) {
	const key = crypto.createPrivateKey(pem);
	return crypto.sign(null, Buffer.from(message, 'utf8'), key);
}

/**
 * Rehype attacher: use as `[rehypeOutOfSiteLinks, { site: 'https://…' }]` so unified passes options correctly.
 * @param {{ site?: string, privateKeyPem?: string }} [options]
 */
export default function rehypeOutOfSiteLinks(options = {}) {
	const siteOrigin = (options.site ?? 'https://umamichi.moe').replace(/\/+$/, '');
	const privateKeyPem = (options.privateKeyPem ?? '').replace(/\\n/g, '\n');
	const canSign = privateKeyPem.length > 0;

	return function transformer(tree, file) {
		const baseUrl = file?.path
			? filePathToDocumentBaseUrl(String(file.path), siteOrigin)
			: new URL('/', siteOrigin);
		const siteUrl = new URL('/', siteOrigin);

		visitElements(tree, (node) => {
			if (node.tagName !== 'a') {
				return;
			}

			const props = node.properties ?? {};
			const rawHref = props.href;
			const href = Array.isArray(rawHref) ? String(rawHref[0] ?? '') : String(rawHref ?? '');
			if (!href || href.startsWith('#')) {
				return;
			}

			let absolute;
			try {
				absolute = new URL(href, baseUrl);
			} catch {
				return;
			}

			if (absolute.origin === siteUrl.origin) {
				return;
			}

			if (absolute.protocol !== 'http:' && absolute.protocol !== 'https:') {
				return;
			}

			const toHref = absolute.href;
			props.target = '_blank';
			props.rel = mergeExternalAnchorRel(props.rel);

			const kind = 'ssr';
			if (canSign) {
				const message = buildCanonicalOutOfSiteMessage({ kind, toHref });
				const sigBuf = signEd25519Pem(message, privateKeyPem);
				props['data-ssr-out-of-site-sig'] = sigBuf.toString('base64url');
			}

			node.properties = props;
		});
	};
}
