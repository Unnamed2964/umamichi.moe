import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { buildDocsStructure } from '../lib/docs';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const docs = await getCollection('docs');
	const { entryRouteMap } = buildDocsStructure(docs);
	const items = docs
		.filter((entry) => entry.data.pubDate && entry.data.rss !== false)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		.map((entry) => ({
			...entry.data,
			link: (() => {
				const routePath = entryRouteMap.get(entry.id) ?? '';
				return routePath ? `/${routePath}/` : '/';
			})(),
		}));

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items,
	});
}
