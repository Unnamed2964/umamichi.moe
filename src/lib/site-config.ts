import umamichiConfig from '../../umamichi.config.mjs';
import type { UmamichiConfig, UmamichiGiscusConfig } from '../../umamichi.config.d.ts';

function stripTrailingSlashes(value: string): string {
	return value.replace(/\/+$/, '');
}

function requireNonEmpty(value: string, label: string): string {
	const trimmed = value.trim();

	if (!trimmed) {
		throw new Error(`umamichi.config: ${label} must be a non-empty string`);
	}

	return trimmed;
}

const raw = umamichiConfig as UmamichiConfig;

const siteUrl = stripTrailingSlashes(requireNonEmpty(raw.site.url, 'site.url'));
const siteHostname = new URL(siteUrl).hostname;

export const siteConfig = raw;

export const SITE_TITLE = requireNonEmpty(raw.site.name, 'site.name');
export const SITE_DESCRIPTION = requireNonEmpty(raw.site.description, 'site.description');
export const SITE_URL = siteUrl;
export const SITE_AUTHOR = requireNonEmpty(raw.site.author, 'site.author');
export const SITE_COPYRIGHT = requireNonEmpty(raw.site.copyright, 'site.copyright');

/** Telemetry / copy-attribution site id (hostname of site.url). */
export const SITE_ID = siteHostname;

export const SITE_SOURCE_BASE_URL = raw.source?.baseUrl
	? stripTrailingSlashes(requireNonEmpty(raw.source.baseUrl, 'source.baseUrl'))
	: undefined;

export const SITE_GITHUB_SOURCE_BASE_URL = SITE_SOURCE_BASE_URL;

export const SITE_GITHUB_ERROR_FLOW_SOURCE_URL = SITE_SOURCE_BASE_URL
	? `${SITE_SOURCE_BASE_URL}/src/components/ErrorRecoveryExperience.astro`
	: undefined;

function defaultAllowedOrigins(origin: string, hostname: string): string[] {
	const origins = [origin];
	const wwwOrigin = `https://www.${hostname}`;

	if (origin !== wwwOrigin && !hostname.startsWith('www.')) {
		origins.push(wwwOrigin);
	}

	return origins;
}

export const TELEMETRY_ALLOWED_ORIGINS = new Set(
	(raw.telemetry?.allowedOrigins?.map((origin) => stripTrailingSlashes(origin))
		?? defaultAllowedOrigins(siteUrl, siteHostname)),
);

export function isTikkunTelemetryEnabled(): boolean {
	return raw.telemetry?.tikkun !== false;
}

export function isHesterTelemetryEnabled(): boolean {
	return raw.telemetry?.hester !== false;
}

export function getGiscusConfig(): UmamichiGiscusConfig | null {
	const giscus = raw.comments?.giscus;

	if (!giscus || giscus.enabled === false) {
		return null;
	}

	requireNonEmpty(giscus.repo, 'comments.giscus.repo');
	requireNonEmpty(giscus.repoId, 'comments.giscus.repoId');
	requireNonEmpty(giscus.category, 'comments.giscus.category');
	requireNonEmpty(giscus.categoryId, 'comments.giscus.categoryId');

	return giscus;
}

export function sourceUrlForPath(path: string): string | undefined {
	if (!SITE_SOURCE_BASE_URL) {
		return undefined;
	}

	const normalized = path.replace(/^\/+/, '');
	return `${SITE_SOURCE_BASE_URL}/${normalized}`;
}

export function formatSiteCopyright(year: number): string {
	return SITE_COPYRIGHT.replaceAll('{year}', String(year));
}
