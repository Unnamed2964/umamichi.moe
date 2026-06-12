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

/** Exact-length buffer for `importKey` (avoids oversized underlying `ArrayBuffer` pools). */
function spkiB64ToSpkiBuffer(b64: string): ArrayBuffer {
	const view = spkiB64ToUint8Array(b64);
	return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
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
		const urlCode = document.getElementById('out-of-site-url');
		if (detail && urlCode) {
			urlCode.textContent = detail;
			detailEl.hidden = false;
		} else {
			if (urlCode) {
				urlCode.textContent = '';
			}
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

	const closeButton = document.getElementById('out-of-site-close');
	if (closeButton instanceof HTMLButtonElement) {
		closeButton.addEventListener('click', () => {
			window.close();
		});
	}

	const proceed = document.getElementById('out-of-site-proceed');
	let proceedDestination: string | null = null;
	if (proceed instanceof HTMLAnchorElement) {
		proceed.addEventListener('click', (event) => {
			if (!proceedDestination) {
				return;
			}
			event.preventDefault();
			window.location.replace(proceedDestination);
		});
	}
	const setProceedButtonTone = (tone: 'secondary' | 'danger') => {
		if (proceed instanceof HTMLAnchorElement) {
			proceed.classList.toggle('secondary-button', tone === 'secondary');
			proceed.classList.toggle('danger-button', tone === 'danger');
		}
	};
	const lockProceed = () => {
		proceedDestination = null;
		if (proceed instanceof HTMLAnchorElement) {
			proceed.hidden = true;
			proceed.href = '#';
			proceed.removeAttribute('target');
			proceed.removeAttribute('rel');
			proceed.setAttribute('aria-disabled', 'true');
			proceed.setAttribute('tabindex', '-1');
			proceed.classList.add('is-pending');
			setProceedButtonTone('secondary');
		}
	};
	const showProceed = (tone: 'secondary' | 'danger' = 'secondary') => {
		proceedDestination = destination.href;
		if (proceed instanceof HTMLAnchorElement) {
			proceed.href = destination.href;
			proceed.removeAttribute('target');
			proceed.removeAttribute('rel');
			proceed.removeAttribute('aria-disabled');
			proceed.removeAttribute('tabindex');
			proceed.classList.remove('is-pending');
			setProceedButtonTone(tone);
			proceed.hidden = false;
		}
	};
	lockProceed();

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
	} catch (err) {
		console.log('[out-of-site]', 'invalid to URL', err);
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
	setStatus('正在校验链接…');
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

		setStatus('正在校验签名…');

		const message = buildCanonicalOutOfSiteMessage({
			kind: 'ssr',
			toHref: destination.href,
		});
		const messageBytes = new TextEncoder().encode(message);

		let signatureBytes: Uint8Array;
		try {
			signatureBytes = base64UrlToUint8Array(sig);
		} catch (err) {
			console.log('[out-of-site]', 'sig base64url decode failed', err);
			replaceWithErrorRecovery('/404/');
			return;
		}

		let publicKey: CryptoKey;
		try {
			publicKey = await crypto.subtle.importKey(
				'spki',
				spkiB64ToSpkiBuffer(ed25519SpkiB64),
				{ name: 'Ed25519' },
				false,
				['verify'],
			);
		} catch (err) {
			console.log('[out-of-site]', 'crypto.subtle.importKey (Ed25519 SPKI) failed', err);
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
		} catch (err) {
			console.log('[out-of-site]', 'crypto.subtle.verify (Ed25519) failed', err);
			replaceWithErrorRecovery('/500/');
			return;
		}
	}

	if (!verified) {
		setStatus('安全警告：未期望的未知链接。该链接可能并不来自网站原本的内容。', destination.href, 'warning');
		showProceed('danger');
		return;
	}

	setStatus('您即将访问第三方网站，本站不对其内容与安全性负责。', destination.href);
	showProceed();
}
