import { env } from "cloudflare:workers"

export const prerender = false;

const TIKKUN_SCHEMA_VERSION = 1;
const TIKKUN_SITE_ID = 'umamichi.moe';
const ALLOWED_ORIGINS = new Set([
	'https://umamichi.moe',
	'https://www.umamichi.moe',
]);
const GET_MESSAGE = `<p>🌟</p>
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
	},
	"hash": "sha256-hex"
}</code></pre>`;

function canonicalize(value) {
	if (Array.isArray(value)) {
		return value.map(canonicalize);
	}

	if (value && typeof value === 'object') {
		return Object.keys(value)
			.sort()
			.reduce((result, key) => {
				result[key] = canonicalize(value[key]);
				return result;
			}, {});
	}

	return value;
}

async function sha256Hex(input) {
	const bytes = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest('SHA-256', bytes);

	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

function normalizePage(page) {
	let referrer = null;

	if (typeof page?.referrer === 'string') {
		try {
			referrer = new URL(page.referrer).origin;
		} catch {
			referrer = null;
		}
	}

	return {
		pathname: typeof page?.pathname === 'string' ? page.pathname : null,
		referrer,
	};
}

function normalizeBrowser(browser) {
	return {
		userAgent: typeof browser?.userAgent === 'string' ? browser.userAgent : null,
		platform: typeof browser?.platform === 'string' ? browser.platform : 'unknown',
		mobile: Boolean(browser?.mobile),
		language: typeof browser?.language === 'string' ? browser.language : null,
		hardwareConcurrency:
			typeof browser?.hardwareConcurrency === 'number' ? browser.hardwareConcurrency : null,
		deviceMemory: typeof browser?.deviceMemory === 'number' ? browser.deviceMemory : null,
		touch: Boolean(browser?.touch),
		devicePixelRatio:
			typeof browser?.devicePixelRatio === 'number' ? browser.devicePixelRatio : null,
		screen: {
			width: typeof browser?.screen?.width === 'number' ? browser.screen.width : null,
			height: typeof browser?.screen?.height === 'number' ? browser.screen.height : null,
		},
	};
}

export function GET() {
	return new Response(GET_MESSAGE, {
		headers: {
			'content-type': 'text/html; charset=utf-8',
		},
	});
}

export async function POST({ request }) {
	const cf = request.cf || {};
	const origin = request.headers.get('Origin');
	const body = await request.json().catch(() => ({}));

	if (!env?.tikkun) {
		return new Response('missing tikkun binding', { status: 500 });
	}

	if (!origin || !ALLOWED_ORIGINS.has(origin)) {
		return new Response('invalid origin', { status: 403 });
	}

	const { hash, ...event } = body;

	if (typeof hash !== 'string' || hash.length === 0) {
		return new Response('missing hash', { status: 400 });
	}

	if (event.version !== TIKKUN_SCHEMA_VERSION) {
		return new Response('invalid version', { status: 400 });
	}

	if (event.siteId !== TIKKUN_SITE_ID) {
		return new Response('invalid siteId', { status: 400 });
	}

	const expectedHash = await sha256Hex(JSON.stringify(canonicalize(event)));

	if (hash !== expectedHash) {
		return new Response('invalid hash', { status: 400 });
	}

	const record = {
		version: event.version,
		siteId: event.siteId,
		page: normalizePage(event.page),
		browser: normalizeBrowser(event.browser),
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

	await env.tikkun.put(`log-${Date.now()}`, JSON.stringify(record));

	return new Response('ok');
}