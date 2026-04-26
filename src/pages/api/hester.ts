import { env } from 'cloudflare:workers';
import {
	ALLOWED_ORIGINS,
	HESTER_SCHEMA_VERSION,
	SITE_ID,
	canonicalize,
	normalizeBrowser,
	normalizePage,
	sha256Hex,
	type HesterTelemetryEvent,
} from '../../lib/telemetry';

export const prerender = false;

const GET_MESSAGE = `<p>🌫️</p>
<p>这里用于记录 404 / 50x 错误页进入事件。</p>
<p>您正在使用 GET 方法访问。在 umamichi.moe 的错误页中使用 POST 方法访问本 URL 时，以下内容将会被发送到 Cloudflare KV 中，作为错误访问路径与设备环境的参考：</p>
<pre><code>{
	"version": 1,
	"siteId": "umamichi.moe",
	"page": {
		"pathname": "/404/",
		"referrer": "https://example.com"
	},
	"browser": {
		"userAgent": "Mozilla/5.0 ...",
		"platform": "Windows",
		"mobile": false,
		"language": "zh-CN",
		"hardwareConcurrency": 8,
		"deviceMemory": 8,
		"touch": false,
		"devicePixelRatio": 1.25,
		"screen": {
			"width": 2560,
			"height": 1440
		}
	},
	"error": {
		"statusCode": 404,
		"statusTitle": "Page Not Found",
		"requestPath": "/missing-page/"
	},
	"hash": "sha256-hex"
}</code></pre>`;

export function GET() {
	return new Response(GET_MESSAGE, {
		headers: {
			'content-type': 'text/html; charset=utf-8',
		},
	});
}

export async function POST({ request }: { request: Request }) {
	const cf = request.cf || {};
	const origin = request.headers.get('Origin');
	const body = await request.json().catch(() => ({} as Record<string, unknown>));

	if (!env?.tikkun) {
		return new Response('missing tikkun binding', { status: 500 });
	}

	if (!origin || !ALLOWED_ORIGINS.has(origin)) {
		return new Response('invalid origin', { status: 403 });
	}

	const { hash, ...event } = body as Record<string, unknown> & { hash?: unknown };
	const telemetryEvent = event as HesterTelemetryEvent;

	if (typeof hash !== 'string' || hash.length === 0) {
		return new Response('missing hash', { status: 400 });
	}

	if (telemetryEvent.version !== HESTER_SCHEMA_VERSION) {
		return new Response('invalid version', { status: 400 });
	}

	if (telemetryEvent.siteId !== SITE_ID) {
		return new Response('invalid siteId', { status: 400 });
	}

	const expectedHash = await sha256Hex(JSON.stringify(canonicalize(telemetryEvent)));

	if (hash !== expectedHash) {
		return new Response('invalid hash', { status: 400 });
	}

	const record = {
		kind: 'hester',
		version: telemetryEvent.version,
		siteId: telemetryEvent.siteId,
		page: normalizePage(telemetryEvent.page),
		browser: normalizeBrowser(telemetryEvent.browser),
		error: {
			statusCode:
				typeof telemetryEvent.error?.statusCode === 'number' ? telemetryEvent.error.statusCode : null,
			statusTitle:
				typeof telemetryEvent.error?.statusTitle === 'string' ? telemetryEvent.error.statusTitle : null,
			requestPath:
				typeof telemetryEvent.error?.requestPath === 'string' ? telemetryEvent.error.requestPath : null,
		},
		hash,
		timestamp: Date.now(),
		client: {
			country: cf.country,
			city: cf.city,
			asn: cf.asn,
			asOrganization: cf.asOrganization,
			deviceType: cf.deviceType,
			timezone: cf.timezone,
		},
	};

	await env.tikkun.put(`hester-${Date.now()}`, JSON.stringify(record));

	return new Response('ok');
}