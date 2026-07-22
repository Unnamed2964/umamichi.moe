import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'src', 'content');
const outDir = path.join(root, 'public', 'git-history');
const manifestPath = path.join(root, 'src', 'generated', 'git-history-manifest.json');
const COMMIT_MARKER = '__COMMIT__';
const END_META_MARKER = '__ENDMETA__';

/**
 * @param {string[]} args
 * @param {{ cwd?: string }} [options]
 */
function runGit(args, options = {}) {
	const result = spawnSync('git', args, {
		cwd: options.cwd ?? root,
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		const stderr = (result.stderr ?? '').trim();
		throw new Error(`git ${args.join(' ')} failed (${result.status}): ${stderr || 'no stderr'}`);
	}

	return result.stdout ?? '';
}

function gitAvailable() {
	const result = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
		cwd: root,
		encoding: 'utf8',
	});
	return result.status === 0 && (result.stdout ?? '').trim() === 'true';
}

function warnIfShallow() {
	try {
		const shallow = runGit(['rev-parse', '--is-shallow-repository']).trim();
		if (shallow === 'true') {
			console.warn(
				'[generate-git-history] Shallow clone detected; history may be incomplete. Use fetch-depth: 0 in CI.',
			);
		}
	} catch {
		// ignore
	}
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listContentDocs(dir) {
	/** @type {string[]} */
	const files = [];

	async function walk(current) {
		const entries = await readdir(current, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.name.startsWith('.')) {
				continue;
			}
			const full = path.join(current, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
				continue;
			}
			if (/\.mdx?$/i.test(entry.name)) {
				files.push(full);
			}
		}
	}

	await walk(dir);
	return files.sort((a, b) => a.localeCompare(b));
}

/**
 * @param {string} relativePath posix path under src/content
 */
function entryIdFromRelativePath(relativePath) {
	const pathWithoutExtension = relativePath.replace(/\.mdx?$/i, '');
	const segments = pathWithoutExtension.split('/');
	const baseName = segments.pop() ?? '';
	const folderPath = segments.join('/');
	if (baseName === 'index') {
		return folderPath || 'index';
	}
	return folderPath ? `${folderPath}/${baseName}` : baseName;
}

/**
 * @param {string} entryId
 */
function historyFileNameForEntryId(entryId) {
	return `${entryId.split('/').map((segment) => encodeURIComponent(segment)).join('__')}.json`;
}

/**
 * @param {string} patch
 */
function parsePathsFromPatch(patch) {
	const renameFrom = patch.match(/^rename from (.+)$/m)?.[1]?.trim();
	const renameTo = patch.match(/^rename to (.+)$/m)?.[1]?.trim();
	const similarityRaw = patch.match(/^similarity index (\d+)%$/m)?.[1];
	const similarity = similarityRaw ? Number(similarityRaw) : undefined;
	const diffHeader = patch.match(/^diff --git a\/(.+?) b\/(.+)$/m);

	if (renameFrom && renameTo) {
		return {
			status: 'R',
			from: renameFrom,
			to: renameTo,
			...(similarity !== undefined ? { similarity } : {}),
		};
	}

	if (patch.includes('\nnew file mode ') || /^new file mode /m.test(patch)) {
		const to = diffHeader?.[2];
		return { status: 'A', to: to ?? undefined };
	}

	if (patch.includes('\ndeleted file mode ') || /^deleted file mode /m.test(patch)) {
		const from = diffHeader?.[1];
		return { status: 'D', from: from ?? undefined };
	}

	if (diffHeader) {
		const from = diffHeader[1];
		const to = diffHeader[2];
		if (from !== to) {
			return {
				status: 'R',
				from,
				to,
				...(similarity !== undefined ? { similarity } : {}),
			};
		}
		return { status: 'M', from, to };
	}

	return { status: 'M' };
}

/**
 * @param {string} output
 */
function parseFollowPatchLog(output) {
	const normalized = output.replace(/\r\n/g, '\n');
	if (!normalized.trim()) {
		return [];
	}

	const parts = normalized.split(`${COMMIT_MARKER}\n`);
	/** @type {Array<{ hash: string; committedAt: string; subject: string; paths: ReturnType<typeof parsePathsFromPatch>; patch: string }>} */
	const commits = [];

	for (const part of parts) {
		const trimmed = part.trimStart();
		if (!trimmed) {
			continue;
		}

		const metaEnd = trimmed.indexOf(`\n${END_META_MARKER}\n`);
		let metaBlock;
		let patch;

		if (metaEnd === -1) {
			// Commit with no patch (or trailing commit without diff)
			const endOnly = trimmed.indexOf(`\n${END_META_MARKER}`);
			if (endOnly === -1) {
				continue;
			}
			metaBlock = trimmed.slice(0, endOnly);
			patch = trimmed.slice(endOnly + END_META_MARKER.length + 2).replace(/^\n/, '');
		} else {
			metaBlock = trimmed.slice(0, metaEnd);
			patch = trimmed.slice(metaEnd + END_META_MARKER.length + 2).replace(/^\n/, '');
		}

		// Drop trailing next-commit leakage — patches end before next marker (already split)
		const metaLines = metaBlock.split('\n');
		const hash = metaLines[0]?.trim();
		const committedAt = metaLines[1]?.trim();
		const subject = metaLines.slice(2).join('\n').trim();

		if (!hash || !committedAt) {
			continue;
		}

		const cleanPatch = patch.replace(/\n+$/, '\n').replace(/^\n+/, '');
		commits.push({
			hash,
			committedAt,
			subject,
			paths: parsePathsFromPatch(cleanPatch),
			patch: cleanPatch,
		});
	}

	return commits;
}

/**
 * @param {string} sourcePath repo-relative posix path
 */
function collectHistoryForSourcePath(sourcePath) {
	const output = runGit([
		'log',
		'--follow',
		'--find-renames',
		`--pretty=format:${COMMIT_MARKER}%n%H%n%cI%n%s%n${END_META_MARKER}`,
		'-p',
		'--',
		sourcePath,
	]);

	return parseFollowPatchLog(output);
}

async function main() {
	await rm(outDir, { recursive: true, force: true });
	await mkdir(outDir, { recursive: true });
	await mkdir(path.dirname(manifestPath), { recursive: true });

	if (!gitAvailable()) {
		await writeFile(manifestPath, `${JSON.stringify({ entries: [] }, null, '\t')}\n`, 'utf8');
		console.warn('[generate-git-history] Not inside a git work tree; wrote empty git-history dir.');
		return;
	}

	warnIfShallow();

	const docs = await listContentDocs(contentDir);
	let written = 0;
	let skippedEmpty = 0;
	/** @type {string[]} */
	const entries = [];

	for (const absolutePath of docs) {
		const relativePath = path.relative(contentDir, absolutePath).split(path.sep).join('/');
		const sourcePath = `src/content/${relativePath}`;
		const entryId = entryIdFromRelativePath(relativePath);

		let commits;
		try {
			commits = collectHistoryForSourcePath(sourcePath);
		} catch (error) {
			console.warn(`[generate-git-history] Failed for ${sourcePath}:`, error);
			commits = [];
		}

		if (commits.length === 0) {
			skippedEmpty += 1;
			continue;
		}

		const payload = {
			sourcePath,
			commits,
		};

		const fileName = historyFileNameForEntryId(entryId);
		await writeFile(path.join(outDir, fileName), `${JSON.stringify(payload)}\n`, 'utf8');
		entries.push(entryId);
		written += 1;
	}

	entries.sort((left, right) => left.localeCompare(right, 'zh-CN'));
	await writeFile(manifestPath, `${JSON.stringify({ entries }, null, '\t')}\n`, 'utf8');

	console.log(
		`[generate-git-history] Wrote ${written} history file(s) to public/git-history/ (${skippedEmpty} empty skipped).`,
	);
}

await main();
