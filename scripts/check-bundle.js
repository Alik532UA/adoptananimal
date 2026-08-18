#!/usr/bin/env node
/**
 * Budget for the JavaScript a visitor downloads before the page is interactive
 * (PERFORMANCE-v8 § 1, § 10.1).
 *
 * The canon's reference script sums `build/_app/immutable/entry`. Copying it here
 * would produce a gate that can never fail: in this SvelteKit version that folder
 * holds 2 KB, and the whole application lives in `chunks/` and `nodes/` beside it.
 * A check reporting "2 KB of 150" every time is worse than none — it reads like
 * proof and measures nothing (AI-AGENT-PITFALLS-v8 § 1).
 *
 * So the measurement is taken from the generated pages themselves: every
 * `_app/immutable/**.js` a page references is what the browser fetches for that
 * page, and the budget applies to the heaviest one. Gzip, because that is how the
 * host serves them.
 *
 * Usage: node scripts/check-bundle.js [buildDir]
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * Ceiling in KB gzip for one page. The canon's default is 150; this project sits
 * just above it and the difference is recorded in PROJECT-CONTEXT.md § 4.20 along
 * with what occupies it. The number is here to stop growth and to be lowered —
 * raising it is a decision, not a fix.
 */
const BUDGET_KB = 165;

const BUILD_DIR = process.argv[2] ?? 'build';

if (!existsSync(BUILD_DIR)) {
	console.error(`No build directory at "${BUILD_DIR}" — run npm run build first.`);
	process.exit(1);
}

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

const gzipped = new Map();
const sizeOf = (asset) => {
	if (!gzipped.has(asset))
		gzipped.set(asset, gzipSync(readFileSync(join(BUILD_DIR, asset))).length);
	return gzipped.get(asset);
};

const ASSET = /_app\/immutable\/[\w-]+\/[\w.$-]+\.js/g;

const measured = pages.map((page) => {
	const assets = [...new Set([...readFileSync(page, 'utf8').matchAll(ASSET)].map((m) => m[0]))];
	return {
		page,
		assets: assets.length,
		kb: assets.reduce((total, asset) => total + sizeOf(asset), 0) / 1024
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

measured.sort((a, b) => b.kb - a.kb);
const heaviest = measured[0];

console.log(
	`heaviest page: ${heaviest.kb.toFixed(1)} KB gzip in ${heaviest.assets} files (${heaviest.page})`
);
console.log(`budget: ${BUDGET_KB} KB gzip per page, over ${measured.length} pages`);

const over = measured.filter((m) => m.kb > BUDGET_KB);
if (over.length > 0) {
	for (const m of over) console.error(`over budget: ${m.page} — ${m.kb.toFixed(1)} KB`);
	process.exit(1);
}
