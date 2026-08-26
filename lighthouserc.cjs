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

/*
 * READ THIS BEFORE "FIXING" THE NUMBER ABOVE.
 *
 * The URLs below end in `.html`, and they have to: lhci serves the build with
 * `express.static` (`src/collect/fallback-server.js`), whose extension fallback is off,
 * so `/beta-test-checklists` is a 404 there. The only alternative,
 * `isSinglePageApplication: true`, answers every path with `index.html` — every page
 * would then be measured as the home page.
 *
 * On a `.html` URL the app hydrates the hidden pages as ORDINARY routes, because
 * `isHiddenRoute()` matches `/beta-test-checklists`, not `/beta-test-checklists.html`.
 * The head is then rebuilt client-side with the default `index, follow` and a canonical,
 * so `is-crawlable` passes and the SEO score comes out near 1.0 instead of 0.69.
 *
 * That is fine — `minScore` is a floor, so a higher score passes — and it is NOT a
 * defect in the noindex mechanism. Checked at the real URL shape, served under the base
 * path the way GitHub Pages does: `/adoptananimal/beta-test-checklists` and
 * `/adoptananimal/apply/form` both keep `noindex, nofollow`, no canonical and no
 * hreflang after hydration. No link on the site, and no sitemap entry, uses `.html`.
 *
 * So the number stays where the measurement put it, and the pages stay on the list:
 * BETA-CHECKLIST-v8 § 5.5 is explicit that the page testers use most must not become
 * the least audited one, and its accessibility and performance audits are unaffected by
 * any of this.
 */

/**
 * The pages Lighthouse measures, listed rather than discovered.
 *
 * WHY THIS LIST EXISTS. `staticDistDir` with no `url` turns on autodiscovery, which
 * takes the first `maxAutodiscoverUrls` (default 5) HTML files it walks into. The
 * sample that produced was `404`, `apply`, `beta-test-checklists`, `de`, `favorites`
 * — and both halves of that were wrong:
 *
 *   - `index.html` sorts after `favorites.html`, so THE HOME PAGE HAD NO BUDGET AT
 *     ALL. The most important address on the site was the one address nobody
 *     measured, and the sample would shift again the day a page with an earlier name
 *     arrived.
 *   - `404.html` is not a page. It is the SPA fallback shell: an empty `<body>` plus
 *     the base-prefixed absolute script paths it needs, because GitHub Pages serves
 *     it from arbitrary depths. lhci's static server serves the build at the ROOT,
 *     so those paths 404, nothing renders, and Lighthouse dies on the whole run with
 *     `NO_FCP` — "The page did not paint any content".
 *
 * That second half only started failing when the deploy build stopped being thrown
 * away (a135ea1). Before then Lighthouse audited Playwright's build, made with no
 * base path, where `404.html`'s absolute paths happened to resolve at the root: the
 * shell hydrated, painted, and got audited as though it were a page. So the green
 * Lighthouse step was measuring an artefact that never shipped, and the red one is
 * the honest result.
 *
 * Every path here is verified against `build/` by `scripts/check-build.js`, together
 * with the rule that `404.html` may never be on the list. A typo would otherwise be
 * a 404 that Lighthouse scores, which is a low score with no defect behind it.
 */
const URLS = [
	// The home page. Added the day this list arrived; see above.
	'/index.html',
	// The heaviest page in the build: the full dog listing, every card with an image.
	// If a performance budget breaks anywhere, it breaks here first.
	'/adopt/dog.html',
	// Carries its own best-practices threshold (0.78) because of the embedded Google
	// form. Dropping it from the sample would leave that number asserting nothing.
	'/apply.html',
	// The one page whose content comes from storage rather than from the build.
	'/favorites.html',
	// A localised home, so `<html lang>` and the hreflang set get audited too, not
	// only the English tree.
	'/de.html',

	/*
	 * The hidden routes, and the reason HIDDEN_SEO_CEILING exists. Same argument as
	 * `/apply.html`: a threshold nobody measures is not a threshold. And
	 * BETA-CHECKLIST-v8 § 5.5 puts it the other way round — the page testers spend
	 * the most time on must not become the least audited one.
	 *
	 * DERIVED, not typed out, and the existing invariant in `src/ci.test.ts` caught
	 * the first draft of this list doing the latter. It is right to: a literal
	 * `/beta-test-checklists.html` here would be the fourth copy of that list, and a
	 * hidden route added later would silently get no budget. Derived, it gets one the
	 * moment it lands in `src/lib/config.ts`.
	 */
	...HIDDEN_ROUTES.map((route) => `${route}.html`)
];

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

			/*
			 * Relative paths are the documented form and they work: lhci resolves each
			 * entry with `new URL(raw, 'http://localhost')` and then overwrites the port
			 * with its own server's (`src/collect/collect.js`). Read from the package at
			 * 0.15.1 rather than assumed — an unverified change to this file cannot be
			 * tried locally, because Lighthouse itself does not run on this machine
			 * (`EPERM` on its own temp directory, PROJECT-CONTEXT.md § 5).
			 */
			url: URLS

			/*
			 * `maxAutodiscoverIsolate: 1` used to sit here and it was never an option.
			 * No such key exists anywhere in `@lhci/cli@0.15.1` — the real ones are
			 * `maxAutodiscoverUrls` and `autodiscoverUrlBlocklist` — so it was read by
			 * nothing and limited nothing, while looking like the knob that kept the
			 * sample small. Removed rather than corrected: with `url` set, autodiscovery
			 * never runs at all (`if (!urls.length)`), so both keys would be inert.
			 */
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
