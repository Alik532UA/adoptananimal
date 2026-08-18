// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Static checks over the data-testid convention (TESTID-AND-NAMING-v8 § 1.9.1).
 *
 * Reads sources rather than the DOM, so it sees every id — including those inside
 * {#if}, menus and error branches, where a browser check after goto() never gets.
 * Runtime duplicates, which need a real page, are the other half of § 1.9 and live
 * in tests/testids.spec.ts.
 *
 * The collector reads three shapes, not one. A plain `data-testid="…"` is the
 * common case, but this project also writes `data-testid={`…`}` for list items and
 * `data-testid={cond ? 'a' : 'b'}` for a button that swaps direction — and those
 * are exactly the ids nobody re-reads. Matching only the quoted form left six of
 * them unchecked, among them both arrows of the carousel and both breadcrumb
 * shapes; the check reported a clean run over the rest and said nothing about it.
 *
 * `data-testid={finalTestId}` carries no literal and is deliberately not resolved:
 * that is the composite-component prop of § 1.7, and the value it receives is
 * checked where it is written.
 *
 * Reverse experiment (AI-AGENT-PITFALLS-v8 § 1.1), one id in Footer.svelte at a
 * time: `-Link` reddens kebab-case, `футер-` reddens it too, `-button` reddens the
 * any-position rule, `${Math.random()}` reddens the non-deterministic rule,
 * `-wrapper` reddens the type-position rule, and stubbing the expression branch out
 * of the collector reddens the check that the collector reads it at all.
 */

/** Canonical type segments (§ 1.3). The last segment of an id must be one of these. */
const CANONICAL_TYPES = [
	'btn',
	'link',
	'input',
	'textarea',
	'checkbox',
	'radio',
	'select',
	'toggle',
	'slider',
	'option',
	'form',
	'fieldset',
	'label',
	'modal',
	'drawer',
	'backdrop',
	'overlay',
	'tooltip',
	'toast',
	'card',
	'list',
	'item',
	'row',
	'cell',
	'tabs',
	'tab',
	'panel',
	'section',
	'header',
	'footer',
	'nav',
	'banner',
	'menu',
	'toolbar',
	'icon',
	'img',
	'container',
	'title',
	'text',
	'message',
	'error',
	'hint',
	'warning',
	'value',
	'count',
	'status',
	'badge',
	'progress',
	'spinner',
	'skeleton'
];

/** Banned in the type position — legitimate elsewhere in a feature name (§ 1.4). */
const FORBIDDEN_TYPES = [
	'wrapper',
	'wrap',
	'box',
	'block',
	'group',
	'content',
	'grid',
	'widget',
	'area',
	'root',
	'trigger',
	'display',
	'switcher',
	'dialog',
	'popup',
	'help',
	'step',
	'dot'
];

/**
 * Banned in any position: the moment `-btn` and `-button` coexist, every locator
 * becomes a guess about which of the two its author picked (§ 1.4).
 */
const FORBIDDEN_ANYWHERE = /^buttons?$/i;

/**
 * What a `{…}` hole becomes before parsing. A letter rather than an empty string:
 * otherwise `news-card-{id}` collapses to `news-card-` and the kebab check fails on
 * a trailing dash that is not in the code.
 */
const DYNAMIC = 'x';

const collect = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = resolve(dir, entry.name);
		if (entry.isDirectory()) collect(full, out);
		else if (entry.name.endsWith('.svelte')) out.push(full);
	}
	return out;
};

/**
 * Drops what is not markup: `<style>`, where a testid appears inside
 * `:global([data-testid="…"])`, and comments, where old names are left with an
 * explanation. Without this the check counts them as separate elements and reports
 * duplicates that are not in the DOM.
 */
const markupOnly = (source: string) =>
	source.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');

/** Text of the `{…}` expression starting at `open`, brace-balanced. */
const expressionAt = (text: string, open: number): string | null => {
	let depth = 0;
	for (let i = open; i < text.length; i++) {
		if (text[i] === '{') depth++;
		else if (text[i] === '}' && --depth === 0) return text.slice(open + 1, i);
	}
	return null;
};

const files = collect(resolve('src'));

/** Every literal testid in the source, whichever of the three shapes wrote it. */
const testIds = files.flatMap((file) => {
	const short = file.replace(resolve('src'), 'src').replace(/\\/g, '/');
	const source = markupOnly(readFileSync(file, 'utf-8'));
	const found: { file: string; id: string }[] = [];

	for (const match of source.matchAll(/data-testid=(["{])/g)) {
		const start = match.index + match[0].length - 1;

		if (match[1] === '"') {
			const end = source.indexOf('"', start + 1);
			if (end !== -1) found.push({ file: short, id: source.slice(start + 1, end) });
			continue;
		}

		const expression = expressionAt(source, start);
		if (expression === null) continue;
		// Every string literal inside the expression: a template, a ternary's two
		// branches, or nothing at all when the value arrives as a prop.
		for (const literal of expression.matchAll(/`([^`]*)`|'([^']*)'|"([^"]*)"/g)) {
			found.push({ file: short, id: literal[1] ?? literal[2] ?? literal[3] });
		}
	}

	return found;
});

/** The id with holes flattened into one letter — for character-level rules. */
const flat = (id: string) => id.replace(/\$?\{[^}]*\}/g, DYNAMIC);

/**
 * Segments of the id. A hole becomes `-x-` rather than `x`: the interpolation can
 * sit without a dash (`…-all-link{suffix}`), and without the artificial boundary
 * the type would fuse with it into `linkx`, which is in no canon.
 */
const segmentsOf = (id: string) =>
	id
		.replace(/\$?\{[^}]*\}/g, `-${DYNAMIC}-`)
		.split('-')
		.filter(Boolean);

/** Last segment that is neither a hole nor a numeric discriminator. */
const typeSegment = (id: string): string => {
	const segments = segmentsOf(id);
	while (
		segments.length &&
		(segments.at(-1) === DYNAMIC || /^\d+$/.test(segments.at(-1) as string))
	)
		segments.pop();
	return segments.at(-1) ?? '';
};

const report = (bad: { file: string; id: string }[]) => bad.map((b) => `${b.file}: ${b.id}`);

describe('data-testid convention', () => {
	it('finds testids to check', () => {
		expect(testIds.length).toBeGreaterThan(20);
	});

	it('reads the templated and conditional forms too, not only the quoted one', () => {
		// The check that keeps the collector honest: drop the expression branch and
		// this number goes to zero while every other check here still passes.
		expect(testIds.filter(({ id }) => id.includes('${')).length).toBeGreaterThan(0);
	});

	it('ends every id with a canonical type segment', () => {
		const bad = testIds.filter(({ id }) => !CANONICAL_TYPES.includes(typeSegment(id)));
		expect(report(bad)).toEqual([]);
	});

	it('never uses a forbidden word in the type position', () => {
		const bad = testIds.filter(({ id }) => FORBIDDEN_TYPES.includes(typeSegment(id)));
		expect(report(bad)).toEqual([]);
	});

	it('never mixes -btn with -button, in any position', () => {
		const bad = testIds.filter(({ id }) => segmentsOf(id).some((s) => FORBIDDEN_ANYWHERE.test(s)));
		expect(report(bad)).toEqual([]);
	});

	it('stays kebab-case ASCII (§ 1.2)', () => {
		// Cyrillic reads fine in the editor and turns into an unusable locator: the
		// selector has to be typed by hand in a test, and half of them will not match.
		const bad = testIds.filter(({ id }) => /[A-Z]|[Ѐ-ӿ]|--|^-|-$/.test(flat(id)));
		expect(report(bad)).toEqual([]);
	});

	it('has no non-deterministic id (§ 1.6)', () => {
		// A locator that changes between two runs of the same page is not a locator.
		const bad = testIds.filter(({ id }) => /randomUUID|Math\.random|Date\.now/.test(id));
		expect(report(bad)).toEqual([]);
	});

	it('has no duplicate literal id within one component', () => {
		const perFile = new Map<string, string[]>();
		for (const { file, id } of testIds) {
			perFile.set(file, [...(perFile.get(file) ?? []), id]);
		}

		const duplicates: string[] = [];
		for (const [file, ids] of perFile) {
			const seen = new Set<string>();
			for (const id of ids) {
				// A templated id renders differently per item, so repeats are expected
				if (id.includes('{')) continue;
				if (seen.has(id)) duplicates.push(`${file}: ${id}`);
				seen.add(id);
			}
		}
		expect(duplicates).toEqual([]);
	});
});
