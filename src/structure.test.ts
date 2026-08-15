import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Structural invariants from PROJECT-STRUCTURE-v8 §§ 4 and 7.
 *
 * The size rule is the one that needed a test rather than good intentions: nothing about
 * an 878-line component is visible in a diff, and by the time it is obvious it is too
 * late to want to split it. The canon says to switch the limit on with the existing
 * offenders listed explicitly, so that the list is a thing you shorten rather than a
 * gate you turn off — which is what this allowlist is.
 */

const ROOT = resolve(__dirname, '..');

function sources(dir = 'src', out: string[] = []): string[] {
	for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) sources(path, out);
		else if (/\.(svelte|ts)$/.test(entry.name) && !/\.(test|spec)\.ts$/.test(entry.name)) {
			out.push(path);
		}
	}
	return out;
}

const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');

/** § 7. A route page may be longer than a component: it is allowed to compose. */
const LIMITS: Array<[RegExp, number]> = [
	[/\/routes\/.*\+page\.svelte$/, 400],
	[/\.svelte$/, 300],
	[/\.svelte\.ts$/, 300],
	[/\.ts$/, 250]
];

/**
 * The files that were already over the line when this test arrived.
 *
 * Every entry is a debt with a reason, and the reasons differ — some are worth paying
 * off, one or two are ports of canon reference code that would only get worse if
 * rearranged. Recorded in PROJECT-CONTEXT.md § 4.15. Entries come out of this list; they
 * do not go in.
 */
const ALLOWED_OVER_LIMIT = new Set([
	'src/lib/components/Header.svelte',
	'src/lib/components/ui/Minimap.svelte',
	'src/lib/components/ui/Carousel.svelte',
	'src/lib/components/ui/PageScrollbar.svelte',
	'src/lib/components/apply/ApplyForm.svelte',
	'src/lib/components/animal/AnimalCard.svelte',
	'src/lib/components/OrgLogos.svelte',
	'src/routes/+layout.svelte',
	'src/routes/[[lang=lang]]/+page.svelte'
]);

describe('§ 7 — file size', () => {
	const measured = sources().map((path) => {
		const limit = LIMITS.find(([re]) => re.test(path))?.[1] ?? Infinity;
		return { path, lines: read(path).split('\n').length, limit };
	});

	it('no new file goes over its limit', () => {
		const over = measured
			.filter((f) => f.lines > f.limit && !ALLOWED_OVER_LIMIT.has(f.path))
			.map((f) => `${f.path}: ${f.lines} lines (limit ${f.limit})`);

		expect(over, `over the limit and not on the list:\n${over.join('\n')}`).toEqual([]);
	});

	it('the list of known offenders holds nothing that has since been split', () => {
		// A stale entry is how an allowlist quietly becomes permission. If a file has come
		// back under its limit, this fails until its name is removed — so the list can only
		// ever get shorter.
		const settled = [...ALLOWED_OVER_LIMIT].filter((path) => {
			const file = measured.find((f) => f.path === path);
			return !file || file.lines <= file.limit;
		});

		expect(
			settled,
			`no longer over the limit — remove from the list:\n${settled.join('\n')}`
		).toEqual([]);
	});
});

describe('§ 4 — naming', () => {
	it('a component is imported under the name of its own file', () => {
		// `import Card from './AnimalCard.svelte'` compiles and reads as a different
		// component than the one it is. Cheap to check, impossible to see in review.
		const wrong: string[] = [];
		const pattern =
			/import\s+([A-Z][A-Za-z0-9]*)\s+from\s+["'][^"']*\/([A-Z][A-Za-z0-9]*)\.svelte["']/g;

		for (const path of sources()) {
			for (const match of read(path).matchAll(pattern)) {
				if (match[1] !== match[2]) wrong.push(`${path}: ${match[1]} -> ${match[2]}.svelte`);
			}
		}

		expect(wrong, `alias does not match the file:\n${wrong.join('\n')}`).toEqual([]);
	});
});
