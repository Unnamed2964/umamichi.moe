import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import umamichiConfig from '../umamichi.config.mjs';
import { COPYRIGHT_CC_LICENSE_IDS } from './lib/copyright';

const copyrightSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('cc'),
		license: z.enum(COPYRIGHT_CC_LICENSE_IDS),
	}),
	z.object({
		kind: z.literal('no-repost'),
		statement: z.string().trim().min(1).optional(),
	}),
]);

/** Keep entry ids aligned with filesystem routes in `src/lib/docs.ts` (do not github-slug spaces). */
function contentEntryIdFromPath(entry: string) {
	const withoutExt = entry.replace(/\\/g, '/').replace(/\.mdx?$/u, '');

	if (withoutExt === 'index') {
		return 'index';
	}

	if (withoutExt.endsWith('/index')) {
		return withoutExt.slice(0, -'/index'.length) || 'index';
	}

	return withoutExt;
}

const docs = defineCollection({
	loader: glob({
		base: './src/content',
		pattern: '**/*.{md,mdx}',
		ignore: umamichiConfig.content.excludeDocGlobs,
		generateId: ({ entry }) => contentEntryIdFromPath(entry),
	}),
	schema: ({ image }) =>
		z.object({
			copyright: copyrightSchema.optional(),
			comment: z.boolean().optional(),
			title: z.string(),
			tags: z.array(z.string().trim().min(1)).default([]),
			'fix-order': z.number().int().lt(0).optional(),
			pubDate: z.coerce.date().optional(),
			timeless: z.boolean().optional(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			rss: z.boolean().optional(),
		}),
});

export const collections = { docs };
