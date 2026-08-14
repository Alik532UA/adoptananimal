import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Absolute origin of the deployed site, used for canonical URLs and the sitemap.
// The deploy workflow passes the real one; the default matches the current host.
const siteOrigin = process.env.SITE_ORIGIN ?? 'https://alik532ua.github.io';
const basePath = process.env.BASE_PATH ?? '';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Scoped to src/ on purpose: the default glob also picked up test files from
		// .read_for_AI/, a read-only copy of another project, and ran them as ours.
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node'
	},
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
		__SITE_ORIGIN__: JSON.stringify(siteOrigin),
		__BASE_PATH__: JSON.stringify(basePath)
	}
});
