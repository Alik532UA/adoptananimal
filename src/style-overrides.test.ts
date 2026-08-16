// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A global override outranks the component rule it overrides — by specificity, not by
 * luck.
 *
 * THE DEFECT THIS EXISTS FOR. `[data-style='playful'] .animal-card:hover` rotated the
 * card in `npm run dev` and did nothing in a build. No `if`, no environment check —
 * the two rules were simply tied, and a tie is broken by source order:
 *
 *     [data-style='playful'] .animal-card:hover   [attr] .class :hover   = (0,3,0)
 *     .animal-card:hover        as authored in AnimalCard.svelte
 *       ↓ compiles to
 *     .animal-card.svelte-1s5geeb:hover           .class .class :hover   = (0,3,0)
 *
 * The scoping class is the whole trick, and it is invisible in the source file. Read
 * off the built CSS rather than assumed: Svelte attaches `.svelte-HASH` as a REAL
 * class to the subject compound (+1 class), and `:where(.svelte-HASH)` to descendants
 * (+0, deliberately specificity-neutral). So every single-compound rule a component
 * writes is one class more specific than it looks.
 *
 * Source order then decides, and source order is not a property of the code: in dev
 * Vite injects component CSS as a <style> after app.css; in a build it emits a
 * separate <link> the global bundle precedes. Same files, same specificity, opposite
 * winner — which is why this class of bug survives a green test suite and shows up
 * only when somebody opens dev and prod side by side.
 *
 * WHY STATIC AND NOT E2E. There is an e2e for this too (tests/skin-overrides.spec.ts),
 * and it is the stronger evidence — it measures the composed transform on the built
 * site. But it only covers the properties somebody thought to enumerate: three tests
 * for one class. This file covers the whole class for the price of one, without a
 * browser, and it names the fix in the failure message.
 */

const ROOT = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(full.replace(/\\/g, '/'));
	}
	return out;
}

const files = walk(join(ROOT, 'src')).map((f) => f.slice(ROOT.replace(/\\/g, '/').length + 1));

const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

/** Specificity as (ids, classes, elements); `:where()` contributes nothing. */
function specificity(selector: string): [number, number, number] {
	const cleaned = selector
		.replace(/:where\([^)]*\)/g, '')
		.replace(/::[a-z-]+/g, '') // pseudo-elements → element weight
		.trim();

	const ids = (cleaned.match(/#[\w-]+/g) ?? []).length;
	const classes =
		(cleaned.match(/\.[\w-]+/g) ?? []).length +
		(cleaned.match(/\[[^\]]+\]/g) ?? []).length +
		(cleaned.match(/:(?!:)[a-z-]+(\([^)]*\))?/g) ?? []).length;
	const elements =
		(cleaned.match(//g) ?? []).length + (cleaned.match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;

	return [ids, classes, elements];
}

const compare = (a: [number, number, number], b: [number, number, number]) =>
	a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

const show = (s: [number, number, number]) => `(${s.join(',')})`;

/** The class a rule is aimed at: the first class of its last compound. */
function subjectClass(selector: string): string | null {
	const last =
		selector
			.trim()
			.split(/\s+(?![^(]*\))|(?<=[>+~])/)
			.pop() ?? '';
	return /\.([\w-]+)/.exec(last)?.[1] ?? null;
}

/** Pseudo-class state on the subject compound, so `:hover` is not compared to rest. */
function subjectState(selector: string): string {
	const last =
		selector
			.trim()
			.split(/\s+(?![^(]*\))|(?<=[>+~])/)
			.pop() ?? '';
	return (last.match(/:(?!:)(?:hover|focus|focus-within|focus-visible|active|disabled)/g) ?? [])
		.sort()
		.join('');
}

type Rule = {
	file: string;
	selector: string;
	spec: [number, number, number];
	props: Set<string>;
	cls: string;
	state: string;
};

/** Declaration blocks, with at-rule wrappers flattened away. */
function rules(css: string, file: string, scopingBonus: number): Rule[] {
	const found: Rule[] = [];
	// Drop comments, then take every `selector { declarations }` whose body has no
	// nested block — that skips `@media { … }` wrappers and keeps what is inside them.
	const source = css.replace(/\/\*[\s\S]*?\*\//g, '');

	for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const selectorList = match[1].trim();
		if (!selectorList || selectorList.startsWith('@')) continue;

		const props = new Set(
			[...match[2].matchAll(/(^|[;\s])([a-z-]+)\s*:/g)].map((m) => m[2]).filter((p) => p !== '')
		);
		if (props.size === 0) continue;

		for (const selector of selectorList.split(',')) {
			const cls = subjectClass(selector);
			if (!cls) continue;
			const spec = specificity(selector);
			found.push({
				file,
				selector: selector.trim(),
				spec: [spec[0], spec[1] + scopingBonus, spec[2]],
				props,
				cls,
				state: subjectState(selector)
			});
		}
	}
	return found;
}

/**
 * `+1` because Svelte adds `.svelte-HASH` as a real class to the subject compound.
 * Verified against the built CSS, not assumed: descendants get `:where(.svelte-HASH)`,
 * which is specificity-neutral, but the subject gets a plain class.
 */
const SCOPING_CLASS = 1;

const componentRules = files
	.filter((f) => f.endsWith('.svelte'))
	.flatMap((f) => {
		const style = /<style[^>]*>([\s\S]*)<\/style>/.exec(read(f))?.[1] ?? '';
		return rules(style, f, SCOPING_CLASS);
	});

/**
 * Only rules carrying `[data-style=…]` or `[data-theme=…]`, and the narrowing is the
 * whole design of this check.
 *
 * Two different relationships look identical to an arithmetic comparison, and only one
 * of them is a defect:
 *
 *   - a SKIN OR THEME overriding a component. This is a layer: it is written after the
 *     component, it means to replace what the component said, and it must win. A tie
 *     here is the bug this file is about.
 *   - a component SPECIALISING a base utility. `.btn` in app.css losing to
 *     `.detail__aside-actions .btn` is not a defect, it is the point — a button inside
 *     that panel is meant to look different. A check that flagged it would be telling
 *     the author to break working CSS.
 *
 * The first draft did not separate them and reported 22 findings, most of them the
 * second kind. A gate that is mostly wrong gets an allowlist, then gets ignored, then
 * gets deleted. The attribute prefix is what makes a rule a layer, so it is what the
 * check keys on.
 */
const LAYER = /\[data-(?:style|theme)=/;

const globalRules = files
	.filter((f) => f === 'src/app.css' || /^src\/lib\/styles\//.test(f))
	.filter((f) => f.endsWith('.css'))
	.flatMap((f) => rules(read(f), f, 0))
	.filter((rule) => LAYER.test(rule.selector));

describe('глобальні перекриття виграють за специфічністю, а не за порядком', () => {
	it('перевірка жива: правила з обох боків знайдено', () => {
		// Пороги грубі навмисно — вони ловлять «сканер шукає не там», а не
		// стежать за кількістю. Точне число тут довелося б правити щоразу, коли
		// хтось додає правило, і воно перестало б щось означати.
		expect(componentRules.length, 'жодного правила в компонентах').toBeGreaterThan(50);
		expect(globalRules.length, 'жодного правила скіна чи теми').toBeGreaterThan(10);
	});

	it('знає, що Svelte додає клас скоупу до першого компаунда', () => {
		// Canary на саму модель: якщо ця арифметика колись перестане збігатися з
		// тим, що видає компілятор, решта файлу мовчки стане неправильною.
		const authored = specificity('.animal-card:hover');
		expect(show([authored[0], authored[1] + SCOPING_CLASS, authored[2]])).toBe('(0,3,0)');
		expect(show(specificity("[data-style='playful'] .animal-card:hover"))).toBe('(0,3,0)');
	});

	it('жодне глобальне правило не програє компонентному, яке перекриває', () => {
		const problems: string[] = [];

		for (const global of globalRules) {
			for (const local of componentRules) {
				if (global.cls !== local.cls || global.state !== local.state) continue;

				const shared = [...global.props].filter((p) => local.props.has(p));
				if (shared.length === 0) continue;

				// Ties only, and the narrowing is deliberate.
				//
				// A tie is never intended: nobody writes two rules meaning "whichever
				// the bundler emits last". A LOSS often is — `[data-style='playful']
				// .section__title` (0,2,0) is outranked by `.about .section__title`
				// (0,3,0) because that page deliberately sizes the heading inside its
				// own section, and the skin is not supposed to override that.
				//
				// Flagging losses too would have reported both, and the second is
				// working CSS. Ties are the defect; losses are a design decision this
				// check has no way to read.
				if (compare(global.spec, local.spec) !== 0) continue;

				problems.push(
					`${global.selector}  ${show(global.spec)}  (${global.file})\n` +
						`   не перекриває  ${local.selector}  ${show(local.spec)}  ` +
						`(${local.file}, з класом скоупу)\n` +
						`   спільні властивості: ${shared.join(', ')}\n` +
						`   → додай :root перед [data-…], це дасть на клас більше`
				);
			}
		}

		expect(
			problems,
			`нічия або програш за специфічністю — переможця обирає порядок у бандлі, ` +
				`а він різний у dev і у збірці:\n\n${problems.join('\n\n')}`
		).toEqual([]);
	});
});
