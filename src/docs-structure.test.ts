// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Структура документації (DOCUMENTATION-v8 § 9).
 *
 * Дві половини з різною вагою, і про це чесніше сказати прямо.
 *
 * Перша — корінь репозиторію. Він **відстежується**, тож ця перевірка діє і в CI:
 * вона тримає межу, через яку документація розповзається найчастіше — черговий
 * `PLAN.md`, `TODO.md`, `AUDIT-final.md` поруч із `README.md`. Дозволений список
 * канону плюс `PROJECT-CONTEXT.md`, який є частиною самого пакета v8 (його шаблон
 * лежить у `PROJECT-CONTEXT-TEMPLATE.md`), і `GEMINI.md` як другий файл контексту
 * для AI поряд з `AGENTS.md`.
 *
 * Друга — `.private/docs/`. Ця тека в `.gitignore`, тобто в CI її просто немає, і
 * перевірка там нічого не доведе. Але писати документацію все одно доводиться на
 * машині розробника, і саме там `npm test` червоніє до того, як файл із кирилицею
 * в назві чи звіт без дати осяде в теці назовсім. Канон приписує пропускати
 * перевірку, коли теки немає: проєкт без внутрішньої документації не порушує
 * нічого, і вигадувати йому порушення не варто.
 *
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1) — у повідомленні коміту, що
 * додав цей файл.
 */

/** Канон плюс два файли, які цей проєкт має за самим каноном. */
const ROOT_ALLOWED = new Set([
	'README.md',
	'LICENSE',
	'CHANGELOG.md',
	'AGENTS.md',
	'CLAUDE.md',
	'GEMINI.md',
	'PROJECT-CONTEXT.md'
]);

const DOCS = '.private/docs';

const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(full.replace(/\\/g, '/'));
	}
	return out;
};

describe('структура документації', () => {
	it('перевірка жива: корінь читається', () => {
		expect(readdirSync('.').filter((f) => f.endsWith('.md')).length).toBeGreaterThan(0);
	});

	it('у корені немає сторонніх .md', () => {
		const stray = readdirSync('.').filter((f) => f.endsWith('.md') && !ROOT_ALLOWED.has(f));
		expect(stray, `перенести у ${DOCS}: ${stray.join(', ')}`).toEqual([]);
	});

	it('немає кирилиці й пробілів у назвах', () => {
		if (!existsSync(DOCS)) return;
		// Ім'я файлу потрапляє в посилання й у команду; кирилиця та пробіл роблять
		// обидва крихкими, а на чужій машині — ще й нечитними.
		const bad = walk(DOCS).filter((f) => /[^\x20-\x7E]/.test(f) || / /.test(f));
		expect(bad, `ASCII-only kebab-case: ${bad.join(', ')}`).toEqual([]);
	});

	it('немає заборонених суфіксів актуальності', () => {
		if (!existsSync(DOCS)) return;
		// `-final`, `-v2`, `-new` означають, що канонічних файлів стало два, і
		// вгадувати, який чинний, доводиться за назвою.
		const bad = walk(DOCS).filter((f) => /-(new|old|final|v\d|copy|backup)\.md$/i.test(f));
		expect(bad, `один канонічний файл; решта — в archive/: ${bad.join(', ')}`).toEqual([]);
	});

	it('кожна тека глибше рівня 1 має README', () => {
		if (!existsSync(DOCS)) return;
		const missing = readdirSync(DOCS)
			.map((entry) => join(DOCS, entry))
			.filter((path) => statSync(path).isDirectory() && !existsSync(join(path, 'README.md')));
		expect(missing, `без README-індексу: ${missing.join(', ')}`).toEqual([]);
	});

	it('звіти-аналізи мають дату на початку назви', () => {
		const dir = join(DOCS, 'analysis');
		if (!existsSync(dir)) return;
		// Саме на початку: тільки так вони сортуються за часом у будь-якому списку.
		const bad = readdirSync(dir)
			.filter((f) => f.endsWith('.md') && f !== 'README.md')
			.filter((f) => !/^\d{4}-\d{2}-\d{2}-/.test(f));
		expect(bad, `формат YYYY-MM-DD-*: ${bad.join(', ')}`).toEqual([]);
	});
});
