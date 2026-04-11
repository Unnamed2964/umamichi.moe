import type { CollectionEntry } from 'astro:content';

type DocEntry = CollectionEntry<'docs'>;

export type DocListItem = {
	id: string;
	href: string;
	title: string;
};

type SourceDocMeta = {
	folderPath: string;
	id: string;
	isIndex: boolean;
	routePath: string;
};

type FolderDocMeta = SourceDocMeta & {
	entry: DocEntry;
};

export type FolderRoute = {
	articleList: DocListItem[];
	entry: DocEntry;
	routePath: string;
};

export type DocRoute = {
	articleList: DocListItem[];
	entry: DocEntry;
	routePath: string;
};

export type DocsStructure = {
	entryRouteMap: Map<string, string>;
	folderRoutes: FolderRoute[];
	routes: DocRoute[];
};

const SOURCE_DOC_FILES = [
	...Object.keys(import.meta.glob('../content/**/*.md')),
	...Object.keys(import.meta.glob('../content/**/*.mdx')),
];

function toPosixPath(path: string) {
	return path.replaceAll('\\', '/');
}

function joinPosixPath(...parts: string[]) {
	return parts.filter(Boolean).join('/');
}

function toHref(routePath: string) {
	return routePath ? `/${routePath}/` : '/';
}

function compareDocs(left: FolderDocMeta, right: FolderDocMeta) {
	if (left.isIndex !== right.isIndex) {
		return left.isIndex ? -1 : 1;
	}

	const leftTime = left.entry.data.pubDate?.valueOf() ?? Number.NEGATIVE_INFINITY;
	const rightTime = right.entry.data.pubDate?.valueOf() ?? Number.NEGATIVE_INFINITY;

	if (leftTime !== rightTime) {
		return rightTime - leftTime;
	}

	return left.entry.data.title.localeCompare(right.entry.data.title, 'zh-CN');
}

function scanContentDirectory(): SourceDocMeta[] {
	const idSourceMap = new Map<string, string[]>();
	const indexSourceMap = new Map<string, string[]>();
	const docs = SOURCE_DOC_FILES.map<SourceDocMeta>((sourcePath) => {
		const normalizedPath = toPosixPath(sourcePath);
		const relativePath = normalizedPath.replace(/^\.\.\/content\//, '');
		const pathWithoutExtension = relativePath.replace(/\.mdx?$/, '');
		const pathSegments = pathWithoutExtension.split('/');
		const baseName = pathSegments.pop() ?? '';
		const folderPath = pathSegments.join('/');
		const isIndex = baseName === 'index';
		const id = isIndex ? folderPath || 'index' : joinPosixPath(folderPath, baseName);
		const routePath = id === 'index' ? '' : id;
		const duplicateSources = idSourceMap.get(id) ?? [];

		duplicateSources.push(relativePath);
		idSourceMap.set(id, duplicateSources);

		if (isIndex) {
			const indexSources = indexSourceMap.get(folderPath) ?? [];
			indexSources.push(relativePath);
			indexSourceMap.set(folderPath, indexSources);
		}

		return {
			folderPath,
			id,
			isIndex,
			routePath,
		};
	});

	for (const [folderPath, indexSources] of indexSourceMap) {
		if (indexSources.length > 1) {
			const displayPath = folderPath || '/';
			throw new Error(`Folder ${displayPath} cannot contain both index.md and index.mdx.`);
		}
	}

	for (const [id, duplicateSources] of idSourceMap) {
		if (duplicateSources.length > 1) {
			throw new Error(`Multiple content files resolve to the same entry id ${id}: ${duplicateSources.join(', ')}`);
		}
	}

	return docs;
}

export function buildDocsStructure(entries: DocEntry[]): DocsStructure {
	const docsById = new Map(entries.map((entry) => [entry.id, entry]));
	const sourceDocs = scanContentDirectory();
	const folderMap = new Map<string, FolderDocMeta[]>();
	const entryRouteMap = new Map<string, string>();

	for (const sourceDoc of sourceDocs) {
		const entry = docsById.get(sourceDoc.id);

		if (!entry) {
			throw new Error(`Unable to resolve content entry for ${sourceDoc.id}.`);
		}

		const folderDocs = folderMap.get(sourceDoc.folderPath) ?? [];
		folderDocs.push({ ...sourceDoc, entry });
		folderMap.set(sourceDoc.folderPath, folderDocs);
		entryRouteMap.set(sourceDoc.id, sourceDoc.routePath);
	}

	const folderRoutes: FolderRoute[] = [];
	const articleRoutes: DocRoute[] = [];

	for (const [folderPath, folderDocs] of folderMap) {
		const sortedDocs = [...folderDocs].sort(compareDocs);
		const nonIndexDocs = sortedDocs.filter((doc) => !doc.isIndex);
		const indexDoc = sortedDocs.find((doc) => doc.isIndex);
		const defaultDoc = indexDoc ?? nonIndexDocs[0];

		if (!defaultDoc) {
			continue;
		}

		const articleList = nonIndexDocs.length > 0
			? sortedDocs.map((doc) => ({
				id: doc.entry.id,
				href: toHref(doc.routePath),
				title: doc.entry.data.title,
			}))
			: [];

		folderRoutes.push({
			articleList,
			entry: defaultDoc.entry,
			routePath: folderPath === 'index' ? '' : folderPath,
		});

		for (const doc of nonIndexDocs) {
			articleRoutes.push({
				articleList,
				entry: doc.entry,
				routePath: doc.routePath,
			});
		}
	}

	const routes = [...folderRoutes, ...articleRoutes].filter(
		(route, index, allRoutes) => allRoutes.findIndex((candidate) => candidate.routePath === route.routePath) === index,
	);

	return {
		entryRouteMap,
		folderRoutes,
		routes,
	};
}