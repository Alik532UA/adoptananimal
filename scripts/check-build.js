#!/usr/bin/env node
/**
 * Checks the built site, not the source.
 *
 * A whole class of static-hosting defects is invisible in src/: a page that ends up
 * with an empty <body>, a canonical carrying the `sveltekit-prerender` placeholder
 * host, a route that was never generated, a link pointing outside the base path.
 * All of those look fine in the editor and 404 in production.
 *
 * Usage: node scripts/check-build.js [buildDir]
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { checkGeo } from './check-geo.js';

const BUILD_DIR = process.argv[2] ?? 'build';
const failures = [];
const fail = (message) => failures.push(message);

/**
 * The site is served from https://host/<base>/, but the build directory IS the base:
 * `build/uk.html` answers `/<base>/uk`. So every path this script derives from a URL —
 * sitemap entry, canonical, alternate — has to have the base taken off first.
 *
 * It arrives by environment because only the workflow knows the repository name. When
 * it is missing, nothing looks broken here: paths just resolve against the wrong root,
 * and the run reports hundreds of failures that are all one misconfiguration. Guarded
 * at the bottom of the sitemap section.
 */
const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/$/, '');

/** A URL (absolute or relative) as a path relative to the build root, base removed. */
const buildPath = (url, base = BASE_PATH) => {
	let pathname;
	try {
		pathname = new URL(url, 'https://example.invalid').pathname;
	} catch {
		return '';
	}
	if (base && (pathname === base || pathname.startsWith(`${base}/`))) {
		pathname = pathname.slice(base.length);
	}
	return pathname.replace(/^\/+/, '').replace(/\/$/, '');
};

if (!existsSync(BUILD_DIR)) {
	console.error(`No build directory at "${BUILD_DIR}" — run npm run build first.`);
	process.exit(1);
}

/** Every .html file in the build, as paths relative to the build root. */
const htmlFiles = [];
(function walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			if (entry !== '_app') walk(full);
		} else if (entry.endsWith('.html')) {
			htmlFiles.push(full);
		}
	}
})(BUILD_DIR);

console.log(`Checking ${htmlFiles.length} pages in ${BUILD_DIR}/`);

// --- 1. no page ships an empty body -----------------------------------------
// 404.html is the SPA shell and is empty by design.
const SHELL_PAGES = new Set(['404.html']);

/**
 * The routes kept out of the index, read from the module that owns the list rather
 * than copied here (BETA-CHECKLIST-v8 § 4.1). A second copy is a second thing to
 * update, and the symptom of forgetting is a green run.
 *
 * Deliberately NOT treated like 404.html. Excusing a hidden page from every check
 * because it has no canonical is two lines cheaper and wrong: the page testers
 * actually use would become the least covered one in the build (§ 5.5).
 */
const HIDDEN_ROUTES = (() => {
	const source = readFileSync('src/lib/config.ts', 'utf-8');
	const list = source.match(/HIDDEN_ROUTES\s*=\s*\[([^\]]*)\]/)?.[1] ?? '';
	const routes = [...list.matchAll(/'([^']+)'/g)].map((m) => m[1]);
	if (routes.length === 0) {
		console.error('HIDDEN_ROUTES could not be read from src/lib/config.ts — this check is dead.');
		process.exit(1);
	}
	return routes;
})();

/** `apply/form` and `uk/apply/form` are separate files; both are the same hidden route. */
const isHiddenPage = (rel) =>
	HIDDEN_ROUTES.some((route) => {
		const tail = `${route.replace(/^\//, '')}.html`;
		return rel === tail || rel.endsWith(`/${tail}`);
	});

for (const file of htmlFiles) {
	const rel = relative(BUILD_DIR, file).split(sep).join('/');
	if (SHELL_PAGES.has(rel)) continue;

	const html = readFileSync(file, 'utf-8');
	const body = html.slice(html.indexOf('<body'), html.lastIndexOf('</body>'));
	const text = body
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/<[^>]+>/g, '')
		.trim();

	if (text.length < 200) {
		fail(`${rel}: body has only ${text.length} characters of text — page rendered empty`);
	}
}

// --- 2. the prerender placeholder host never reaches the output --------------
for (const file of htmlFiles) {
	const html = readFileSync(file, 'utf-8');
	if (html.includes('sveltekit-prerender')) {
		fail(`${relative(BUILD_DIR, file)}: contains the prerender placeholder host`);
	}
}

// --- 3. every page carries exactly one absolute canonical -------------------
for (const file of htmlFiles) {
	const rel = relative(BUILD_DIR, file).split(sep).join('/');
	if (SHELL_PAGES.has(rel) || isHiddenPage(rel)) continue;

	const html = readFileSync(file, 'utf-8');
	const canonicals = [...html.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/g)].map(
		(m) => m[1]
	);

	if (canonicals.length !== 1) {
		fail(`${rel}: expected 1 canonical, found ${canonicals.length}`);
	} else if (!/^https?:\/\//.test(canonicals[0]) || canonicals[0].includes('..')) {
		fail(`${rel}: canonical is not an absolute URL — "${canonicals[0]}"`);
	}
}

// --- 4. absolute URLs in meta tags are really absolute ----------------------
for (const file of htmlFiles) {
	const html = readFileSync(file, 'utf-8');
	for (const [, prop, value] of html.matchAll(
		/<meta[^>]+property="(og:url|og:image)"[^>]+content="([^"]*)"/g
	)) {
		if (!/^https?:\/\//.test(value) || value.includes('/../')) {
			fail(`${relative(BUILD_DIR, file)}: ${prop} is not absolute — "${value}"`);
		}
	}
}

// --- 4A. every absolute URL names the host in lower case ---------------------
//
// The host of a URL is case-insensitive, its path is not (RFC 3986 § 3.2.2, § 6.2.2.1),
// so a capitalised host is not a 404 — which is exactly why it needs a gate. Nothing
// breaks and nothing complains; the site simply advertises itself under a spelling
// that appears nowhere else. Search Console and any tool that treats a URL as an
// opaque string then sees two sites where there is one.
//
// This is not hypothetical here. The deploy workflow derives the origin from
// `github.repository_owner`, and GitHub returns it as the owner typed it — `Alik532UA`.
// It was invisible until now for the wrong reason: the artefact that shipped came from
// Playwright's own build, which used the lower-case default in `vite.config.ts` and
// threw away the workflow's value along with the base path. Fixing that (a135ea1)
// un-masked this, so the gate and the fix arrive together.
//
// Scoped to the host on purpose. The path stays case-sensitive, and SEO-v8 § 1.5 is
// about exactly that: a slug whose case differs from the file is a 404 on Linux.
{
	const absoluteUrl = /https?:\/\/[^"'\s<>]+/g;
	const files = [...htmlFiles, join(BUILD_DIR, 'sitemap.xml'), join(BUILD_DIR, 'robots.txt')];

	for (const file of files) {
		if (!existsSync(file)) continue;
		const text = readFileSync(file, 'utf-8');
		const offenders = new Set();

		for (const [url] of text.matchAll(absoluteUrl)) {
			const host = url.replace(/^https?:\/\//, '').split(/[/?#]/)[0];
			if (host !== host.toLowerCase()) offenders.add(host);
		}

		for (const host of offenders) {
			fail(`${relative(BUILD_DIR, file)}: host is not lower case — "${host}"`);
		}
	}
}

// --- 5. the sitemap lists pages that were actually generated ----------------
const sitemapPath = join(BUILD_DIR, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
	fail('sitemap.xml was not generated');
} else {
	const sitemap = readFileSync(sitemapPath, 'utf-8');
	const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

	if (locs.length === 0) fail('sitemap.xml lists no URLs');

	const generated = new Set(
		htmlFiles.map((f) =>
			relative(BUILD_DIR, f)
				.split(sep)
				.join('/')
				.replace(/\.html$/, '')
		)
	);

	const keyOf = (loc, base) => buildPath(loc, base) || 'index';

	// A base the script was not told about makes every URL-derived path wrong at the
	// same time — 388 lines that are one misconfiguration. This is not a guess: it
	// counts how many sitemap entries resolve with the base taken off versus left on,
	// and only speaks up when removing it is measurably the explanation.
	if (!BASE_PATH && locs.length > 0) {
		const resolved = (base) => locs.filter((loc) => generated.has(keyOf(loc, base))).length;
		const segments = [...new Set(locs.map((loc) => new URL(loc).pathname.split('/')[1] ?? ''))];
		const candidate = segments.length === 1 && segments[0] ? `/${segments[0]}` : '';

		if (candidate && resolved(candidate) > resolved('')) {
			console.error(
				`Every sitemap URL sits under "${candidate}", and ${resolved(candidate)} of ${locs.length} ` +
					`entries resolve once that prefix comes off — against ${resolved('')} with it left on.\n` +
					`The site is served from a base path and BASE_PATH was not passed to this script, so ` +
					`every path it derives from a URL is measured against the wrong root.\n` +
					`Pass the same BASE_PATH the build used.`
			);
			process.exit(1);
		}
	}

	for (const loc of locs) {
		const key = keyOf(loc, BASE_PATH);
		// Case-sensitive: a slug whose case differs from the file is a 404 on Linux.
		if (!generated.has(key)) {
			fail(`sitemap lists ${loc}, but ${key}.html was not generated`);
		}
		// And the other direction: the file that invites the crawler must not name a
		// page the same build tells it to ignore (BETA-CHECKLIST-v8 § 5.5).
		if (isHiddenPage(`${key}.html`)) {
			fail(`sitemap lists ${loc}, which is in HIDDEN_ROUTES`);
		}
	}
}

// --- 6. GitHub Pages needs 404.html, not index.html, as the SPA fallback -----
if (!existsSync(join(BUILD_DIR, '404.html'))) {
	fail('404.html is missing — GitHub Pages serves it for unknown paths');
}

// --- 7. every page is rendered in the language its URL claims ----------------
// Prerendering runs all pages in one process, so a module singleton holding the
// language leaks it into the next page. That produced a Ukrainian page with Dutch
// chrome, and nothing in the source looked wrong.
const LOCALES = ['en', 'uk', 'de', 'nl'];
const PREFIXED = LOCALES.filter((l) => l !== 'en');

const localeOfPath = (rel) => {
	const first = rel.split('/')[0];
	return PREFIXED.includes(first) || PREFIXED.includes(first.replace(/\.html$/, ''))
		? first.replace(/\.html$/, '')
		: 'en';
};

for (const file of htmlFiles) {
	const rel = relative(BUILD_DIR, file).split(sep).join('/');
	if (SHELL_PAGES.has(rel)) continue;

	const html = readFileSync(file, 'utf-8');
	const expected = localeOfPath(rel);

	const lang = html.match(/<html[^>]+lang="([^"]*)"/)?.[1];
	if (lang !== expected) {
		fail(`${rel}: <html lang="${lang}"> but the URL says "${expected}"`);
	}

	// A hidden route declares the opposite of an indexed one, and both halves of that
	// promise are checked separately (BETA-CHECKLIST-v8 § 5.5). `noindex` alone with a
	// canonical still invites the crawler; a canonical alone without `noindex` is the
	// page competing with the ones visitors came for.
	if (isHiddenPage(rel)) {
		if (!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html)) {
			fail(`${rel}: hidden route without noindex`);
		}
		if (/rel="canonical"/.test(html)) fail(`${rel}: hidden route carries a canonical`);
		if (/rel="alternate"[^>]+hreflang=/.test(html)) fail(`${rel}: hidden route carries hreflang`);
		continue;
	}

	if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html)) {
		fail(`${rel}: noindex on a page that is not in HIDDEN_ROUTES`);
	}

	// The canonical must name this page's own language, not a neighbour's.
	// Through buildPath, or the base segment reads as the language segment: every
	// prefixed page then looks English. Same misconfiguration, second half.
	const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/)?.[1] ?? '';
	const canonicalLocale = localeOfPath(buildPath(canonical));
	if (canonicalLocale !== expected) {
		fail(`${rel}: canonical points at the "${canonicalLocale}" version, expected "${expected}"`);
	}

	// One alternate per language plus x-default, so a crawler that finds one
	// translation knows the others exist instead of calling them duplicates.
	const alternates = [...html.matchAll(/<link[^>]+rel="alternate"[^>]+hreflang="([^"]*)"/g)].map(
		(m) => m[1]
	);
	const missing = [...LOCALES, 'x-default'].filter((l) => !alternates.includes(l));
	if (missing.length > 0) {
		fail(`${rel}: missing hreflang alternates: ${missing.join(', ')}`);
	}
}

// --- 7A. a hidden route exists in every language and is disallowed -----------
// The other half of § 5.5: § 7 above proves the pages it finds are hidden properly,
// this proves they were generated at all. An entries() that stopped emitting the
// language variants, or a route that was deleted outright, leaves § 7 with nothing to
// look at and therefore nothing to say.
for (const route of HIDDEN_ROUTES) {
	// The slug is typed by hand and a Cyrillic homoglyph in it gives an address that
	// looks right and never matches (§ 4.2).
	if (/[^\x20-\x7E]/.test(route)) {
		fail(`hidden route "${route}" is not ASCII — a homoglyph here is invisible in a diff`);
	}

	const tail = `${route.replace(/^\//, '')}.html`;
	for (const locale of ['', ...PREFIXED]) {
		const expected = locale ? `${locale}/${tail}` : tail;
		if (!existsSync(join(BUILD_DIR, ...expected.split('/')))) {
			fail(`hidden route ${expected} was not generated — testers would get a 404`);
		}
	}
}

{
	const robotsPath = join(BUILD_DIR, 'robots.txt');
	if (!existsSync(robotsPath)) {
		fail('robots.txt was not generated');
	} else {
		const robots = readFileSync(robotsPath, 'utf-8');
		for (const route of HIDDEN_ROUTES) {
			for (const locale of ['', ...PREFIXED]) {
				const path = `${BASE_PATH}${locale ? `/${locale}` : ''}${route}`;
				if (!robots.includes(`Disallow: ${path}`)) {
					fail(`robots.txt does not disallow ${path}`);
				}
			}
		}
	}
}

// --- 8. internal links and assets point at something that exists -------------
// This replaces svelte/no-navigation-without-resolve, which the project turns off
// because it routes through withBase() rather than SvelteKit's typed resolve().
const EXTERNAL = /^(https?:|mailto:|tel:|data:|#|\/\/)/;

for (const file of htmlFiles) {
	const rel = relative(BUILD_DIR, file).split(sep).join('/');
	if (SHELL_PAGES.has(rel)) continue;

	const html = readFileSync(file, 'utf-8');
	const dir = file.slice(0, file.lastIndexOf(sep));

	for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
		if (value === '' || EXTERNAL.test(value)) continue;
		// An absolute path bypasses the base entirely — the exact bug this catches.
		if (value.startsWith('/')) {
			fail(`${rel}: ${attr}="${value}" is root-absolute and ignores the base path`);
			continue;
		}

		const [target] = value.split(/[?#]/);
		if (target === '' || target === './') continue;

		const candidates = [
			join(dir, target),
			join(dir, `${target}.html`),
			join(dir, target, 'index.html')
		];
		if (!candidates.some((c) => existsSync(c))) {
			fail(`${rel}: ${attr}="${value}" points at a file that was not generated`);
		}
	}
}

// --- 10. the standard backdrop-filter survives minification --------------------
// The source writes the prefixed property first and the standard one second. A
// minifier that treats the pair as duplicates keeps the last, and this project once
// shipped with only -webkit-backdrop-filter — which Chromium does not implement, so
// every glass surface rendered with no blur at all. Nothing in src/ looked wrong.
{
	const cssFiles = [];
	(function walkCss(dir) {
		for (const entry of readdirSync(dir)) {
			const full = join(dir, entry);
			if (statSync(full).isDirectory()) walkCss(full);
			else if (entry.endsWith('.css')) cssFiles.push(full);
		}
	})(BUILD_DIR);

	for (const file of cssFiles) {
		const css = readFileSync(file, 'utf-8');
		const prefixed = (css.match(/-webkit-backdrop-filter\s*:/g) ?? []).length;
		const standard = (css.match(/(?<!-)backdrop-filter\s*:/g) ?? []).length;

		if (prefixed > standard) {
			fail(
				`${relative(BUILD_DIR, file)}: ${prefixed} prefixed backdrop-filter declarations ` +
					`but only ${standard} standard ones — the blur will not render`
			);
		}
	}
}

// ---------------------------------------------------------------------------
// SEO-v8 § 7.5 — артефакти AI-пошуку (llms.txt і групи robots.txt).
//
// Розбір живе в `check-geo`, бо він робить власний парсер `robots.txt`:
// краулер, що збігся з іменованою групою, ігнорує `User-agent: *` цілком, тож
// пропущений там `Disallow` не «наслідується», а ВІДКРИВАЄ шлях саме цьому
// боту. У кількох майже однакових блоках очима така дірка не видно.
for (const msg of checkGeo(BUILD_DIR)) fail(msg);

if (failures.length > 0) {
	console.error(`\n${failures.length} problem(s) in the build:\n`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.log(`Build looks good: ${htmlFiles.length} pages, canonical and sitemap consistent.`);
