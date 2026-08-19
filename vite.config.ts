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
		environment: 'node',

		/*
		 * CODE-QUALITY-v8 § 6.2 — a floor under the critical logic, not over the site.
		 *
		 * Scoped to controllers and services because that is what the canon names, and
		 * because a whole-project number would be dominated by `data/animals/`: fifty
		 * files of literals that no test needs to execute. Averaging them in produces a
		 * figure that moves when content is added and never when a service loses its
		 * tests — a metric that reports on the wrong thing is worse than none.
		 *
		 * The numbers are the measured ones less about two points, and they are a floor
		 * that goes UP. Not the canon's recommended 70 yet — the measurement when this
		 * arrived was 66.7 / 62.2 / 60 / 68.3, and setting a threshold the project does
		 * not meet means a gate that is red on arrival and switched off by the end of the
		 * week (the § 6.4.1 argument about `off`, and ACCESSIBILITY § 10.1.1 about zero
		 * as an axe baseline). The margin is there so an honest refactor that moves a
		 * line does not fail the build; it is not room to spend.
		 *
		 * What is still at zero and why, so the next reader does not re-derive it:
		 * `scrollbar.svelte.ts` and `debugMode.svelte.ts` are driven through the browser
		 * by `tests/scrollbar.spec.ts` and the service badge, and `imageQueue.ts` is an
		 * IntersectionObserver queue that has nothing to observe outside one.
		 */
		coverage: {
			provider: 'v8',
			include: ['src/lib/controllers/**', 'src/lib/services/**'],
			reporter: ['text'],
			thresholds: { statements: 64, branches: 60, functions: 58, lines: 66 }
		}
	},
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
		__SITE_ORIGIN__: JSON.stringify(siteOrigin),
		__BASE_PATH__: JSON.stringify(basePath)
	}
});
