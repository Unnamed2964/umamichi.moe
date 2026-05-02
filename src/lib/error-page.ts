import { getCollection } from 'astro:content';
import { buildDocsStructure } from './docs';

const ERROR_PAGE_PATHS = new Set(['/404/', '/418/', '/500/', '/502/', '/503/', '/504/']);

function normalizePathname(pathname: string) {
	if (!pathname || pathname === '/') {
		return '/';
	}

	const trimmed = pathname.replace(/^\/+|\/+$/g, '');

	return trimmed ? `/${trimmed}/` : '/';
}

function toPathname(pathname: string) {
	return normalizePathname(new URL(pathname, 'https://umamichi.moe').pathname);
}

function getRecoveryCandidates(pathname: string) {
	const normalizedPath = normalizePathname(pathname);
	const segments = normalizedPath.split('/').filter(Boolean);
	const candidates: string[] = [];

	if (segments.length > 0) {
		candidates.push(normalizePathname(`/${segments.slice(0, Math.min(2, segments.length)).join('/')}/`));
	}

	for (let depth = segments.length - 1; depth >= 1; depth -= 1) {
		candidates.push(normalizePathname(`/${segments.slice(0, depth).join('/')}/`));
	}

	candidates.push('/', '/about/');

	return Array.from(new Set(candidates.filter((candidate) => !ERROR_PAGE_PATHS.has(candidate))));
}

async function getValidRouteSet() {
	const docs = await getCollection('docs');
	const { routes, tagRoutes } = buildDocsStructure(docs);
	const validRoutes = new Set<string>(['/', '/about/']);

	for (const route of routes) {
		validRoutes.add(toPathname(route.routePath ? `/${route.routePath}/` : '/'));
	}

	for (const route of tagRoutes) {
		validRoutes.add(toPathname(`/tag/${route.param}/`));
	}

	return validRoutes;
}

export async function getErrorPageRecoveryLink(pathname: string) {
	const normalizedPath = normalizePathname(pathname);

	if (ERROR_PAGE_PATHS.has(normalizedPath)) {
		return {
			href: '/about/',
			label: '前往关于页',
		};
	}

	const validRoutes = await getValidRouteSet();
	const candidates = getRecoveryCandidates(normalizedPath);
	const secondaryCandidate = candidates[0];
	const selected = candidates.find((candidate) => validRoutes.has(candidate)) ?? '/about/';

	let label = '前往较近的上级页面';

	if (selected === '/about/') {
		label = '前往关于页';
	} else if (selected === '/') {
		label = '返回主页';
	} else if (selected === secondaryCandidate) {
		label = '前往该 URL 的二级页面';
	}

	return {
		href: selected,
		label,
	};
}