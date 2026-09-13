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
