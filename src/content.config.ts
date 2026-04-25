import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
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

const docs = defineCollection({
	loader: glob({ base: './src/content', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			copyright: copyrightSchema.optional(),
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
