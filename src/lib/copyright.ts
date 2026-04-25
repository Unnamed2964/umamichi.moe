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

export type CopyrightConfig =
	| {
		kind: 'cc';
		license: CcLicenseId;
	}
	| {
		kind: 'no-repost';
		statement?: string;
	};

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
		href: 'https://creativecommons.org/licenses/by-nc/4.0/',
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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseCopyrightConfig(rawValue: unknown, sourceLabel: string): CopyrightConfig | undefined {
	if (rawValue === undefined || rawValue === null) {
		return undefined;
	}

	if (!isRecord(rawValue)) {
		throw new Error(`${sourceLabel} has an invalid copyright value.`);
	}

	const kind = rawValue.kind;
	if (kind === 'cc') {
		const license = rawValue.license;

		if (typeof license !== 'string' || !COPYRIGHT_CC_LICENSE_IDS.includes(license as CcLicenseId)) {
			throw new Error(`${sourceLabel} has an unsupported copyright.license value.`);
		}

		return {
			kind,
			license: license as CcLicenseId,
		};
	}

	if (kind === 'no-repost') {
		const statement = rawValue.statement;

		if (statement !== undefined && (typeof statement !== 'string' || !statement.trim())) {
			throw new Error(`${sourceLabel} has an invalid copyright.statement value.`);
		}

		return {
			kind,
			statement: typeof statement === 'string' ? statement.trim() : undefined,
		};
	}

	throw new Error(`${sourceLabel} has an unsupported copyright.kind value.`);
}