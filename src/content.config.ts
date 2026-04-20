import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
	loader: glob({ base: './src/content', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
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
