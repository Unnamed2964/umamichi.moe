import { defineConfig } from 'vitest/config';

// Plain Vitest config (not Astro getViteConfig): Cloudflare SSR deps optimization
// breaks loading @vitest/coverage-v8 via vite-node. Unit tests under src/lib are
// framework-free and do not need the Astro Vite pipeline.
export default defineConfig({
	test: {
		include: ['src/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			reportsDirectory: './coverage',
			include: ['src/lib/**/*.{ts,mjs}', 'src/integrations/**/*.mjs'],
			exclude: [
				'**/*.test.ts',
				'**/*.test-fixtures.ts',
				'**/*-client.ts',
				'src/content/**',
			],
		},
	},
});
