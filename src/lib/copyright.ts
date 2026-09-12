import { z } from 'zod';

export const COPYRIGHT_CC_LICENSE_IDS = [
	'cc0-1.0',
	'cc-by-4.0',
	'cc-by-sa-4.0',
	'cc-by-nd-4.0',
	'cc-by-nc-4.0',
	'cc-by-nc-sa-4.0',
	'cc-by-nc-nd-4.0',
] as const;

export type CcLicenseId = (typeof COPYRIGHT_CC_LICENSE_IDS)[number];

export const copyrightSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('cc'),
		license: z.enum(COPYRIGHT_CC_LICENSE_IDS),
	}),
	z.object({
		kind: z.literal('no-repost'),
		statement: z.string().trim().min(1).optional(),
	}),
]);

export type CopyrightConfig = z.infer<typeof copyrightSchema>;

export const COPYRIGHT_CC_DOWNLOADS_URL = 'https://creativecommons.org/mission/downloads/';

export const COPYRIGHT_CC_LICENSES: Record<CcLicenseId, { badgeSrc: string; href: string; label: string }> = {
	'cc0-1.0': {
		badgeSrc: 'https://i.creativecommons.org/p/zero/1.0/88x31.png',
		href: 'https://creativecommons.org/publicdomain/zero/1.0/',
		label: 'CC0 1.0',
	},
	'cc-by-4.0': {
		badgeSrc: 'https://i.creativecommons.org/l/by/4.0/88x31.png',
		href: 'https://creativecommons.org/licenses/by/4.0/',
		label: 'CC BY 4.0',
	},
	'cc-by-sa-4.0': {
		badgeSrc: 'https://i.creativecommons.org/l/by-sa/4.0/88x31.png',
		href: 'https://creativecommons.org/licenses/by-sa/4.0/',
		label: 'CC BY-SA 4.0',
	},
	'cc-by-nd-4.0': {
		badgeSrc: 'https://i.creativecommons.org/l/by-nd/4.0/88x31.png',
		href: 'https://creativecommons.org/licenses/by-nd/4.0/',
		label: 'CC BY-ND 4.0',
	},
	'cc-by-nc-4.0': {
		badgeSrc: 'https://i.creativecommons.org/l/by-nc/4.0/88x31.png',
		href: 'https://creativecommons.org/licenses/by-nc-4.0/',
		label: 'CC BY-NC 4.0',
	},
	'cc-by-nc-sa-4.0': {
		badgeSrc: 'https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png',
		href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
		label: 'CC BY-NC-SA 4.0',
	},
	'cc-by-nc-nd-4.0': {
		badgeSrc: 'https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png',
		href: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
		label: 'CC BY-NC-ND 4.0',
	},
};
