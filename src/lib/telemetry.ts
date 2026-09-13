import {
	SITE_ID as CONFIG_SITE_ID,
	TELEMETRY_ALLOWED_ORIGINS,
} from './site-config';

export const SITE_ID = CONFIG_SITE_ID;
export const TIKKUN_SCHEMA_VERSION = 2;
export const HESTER_SCHEMA_VERSION = 2;
export const ALLOWED_ORIGINS = TELEMETRY_ALLOWED_ORIGINS;

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
