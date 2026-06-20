import { createReadStream } from 'node:fs';
import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

const MIME_TYPES = {
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.json': 'application/json',
	'.pdf': 'application/pdf',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
	'.zip': 'application/zip',
};

function toFsPath(dir) {
	return typeof dir === 'string' ? dir : fileURLToPath(dir);
}

/** @param {string} relativePath path relative to src/content */
export function shouldPublishContentAsset(relativePath) {
	const base = path.basename(relativePath);
	if (base.startsWith('.')) {
		return false;
	}
	if (/\.(md|mdx)$/iu.test(relativePath)) {
		return false;
	}
	return true;
}

/** @returns {Promise<Array<{ absolutePath: string, relativePath: string }>>} */
async function collectContentAssets(contentRoot) {
	/** @type {Array<{ absolutePath: string, relativePath: string }>} */
	const assets = [];

	/** @param {string} dir @param {string} relativePrefix */
	async function walk(dir, relativePrefix = '') {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const rel = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
			const absolutePath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(absolutePath, rel);
			} else if (entry.isFile() && shouldPublishContentAsset(rel)) {
				assets.push({ absolutePath, relativePath: rel.replaceAll('\\', '/') });
			}
		}
	}

	await walk(contentRoot);
	return assets;
}

/** @param {Array<{ absolutePath: string, relativePath: string }>} assets @param {string} destRoot */
async function copyAssetsToDest(assets, destRoot) {
	for (const asset of assets) {
		const destPath = path.join(destRoot, asset.relativePath);
		await mkdir(path.dirname(destPath), { recursive: true });
		await cp(asset.absolutePath, destPath);
	}
}

function resolveHtmlRootFromBuildDir(buildDirPath) {
	const clientDir = path.join(buildDirPath, 'client');
	return existsSync(clientDir) ? clientDir : buildDirPath;
}

function contentAssetsDevPlugin() {
	return {
		name: 'content-static-assets-dev',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const rawUrl = req.url?.split('?')[0];
				if (!rawUrl || rawUrl.includes('..')) {
					next();
					return;
				}

				const relativePath = decodeURIComponent(rawUrl.replace(/^\/+/, ''));
				if (!relativePath || !shouldPublishContentAsset(relativePath)) {
					next();
					return;
				}

				const contentPath = path.resolve(CONTENT_DIR, relativePath);
				if (!contentPath.startsWith(CONTENT_DIR)) {
					next();
					return;
				}

				stat(contentPath)
					.then((fileStat) => {
						if (!fileStat.isFile()) {
							next();
							return;
						}

						const ext = path.extname(contentPath).toLowerCase();
						res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream');
						createReadStream(contentPath).pipe(res);
					})
					.catch(() => {
						next();
					});
			});
		},
	};
}

export default function contentStaticAssetsIntegration() {
	return {
		name: 'content-static-assets',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [contentAssetsDevPlugin()],
					},
				});
			},
			'astro:build:done': async ({ dir }) => {
				const buildDirPath = toFsPath(dir);
				const destRoot = resolveHtmlRootFromBuildDir(buildDirPath);
				const assets = await collectContentAssets(CONTENT_DIR);
				await copyAssetsToDest(assets, destRoot);
			},
		},
	};
}
