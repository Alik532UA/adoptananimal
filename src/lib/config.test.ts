// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { localeUrl, absoluteLocale, SITE_ORIGIN } from './config';
import { DEFAULT_LOCALE, LOCALES, PREFIXED_LOCALES } from './i18n/locales';

/**
 * The absolute addresses this site advertises about itself.
 *
 * These are the strings that go into `canonical`, `og:url`, the `hreflang`
 * alternates and every `<loc>` in the sitemap — the site's own claim about where it
 * lives. A wrong one here is not a crash: the page loads, the build is green, and
 * the only reader who ever notices is a crawler.
 *
 * **Everything is tested against a non-empty base on purpose.** `SITE_BASE` comes
 * from `BASE_PATH`, which nothing sets outside the deploy workflow, so
 * `absoluteLocale()` under Vitest builds URLs for a site at the domain root — the
 * one configuration this project is never deployed in. That is exactly how the
 * trailing-slash defect below stayed invisible: `npm test`, `npm run check`,
 * `npm run lint`, `npm run check:build` and 349 unit tests were all green over a
 * live site whose home page canonical answered 301. `localeUrl()` takes the origin
 * and base as arguments so a test can name the deploy's values.
 *
 * Reverse experiment (AI-AGENT-PITFALLS-v8 § 1.1): restoring the old rule —
 * `url === origin ? origin + '/' : url` — reddens `the site root keeps its
 * trailing slash under a base path` and leaves every other case here green, which
 * is the shape of the defect it was hiding.
 */

/** The base the deploy workflow derives from the repository name. */
const DEPLOY_BASE = `/${JSON.parse(readFileSync('package.json', 'utf-8')).name}`;

const deployUrl = (path: string, locale = DEFAULT_LOCALE) =>
	localeUrl(SITE_ORIGIN, DEPLOY_BASE, path, locale);

describe('absolute page addresses', () => {
	/*
	 * A directory URL without the trailing slash is a 301 on every static host, and
	 * GitHub Pages is no exception: `https://alik532ua.github.io/adoptananimal`
	 * redirects to `…/adoptananimal/`. Naming the redirecting form in a canonical
	 * means the page and the server disagree about the page's own address, and the
	 * server wins.
	 */
	it('the site root keeps its trailing slash under a base path', () => {
		expect(deployUrl('/')).toBe(`${SITE_ORIGIN}${DEPLOY_BASE}/`);
	});

	it('the site root keeps its trailing slash with no base path', () => {
		expect(localeUrl(SITE_ORIGIN, '', '/', DEFAULT_LOCALE)).toBe(`${SITE_ORIGIN}/`);
	});

	/*
	 * The other three languages are FILES in the build — `uk.html`, not `uk/index.html`
	 * — so their root is not a directory and a trailing slash there would be the
	 * mirror-image mistake. Asserted rather than assumed, because the rule above is
	 * one character away from applying to all four.
	 */
	it('a prefixed language root carries no trailing slash', () => {
		for (const locale of PREFIXED_LOCALES) {
			expect(deployUrl('/', locale)).toBe(`${SITE_ORIGIN}${DEPLOY_BASE}/${locale}`);
		}
	});

	it('an inner page carries no trailing slash in any language', () => {
		for (const locale of LOCALES) {
			const segment = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
			expect(deployUrl('/adopt/cat', locale)).toBe(
				`${SITE_ORIGIN}${DEPLOY_BASE}${segment}/adopt/cat`
			);
		}
	});

	/* No address of ours may name the base path twice, or drop it. */
	it('every address sits under the base exactly once', () => {
		for (const path of ['/', '/adopt/cat', '/adopt/dog/lucky', '/apply', '/favorites']) {
			for (const locale of LOCALES) {
				const url = deployUrl(path, locale);
				expect(url.startsWith(`${SITE_ORIGIN}${DEPLOY_BASE}`)).toBe(true);
				expect(url.slice(SITE_ORIGIN.length).split(DEPLOY_BASE).length - 1).toBe(1);
			}
		}
	});

	/*
	 * The shipping helper has to be the same function, or the rules above are true of
	 * something nothing calls.
	 */
	it('absoluteLocale() is localeUrl() with the build constants', () => {
		for (const locale of LOCALES) {
			expect(absoluteLocale('/adopt/cat', locale)).toBe(
				localeUrl(SITE_ORIGIN, '', '/adopt/cat', locale)
			);
		}
	});
});
