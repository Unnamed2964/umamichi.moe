import { accessSync, constants } from 'node:fs';
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

/** Absolute paths only — avoid resolving `git` via a potentially writable PATH. */
const GIT_BIN_CANDIDATES =
	process.platform === 'win32'
		? [
				'C:\\Program Files\\Git\\cmd\\git.exe',
				'C:\\Program Files\\Git\\bin\\git.exe',
				'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
			]
		: ['/usr/bin/git', '/bin/git', '/usr/local/bin/git', '/opt/homebrew/bin/git'];

/**
 * @returns {string | null}
 */
function resolveGitBin() {
	const fromEnv = process.env.GIT_BIN;
	if (typeof fromEnv === 'string' && path.isAbsolute(fromEnv)) {
		try {
			accessSync(fromEnv, constants.F_OK);
			return fromEnv;
		} catch {
			return null;
		}
	}

	for (const candidate of GIT_BIN_CANDIDATES) {
		try {
			accessSync(candidate, constants.F_OK);
			return candidate;
		} catch {
			// try next trusted path
		}
	}

	return null;
}

const gitBin = resolveGitBin();

/**
 * @param {string[]} args
 * @param {{ cwd?: string }} [options]
 */
function runGit(args, options = {}) {
	if (!gitBin) {
		throw new Error(
			`git executable not found in trusted paths (${GIT_BIN_CANDIDATES.join(', ')}). Set GIT_BIN to an absolute path if needed.`,
		);
	}

	const result = spawnSync(gitBin, args, {
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
	if (!gitBin) {
		return false;
	}

	const result = spawnSync(gitBin, ['rev-parse', '--is-inside-work-tree'], {
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
	return `${entryId.replaceAll('/', '__')}.json`;
}

/**
 * @param {string} patch
 * @returns {[string, string] | null}
 */
function parseDiffGitPaths(patch) {
	const line = patch.split('\n').find((entry) => entry.startsWith('diff --git a/'));
	if (!line) {
		return null;
	}

	const rest = line.slice('diff --git a/'.length);
	const mid = rest.indexOf(' b/');
	if (mid < 0) {
		return null;
	}

	return [rest.slice(0, mid), rest.slice(mid + 3)];
}

/**
 * @param {string} patch
 */
function parsePathsFromPatch(patch) {
	const renameFrom = patch.match(/^rename from (.+)$/m)?.[1]?.trim();
	const renameTo = patch.match(/^rename to (.+)$/m)?.[1]?.trim();
	const similarityRaw = patch.match(/^similarity index (\d+)%$/m)?.[1];
	const similarity = similarityRaw ? Number(similarityRaw) : undefined;
	const diffHeader = parseDiffGitPaths(patch);

	if (renameFrom && renameTo) {
		return {
			status: 'R',
			from: renameFrom,
			to: renameTo,
			...(similarity !== undefined ? { similarity } : {}),
		};
	}

	if (patch.includes('\nnew file mode ') || /^new file mode /m.test(patch)) {
		const to = diffHeader?.[1];
		return { status: 'A', to: to ?? undefined };
	}

	if (patch.includes('\ndeleted file mode ') || /^deleted file mode /m.test(patch)) {
		const from = diffHeader?.[0];
		return { status: 'D', from: from ?? undefined };
	}

	if (diffHeader) {
		const from = diffHeader[0];
		const to = diffHeader[1];
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
 * Keep body; drop leading newlines; collapse trailing newlines to one.
 * @param {string} patch
 */
function normalizePatchNewlines(patch) {
	let end = patch.length;
	while (end > 0 && patch.charCodeAt(end - 1) === 10 /* \n */) {
		end -= 1;
	}

	let start = 0;
	while (start < end && patch.charCodeAt(start) === 10 /* \n */) {
		start += 1;
	}

	if (start >= end) {
		return '';
	}

	return `${patch.slice(start, end)}\n`;
}

/**
 * @param {string} output
 */
function parseFollowPatchLog(output) {
	const normalized = output.replaceAll('\r\n', '\n');
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
			patch = normalizePatchNewlines(trimmed.slice(endOnly + END_META_MARKER.length + 2));
		} else {
			metaBlock = trimmed.slice(0, metaEnd);
			patch = normalizePatchNewlines(trimmed.slice(metaEnd + END_META_MARKER.length + 2));
		}

		// Drop trailing next-commit leakage — patches end before next marker (already split)
		const metaLines = metaBlock.split('\n');
		const hash = metaLines[0]?.trim();
		const committedAt = metaLines[1]?.trim();
		const subject = metaLines.slice(2).join('\n').trim();

		if (!hash || !committedAt) {
			continue;
		}

		commits.push({
			hash,
			committedAt,
			subject,
			paths: parsePathsFromPatch(patch),
			patch,
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
