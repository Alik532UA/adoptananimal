// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Files in `static/` that nobody asks for (PROJECT-STRUCTURE-v9 § 2.1,
 * `PS-STATIC-ORPHANS`).
 *
 * `adapter-static` copies `static/` into `build/` whole, without asking whether
 * anything references what it is copying. A forgotten file therefore ships to the
 * host and stays there: the build says nothing, `check-build.js` looks at the markup
 * rather than at the directory, and the JS budget counts scripts. There is no step in
 * this project where an unused image would have shown up — which is why the canon
 * measured 57 orphan files of 86 in a neighbouring site, 1 504 KB, most of the weight
 * of the whole thing.
 *
 * The scan is the reverse of the one in `check-build.js`. That one starts from the
 * markup and asks whether the file exists; this one starts from the file and asks
 * whether the markup wants it. Both are needed, and neither implies the other.
 */

const ROOT = resolve(__dirname, '..');

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) walk(path, out);
		else out.push(path);
	}
	return out;
}

const read = (path: string) => {
	try {
		return readFileSync(resolve(ROOT, path), 'utf8');
	} catch {
		// A binary file read as text is not a reference to anything; the walk below
		// covers directories that hold both, and skipping is cheaper than sniffing.
		return '';
	}
};

/**
 * The orphans that were already there when this check arrived — path and why.
 *
 * The canon asks for a debt that can only shrink rather than a deletion made on the
 * spot: some orphans are the targets of links that live outside the repository, and
 * the repository cannot see them. This one is not that — a social icon is only ever
 * used from inside — but it is a content decision rather than a code one, and the
 * useful thing a gate can do with it is make it visible instead of settling it.
 */
const KNOWN_ORPHANS: Record<string, string> = {};

describe('§ 2.1 — файл у static/, якого не просить ніхто', () => {
	const assets = walk('static');

	/*
	 * Everything that could name an asset — minus this file.
	 *
	 * The exclusion is not tidiness. `KNOWN_ORPHANS` holds the path of every orphan as
	 * a string, so a scan that reads its own source finds each of them referenced and
	 * reports the list as settled — the gate proving the opposite of what it measures,
	 * and doing it more convincingly the longer the list grows.
	 */
	const SELF = 'src/static-assets.test.ts';
	const haystack = ['src', 'scripts', 'tests']
		.flatMap((dir) => walk(dir))
		.filter((path) => path !== SELF)
		.map(read)
		.join('\n');

	it('перевірка жива: обидва боки прочитано', () => {
		expect(assets.length, 'static/ порожній — обхід дивиться не туди').toBeGreaterThan(10);
		expect(haystack.length, 'джерела порожні — шукати нема в чому').toBeGreaterThan(10_000);
	});

	it('на кожен файл у static/ хтось посилається', () => {
		// Full path from the site root, the form every reference in this project takes
		// (`/images/animals/cat_basti.jpg`). Matching by basename alone would let
		// `en.svg` be "found" by any sentence containing that name, which is the same
		// mistake `PS-REACHABILITY` was written about.
		const orphans = assets.filter((path) => {
			if (KNOWN_ORPHANS[path] !== undefined) return false;
			return !haystack.includes(path.replace(/^static/, ''));
		});

		expect(
			orphans,
			`їде на хостинг і не потрібне нікому — прибрати або послатися:\n${orphans.join('\n')}`
		).toEqual([]);
	});

	it('перелік відомих сиріт тримає лише те, що досі сирота', () => {
		// The same ratchet as the size list: an entry that has since been wired up has
		// to leave, or the list becomes a place where names go to be forgotten.
		const settled = Object.keys(KNOWN_ORPHANS).filter(
			(path) => !assets.includes(path) || haystack.includes(path.replace(/^static/, ''))
		);

		expect(
			settled,
			`уже не сирота (або файла немає) — прибрати з переліку:\n${settled.join('\n')}`
		).toEqual([]);
	});

	it('вага боргу названа числом, а не словом', () => {
		// A count of files says nothing about what it costs: one forgotten video
		// outweighs forty icons. The number is here so that the next reader sees the
		// size of the debt without measuring it again, and it is measured rather than
		// written down (`PIT-NUMBER-UNDER-GATE`).
		const weight = Object.keys(KNOWN_ORPHANS)
			.map((path) => statSync(resolve(ROOT, path)).size)
			.reduce((sum, size) => sum + size, 0);

		expect(weight, 'борг у static/ виріс — перелік лише скорочується').toBeLessThanOrEqual(
			8 * 1024
		);
	});
});
