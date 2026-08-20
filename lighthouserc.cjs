/*
 * Lighthouse CI budgets.
 *
 * A `.cjs` file rather than `lighthouserc.json`, for two reasons that arrived together.
 *
 * The first is that the hidden routes need their own SEO threshold, and the reason has
 * to be written down next to the number — JSON has nowhere to put it, and a bare `0.69`
 * in a config file is the kind of value the next reader deletes.
 *
 * The second is that the list of hidden routes already exists, in `src/lib/config.ts`,
 * and PROJECT-CONTEXT.md § 4.22 is about exactly this: one list, and every consequence
 * derived from it. A copy here would be the fourth, and the day it fell behind is the
 * day the deploy stops — which is precisely what happened before this file existed.
 *
 * `.cjs`, not `.js`: the package is `"type": "module"`, and lhci loads its config with
 * `require()`.
 */

const { readFileSync } = require('node:fs');

/**
 * The hidden routes, read from the source rather than repeated.
 *
 * Same regex as `scripts/check-build.js`, and it dies the same way: an empty result is a
 * dead check, not an empty list, so it throws instead of quietly asserting nothing.
 */
const HIDDEN_ROUTES = (() => {
	const source = readFileSync('src/lib/config.ts', 'utf-8');
	const list = source.match(/HIDDEN_ROUTES\s*=\s*\[([^\]]*)\]/)?.[1] ?? '';
	const routes = [...list.matchAll(/'([^']+)'/g)].map((m) => m[1]);
	if (routes.length === 0) {
		throw new Error('HIDDEN_ROUTES could not be read from src/lib/config.ts — this gate is dead');
	}
	return routes;
})();

/** `apply/form.html` and `uk/apply/form.html` are the same hidden route, two files. */
const hiddenPattern = `(?:${HIDDEN_ROUTES.map((route) => route.replace(/^\//, '').replace(/[/-]/g, (c) => `\\${c}`)).join('|')})\\.html$`;

/**
 * The SEO ceiling of a page that is deliberately `noindex`.
 *
 * Measured, not chosen: in the run that made this file necessary the ONLY failing SEO
 * audit on `/beta-test-checklists` was `is-crawlable` — "Page is blocked from indexing",
 * weight 4.04 of 13.04. Every other audit passed, so the score was 0.69 and no amount
 * of work on the page could raise it. The assertion asked for 0.9, so the step could
 * only ever fail, and it sits above `upload-pages-artifact`: nothing had deployed since
 * the checklist page landed.
 *
 * Set AT the ceiling with no slack, which is what keeps it a gate rather than an excuse:
 * one more failing SEO audit on a hidden page — a lost `<title>`, a broken `hreflang` —
 * costs at least 1/13 and lands below 0.69. This is the ACCESSIBILITY § 10.1.1 pattern:
 * a measured number that may only rise, never a threshold nobody can meet.
 *
 * It rises if Lighthouse re-weights `is-crawlable`, and that is a deliberate bump with a
 * commit, not a "fix the CI" edit.
 */
const HIDDEN_SEO_CEILING = 0.69;

/** Everything except SEO is the same everywhere; only the reason for SEO differs. */
const shared = {
	'categories:performance': ['warn', { minScore: 0.8 }],
	'categories:accessibility': ['error', { minScore: 0.95 }],
	'categories:best-practices': ['error', { minScore: 0.9 }]
};

module.exports = {
	ci: {
		collect: {
			staticDistDir: './build',
			maxAutodiscoverIsolate: 1
		},
		assert: {
			/*
			 * Ordered narrowest-last is not enough — lhci applies EVERY matching entry,
			 * so the patterns have to be mutually exclusive. Each `matchingUrlPattern`
			 * therefore excludes the others explicitly.
			 */
			assertMatrix: [
				{
					// Ordinary pages: the whole SEO category, as before.
					matchingUrlPattern: `^(?!.*/apply\\.html$)(?!.*${hiddenPattern}).*$`,
					assertions: { ...shared, 'categories:seo': ['error', { minScore: 0.9 }] }
				},
				{
					/*
					 * `/apply` embeds a Google form, and best-practices cannot reach 0.9
					 * there: `third-party-cookies` (weight 5) and `inspector-issues` are
					 * cookies set by `docs.google.com`, in a document that is not ours.
					 * 0.78 against a measured 0.79 — one audit of slack, not a licence.
					 * PROJECT-CONTEXT.md § 4.18.
					 */
					matchingUrlPattern: '/apply\\.html$',
					assertions: {
						...shared,
						'categories:best-practices': ['error', { minScore: 0.78 }],
						'categories:seo': ['error', { minScore: 0.9 }]
					}
				},
				{
					// Pages that are `noindex` on purpose (§ 4.22). Everything but SEO is
					// held to the same standard as any other page — being out of the index
					// is not a reason to be inaccessible or slow.
					matchingUrlPattern: hiddenPattern,
					assertions: {
						...shared,
						'categories:seo': ['error', { minScore: HIDDEN_SEO_CEILING }]
					}
				}
			]
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
