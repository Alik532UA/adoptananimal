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

/**
 * `/apply/form` and `/uk/apply/form` are the same hidden route at two addresses.
 *
 * No `.html` any more: the pages are measured at the addresses the site actually
 * serves rather than at raw filenames — see `startServerCommand` below.
 */
const hiddenPattern = `(?:${HIDDEN_ROUTES.map((route) => route.replace(/^\//, '').replace(/[/-]/g, (c) => `\\${c}`)).join('|')})$`;

/**
 * The SEO ceiling of a page that is deliberately `noindex`.
 *
 * Measured, not chosen. The only failing SEO audit on `/beta-test-checklists` is
 * `is-crawlable` — "Page is blocked from indexing", weight 4.04 — which is the whole
 * point of the page being hidden and can never be fixed. A hidden page also draws no
 * `canonical` and no `hreflang`, so those two audits come back "not applicable" and
 * drop out of the total: 11.04 of weight is scored, 4.04 of it lost, giving
 * 7/11.04 = 0.634.
 *
 * The number here was 0.69, and it had been measured against a page in a state the
 * site never serves. lhci used to serve the build at the SERVER ROOT, so pages were
 * audited at `/beta-test-checklists.html` — an address with an extension, which the
 * client router does not recognise as a hidden route. The page hydrated as an ordinary
 * one, grew a canonical and an hreflang, and 9/13.04 came out at 0.69. Measured at the
 * address production serves, with lighthouse 12.6.1 — the version `@lhci/cli@0.15.1`
 * bundles — it is 0.634.
 *
 * Set AT the ceiling with no slack, which is what keeps it a gate rather than an
 * excuse: one more failing SEO audit on a hidden page — a lost `<title>`, a missing
 * description — costs at least 1/11.04 and lands below 0.63. This is the
 * ACCESSIBILITY § 10.1.1 pattern: a measured number that may only rise, never a
 * threshold nobody can meet.
 *
 * It moves if Lighthouse re-weights `is-crawlable`, and that is a deliberate bump with
 * a commit, not a "fix the CI" edit.
 */
const HIDDEN_SEO_CEILING = 0.63;

/*
 * WHY A REAL SERVER AND NOT `staticDistDir`.
 *
 * The block that stood here explained why the URLs had to end in `.html`: lhci serves
 * the build with `express.static` (`src/collect/fallback-server.js`), whose extension
 * fallback is off, so `/beta-test-checklists` is a 404 there — and the only alternative
 * it offers, `isSinglePageApplication: true`, answers every path with `index.html`, so
 * every page would be measured as the home page.
 *
 * Both halves were true. The conclusion — measure `.html` addresses instead — was the
 * part that cost, and it cost twice.
 *
 * FIRST, it measured a state the site never serves. `isHiddenRoute()` matches
 * `/beta-test-checklists`, not `/beta-test-checklists.html`, so on an `.html` address
 * the app hydrates a hidden page as an ORDINARY route: the head is rebuilt with
 * `index, follow`, a canonical and an hreflang appear, and `is-crawlable` passes on a
 * page whose whole purpose is to be out of the index. The old note called that "fine,
 * because minScore is a floor". It is not fine: it is where the 0.69 ceiling came
 * from, and that number was then a measurement of a page nobody can visit.
 *
 * SECOND, `express.static` serves the build at the SERVER ROOT, while the build is
 * made for `/<repo>/`. That was survivable only while SvelteKit emitted relative
 * paths. The day `paths.relative` went to `false` (PROJECT-CONTEXT § 4.38) every
 * asset URL became `/adoptananimal/…`, all 60 of them 404'd at the root, and
 * Lighthouse scored seven pages that had no CSS, no JavaScript and no images —
 * reporting a HIGHER performance score than before, because there was nothing left to
 * download.
 *
 * `startServerCommand` removes both. `vite preview` is the same server Playwright
 * uses, it serves the build under `paths.base`, and it resolves an extension-less
 * address to its file the way GitHub Pages does. So the addresses below are the
 * addresses the site has.
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
const PAGES = [
	// The home page. Added the day this list arrived; see above.
	'/',
	// The heaviest page in the build: the full dog listing, every card with an image.
	// If a performance budget breaks anywhere, it breaks here first.
	'/adopt/dog',
	// Carries its own best-practices threshold (0.78) because of the embedded Google
	// form. Dropping it from the sample would leave that number asserting nothing.
	'/apply',
	// The one page whose content comes from storage rather than from the build.
	'/favorites',
	// A localised home, so `<html lang>` and the hreflang set get audited too, not
	// only the English tree.
	'/de',

	/*
	 * The hidden routes, and the reason HIDDEN_SEO_CEILING exists. Same argument as
	 * `/apply`: a threshold nobody measures is not a threshold. And
	 * BETA-CHECKLIST-v8 § 5.5 puts it the other way round — the page testers spend
	 * the most time on must not become the least audited one.
	 *
	 * DERIVED, not typed out, and the existing invariant in `src/ci.test.ts` caught
	 * the first draft of this list doing the latter. It is right to: a literal
	 * `/beta-test-checklists.html` here would be the fourth copy of that list, and a
	 * hidden route added later would silently get no budget. Derived, it gets one the
	 * moment it lands in `src/lib/config.ts`.
	 */
	...HIDDEN_ROUTES
];

/**
 * The port the preview server is asked for, and the base it serves under.
 *
 * `4174` rather than Playwright's `4173`: the two run in different CI steps, but a
 * port that is only free by scheduling is a port that collides the day the steps move.
 */
const PORT = 4174;

/**
 * The base path, from the same environment variable the build read.
 *
 * Without it the URLs below would name addresses the server does not have, and every
 * page would be scored as a 404 — a low score with no defect behind it.
 */
const BASE = process.env.BASE_PATH ?? '';

/** `/` is the base itself, and it keeps the trailing slash a directory URL needs. */
const URLS = PAGES.map((page) => `http://localhost:${PORT}${BASE}${page === '/' ? '/' : page}`);

/** Everything except SEO is the same everywhere; only the reason for SEO differs. */
const shared = {
	'categories:performance': ['warn', { minScore: 0.8 }],
	'categories:accessibility': ['error', { minScore: 0.95 }],
	'categories:best-practices': ['error', { minScore: 0.9 }]
};

module.exports = {
	ci: {
		collect: {
			/*
			 * The project's own preview server, so the build is served under its base
			 * path at the addresses production uses — see the block above for what
			 * `staticDistDir` measured instead.
			 *
			 * It reads `BASE_PATH` from the environment exactly as the build did, so the
			 * deploy workflow has to hand the same value to this step. Without it the
			 * server comes up at the root while the URLs below carry the base, and every
			 * page scores as a 404.
			 */
			startServerCommand: `npm run preview -- --port ${PORT} --strictPort`,

			// vite prints `➜  Local:   http://localhost:4174/adoptananimal` when it is up.
			startServerReadyPattern: 'Local:',
			startServerReadyTimeout: 120000,

			/*
			 * Absolute URLs, because there is no `staticDistDir` for lhci to infer a port
			 * from. `--strictPort` is what makes that safe: the server either takes 4174
			 * or refuses to start, so the URLs cannot end up pointing at a different one.
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
					matchingUrlPattern: `^(?!.*/apply$)(?!.*${hiddenPattern}).*$`,
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
					matchingUrlPattern: '/apply$',
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
