import type { CollectionEntry } from 'astro:content';

type DocEntry = CollectionEntry<'docs'>;

export type DocListItem = {
	id: string;
	href: string;
	title: string;
};

export type DocListItemWithPubDate = DocListItem & {
	pubDate?: Date;
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

export type GeneratedFolderPageData = {
	description: string;
	title: string;
};

export type GeneratedFolderRoute = {
	articleList: DocListItem[];
	generatedPage: GeneratedFolderPageData;
	routePath: string;
};

export type DocRoute = {
	articleList: DocListItem[];
	entry: DocEntry;
	routePath: string;
};

export type SiteRoute = FolderRoute | GeneratedFolderRoute | DocRoute;

export type TagRoute = {
	items: DocListItemWithPubDate[];
	param: string;
	tag: string;
};

export type DocsStructure = {
	entryRouteMap: Map<string, string>;
	folderRoutes: FolderRoute[];
	routes: SiteRoute[];
	tagRoutes: TagRoute[];
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

function formatFolderSegment(segment: string) {
	return segment
		.split(/[-_]/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function buildGeneratedFolderPage(folderPath: string): GeneratedFolderPageData {
	const pathSegments = folderPath.split('/').filter(Boolean);
	const fallbackTitle = pathSegments.length > 0
		? pathSegments.map(formatFolderSegment).join(' / ')
		: '文章列表';

	return {
		description: `按发布时间整理的 ${fallbackTitle} 文章列表。`,
		title: fallbackTitle,
	};
}

export function toTagSlug(tag: string) {
	return encodeURIComponent(tag.trim());
}

export function toTagHref(tag: string) {
	return `/tag/${toTagSlug(tag)}/`;
}

function compareDocListItems(left: DocListItemWithPubDate, right: DocListItemWithPubDate) {
	const leftTime = left.pubDate?.valueOf() ?? Number.NEGATIVE_INFINITY;
	const rightTime = right.pubDate?.valueOf() ?? Number.NEGATIVE_INFINITY;

	if (leftTime !== rightTime) {
		return rightTime - leftTime;
	}

	return left.title.localeCompare(right.title, 'zh-CN');
}

function compareEntriesByDateAndTitle(left: DocEntry, right: DocEntry) {
	const leftTime = left.data.pubDate?.valueOf() ?? Number.NEGATIVE_INFINITY;
	const rightTime = right.data.pubDate?.valueOf() ?? Number.NEGATIVE_INFINITY;

	if (leftTime !== rightTime) {
		return rightTime - leftTime;
	}

	return left.data.title.localeCompare(right.data.title, 'zh-CN');
}

function compareDocs(left: FolderDocMeta, right: FolderDocMeta) {
	if (left.isIndex !== right.isIndex) {
		return left.isIndex ? -1 : 1;
	}

	return compareEntriesByDateAndTitle(left.entry, right.entry);
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
	const generatedFolderRoutes: GeneratedFolderRoute[] = [];
	const articleRoutes: DocRoute[] = [];
	const tagMap = new Map<string, DocListItemWithPubDate[]>();

	for (const [folderPath, folderDocs] of folderMap) {
		const sortedDocs = [...folderDocs].sort(compareDocs);
		const nonIndexDocs = sortedDocs.filter((doc) => !doc.isIndex);
		const indexDoc = sortedDocs.find((doc) => doc.isIndex);

		if (!indexDoc && nonIndexDocs.length === 0) {
			continue;
		}

		const articleList = nonIndexDocs.length > 0
			? nonIndexDocs.map((doc) => ({
				id: doc.entry.id,
				href: toHref(doc.routePath),
				title: doc.entry.data.title,
			}))
			: [];

		if (indexDoc) {
			folderRoutes.push({
				articleList,
				entry: indexDoc.entry,
				routePath: folderPath === 'index' ? '' : folderPath,
			});
		} else {
			generatedFolderRoutes.push({
				articleList,
				generatedPage: buildGeneratedFolderPage(folderPath),
				routePath: folderPath === 'index' ? '' : folderPath,
			});
		}

		for (const doc of nonIndexDocs) {
			articleRoutes.push({
				articleList,
				entry: doc.entry,
				routePath: doc.routePath,
			});
		}
	}

	for (const entry of entries) {
		const routePath = entryRouteMap.get(entry.id);

		if (routePath === undefined) {
			continue;
		}

		for (const rawTag of new Set(entry.data.tags)) {
			const tag = rawTag.trim();

			if (!tag) {
				continue;
			}

			const taggedDocs = tagMap.get(tag) ?? [];
			taggedDocs.push({
				id: entry.id,
				href: toHref(routePath),
				pubDate: entry.data.pubDate,
				title: entry.data.title,
			});
			tagMap.set(tag, taggedDocs);
		}
	}

	const routes = [...folderRoutes, ...generatedFolderRoutes, ...articleRoutes].filter(
		(route, index, allRoutes) => allRoutes.findIndex((candidate) => candidate.routePath === route.routePath) === index,
	);
	const tagRoutes = [...tagMap.entries()]
		.sort(([leftTag], [rightTag]) => leftTag.localeCompare(rightTag, 'zh-CN'))
		.map(([tag, items]) => ({
			items: [...items].sort(compareDocListItems),
			param: tag,
			tag,
		}));

	return {
		entryRouteMap,
		folderRoutes,
		routes,
		tagRoutes,
	};
}