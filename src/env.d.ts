/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_OUT_OF_SITE_ED25519_SPKI_B64?: string;
	readonly PUBLIC_OUT_OF_SITE_LINK_HMAC_KEY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
