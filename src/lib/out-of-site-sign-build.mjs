import crypto from 'node:crypto';
import { buildCanonicalOutOfSiteMessage } from './out-of-site-payload.mjs';

export function mergeExternalAnchorRel(existing) {
	const relString = Array.isArray(existing) ? existing.join(' ') : String(existing ?? '');
	const tokens = new Set(
		relString
			.split(/\s+/)
			.map((t) => t.trim())
			.filter(Boolean),
	);
	tokens.delete('nofollow');
	tokens.add('noopener');
	tokens.add('noreferrer');
	return [...tokens].sort().join(' ');
}

/**
 * @param {string} toHref absolute http(s) URL
 * @param {string} privateKeyPem PKCS#8 PEM
 * @returns {string | null} Base64URL signature or null if no key
 */
export function signSsrOutOfSiteLink(toHref, privateKeyPem) {
	const pem = privateKeyPem.replace(/\\n/g, '\n');
	if (!pem) {
		return null;
	}
	const key = crypto.createPrivateKey(pem);
	const message = buildCanonicalOutOfSiteMessage({ kind: 'ssr', toHref });
	return crypto.sign(null, Buffer.from(message, 'utf8'), key).toString('base64url');
}
