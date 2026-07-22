/**
 * Build-time / client-shared helpers for article git history JSON URLs.
 */

export function historyFileNameForEntryId(entryId: string): string {
	return `${entryId
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('__')}.json`;
}

export function historyUrlForEntryId(entryId: string): string {
	return `/git-history/${historyFileNameForEntryId(entryId)}`;
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
