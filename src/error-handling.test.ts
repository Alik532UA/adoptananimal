// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * ERROR-HANDLING-v8 § 7 — інваріанти по джерелах.
 *
 * Файл `src/lib/errors/` у проєкті свідомо видалено (PROJECT-CONTEXT § 4.4), і
 * разом із ним пропав єдиний привід написати ці перевірки. Але два правила § 7 не
 * про доменні класи, а про будь-який код: `throw` рядком і мовчазний `catch`.
 * Обидва зараз виконані — нуль порушень на 190 файлах, — і рівно тому їх варто
 * зафіксувати: правило, яке виконується сьогодні й не перевіряється нічим, це
 * стан, а не гарантія (v8, головна теза).
 *
 * Ціна кожного з двох невелика поодинці й точно та сама щоразу:
 *
 * - `throw 'рядок'` не має ні `stack`, ні `name`, тож у звіті лишається сам текст
 *   без місця, де він стався. Логер тут не допоможе — ловити нема чого.
 * - Порожній `catch {}` перетворює збій на тишу. Саме через це у фасаді сховища
 *   колись зникали обрані без жодного сліду — і саме тому кожен `catch` у ньому
 *   тепер має або дію, або записану причину нічого не робити.
 *
 * Коментар усередині `catch` рахується за причину — перевірка читає джерела без
 * вирізання коментарів, і це навмисно. Блок із поясненням, чому робити нічого не
 * треба, — рішення, записане в коді; порожні дужки — його відсутність. Саме так
 * і написані всі шість `catch` у фасаді сховища.
 *
 * Решта перевірок файлу — про наявність трьох сіток: сторінки помилки, глобальних
 * слухачів і клієнтського `handleError` (§ 2.2, § 2.4, § 5). Кожна з них зникає
 * тихо: видалили файл — і збірка та лінт лишаються зеленими.
 *
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1) проведено на кожній
 * перевірці окремо — перелік у повідомленні коміту, що її додав.
 */

const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(full.replace(/\\/g, '/'));
	}
	return out;
};

/** Джерела без самих перевірок: у них обидва анти-патерни цитуються навмисно. */
const sources = walk('src').filter(
	(f) => /\.(ts|svelte)$/.test(f) && !/\.(test|spec)\.ts$/.test(f)
);

const read = (file: string) => readFileSync(file, 'utf8');

/**
 * The same source with comments removed.
 *
 * Used by the `throw '…'` check only, and the asymmetry is deliberate. That check
 * looks for a CODE construct, so prose is noise — and it produced a false positive
 * the moment a docblock explained which error a rune would "throw `effect_orphan`":
 * the backtick right after the word is all the pattern needs. A gate that fails on
 * an accurate comment teaches people to stop writing comments.
 *
 * The empty-`catch` check below deliberately does NOT use this. There a comment is
 * not noise but the required content: `catch { }` with an explanation inside is a
 * documented decision, `catch {}` with nothing is the silence the rule forbids.
 */
const readCode = (file: string) =>
	read(file)
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/\/\/.*$/gm, '');

describe('обробка помилок — джерела', () => {
	it('перевірка жива: джерела знайдено', () => {
		expect(sources.length, 'сканер шукає не там').toBeGreaterThan(50);
	});

	it('немає throw рядком (§ 7)', () => {
		const bad = sources.filter((f) => /throw\s+['"`]/.test(readCode(f)));
		expect(
			bad,
			`рядок замість Error — у звіті не буде ні стека, ні місця:\n${bad.join('\n')}`
		).toEqual([]);
	});

	it('немає мовчазного catch (§ 7)', () => {
		const bad = sources.filter((f) => /catch\s*(\([^)]*\))?\s*\{\s*\}/.test(read(f)));
		expect(bad, `порожній catch — збій перетворюється на тишу:\n${bad.join('\n')}`).toEqual([]);
	});
});

describe('обробка помилок — сітки', () => {
	it('сторінка помилки є в корені маршрутів (§ 2.2)', () => {
		expect(existsSync('src/routes/+error.svelte')).toBe(true);
	});

	it('глобальні слухачі встановлені (§ 5)', () => {
		const layout = read('src/routes/+layout.svelte');
		expect(layout).toContain("addEventListener('unhandledrejection'");
		expect(layout).toContain("addEventListener('error'");
		expect(layout, 'слухач без зняття переживає навігацію й дублюється').toContain(
			"removeEventListener('unhandledrejection'"
		);
	});

	it('клієнтський handleError є і пише в логер, а не в console (§ 2.4)', () => {
		expect(existsSync('src/hooks.client.ts'), 'помилка клієнтського load не дійде нікуди').toBe(
			true
		);

		const hooks = read('src/hooks.client.ts');
		expect(hooks).toMatch(/export const handleError/);
		expect(hooks, 'логер — єдині двері, console заборонена ESLint-правилом').toContain(
			'logService.error('
		);
	});
});
