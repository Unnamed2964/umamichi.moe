export type UmamichiConfig = {
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
