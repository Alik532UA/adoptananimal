// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_BETA_CHECKS, BETA_TABS, BETA_UNCOVERED_ROUTES } from './tabs';

/**
 * The checklist is data, and this is what makes that worth anything
 * (BETA-CHECKLIST-v8 § 5).
 *
 * The expensive failure of a checklist is not a wrong item — it is **falling behind**:
 * the code changed, the item stayed, and a person ticks «checked» on something that is
 * no longer there. A rule written in prose catches that whenever somebody re-reads the
 * prose. An invariant catches it on every run.
 *
 * Two rules of § 2.4 and § 3 are absent from this file on purpose: `test` being
 * required for `covered` and forbidden for the rest is held by the type
 * (`CoverageClaim`), and so is the presence of both languages. An invariant that
 * cannot fail is noise, and the canon says as much about writing «every controller has
 * a reset» for controllers that need none.
 *
 * Zero violations today. That is the point: the list is new, and these hold it to the
 * shape it was written in rather than proving it once.
 *
 * Reverse experiment (AI-AGENT-PITFALLS-v8 § 1.1) — in the commit message that added
 * this file, one mutation per check.
 */

const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(full.replace(/\\/g, '/'));
	}
	return out;
};

/**
 * Every route of the site, derived from disk rather than from a second hand-kept list.
 *
 * `src/routes/[[lang=lang]]/adopt/cat/[slug]/+page.svelte` → `/adopt/cat/[slug]`. The
 * language segment comes off because a tab answers for a page, not for a translation.
 */
const routesOnDisk = (): string[] =>
	walk('src/routes')
		.filter((f) => f.endsWith('/+page.svelte'))
		.map((f) =>
			f
				.replace(/^src\/routes/, '')
				.replace(/\/\+page\.svelte$/, '')
				.replace('/[[lang=lang]]', '')
		)
		.map((path) => path || '/');

// --- locators, resolved the way the browser assembles them (§ 5.3) ------------

/**
 * A locator in this project is often written across two files:
 * `<DropdownMenu testId="theme" />` in one, `data-testid="{testId}-toggle-btn"` in the
 * other — and the string `theme-toggle-btn` exists in neither. Collecting raw
 * `data-testid` literals and calling that the set of locators would reject correct
 * names and, worse, accept invented ones: a bare `*` pattern matches anything.
 */
const svelteFiles = walk('src').filter((f) => f.endsWith('.svelte'));

const markupOnly = (source: string) =>
	source.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');

/** Values handed to a `testId`/`scope` prop anywhere in the markup. */
const propValues = (name: string): string[] => [
	...new Set(
		svelteFiles.flatMap((f) =>
			[
				...markupOnly(readFileSync(f, 'utf8')).matchAll(new RegExp(`\\b${name}="([^"{]+)"`, 'g'))
			].map((m) => m[1])
		)
	)
];

/** A `{…}` or `${…}` interpolation inside a data-testid value. */
const HOLE = /\$?\{[^}]*\}/g;

/** What a hole is allowed to be: a real discriminator, or the `*` a check writes. */
const HOLE_SOURCE = '([\\w-]+|\\*)';

/** Raw patterns as written, holes and all. */
const rawPatterns = (): string[] => {
	const found: string[] = [];
	for (const file of svelteFiles) {
		const source = markupOnly(readFileSync(file, 'utf8'));
		for (const m of source.matchAll(/data-testid="([^"]*)"/g)) found.push(m[1]);
		for (const m of source.matchAll(/data-testid=\{`([^`]*)`\}/g)) found.push(m[1]);
		for (const m of source.matchAll(/data-testid=\{([^}]*'[^}]*)\}/g)) {
			for (const lit of m[1].matchAll(/'([^']+)'/g)) found.push(lit[1]);
		}
	}
	return [...new Set(found)];
};

/**
 * Patterns turned into matchers. A leading `{prop}` is expanded with the values that
 * prop actually receives; an interior hole becomes `*`. Without the expansion step
 * `{testId}-toggle-btn` would become `*-toggle-btn` and accept `banana-toggle-btn`.
 */
const locatorMatchers = (): RegExp[] => {
	const prefixes = new Map([
		['testId', propValues('testId')],
		['scope', propValues('scope')]
	]);

	const expanded: string[] = [];
	for (const pattern of rawPatterns()) {
		const lead = pattern.match(/^\$?\{(\w+)\}/);
		const values = lead ? prefixes.get(lead[1]) : undefined;

		if (lead && values?.length) {
			for (const value of values) expanded.push(value + pattern.slice(lead[0].length));
		} else {
			expanded.push(pattern);
		}
	}

	// A hole accepts either a real discriminator or the `*` a check writes in its place
	// (§ 5.3: `reserve-animal-*-btn`). Only where the source HAS a hole: a `*` standing
	// in for a literal segment would let an invented name through.
	//
	// Built from chunks rather than by escaping the pattern: a testid is kebab-case, so
	// the chunks carry no metacharacters, and the holes are the only thing that varies.
	return expanded.map((pattern) => new RegExp(`^${pattern.split(HOLE).join(HOLE_SOURCE)}$`));
};

describe('чеклист бета-тестування', () => {
	const matchers = locatorMatchers();

	it('перевірка жива: пункти й локатори знайдено', () => {
		expect(ALL_BETA_CHECKS.length, 'пунктів немає — перевіряти нічого').toBeGreaterThan(20);
		expect(matchers.length, 'локаторів не знайдено — резолвер шукає не там').toBeGreaterThan(40);
	});

	it('кожен маршрут заявлений рівно однією вкладкою (§ 5.1)', () => {
		const claimed = new Map<string, string[]>();
		for (const tab of BETA_TABS) {
			for (const route of tab.routes) claimed.set(route, [...(claimed.get(route) ?? []), tab.id]);
		}

		const routes = routesOnDisk();
		const unclaimed = routes.filter(
			(route) => !claimed.has(route) && !BETA_UNCOVERED_ROUTES.includes(route)
		);
		expect(unclaimed, `сторінка є, а перевіряти її нічим: ${unclaimed.join(', ')}`).toEqual([]);

		const twice = [...claimed].filter(([, tabs]) => tabs.length > 1);
		expect(twice.map(([route, tabs]) => `${route}: ${tabs.join(', ')}`)).toEqual([]);

		const ghosts = [...claimed.keys()].filter((route) => !routes.includes(route));
		expect(ghosts, `вкладка заявляє маршрут, якого немає: ${ghosts.join(', ')}`).toEqual([]);
	});

	it('covered називає файл тесту, і файл існує (§ 5.2)', () => {
		const missing = ALL_BETA_CHECKS.filter(
			(check) => check.coverage === 'covered' && !existsSync(check.test)
		).map((check) => `${check.id} → ${'test' in check ? check.test : ''}`);
		expect(
			missing,
			`твердження про покриття гниє швидше за сам пункт:\n${missing.join('\n')}`
		).toEqual([]);
	});

	it('пункт, що просить натиснути, називає локатор (§ 5.3)', () => {
		const naked = ALL_BETA_CHECKS.filter(
			(check) => /натисн/i.test(check.text.uk) && !check.testid
		).map((check) => check.id);
		expect(naked, `неперевірний за побудовою: ${naked.join(', ')}`).toEqual([]);
	});

	it('кожен названий локатор існує в розмітці (§ 5.3)', () => {
		const unknown = ALL_BETA_CHECKS.filter((check) => check.testid)
			.filter((check) => !matchers.some((re) => re.test(check.testid as string)))
			.map((check) => `${check.id} → ${check.testid}`);
		expect(unknown, `локатора немає в джерелах:\n${unknown.join('\n')}`).toEqual([]);
	});

	it('id унікальні й мають форму {вкладка}_{номер} (§ 5.4)', () => {
		const ids = ALL_BETA_CHECKS.map((check) => check.id);
		expect(ids.length, 'дублікат id стирає людині прогрес').toBe(new Set(ids).size);

		const wrong: string[] = [];
		for (const tab of BETA_TABS) {
			for (const check of tab.checks) {
				if (!new RegExp(`^${tab.id}_\\d+$`).test(check.id)) wrong.push(`${check.id} у ${tab.id}`);
			}
		}
		expect(wrong).toEqual([]);
	});

	it('тексти й категорії непорожні, англійський без кирилиці (§ 5.4)', () => {
		const problems: string[] = [];
		for (const check of ALL_BETA_CHECKS) {
			for (const [field, value] of [
				['text', check.text],
				['category', check.category]
			] as const) {
				if (!value.uk.trim()) problems.push(`${check.id}: ${field}.uk порожній`);
				if (!value.en.trim()) problems.push(`${check.id}: ${field}.en порожній`);
				// Забутий переклад: тип бачить рядок, а не мову, якою він написаний.
				if (/[Ѐ-ӿ]/.test(value.en)) problems.push(`${check.id}: ${field}.en кирилицею`);
				if (!/[Ѐ-ӿ]/.test(value.uk)) problems.push(`${check.id}: ${field}.uk не українською`);
			}
		}
		expect(problems, problems.join('\n')).toEqual([]);
	});

	it('в українському тексті один вид апострофа (§ 5.4)', () => {
		// Два різні апострофи ламають пошук по чеклисту, а шукати в ньому доводиться
		// щоразу, коли зі звіту треба знайти пункт за словом. Проєкт поза цією текою
		// вживає всі три; тут — рівно U+2019.
		const wrong = ALL_BETA_CHECKS.filter((check) => /[Ѐ-ӿ]['ʼ‘][Ѐ-ӿ]/.test(check.text.uk)).map(
			(check) => check.id
		);
		expect(wrong, `не U+2019: ${wrong.join(', ')}`).toEqual([]);
	});

	it('текст не починається з номера і не називає внутрішнього (§ 2.1, § 2.2)', () => {
		const numbered = ALL_BETA_CHECKS.filter((check) => /^\s*\d+[.)]/.test(check.text.uk));
		expect(
			numbered.map((c) => c.id),
			'номер малює сторінка з позиції'
		).toEqual([]);

		// Людина, яка згодилася потикати сайт, не знає, що таке локатор чи руна.
		const internals = /data-testid|\$state|\$derived|\.svelte|\.ts\b|localStorage|синглтон/i;
		const leaked = ALL_BETA_CHECKS.filter(
			(check) => internals.test(check.text.uk) || internals.test(check.text.en)
		).map((check) => check.id);
		expect(leaked, `внутрішні назви в тексті: ${leaked.join(', ')}`).toEqual([]);
	});

	it('у кожної вкладки є пункт для людини і пункт-межа (§ 5.4, § 2.3)', () => {
		const noManual = BETA_TABS.filter(
			(tab) => !tab.checks.some((check) => check.coverage === 'manual')
		).map((tab) => tab.id);
		expect(noManual, `вкладка, де все покрито машиною, марнує час людини: ${noManual}`).toEqual([]);

		const noBoundary = BETA_TABS.filter((tab) => !tab.checks.some((check) => check.negative)).map(
			(tab) => tab.id
		);
		expect(noBoundary, `вкладка без «не мусить»: ${noBoundary}`).toEqual([]);
	});
});
