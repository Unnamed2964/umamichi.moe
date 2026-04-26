import {
	canonicalize,
	sha256Hex,
	type BaseTelemetryEvent,
	type JsonValue,
} from './telemetry';

type NavigatorWithTelemetry = Navigator & {
	deviceMemory?: number;
	userAgentData?: {
		brands?: Array<{
			brand?: string;
			version?: string;
		}>;
		platform?: string;
		mobile?: boolean;
	};
};

function getReferrerOrigin() {
	if (!document.referrer) {
		return null;
	}

	try {
		return new URL(document.referrer).origin;
	} catch {
		return null;
	}
}

export function createBaseTelemetryEvent(version: number, siteId: string): BaseTelemetryEvent {
	const telemetryNavigator = navigator as NavigatorWithTelemetry;
	const uaData = telemetryNavigator.userAgentData || {};

	return {
		version,
		siteId,
		page: {
			pathname: window.location.pathname,
			referrer: getReferrerOrigin(),
		},
		browser: {
			userAgent: navigator.userAgent,
			platform: uaData.platform || 'unknown',
			mobile: uaData.mobile || false,
			language: navigator.language,
			hardwareConcurrency: navigator.hardwareConcurrency,
			deviceMemory: telemetryNavigator.deviceMemory ?? null,
			touch: 'ontouchstart' in window,
			devicePixelRatio: window.devicePixelRatio || 1,
			screen: {
				width: window.screen.width,
				height: window.screen.height,
			},
		},
	};
}

export async function postTelemetry<T extends object>(endpoint: string, event: T) {
	const hash = await sha256Hex(JSON.stringify(canonicalize(event as JsonValue)));

	return fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ...(event as object), hash }),
		keepalive: true,
	});
}