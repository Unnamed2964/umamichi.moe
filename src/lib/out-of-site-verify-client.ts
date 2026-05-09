import { buildCanonicalOutOfSiteMessage } from './out-of-site-payload.mjs';
import { hmacSha256Base64Url, timingSafeEqualUtf8 } from './out-of-site-giscus-hmac';

function spkiB64ToUint8Array(b64: string) {
	const binary = atob(b64.trim());
	const out = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		out[i] = binary.charCodeAt(i);
	}
	return out;
}

function base64UrlToUint8Array(value: string) {
	const pad = '='.repeat((4 - (value.length % 4)) % 4);
	const b64 = (value + pad).replace(/-/g, '+').replace(/_/g, '/');
	const binary = atob(b64);
	const out = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		out[i] = binary.charCodeAt(i);
	}
	return out;
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
	return view.slice().buffer;
}

function setStatus(message: string, detail?: string, tone: 'normal' | 'warning' = 'normal') {
	const status = document.getElementById('out-of-site-status');
	const detailEl = document.getElementById('out-of-site-detail');
	if (status) {
		status.textContent = message;
		status.hidden = message.length === 0;
		status.classList.toggle('is-warning', tone === 'warning');
	}
	if (detailEl) {
		if (detail) {
			detailEl.textContent = detail;
			detailEl.hidden = false;
		} else {
			detailEl.textContent = '';
			detailEl.hidden = true;
		}
	}
}

/** Same UX as browsing to the static error recovery routes (`/404/`, `/500/`, `/503/`). */
function replaceWithErrorRecovery(path: '/404/' | '/500/' | '/503/') {
	window.location.replace(path);
}

export type OutOfSiteVerifyEnv = {
	ed25519SpkiB64: string;
	outOfSiteLinkHmacKey: string;
};

export async function runOutOfSitePage(env: OutOfSiteVerifyEnv) {
	const { ed25519SpkiB64, outOfSiteLinkHmacKey } = env;
	const params = new URLSearchParams(window.location.search);
	const to = params.get('to');
	const sig = params.get('sig');
	const kind = params.get('kind');
	const hash = params.get('hash');

	const proceed = document.getElementById('out-of-site-proceed');
	const showProceed = () => {
		if (proceed instanceof HTMLAnchorElement) {
			proceed.href = destination.href;
			proceed.removeAttribute('target');
			proceed.removeAttribute('rel');
			proceed.hidden = false;
		}
	};

	if (!to || !kind) {
		replaceWithErrorRecovery('/404/');
		return;
	}

	if (kind !== 'ssr' && kind !== 'giscus') {
		replaceWithErrorRecovery('/404/');
		return;
	}

	let destination: URL;
	try {
		destination = new URL(to);
	} catch {
		replaceWithErrorRecovery('/404/');
		return;
	}

	if (destination.protocol !== 'http:' && destination.protocol !== 'https:') {
		replaceWithErrorRecovery('/404/');
		return;
	}

	if (!outOfSiteLinkHmacKey) {
		replaceWithErrorRecovery('/503/');
		return;
	}
	if (!hash) {
		replaceWithErrorRecovery('/404/');
		return;
	}

	const hmacToken = buildCanonicalOutOfSiteMessage({ kind, toHref: destination.href });
	const expectedHmac = await hmacSha256Base64Url(outOfSiteLinkHmacKey, hmacToken);
	if (!timingSafeEqualUtf8(hash, expectedHmac)) {
		replaceWithErrorRecovery('/404/');
		return;
	}

	if (kind === 'giscus') {
		setStatus('您即将访问第三方网站，本链接由用户提供，本站不对其内容与安全性负责。', destination.href);
		showProceed();
		return;
	}

	/* kind === 'ssr' — 对称 HMAC（hash）已通过；可选 Ed25519（sig） */
	let verified = false;
	if (sig) {
		if (!ed25519SpkiB64) {
			replaceWithErrorRecovery('/503/');
			return;
		}

		const message = buildCanonicalOutOfSiteMessage({
			kind: 'ssr',
			toHref: destination.href,
		});
		const messageBytes = new TextEncoder().encode(message);

		let signatureBytes: Uint8Array;
		try {
			signatureBytes = base64UrlToUint8Array(sig);
		} catch {
			replaceWithErrorRecovery('/404/');
			return;
		}

		let publicKey: CryptoKey;
		try {
			publicKey = await crypto.subtle.importKey(
				'spki',
				spkiB64ToUint8Array(ed25519SpkiB64),
				{ name: 'Ed25519' },
				false,
				['verify'],
			);
		} catch {
			replaceWithErrorRecovery('/500/');
			return;
		}

		try {
			verified = await crypto.subtle.verify(
				{ name: 'Ed25519' },
				publicKey,
				toArrayBuffer(signatureBytes),
				toArrayBuffer(messageBytes),
			);
		} catch {
			replaceWithErrorRecovery('/500/');
			return;
		}
	}

	if (!verified) {
		setStatus('安全警告：未期望的未知链接。该链接可能并不来自网站原本的内容。', destination.href, 'warning');
		showProceed();
		return;
	}

	setStatus('您即将访问第三方网站，本站不对其内容与安全性负责。', destination.href);
	showProceed();
}
