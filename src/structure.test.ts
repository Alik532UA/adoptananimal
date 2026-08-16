import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

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
 * rearranged. Recorded in PROJECT-CONTEXT.md § 4.15.
 *
 * The list is meant to shrink, and an entry is only allowed in when splitting the file
 * would make the code WORSE rather than when it would merely be work — PROJECT-STRUCTURE
 * § 7 sanctions exactly that, provided the reason is written down. "Entries never go in"
 * is what this note used to say, and it did not survive contact: HeaderNavLinks went
 * over while gaining a feature it could not be split out of. Saying so is better than a
 * rule quietly broken.
 */
const ALLOWED_OVER_LIMIT = new Set([
	'src/lib/components/ui/Minimap.svelte',
	'src/lib/components/ui/Carousel.svelte',
	'src/lib/components/ui/PageScrollbar.svelte',
	'src/lib/components/apply/ApplyForm.svelte',
	'src/lib/components/animal/AnimalCard.svelte',
	'src/lib/components/OrgLogos.svelte',
	'src/routes/+layout.svelte',
	'src/routes/[[lang=lang]]/+page.svelte',
	// The wordmark, the destinations and the call to action are all `.header__link`
	// with a few declarations on top. Splitting any of them out leaves its rules in
	// another component's <style>, where the scope cannot reach them — SVELTE-UI § 3.5,
	// and the component's own docblock says so. PROJECT-CONTEXT.md § 4.19.
	'src/lib/components/header/HeaderNavLinks.svelte'
]);

describe('§ 4.3 — a file that exists reads as work that was done', () => {
	// The most expensive rule in the canon, and the one this file was missing. A
	// component nobody imports still gets read, edited and cited: a fully written
	// SEO.svelte, imported from nowhere, once earned a project an SEO score it did
	// not have. Nothing about it looks wrong — that is the whole problem.
	const all = sources();

	it('the scan finds components at all — the check is alive', () => {
		const components = all.filter((path) => path.includes('/lib/') && path.endsWith('.svelte'));
		expect(
			components.length,
			'no components found — the walker is looking in the wrong place'
		).toBeGreaterThan(10);
	});

	it('every component under lib/ is imported from somewhere', () => {
		const contents = new Map(all.map((path) => [path, read(path)]));
		const components = all.filter((path) => path.includes('/lib/') && path.endsWith('.svelte'));

		// Deliberately crude: it looks for the file name in the text of every other
		// source. That misses a dynamic import built from a variable, which is why
		// the canon says such cases go in an explicit allowlist here rather than
		// loosening the rule. There are none today.
		const orphans = components.filter((path) => {
			const name = basename(path);
			return ![...contents].some(([other, text]) => other !== path && text.includes(name));
		});

		expect(
			orphans,
			`imported from nowhere — wire it up or delete it:\n${orphans.join('\n')}`
		).toEqual([]);
	});

	it('runes live only in .svelte and .svelte.ts', () => {
		// The compiler does not process runes outside those two extensions. It does
		// not complain either: `$state(0)` in a plain .ts is an undefined function
		// call that fails at runtime, in the browser, on whichever path reaches it
		// first. Renaming the file is the whole fix, which is why this is worth a
		// gate rather than a habit.
		const wrong = all
			.filter((path) => path.endsWith('.ts') && !path.endsWith('.svelte.ts'))
			.filter((path) => /\$state[({<]|\$derived[({<]|\$effect[({.]/.test(read(path)));

		expect(wrong, `runes in a plain .ts — rename to .svelte.ts:\n${wrong.join('\n')}`).toEqual([]);
	});
});

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
