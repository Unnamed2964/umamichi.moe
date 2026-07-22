/** @type {import('./umamichi.config.d.ts').UmamichiConfig} */
export default {
	content: {
		excludeDocGlobs: ['**/imgs/**', '**/files/**'],
		// MkDocs-style: keys/values are Markdown paths relative to src/content.
		redirect_maps: {
			'blog/yanji-rail-transit-imaginary.md':
				'blog/yanji-hambuk intercity/yanji-rail-transit-imaginary.md',
			'blog/yanji-rail-transit-railmap.md':
				'blog/yanji-hambuk intercity/yanji-rail-transit-railmap.md',
		},
	},
	imageOptimization: {
		enabled: false,
	},
};
