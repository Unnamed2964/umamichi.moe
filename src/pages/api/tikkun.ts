import { env } from 'cloudflare:workers';
import {
	ALLOWED_ORIGINS,
	SITE_ID,
	TIKKUN_SCHEMA_VERSION,
	type BaseTelemetryEvent,
} from '../../lib/telemetry';

export const prerender = false;

const GET_MESSAGE = `<p>✨</p>
<p>感谢您对本网站的技术细节的关注🥺</p>
<p>您正在使用 GET 方法访问。在 umamichi.moe/* 使用 POST 方法访问本 URL 时，以下内容将会被发送到 Cloudflare KV 中，作为了解用户体验的参考：</p>
<pre><code>{
	"version": 1,
	"siteId": "umamichi.moe",
	"page": {
		"pathname": "/blog/first-post/",
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
	"client": {
		"country": "JP",
		"city": "Tokyo",
		"asn": 13335,
		"asOrganization": "Cloudflare, Inc.",
		"deviceType": "desktop",
		"timezone": "Asia/Tokyo"
	}
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

	let telemetryEvent: BaseTelemetryEvent;
	try {
		telemetryEvent = await request.json();
	} catch {
		return new Response('invalid json', { status: 400 });
	}

	if (!env?.tikkun) {
		return new Response('missing tikkun binding', { status: 500 });
	}

	if (!origin || !ALLOWED_ORIGINS.has(origin)) {
		return new Response('invalid origin', { status: 403 });
	}

	if (telemetryEvent.version !== TIKKUN_SCHEMA_VERSION) {
		return new Response('invalid version', { status: 400 });
	}

	if (telemetryEvent.siteId !== SITE_ID) {
		return new Response('invalid siteId', { status: 400 });
	}

	const record = {
		kind: 'tikkun',
		version: telemetryEvent.version,
		siteId: telemetryEvent.siteId,
		page: telemetryEvent.page,
		browser: telemetryEvent.browser,
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

	await env.tikkun.put(`tikkun-${Date.now()}`, JSON.stringify(record));

	return new Response('ok');
}
