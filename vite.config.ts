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
		 * that goes UP — which is the whole reason to re-measure rather than leave them.
		 * They arrived at 64 / 60 / 58 / 66 against a measurement of 66.7 / 62.2 / 60 /
		 * 68.3; measured again on 2026-09-02 the run gives 73.6 / 65.5 / 65.9 / 74.8, so
		 * the old floor sat nine points under the work and had stopped being a floor.
		 *
		 * Statements and lines are now ABOVE the canon's recommended 70 for the first
		 * time. That is not a reason to write 70 here: the rule is measured-minus-two in
		 * both directions, and a threshold the project does not meet is a gate that is
		 * red on arrival and switched off by the end of the week (the § 6.4.1 argument
		 * about `off`, and ACCESSIBILITY § 10.1.1 about zero as an axe baseline). The
		 * margin is there so an honest refactor that moves a line does not fail the
		 * build; it is not room to spend.
		 *
		 * What is still at zero and why, so the next reader does not re-derive it:
		 * `scrollbar.svelte.ts` and `debugMode.svelte.ts` are driven through the browser
		 * by `tests/scrollbar.spec.ts` and the service badge. `imageQueue.ts` is no
		 * longer among them — the observer still needs a browser, but the two branches
		 * that decide what a settled photograph shows do not, and they are the ones the
		 * CSP fix moved off the markup (`src/lib/services/imageQueue.test.ts`).
		 */
		coverage: {
			provider: 'v8',
			include: ['src/lib/controllers/**', 'src/lib/services/**'],
			reporter: ['text'],
			thresholds: { statements: 71, branches: 63, functions: 63, lines: 72 }
		}
	},
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
		__SITE_ORIGIN__: JSON.stringify(siteOrigin),
		__BASE_PATH__: JSON.stringify(basePath)
	}
});
