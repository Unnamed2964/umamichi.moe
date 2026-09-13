/** @type {import('./umamichi.config.d.ts').UmamichiConfig} */
export default {
	site: {
		name: "Umamichi's Blog",
		description: "Welcome to Umamichi's website!",
		url: 'https://umamichi.moe',
		author: 'Umamichi/Unnamed2964',
		copyright: '© {year} Umamichi/Unnamed2964.',
	},
	source: {
		baseUrl: 'https://github.com/Unnamed2964/umamichi.moe/blob/main',
	},
	comments: {
		giscus: {
			enabled: true,
			repo: 'Unnamed2964/umamichi.moe',
			repoId: 'R_kgDOR3nnpw',
			category: 'Announcements',
			categoryId: 'DIC_kwDOR3nnp84C8BSy',
			mapping: 'pathname',
			strict: '0',
			reactionsEnabled: '1',
			emitMetadata: '0',
			inputPosition: 'top',
			lang: 'zh-CN',
			loading: 'eager',
		},
	},
	telemetry: {
		tikkun: true,
		hester: true,
	},
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
