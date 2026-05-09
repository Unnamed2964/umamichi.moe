import { existsSync } from 'node:fs';
import { glob, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, serialize } from 'parse5';
import { mergeExternalAnchorRel, signSsrOutOfSiteLink } from '../lib/out-of-site-sign-build.mjs';

function toFsPath(dir) {
	return typeof dir === 'string' ? dir : fileURLToPath(dir);
}

/**
 * Map prerendered HTML path under the output root to the public page URL used for resolving relative href.
 * @param {string} absoluteFilePath
 * @param {string} htmlRoot absolute path to directory containing emitted HTML (e.g. dist/client)
 * @param {string} siteOrigin e.g. https://example.com (trailing slashes tolerated)
 */
export function htmlFilePathToPageBaseUrl(absoluteFilePath, htmlRoot, siteOrigin) {
	const site = siteOrigin.replace(/\/+$/, '');
	const rel = path.relative(htmlRoot, absoluteFilePath).replaceAll('\\', '/');
	if (!rel || rel.startsWith('..')) {
		return new URL('/', site + '/');
	}
	if (rel === 'index.html' || rel.endsWith('/index.html')) {
		const dir = rel === 'index.html' ? '' : rel.slice(0, -'/index.html'.length);
		const pathname = dir ? `/${dir}/` : '/';
		return new URL(pathname, site + '/');
	}
	if (rel.endsWith('.html')) {
		const stem = rel.slice(0, -'.html'.length);
		return new URL(`/${stem}.html`, site + '/');
	}
	return new URL('/', site + '/');
}

/** @param {{ attrs?: { name: string, value: string }[] }} node */
function getAttr(node, name) {
	return node.attrs?.find((a) => a.name === name)?.value;
}

/** @param {{ attrs?: { name: string, value: string }[] }} node */
function setAttr(node, name, value) {
	if (!node.attrs) {
		node.attrs = [];
	}
	const i = node.attrs.findIndex((a) => a.name === name);
	if (i >= 0) {
		node.attrs[i].value = value;
	} else {
		node.attrs.push({ name, value });
	}
}

function walkNodes(node, fn) {
	if (!node || typeof node !== 'object') {
		return;
	}
	fn(node);
	if (getAttr(node, 'data-out-of-site-ugc') === 'giscus') {
		return;
	}
	for (const c of node.childNodes ?? []) {
		walkNodes(c, fn);
	}
}

async function collectHtmlFiles(root) {
	const rels = await Array.fromAsync(glob('**/*.html', { cwd: root }));
	return rels.map((r) => path.join(root, r));
}

/**
 * @param {string} htmlRoot
 * @param {{ siteOrigin: string, privateKeyPem: string }} opts
 */
export async function processHtmlFilesUnder(htmlRoot, opts) {
	const origin = opts.siteOrigin.replace(/\/+$/, '');
	const siteUrl = new URL('/', origin + '/');
	const pem = opts.privateKeyPem.replace(/\\n/g, '\n');
	const sigCache = new Map();

	/** @param {string} toHref */
	function memoSign(toHref) {
		if (!pem) {
			return null;
		}
		if (sigCache.has(toHref)) {
			return sigCache.get(toHref);
		}
		const s = signSsrOutOfSiteLink(toHref, pem);
		sigCache.set(toHref, s);
		return s;
	}

	const files = await collectHtmlFiles(htmlRoot);
	for (const filePath of files) {
		const baseUrl = htmlFilePathToPageBaseUrl(filePath, htmlRoot, origin);
		const doc = parse(await readFile(filePath, 'utf8'));
		walkNodes(doc, (node) => {
			if (node.nodeName !== 'a') {
				return;
			}
			const href = getAttr(node, 'href');
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
			setAttr(node, 'target', '_blank');
			setAttr(node, 'rel', mergeExternalAnchorRel(getAttr(node, 'rel')));
			const sig = memoSign(toHref);
			if (sig) {
				setAttr(node, 'data-ssr-out-of-site-sig', sig);
			}
		});
		await writeFile(filePath, serialize(doc), 'utf8');
	}
}

function resolveHtmlRootFromBuildDir(buildDirPath) {
	const clientDir = path.join(buildDirPath, 'client');
	return existsSync(clientDir) ? clientDir : buildDirPath;
}

/**
 * @param {{ site?: string, privateKeyPem?: string }} [options]
 */
export default function outOfSiteHtmlPostbuildIntegration(options = {}) {
	const siteOrigin = (options.site ?? 'https://umamichi.moe').replace(/\/+$/, '');
	const privateKeyPem = options.privateKeyPem ?? '';

	return {
		name: 'out-of-site-html-postbuild',
		hooks: {
			'astro:build:done': async ({ dir }) => {
				const buildDirPath = toFsPath(dir);
				const htmlRoot = resolveHtmlRootFromBuildDir(buildDirPath);
				await processHtmlFilesUnder(htmlRoot, { siteOrigin, privateKeyPem });
			},
		},
	};
}
