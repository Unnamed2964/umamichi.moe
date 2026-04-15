import { env } from "cloudflare:workers"

export const prerender = false;

export function GET() {
	return new Response('d727');
}

export async function POST({ request, locals }) {
	const cf = request.cf || {};
	const body = await request.json().catch(() => ({}));

	if (!env?.tikkun) {
		return new Response('missing tikkun binding', { status: 500 });
	}

	const record = {
		timestamp: Date.now(),
		client: {
			ip: request.headers.get('CF-Connecting-IP'),
			country: cf.country,
			city: cf.city,
			asn: cf.asn,
			asOrganization: cf.asOrganization,
			deviceType: cf.deviceType,
			timezone: cf.timezone,
		},
		browser: body,
	};

	await env.tikkun.put(`log-${Date.now()}`, JSON.stringify(record));

	return new Response('ok');
}