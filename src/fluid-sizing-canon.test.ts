// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Підлога ширини колонки — по джерелах (FLUID-SIZING-v8 § 1, § 1.1).
 *
 * Два записи, обидва названі в каноні анти-патерном рівня CRITICAL, і обидва
 * читаються як правильні:
 *
 * - `repeat(N, 1fr)`. `1fr` — це `minmax(auto, 1fr)`: колонка може рости, але не
 *   може стати вужчою за `min-content` свого вмісту. Не «росте як хоче», а має
 *   підлогу.
 * - `minmax(320px, 1fr)`. Тут «мінімум» буквальний: коли контейнер вужчий за
 *   320px, колонка однаково лишається 320px і розпирає сторінку. `auto-fit` не
 *   рятує — він прибирає порожні колонки, а не звужує наявну.
 *
 * Ціна — не колонка, а весь сайт: один такий рядок задає мінімальну ширину
 * сторінки, і на телефоні вона їде вбік. Побачити це можна лише на вузькому
 * екрані, тобто в користувача, а не у збірці.
 *
 * Чому по джерелах, коли `tests/fluid-sizing.spec.ts` уже міряє браузером. E2E
 * ловить **наслідок** і лише там, де підлога вже вища за екран: сітка, у якої
 * сьогодні немає нічого нерозривного, пройде обидві перевірки, а завтра німецька
 * назва породи зробить ту підлогу справжньою. Сканер прибирає причину до того, як
 * з'явиться наслідок.
 *
 * Коментарі **замінюються пробілами**, а не вирізаються (канон § 9). Пояснення
 * анти-патерну живуть просто над правилами, які його уникають, — біля `.grid--4`
 * в `app.css` і біля сітки прапорів. Сьогодні жодне з них не цитує заборонену
 * форму дослівно, тож гасіння ще не спрацювало по-справжньому; перевірено, що
 * воно робить свою роботу: коментар із `repeat(2, 1fr)` усередині лишає прогін
 * зеленим, а без гасіння той самий коментар його валить. Заміна саме на пробіли, а
 * не вирізання: інакше номери рядків поїдуть і звіт указуватиме не туди.
 *
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1) — у повідомленні коміту,
 * що додав цей файл.
 */

const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (/\.(css|svelte)$/.test(entry)) out.push(full.replace(/\\/g, '/'));
	}
	return out;
};

/** Коментар на ті самі пробіли: зміст зникає, розкладка рядків лишається. */
const blankComments = (source: string) =>
	source
		.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
		.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));

const hits = (pattern: RegExp) => {
	const found: string[] = [];
	for (const file of walk('src')) {
		const lines = blankComments(readFileSync(file, 'utf8')).split('\n');
		lines.forEach((line, index) => {
			if (pattern.test(line)) found.push(`${file}:${index + 1}: ${line.trim()}`);
		});
	}
	return found;
};

describe('масштабування колонок', () => {
	it('перевірка жива: сітки в джерелах знайдено', () => {
		expect(hits(/grid-template-columns/).length, 'сканер шукає не там').toBeGreaterThan(3);
	});

	it('жодна колонка не має підлоги від голого 1fr (§ 1)', () => {
		const bad = hits(/repeat\(\s*\d+\s*,\s*1fr\s*\)/);
		expect(bad, `1fr — це minmax(auto, 1fr); треба minmax(0, 1fr):\n${bad.join('\n')}`).toEqual([]);
	});

	it('мінімум у minmax() ніколи не гола довжина (§ 1.1)', () => {
		const bad = hits(/minmax\(\s*[\d.]+(px|rem|em)/);
		expect(bad, `поріг переносу став підлогою; треба min(Npx, 100%):\n${bad.join('\n')}`).toEqual(
			[]
		);
	});
});
