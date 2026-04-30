import type { CollectionEntry } from 'astro:content';
import { parse as parseYaml } from 'yaml';
import { parseCopyrightConfig, type CopyrightConfig } from './copyright';

type DocEntry = CollectionEntry<'docs'>;

export type NavIconKind =
	| 'normal'
	| 'transfer'
	| 'transfer-and-out-of-station-transfer'
	| 'out-of-station-transfer'
	| 'out-of-station-transfer-and-out-of-station-transfer';

export type FolderListItem = {
	fixOrder?: number;
	href: string;
	id: string;
	kind: 'folder';
	timeless: true;
	title: string;
	icon?: NavIconKind;
};

export type DocListItem = {
	fixOrder?: number;
	href: string;
	id: string;
	kind: 'doc';
	pubDate?: Date;
	timeless: boolean;
	title: string;
};

export type FolderPageListItem = FolderListItem | DocListItem;

type SourceDocMeta = {
	folderPath: string;
	id: string;
	isIndex: boolean;
	rawContent: string;
	routePath: string;
	sourcePath: string;
};

type RawFolderMeta = {
	comment?: boolean;
	copyright?: CopyrightConfig;
	fixOrder?: number;
	icon?: string;
	name?: string;
	timeless?: boolean;
	title?: string;
};

type FolderMeta = {
	comment?: boolean;
	copyright?: CopyrightConfig;
	fixOrder?: number;
	icon?: NavIconKind;
	timelessEffectToFile: boolean;
	title?: string;
};

type ResolvedDocMeta = SourceDocMeta & {
	comment?: boolean;
	copyright?: CopyrightConfig;
	entry: DocEntry;
	fixOrder?: number;
	timeless: boolean;
};

type FolderState = {
	childItems: FolderPageListItem[];
	depth: number;
	directChildFolders: string[];
	displayTitle: string;
	folderPath: string;
	indexDoc?: ResolvedDocMeta;
	meta: FolderMeta;
	nonIndexDocs: ResolvedDocMeta[];
	parentPath?: string;
	routePath: string;
};

type ScannedContent = {
	folderPaths: string[];
	rawFolderMetaMap: Map<string, RawFolderMeta>;
	sourceDocs: SourceDocMeta[];
};

export type FolderRoute = {
	childItems: FolderPageListItem[];
	entry: DocEntry;
	routePath: string;
};

export type GeneratedFolderPageData = {
	comment?: boolean;
	description: string;
	title: string;
};

export type GeneratedFolderRoute = {
	childItems: FolderPageListItem[];
	generatedPage: GeneratedFolderPageData;
	routePath: string;
};

export type FolderListData = {
	childItems: FolderPageListItem[];
	routePath: string;
};

export type DocRoute = {
	entry: DocEntry;
	routePath: string;
};

export type SiteRoute = FolderRoute | GeneratedFolderRoute | DocRoute;

export type TagRoute = {
	items: DocListItem[];
	param: string;
	tag: string;
};

export type SidebarDocNode = {
	href: string;
	id: string;
	kind: 'doc';
	level: number;
	title: string;
};

export type SidebarFolderNode = {
	children: SidebarNode[];
	href: string;
	kind: 'folder';
	level: number;
	routePath: string;
	title: string;
};

export type SidebarNode = SidebarFolderNode | SidebarDocNode;

export type TopLevelNavItem = {
	folderPath: string;
	href: string;
	icon: NavIconKind;
	label: string;
};

export type DocsStructure = {
	docDataById: Map<string, { comment?: boolean; copyright?: CopyrightConfig; rawContent: string; routePath: string; sourcePath: string }>;
	entryRouteMap: Map<string, string>;
	folderRoutes: FolderRoute[];
	routes: SiteRoute[];
	tagRoutes: TagRoute[];
	topLevelFolderTrees: Map<string, SidebarFolderNode>;
	topLevelNavItems: TopLevelNavItem[];
};

type TimedComparableItem = {
	fixOrder?: number;
	pubDate?: Date;
	timeless: boolean;
	title: string;
};

const SOURCE_DOC_FILES = [
	...Object.keys(import.meta.glob('../content/**/*.md')),
	...Object.keys(import.meta.glob('../content/**/*.mdx')),
];

const SOURCE_DOC_RAW_FILES = import.meta.glob('../content/**/*.{md,mdx}', {
	eager: true,
	import: 'default',
	query: '?raw',
}) as Record<string, string>;

const SOURCE_FOLDER_META_FILES = import.meta.glob('../content/**/_meta.{yml,yaml}', {
	eager: true,
	import: 'default',
	query: '?raw',
}) as Record<string, string>;

const VALID_NAV_ICON_KINDS = new Set<NavIconKind>([
	'normal',
	'transfer',
	'transfer-and-out-of-station-transfer',
	'out-of-station-transfer',
	'out-of-station-transfer-and-out-of-station-transfer',
]);

function toPosixPath(path: string) {
	return path.replaceAll('\\', '/');
}

function joinPosixPath(...parts: string[]) {
	return parts.filter(Boolean).join('/');
}

function toHref(routePath: string) {
	return routePath ? `/${routePath}/` : '/';
}

function normalizeRoutePath(routePath: string) {
	return routePath.replace(/^\/+|\/+$/g, '');
}

function formatFolderSegment(segment: string) {
	return segment
		.split(/[-_]/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function getFolderDepth(folderPath: string) {
	return folderPath ? folderPath.split('/').length : 0;
}

function getParentFolderPath(folderPath: string) {
	if (!folderPath) {
		return undefined;
	}

	const segments = folderPath.split('/');
	segments.pop();

	return segments.join('/');
}

function addFolderPathWithAncestors(folderPathSet: Set<string>, folderPath: string) {
	folderPathSet.add(folderPath);

	let currentPath = folderPath;
	while (currentPath) {
		const parentPath = getParentFolderPath(currentPath);

		if (parentPath === undefined) {
			break;
		}

		folderPathSet.add(parentPath);
		currentPath = parentPath;
	}
	folderPathSet.add('');
}

function parseFolderMeta(sourcePath: string, rawContent: string): RawFolderMeta {
	const parsed = parseYaml(rawContent);

	if (parsed === null || parsed === undefined) {
		return {};
	}

	if (typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error(`Folder meta file ${sourcePath} must contain a YAML object.`);
	}

	const { comment, copyright, icon, name, timeless, title } = parsed as Record<string, unknown>;
	const fixOrder = (parsed as Record<string, unknown>)['fix-order'];

	if (comment !== undefined && typeof comment !== 'boolean') {
		throw new Error(`Folder meta file ${sourcePath} has an invalid comment value.`);
	}

	if (icon !== undefined && typeof icon !== 'string') {
		throw new Error(`Folder meta file ${sourcePath} has an invalid icon value.`);
	}

	if (name !== undefined && typeof name !== 'string') {
		throw new Error(`Folder meta file ${sourcePath} has an invalid name value.`);
	}

	if (timeless !== undefined && typeof timeless !== 'boolean') {
		throw new Error(`Folder meta file ${sourcePath} has an invalid timeless value.`);
	}

	if (title !== undefined && typeof title !== 'string') {
		throw new Error(`Folder meta file ${sourcePath} has an invalid title value.`);
	}

	if (fixOrder !== undefined && (typeof fixOrder !== 'number' || !Number.isInteger(fixOrder) || fixOrder >= 0)) {
		throw new Error(`Folder meta file ${sourcePath} has an invalid fix-order value.`);
	}

	return {
		comment,
		copyright: parseCopyrightConfig(copyright, `Folder meta file ${sourcePath}`),
		fixOrder: fixOrder as number | undefined,
		icon,
		name,
		timeless,
		title,
	};
}

function resolveFolderMeta(folderPath: string, rawMeta: RawFolderMeta | undefined, parentMeta: FolderMeta | undefined): FolderMeta {
	const resolvedIcon = rawMeta?.icon;

	if (resolvedIcon !== undefined && !VALID_NAV_ICON_KINDS.has(resolvedIcon as NavIconKind)) {
		throw new Error(`Folder ${folderPath || '/'} has an unsupported icon value: ${resolvedIcon}.`);
	}

	return {
		comment: rawMeta?.comment ?? parentMeta?.comment,
		copyright: rawMeta?.copyright ?? parentMeta?.copyright,
		fixOrder: rawMeta?.fixOrder,
		icon: resolvedIcon as NavIconKind | undefined,
		timelessEffectToFile: rawMeta?.timeless ?? parentMeta?.timelessEffectToFile ?? false,
		title: rawMeta?.title ?? rawMeta?.name,
	};
}

function buildGeneratedFolderPage(folder: FolderState): GeneratedFolderPageData {
	const fallbackTitle = folder.displayTitle || '文章列表';

	return {
		comment: folder.meta.comment,
		description: `这里收录了 ${fallbackTitle} 下的文件与子目录。`,
		title: fallbackTitle,
	};
}

export function toTagSlug(tag: string) {
	return encodeURIComponent(tag.trim());
}

export function toTagHref(tag: string) {
	return `/tag/${toTagSlug(tag)}/`;
}

export function getFolderListData(docsStructure: DocsStructure, folder: string): FolderListData {
	const routePath = normalizeRoutePath(folder);
	const folderRoute = docsStructure.folderRoutes.find((route) => route.routePath === routePath);

	if (folderRoute) {
		return {
			childItems: folderRoute.childItems,
			routePath: folderRoute.routePath,
		};
	}

	const generatedFolderRoute = docsStructure.routes.find(
		(route): route is GeneratedFolderRoute => 'generatedPage' in route && route.routePath === routePath,
	);

	if (generatedFolderRoute) {
		return {
			childItems: generatedFolderRoute.childItems,
			routePath: generatedFolderRoute.routePath,
		};
	}

	throw new Error(`Unable to resolve folder list data for ${routePath || '/'}.`);
}

function compareTimedItems(left: TimedComparableItem, right: TimedComparableItem) {
	if (left.fixOrder !== undefined || right.fixOrder !== undefined) {
		if (left.fixOrder === undefined) {
			return 1;
		}

		if (right.fixOrder === undefined) {
			return -1;
		}

		if (left.fixOrder !== right.fixOrder) {
			return left.fixOrder - right.fixOrder;
		}
	}

	if (left.timeless !== right.timeless) {
		return left.timeless ? -1 : 1;
	}

	if (left.timeless) {
		return left.title.localeCompare(right.title, 'zh-CN');
	}

	const leftTime: number = left.pubDate?.valueOf() ?? Number.NEGATIVE_INFINITY;
	const rightTime: number = right.pubDate?.valueOf() ?? Number.NEGATIVE_INFINITY;

	if (leftTime !== rightTime) {
		return rightTime - leftTime;
	}

	return left.title.localeCompare(right.title, 'zh-CN');
}

function compareFolderPageItems(left: FolderPageListItem, right: FolderPageListItem) {
	return compareTimedItems(left, right);
}

function compareTagItems(left: DocListItem, right: DocListItem) {
	return compareTimedItems(left, right);
}

function assertUniqueFixOrders(items: Array<Pick<FolderPageListItem, 'fixOrder' | 'title'>>, contextLabel: string) {
	const seenFixOrders = new Map<number, string>();

	for (const item of items) {
		if (item.fixOrder === undefined) {
			continue;
		}

		const existingItemTitle = seenFixOrders.get(item.fixOrder);
		if (existingItemTitle) {
			throw new Error(`${contextLabel} contains duplicate fix-order ${item.fixOrder}: ${existingItemTitle}, ${item.title}.`);
		}

		seenFixOrders.set(item.fixOrder, item.title);
	}
}

function buildFolderListItem(folder: FolderState): FolderListItem {
	return {
		fixOrder: folder.meta.fixOrder,
		href: toHref(folder.routePath),
		id: `folder:${folder.routePath || 'index'}`,
		icon: folder.depth === 1 ? folder.meta.icon : undefined,
		kind: 'folder',
		timeless: true,
		title: folder.displayTitle,
	};
}

function buildDocListItem(doc: ResolvedDocMeta): DocListItem {
	return {
		fixOrder: doc.fixOrder,
		href: toHref(doc.routePath),
		id: doc.entry.id,
		kind: 'doc',
		pubDate: doc.entry.data.pubDate,
		timeless: doc.timeless,
		title: doc.entry.data.title,
	};
}

function scanContentDirectory(): ScannedContent {
	const folderPathSet = new Set<string>(['']);
	const idSourceMap = new Map<string, string[]>();
	const indexSourceMap = new Map<string, string[]>();
	const rawFolderMetaMap = new Map<string, RawFolderMeta>();
	const sourceDocs = SOURCE_DOC_FILES.map<SourceDocMeta>((sourcePath) => {
		const normalizedPath = toPosixPath(sourcePath);
		const relativePath = normalizedPath.replace(/^\.\.\/content\//, '');
		const rawContent = SOURCE_DOC_RAW_FILES[sourcePath];
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
		addFolderPathWithAncestors(folderPathSet, folderPath);

		if (isIndex) {
			const indexSources = indexSourceMap.get(folderPath) ?? [];
			indexSources.push(relativePath);
			indexSourceMap.set(folderPath, indexSources);
		}

		return {
			folderPath,
			id,
			isIndex,
			rawContent,
			routePath,
			sourcePath: `src/content/${relativePath}`,
		};
	});

	for (const [sourcePath, rawContent] of Object.entries(SOURCE_FOLDER_META_FILES)) {
		const normalizedPath = toPosixPath(sourcePath);
		const relativePath = normalizedPath.replace(/^\.\.\/content\/?/, '');
		const folderPath = relativePath.replace(/(?:^|\/)_meta\.ya?ml$/u, '');
		const normalizedFolderPath = folderPath === relativePath ? '' : folderPath;

		if (rawFolderMetaMap.has(normalizedFolderPath)) {
			throw new Error(`Folder ${normalizedFolderPath || '/'} cannot contain multiple meta files.`);
		}

		rawFolderMetaMap.set(normalizedFolderPath, parseFolderMeta(relativePath, rawContent));
		addFolderPathWithAncestors(folderPathSet, normalizedFolderPath);
	}

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

	return {
		folderPaths: [...folderPathSet].sort((left, right) => {
			const depthDiff = getFolderDepth(left) - getFolderDepth(right);

			return depthDiff !== 0 ? depthDiff : left.localeCompare(right, 'zh-CN');
		}),
		rawFolderMetaMap,
		sourceDocs,
	};
}

function buildSidebarTree(folderPath: string, folderStateMap: Map<string, FolderState>): SidebarFolderNode {
	const folder = folderStateMap.get(folderPath);

	if (!folder) {
		throw new Error(`Unable to build sidebar tree for folder ${folderPath || '/'}.`);
	}

	return {
		children: folder.childItems.map((item) => {
			if (item.kind === 'folder') {
				const childFolderPath = item.href.replace(/^\//, '').replace(/\/$/, '');
				return buildSidebarTree(childFolderPath, folderStateMap);
			}

			return {
				href: item.href,
				id: item.id,
				kind: 'doc',
				level: folder.depth + 1,
				title: item.title,
			} satisfies SidebarDocNode;
		}),
		href: toHref(folder.routePath),
		kind: 'folder',
		level: folder.depth,
		routePath: folder.routePath,
		title: folder.displayTitle,
	};
}

export function buildDocsStructure(entries: DocEntry[]): DocsStructure {
	const docsById = new Map(entries.map((entry) => [entry.id, entry]));
	const scannedContent = scanContentDirectory();
	const docDataById = new Map<string, { comment?: boolean; copyright?: CopyrightConfig; rawContent: string; routePath: string; sourcePath: string }>();
	const entryRouteMap = new Map<string, string>();
	const folderMetaMap = new Map<string, FolderMeta>();
	const folderStateMap = new Map<string, FolderState>();
	const folderRoutes: FolderRoute[] = [];
	const generatedFolderRoutes: GeneratedFolderRoute[] = [];
	const articleRoutes: DocRoute[] = [];
	const tagMap = new Map<string, DocListItem[]>();

	for (const folderPath of scannedContent.folderPaths) {
		const parentPath = getParentFolderPath(folderPath);
		const parentMeta = parentPath === undefined ? undefined : folderMetaMap.get(parentPath);
		const meta = resolveFolderMeta(folderPath, scannedContent.rawFolderMetaMap.get(folderPath), parentMeta);

		folderMetaMap.set(folderPath, meta);
		folderStateMap.set(folderPath, {
			childItems: [],
			depth: getFolderDepth(folderPath),
			directChildFolders: [],
			displayTitle: meta.title ?? (folderPath ? formatFolderSegment(folderPath.split('/').at(-1) ?? folderPath) : '首页'),
			folderPath,
			meta,
			nonIndexDocs: [],
			parentPath,
			routePath: folderPath,
		});
	}

	for (const folderPath of scannedContent.folderPaths) {
		const parentPath = getParentFolderPath(folderPath);

		if (parentPath === undefined) {
			continue;
		}

		folderStateMap.get(parentPath)?.directChildFolders.push(folderPath);
	}

	const resolvedDocs: ResolvedDocMeta[] = scannedContent.sourceDocs.map((sourceDoc) => {
		const entry = docsById.get(sourceDoc.id);

		if (!entry) {
			throw new Error(`Unable to resolve content entry for ${sourceDoc.id}.`);
		}

		const folderMeta = folderMetaMap.get(sourceDoc.folderPath);
		const comment = entry.data.comment ?? folderMeta?.comment;
		const copyright = entry.data.copyright ?? folderMeta?.copyright;
		const fixOrder = entry.data['fix-order'];
		const timeless = entry.data.timeless ?? folderMeta?.timelessEffectToFile ?? false;
		const resolvedDoc = {
			comment,
			copyright,
			...sourceDoc,
			entry,
			fixOrder,
			timeless,
		};

		docDataById.set(sourceDoc.id, {
			comment,
			copyright,
			rawContent: sourceDoc.rawContent,
			routePath: sourceDoc.routePath,
			sourcePath: sourceDoc.sourcePath,
		});

		entryRouteMap.set(sourceDoc.id, sourceDoc.routePath);

		const folderState = folderStateMap.get(sourceDoc.folderPath);
		if (!folderState) {
			throw new Error(`Unable to resolve folder state for ${sourceDoc.folderPath || '/'}.`);
		}

		if (sourceDoc.isIndex) {
			folderState.indexDoc = resolvedDoc;
		} else {
			folderState.nonIndexDocs.push(resolvedDoc);
		}

		return resolvedDoc;
	});

	for (const folderState of folderStateMap.values()) {
		const childFolderItems = folderState.directChildFolders
			.map((childPath) => folderStateMap.get(childPath))
			.filter((childFolder): childFolder is FolderState => Boolean(childFolder))
			.filter((childFolder) => childFolder.indexDoc !== undefined || childFolder.nonIndexDocs.length > 0 || childFolder.directChildFolders.length > 0)
			.map(buildFolderListItem);
		const childDocItems = folderState.nonIndexDocs.map(buildDocListItem);

		folderState.nonIndexDocs.sort((left, right) => compareTagItems(buildDocListItem(left), buildDocListItem(right)));
		assertUniqueFixOrders([...childFolderItems, ...childDocItems], `Folder ${folderState.routePath || '/'}`);
		folderState.childItems = [...childFolderItems, ...childDocItems].sort(compareFolderPageItems);

		if (!folderState.indexDoc && folderState.childItems.length === 0) {
			continue;
		}

		if (folderState.indexDoc) {
			folderRoutes.push({
				childItems: folderState.childItems,
				entry: folderState.indexDoc.entry,
				routePath: folderState.routePath,
			});
		} else {
			generatedFolderRoutes.push({
				childItems: folderState.childItems,
				generatedPage: buildGeneratedFolderPage(folderState),
				routePath: folderState.routePath,
			});
		}
	}

	for (const resolvedDoc of resolvedDocs) {
		if (!resolvedDoc.isIndex) {
			articleRoutes.push({
				entry: resolvedDoc.entry,
				routePath: resolvedDoc.routePath,
			});
		}

		for (const rawTag of new Set(resolvedDoc.entry.data.tags)) {
			const tag = rawTag.trim();

			if (!tag) {
				continue;
			}

			const taggedDocs = tagMap.get(tag) ?? [];
			taggedDocs.push(buildDocListItem(resolvedDoc));
			tagMap.set(tag, taggedDocs);
		}
	}

	const topLevelFolderTrees = new Map<string, SidebarFolderNode>();
	const rootFolderState = folderStateMap.get('');
	const topLevelNavSourceItems = [
		...(rootFolderState?.indexDoc ? [buildDocListItem(rootFolderState.indexDoc)] : []),
		...(rootFolderState?.childItems ?? []),
	];
	assertUniqueFixOrders(topLevelNavSourceItems, 'Top-level navigation');
	const topLevelNavItems = [...topLevelNavSourceItems]
		.sort(compareFolderPageItems)
		.map((item) => {
			const folderPath = item.href.replace(/^\//, '').replace(/\/$/, '');

			if (item.kind === 'folder') {
				topLevelFolderTrees.set(folderPath, buildSidebarTree(folderPath, folderStateMap));
			}

			return {
				folderPath,
				href: item.href,
				icon: item.kind === 'folder' ? item.icon ?? 'normal' : 'normal',
				label: item.title,
			};
		});

	const tagRoutes = [...tagMap.entries()]
		.sort(([leftTag], [rightTag]) => leftTag.localeCompare(rightTag, 'zh-CN'))
		.map(([tag, items]) => {
			assertUniqueFixOrders(items, `Tag ${tag}`);

			return {
				items: [...items].sort(compareTagItems),
				param: tag,
				tag,
			};
		});

	return {
		docDataById,
		entryRouteMap,
		folderRoutes,
		routes: [...folderRoutes, ...generatedFolderRoutes, ...articleRoutes],
		tagRoutes,
		topLevelFolderTrees,
		topLevelNavItems,
	};
}