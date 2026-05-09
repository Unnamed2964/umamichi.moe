function utf8Bytes(value: string) {
	return new TextEncoder().encode(value);
}

function bytesToBase64Url(bytes: Uint8Array) {
	let binary = '';
	for (let i = 0; i < bytes.length; i += 1) {
		binary += String.fromCharCode(bytes[i]);
	}
	const b64 = btoa(binary);
	return b64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export async function hmacSha256Base64Url(secret: string, message: string) {
	const key = await crypto.subtle.importKey(
		'raw',
		utf8Bytes(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);
	const sig = await crypto.subtle.sign('HMAC', key, utf8Bytes(message));
	return bytesToBase64Url(new Uint8Array(sig));
}

export function timingSafeEqualUtf8(a: string, b: string) {
	const ae = utf8Bytes(a);
	const be = utf8Bytes(b);
	if (ae.length !== be.length) {
		return false;
	}
	let diff = 0;
	for (let i = 0; i < ae.length; i += 1) {
		diff |= ae[i] ^ be[i];
	}
	return diff === 0;
}
