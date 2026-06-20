export type UmamichiConfig = {
	content: {
		excludeDocGlobs: string[];
	};
	imageOptimization: {
		enabled: boolean;
	};
};

declare module './umamichi.config.mjs' {
	const config: UmamichiConfig;
	export default config;
}
