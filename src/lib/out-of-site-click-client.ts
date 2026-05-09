import { buildCanonicalOutOfSiteMessage } from './out-of-site-payload.mjs';
import { hmacSha256Base64Url } from './out-of-site-giscus-hmac';

const INIT_KEY = '__outOfSiteClickInit';

function isHttpOrHttpsUrl(url: URL) {
	return url.protocol === 'http:' || url.protocol === 'https:';
}

export function initOutOfSiteClickHandler(options: { outOfSiteLinkHmacKey: string }) {
	if (typeof window === 'undefined' || (window as unknown as Record<string, boolean>)[INIT_KEY]) {
		return;
	}
	(window as unknown as Record<string, boolean>)[INIT_KEY] = true;

	const { outOfSiteLinkHmacKey } = options;

	document.addEventListener(
		'click',
		(event) => {
			if (event.defaultPrevented) {
				return;
			}

			const rawTarget = event.target;
			if (!(rawTarget instanceof Element)) {
				return;
			}

			const anchor = rawTarget.closest('a[href]');
			if (!(anchor instanceof HTMLAnchorElement)) {
				return;
			}

			const hrefAttr = anchor.getAttribute('href');
			if (!hrefAttr || hrefAttr.startsWith('#')) {
				return;
			}

			let resolved: URL;
			try {
				resolved = new URL(hrefAttr, window.location.href);
			} catch {
				return;
			}

			if (!isHttpOrHttpsUrl(resolved)) {
				return;
			}

			if (resolved.origin === window.location.origin) {
				const path = resolved.pathname.replace(/\/+$/, '') || '/';
				if (path === '/out-of-site' || resolved.pathname.startsWith('/out-of-site/')) {
					return;
				}
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const toAbs = resolved.href;
			const inGiscus = Boolean(anchor.closest('[data-out-of-site-ugc="giscus"]'));
			const kind = inGiscus ? 'giscus' : 'ssr';

			void (async () => {
				const params = new URLSearchParams();
				params.set('to', toAbs);
				params.set('kind', kind);

				if (kind === 'ssr') {
					const sig = anchor.getAttribute('data-ssr-out-of-site-sig');
					if (sig) {
						params.set('sig', sig);
					}
				}

				if (!outOfSiteLinkHmacKey) {
					params.set('hash', '');
				} else {
					const token = buildCanonicalOutOfSiteMessage({ kind, toHref: toAbs });
					params.set('hash', await hmacSha256Base64Url(outOfSiteLinkHmacKey, token));
				}

				const interstitial = new URL('/out-of-site/', window.location.origin);
				interstitial.search = params.toString();
				window.open(interstitial.href, '_blank', 'noopener,noreferrer');
			})();
		},
		true,
	);
}
