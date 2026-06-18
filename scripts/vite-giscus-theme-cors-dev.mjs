/** @returns {import('vite').Plugin} */
export function giscusThemeCorsDev() {
	return {
		name: 'giscus-theme-cors-dev',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const pathname = req.url?.split('?')[0] ?? '';

				if (/^\/giscus\/.*\.css$/i.test(pathname)) {
					res.setHeader('Access-Control-Allow-Origin', '*');
				}

				next();
			});
		},
	};
}
