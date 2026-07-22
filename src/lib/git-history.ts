/**
 * Build-time / client-shared helpers for article git history JSON URLs.
 *
 * Files keep literal spaces (and other characters) from the entry id; only `/`
 * is replaced with `__`. The public URL percent-encodes the filename so hosts
 * that decode `%20` → space resolve the asset correctly.
 */

export function historyFileNameForEntryId(entryId: string): string {
	return `${entryId.split('/').join('__')}.json`;
}

export function historyUrlForEntryId(entryId: string): string {
	return `/git-history/${encodeURIComponent(historyFileNameForEntryId(entryId))}`;
}

export type GitHistoryPaths = {
	status: 'A' | 'D' | 'M' | 'R' | string;
	from?: string;
	to?: string;
	similarity?: number;
};

export type GitHistoryCommit = {
	hash: string;
	committedAt: string;
	subject: string;
	paths: GitHistoryPaths;
	patch: string;
};

export type GitHistoryPayload = {
	sourcePath: string;
	commits: GitHistoryCommit[];
};
