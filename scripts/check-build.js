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

const BUILD_DIR = process.argv[2] ?? 'build';
const failures = [];
const fail = (message) => failures.push(message);

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
	if (SHELL_PAGES.has(rel)) continue;

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

	// Sitemap URLs carry the base path; the build directory *is* the base, so the
	// prefix has to come off before comparing against generated files.
	const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/$/, '');

	for (const loc of locs) {
		let pathname = new URL(loc).pathname;
		if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
			pathname = pathname.slice(BASE_PATH.length);
		}
		const path = pathname.replace(/^\/+/, '').replace(/\/$/, '');
		const key = path === '' ? 'index' : path;
		// Case-sensitive: a slug whose case differs from the file is a 404 on Linux.
		if (!generated.has(key)) {
			fail(`sitemap lists ${loc}, but ${key}.html was not generated`);
		}
	}
}

// --- 6. GitHub Pages needs 404.html, not index.html, as the SPA fallback -----
if (!existsSync(join(BUILD_DIR, '404.html'))) {
	fail('404.html is missing — GitHub Pages serves it for unknown paths');
}

// --- 7. internal links and assets point at something that exists -------------
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

if (failures.length > 0) {
	console.error(`\n${failures.length} problem(s) in the build:\n`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}

console.log(`Build looks good: ${htmlFiles.length} pages, canonical and sitemap consistent.`);
