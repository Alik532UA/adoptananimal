#!/usr/bin/env node
/**
 * Budget for the JavaScript a visitor downloads before the page is interactive
 * (PERFORMANCE-v8 § 1, § 1.1, § 10.1; SVELTEKIT-DATA-v8 § 7.8).
 *
 * The canon's reference script sums `build/_app/immutable/entry`. Copying it here
 * would produce a gate that can never fail: in this SvelteKit version that folder
 * holds 2 KB, and the whole application lives in `chunks/` and `nodes/` beside it.
 * A check reporting "2 KB of 150" every time is worse than none — it reads like
 * proof and measures nothing (AI-AGENT-PITFALLS-v8 § 1).
 *
 * So the measurement is taken from the generated pages themselves: every
 * `_app/immutable/**.js` a page references is what the browser fetches for that
 * page. Gzip, because that is how the host serves them.
 *
 * CODE AND DATA ARE TWO NUMBERS, NOT ONE (§ 1.1). A budget exists to catch code
 * growing — "a heavy library reaches the main bundle by drift, not by decision".
 * One combined figure also counts the animal registry, which rides into the bundle
 * as a module, and then every animal added to the site pushes a performance
 * threshold that no code went anywhere near.
 *
 * Not theoretical here. Measured 2026-09-02, before this split:
 *
 *   heaviest by TOTAL   index.html  163.1 KB  =  84.2 code + 78.9 registry
 *   heaviest by CODE    apply/form.html  96.3 KB, with no registry at all
 *
 * The single 165 KB ceiling had 1.8 KB left — two more animals — while the page
 * carrying the most actual code sat 67 KB below it, unwatched. The gate was
 * measuring the catalogue and calling it the bundle.
 *
 * Usage: node scripts/check-bundle.js [buildDir]
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * Ceiling in KB gzip for the CODE one page pulls in.
 *
 * The canon's default is 150 and this project is well inside it; the number here is
 * the project's own, and it is tighter on purpose. § 1.1: "a budget with half again
 * of headroom catches nothing but a catastrophe, and then it is not needed". About
 * ten per cent over the measured 96.3 KB of `apply/form`, so ordinary work has room
 * and a library arriving by accident does not.
 */
const CODE_KB = 106;

/**
 * Ceiling in KB gzip for the DATA one page pulls in — the animal registry.
 *
 * Roomier by design (§ 1.1): adding animals is the site working as intended, and a
 * ceiling that fires on the next record would be switched off within a week. Wide
 * enough for about twenty-five more animals at the measured 1.6 KB each, and narrow
 * enough that doubling the catalogue is refused rather than merely noticed.
 *
 * Both numbers are meant to come DOWN. The registry ships to 216 of 229 pages,
 * including the thirteen that show no cards at all; splitting it is the real
 * optimisation here and is recorded in PROJECT-CONTEXT.md § 4.20.
 */
const DATA_KB = 120;

const BUILD_DIR = process.argv[2] ?? 'build';

if (!existsSync(BUILD_DIR)) {
	console.error(`No build directory at "${BUILD_DIR}" — run npm run build first.`);
	process.exit(1);
}

/**
 * The registry's own slugs, read from the directory that owns them rather than
 * copied here: a second list is a second thing to update, and forgetting shows up
 * as a green run.
 */
const ANIMALS_DIR = 'src/lib/data/animals';
const slugs = existsSync(ANIMALS_DIR)
	? readdirSync(ANIMALS_DIR)
			.filter((f) => f.endsWith('.ts'))
			.map((f) => f.replace(/^(cat|dog)_/, '').replace(/\.ts$/, ''))
	: [];

if (slugs.length === 0) {
	console.error(`No animal data files under ${ANIMALS_DIR} — the code/data split cannot be made.`);
	process.exit(1);
}

/**
 * A chunk counts as the registry when it holds nearly all of the catalogue.
 *
 * By content, not by filename: the chunk's name is a build hash and changes on every
 * edit. All three quote characters, because the minifier rewrites `'cucumber'` as a
 * template literal and a check that only knew about apostrophes classified the whole
 * registry as code — 50 slugs found, then 0, from one missing backtick.
 *
 * The threshold is nowhere near a judgement call in practice: measured, the registry
 * chunk holds 50 of 50 and no other chunk holds more than 1.
 */
const REGISTRY_SHARE = 0.8;
const holdsSlug = (src, slug) =>
	src.includes(`'${slug}'`) || src.includes(`"${slug}"`) || src.includes('`' + slug + '`');

/** Every generated page. `_app` holds the assets themselves, not pages. */
const pages = [];
(function walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			if (entry !== '_app') walk(full);
		} else if (entry.endsWith('.html')) {
			pages.push(full);
		}
	}
})(BUILD_DIR);

const seen = new Map();
const describe = (asset) => {
	if (!seen.has(asset)) {
		const src = readFileSync(join(BUILD_DIR, asset), 'utf8');
		const covered = slugs.filter((slug) => holdsSlug(src, slug)).length;
		seen.set(asset, {
			kb: gzipSync(Buffer.from(src)).length / 1024,
			isRegistry: covered >= slugs.length * REGISTRY_SHARE
		});
	}
	return seen.get(asset);
};

const ASSET = /_app\/immutable\/[\w-]+\/[\w.$-]+\.js/g;

const measured = pages.map((page) => {
	const assets = [...new Set([...readFileSync(page, 'utf8').matchAll(ASSET)].map((m) => m[0]))];
	let code = 0;
	let data = 0;
	for (const asset of assets) {
		const info = describe(asset);
		if (info.isRegistry) data += info.kb;
		else code += info.kb;
	}
	return {
		page: relative(BUILD_DIR, page).split(sep).join('/'),
		assets: assets.length,
		code,
		data
	};
});

/**
 * The check has to be able to fail. Zero pages, or pages that reference nothing,
 * both mean the build layout moved and the scan is looking in the wrong place —
 * which must be loud, not a pass (PERFORMANCE-v8 § 10.1).
 */
if (measured.length === 0) {
	console.error('No pages found — the check is dead, has the build layout changed?');
	process.exit(1);
}
if (measured.every((m) => m.assets === 0)) {
	console.error(
		'No page references any _app/immutable script — the asset pattern no longer matches.'
	);
	process.exit(1);
}

/**
 * Third canary, and the one this split adds. The registry is imported statically and
 * ships to most pages, so "no chunk looks like the registry" is never good news: it
 * means the classifier stopped recognising it, every byte of the catalogue is being
 * counted as code, and the code number silently became the old combined one.
 */
if (![...seen.values()].some((info) => info.isRegistry)) {
	console.error(
		`No chunk was recognised as the animal registry (${slugs.length} slugs) — ` +
			'the code/data split is not being made, and the code figure below is wrong.'
	);
	process.exit(1);
}

const heaviest = (key) => measured.reduce((a, b) => (b[key] > a[key] ? b : a));
const worstCode = heaviest('code');
const worstData = heaviest('data');
const worstTotal = measured.reduce((a, b) => (b.code + b.data > a.code + a.data ? b : a));

console.log(`heaviest code:  ${worstCode.code.toFixed(1)} KB gzip (${worstCode.page})`);
console.log(`heaviest data:  ${worstData.data.toFixed(1)} KB gzip (${worstData.page})`);
console.log(
	`heaviest page:  ${(worstTotal.code + worstTotal.data).toFixed(1)} KB gzip = ` +
		`${worstTotal.code.toFixed(1)} code + ${worstTotal.data.toFixed(1)} data (${worstTotal.page})`
);
console.log(
	`budget: ${CODE_KB} KB code and ${DATA_KB} KB data per page, over ${measured.length} pages`
);

const over = [
	...measured
		.filter((m) => m.code > CODE_KB)
		.map((m) => `code ${m.code.toFixed(1)} KB — ${m.page}`),
	...measured.filter((m) => m.data > DATA_KB).map((m) => `data ${m.data.toFixed(1)} KB — ${m.page}`)
];

if (over.length > 0) {
	for (const line of over) console.error(`over budget: ${line}`);
	process.exit(1);
}
