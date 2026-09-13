/**
 * Schema: docs/umamichi-config.md
 * Influences: hexo-theme-arknights (comments / enable style), MkDocs (site info, content paths).
 */
export type UmamichiGiscusConfig = {
	enabled?: boolean;
	repo: string;
	repoId: string;
	category: string;
	categoryId: string;
	mapping?: string;
	strict?: string;
	reactionsEnabled?: string;
	emitMetadata?: string;
	inputPosition?: 'top' | 'bottom';
	lang?: string;
	loading?: string;
	/** Giscus client origin restriction; unrelated to telemetry.allowedOrigins. */
	origin?: string;
};

export type UmamichiConfig = {
	site: {
		name: string;
		description: string;
		/** Canonical origin, no trailing slash. */
		url: string;
		author: string;
		copyright: string;
	};
	source?: {
		/** e.g. https://github.com/org/repo/blob/main */
		baseUrl: string;
	};
	comments?: {
		giscus?: UmamichiGiscusConfig;
	};
	telemetry?: {
		/** Page-view beacon; default true. */
		tikkun?: boolean;
		/** Error-page beacon; default true. */
		hester?: boolean;
		allowedOrigins?: string[];
	};
	content: {
		excludeDocGlobs: string[];
		/**
		 * MkDocs-style page redirects (moved/renamed docs).
		 * Keys and internal values are Markdown paths relative to `src/content`
		 * (not final HTML URLs). Values may also be absolute `http(s)` URLs.
		 */
		redirect_maps?: Record<string, string>;
	};
	imageOptimization: {
		enabled: boolean;
	};
};

declare module './umamichi.config.mjs' {
	const config: UmamichiConfig;
	export default config;
}
