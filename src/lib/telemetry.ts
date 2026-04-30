export const SITE_ID = 'umamichi.moe';
export const TIKKUN_SCHEMA_VERSION = 2;
export const HESTER_SCHEMA_VERSION = 2;
export const ALLOWED_ORIGINS = new Set([
	'https://umamichi.moe',
	'https://www.umamichi.moe',
]);

export type JsonValue =
	| null
	| boolean
	| number
	| string
	| JsonValue[]
	| { [key: string]: JsonValue };

export interface PageTelemetry {
	[key: string]: JsonValue;
	pathname: string | null;
	referrer: string | null;
}

export interface BrowserTelemetry {
	[key: string]: JsonValue;
	userAgent: string | null;
	platform: string;
	mobile: boolean;
	language: string | null;
	hardwareConcurrency: number | null;
	deviceMemory: number | null;
	touch: boolean;
	devicePixelRatio: number | null;
	screen: {
		width: number | null;
		height: number | null;
	};
}

export interface BaseTelemetryEvent {
	[key: string]: JsonValue;
	version: number;
	siteId: string;
	page: PageTelemetry;
	browser: BrowserTelemetry;
}

export interface HesterTelemetryEvent extends BaseTelemetryEvent {
	[key: string]: JsonValue;
	error: {
		[key: string]: JsonValue;
		statusCode: number | null;
		statusTitle: string | null;
		requestPath: string | null;
	};
}

export function canonicalize(value: JsonValue): JsonValue {
	if (Array.isArray(value)) {
		return value.map(canonicalize);
	}

	if (value && typeof value === 'object') {
		return Object.keys(value)
			.sort()
			.reduce((result, key) => {
				result[key] = canonicalize(value[key]);
				return result;
			}, {} as { [key: string]: JsonValue });
	}

	return value;
}

export async function sha256Hex(input: string) {
	const bytes = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest('SHA-256', bytes);

	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

export function normalizePage(page: unknown): PageTelemetry {
	const candidate = page as { pathname?: unknown; referrer?: unknown } | null | undefined;
	let referrer = null;

	if (typeof candidate?.referrer === 'string') {
		try {
			referrer = new URL(candidate.referrer).origin;
		} catch {
			referrer = null;
		}
	}

	return {
		pathname: typeof candidate?.pathname === 'string' ? candidate.pathname : null,
		referrer,
	};
}

export function normalizeBrowser(browser: unknown): BrowserTelemetry {
	const candidate = browser as {
		userAgent?: unknown;
		platform?: unknown;
		mobile?: unknown;
		language?: unknown;
		hardwareConcurrency?: unknown;
		deviceMemory?: unknown;
		touch?: unknown;
		devicePixelRatio?: unknown;
		screen?: { width?: unknown; height?: unknown };
	} | null | undefined;

	return {
		userAgent: typeof candidate?.userAgent === 'string' ? candidate.userAgent : null,
		platform: typeof candidate?.platform === 'string' ? candidate.platform : 'unknown',
		mobile: typeof candidate?.mobile === 'boolean' ? candidate.mobile : false,
		language: typeof candidate?.language === 'string' ? candidate.language : null,
		hardwareConcurrency:
			typeof candidate?.hardwareConcurrency === 'number' ? candidate.hardwareConcurrency : null,
		deviceMemory: typeof candidate?.deviceMemory === 'number' ? candidate.deviceMemory : null,
		touch: typeof candidate?.touch === 'boolean' ? candidate.touch : false,
		devicePixelRatio:
			typeof candidate?.devicePixelRatio === 'number' ? candidate.devicePixelRatio : null,
		screen: {
			width: typeof candidate?.screen?.width === 'number' ? candidate.screen.width : null,
			height: typeof candidate?.screen?.height === 'number' ? candidate.screen.height : null,
		},
	};
}