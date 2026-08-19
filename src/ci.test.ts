// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * CI-CD-AND-TOOLS-v8 § 3 — workflow теж код, і його стан перевіряється.
 *
 * Клас дефекту тут окремий від «тест не запускається» (AI-AGENT-PITFALLS § 1.2)
 * і гірший: крок є у deploy.yml, виглядає як гейт — і не робить того, що
 * обіцяє. `npm install` замість `npm ci` дає задеплоєний артефакт, який
 * відрізняється від протестованого; крок Playwright без `playwright install`
 * падає на відсутньому браузері; тестовий скрипт у watch-режимі підвисає до
 * таймауту job'а. Жодне з цього не видно в переліку кроків — там усе зелене або
 * «довго йде».
 *
 * Перевірка читає сам workflow, а не описує його. Зворотний експеримент
 * (§ 1.1) на кожному пункті — у повідомленні коміту, що приніс цей файл.
 */

const ROOT = process.cwd();
const DIR = join(ROOT, '.github/workflows');

const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f)) : [];
const workflows = files.map((f) => ({ name: f, text: readFileSync(join(DIR, f), 'utf8') }));

/**
 * The workflows with their comment lines removed — every check below reads this rather
 * than the raw text.
 *
 * A comment is documentation, not a step, and letting one answer a grep breaks the
 * checks in both directions. It has happened here already: a comment explaining why the
 * Lighthouse call carries a version made the very check for that version fail, because
 * the sentence quoted the unpinned form. The mirror case is worse and quieter — a note
 * saying "never use npm install" would satisfy a search for `npm install` and report a
 * defect that is not there, or a note naming a step would report a step that is gone.
 */
const all = workflows
	.map((w) =>
		w.text
			.split('\n')
			.filter((line) => !/^\s*#/.test(line))
			.join('\n')
	)
	.join('\n');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
	scripts?: Record<string, string>;
};

describe('CI', () => {
	it('перевірка жива: workflow узагалі знайдено', () => {
		expect(files.length, 'немає жодного workflow — сканер шукає не там').toBeGreaterThan(0);
	});

	it('юніт-тести запускаються в CI (§ 1.6)', () => {
		// Пайплайн install → build → deploy означає, що тести не виконуються
		// ніколи, скільки б їх не було написано.
		//
		// Кінець рядка в шаблоні обов'язковий, і це не причепка до стилю.
		// Перша редакція шукала `npm run test` — і зворотний експеримент (§ 1.1)
		// показав, що з видаленим кроком юніт-тестів вона лишається зеленою:
		// умову задовольняв `npm run test:e2e`, який стоїть нижче. Тобто
		// перевірка звітувала про покриття, якого вже не було.
		const unit = /run:\s*(npm test|npm run test:unit)\s*$/m.test(all);
		expect(unit, 'у workflow немає кроку з юніт-тестами').toBe(true);
	});

	it('e2e запускаються в CI', () => {
		// Записано окремо від юніт-кроку: мовчазна відсутність e2e читається як
		// покриття, а axe і рантайм-дублікати testid живуть лише тут.
		expect(/run:\s*npm run test:e2e|playwright test/.test(all), 'немає кроку e2e').toBe(true);
	});

	it('використовується npm ci, а не npm install', () => {
		expect(/run:\s*npm install\b/.test(all), 'npm install робить білд невідтворюваним').toBe(false);
		expect(/run:\s*npm ci\b/.test(all), 'немає кроку npm ci').toBe(true);
	});

	it('Playwright має крок встановлення браузерів (§ 1.3)', () => {
		if (!/playwright test|test:e2e/.test(all)) return;
		expect(
			/playwright install/.test(all),
			"без install крок падає з «Executable doesn't exist»"
		).toBe(true);
	});

	it('збірка не бруднить робоче дерево (§ 1.5)', () => {
		// Єдина машинна перевірка правила «артефакт збірки не комітиться»
		// (VERSIONING-v8 § 1.4). Без цього кроку згенерований файл із часом
		// збірки роками їздить у комітах як шум.
		expect(/git diff --exit-code/.test(all), 'після npm run build немає git diff --exit-code').toBe(
			true
		);
	});

	it('деплой іде через OIDC, а не стороннім екшеном із доступом на запис (§ 1.1)', () => {
		// contents: write у стороннього екшена — вектор supply-chain атаки.
		// Виняток один (dual deploy за патерном peaceiris), і цей проєкт має
		// одне середовище: PROJECT-CONTEXT.md § 3.
		expect(/actions\/deploy-pages@/.test(all), 'немає OIDC-деплою').toBe(true);
		expect(/contents:\s*write/.test(all), 'workflow просить доступ на запис').toBe(false);
	});

	it('жоден тестовий скрипт не у watch-режимі (§ 1.4)', () => {
		// Не лише `test`: гейтом у workflow буває test:unit, test:e2e, test:ci —
		// і саме там watch і зустрічається, бо `test` перевіряють, а решту ні.
		// `test:watch` виключений навмисно: він для цього й існує.
		const watchers = Object.entries(pkg.scripts ?? {})
			.filter(([name]) => /^test(:|$)/.test(name) && name !== 'test:watch')
			.filter(([, cmd]) => /^(vitest|playwright)\s*$/.test(cmd.trim()))
			.map(([name, cmd]) => `${name}: ${cmd}`);

		expect(watchers, `watch-режим підвисне поза CI, де немає CI=true`).toEqual([]);
	});

	it('кожен інструмент, який кличе npx, або локальний, або з версією (§ 1.2)', () => {
		// `npm ci` тримає версії всього, що в lockfile. `npx <tool>` без версії обходить
		// його: якщо бінарника немає локально, npx тягне ПОТОЧНИЙ реліз із реєстру —
		// тобто `latest` у полі версії, який DEPENDENCIES-v8 § 2.3 забороняє, тільки
		// невидимий, бо він не в package.json.
		//
		// Знайдено саме так: `npx @lhci/cli autorun` стояв тут без версії, а пороги
		// Lighthouse — це пороги БАЛІВ. Реліз, який рахує інакше, валить деплой без
		// жодної зміни в репозиторії, і причина цього не видна ніде.
		const calls = [...all.matchAll(/npx\s+((?:@[\w.-]+\/)?[\w.-]+)(@[\w.^~-]+)?/g)];
		expect(calls.length, 'жодного npx у workflow — сканер шукає не там').toBeGreaterThan(0);

		const floating = calls
			.filter(([, tool, version]) => {
				if (version) return false;
				// Локальний бінарник приходить із lockfile — саме те, чого ми й хочемо.
				return !existsSync(join(ROOT, 'node_modules/.bin', tool));
			})
			.map(([, tool]) => tool);

		expect(
			floating,
			`версія вирішується під час прогону: ${floating.join(', ')} — або в devDependencies, або з @версією`
		).toEqual([]);
	});

	it('ignore-файл для AI не ховає ні конфігів, ні документації (§ 2.2)', () => {
		// Обидві половини правила — з наслідками, які вже ставалися в проєктах пакета.
		//
		// Конфіг: асистент дізнається профіль саме з цих файлів — який адаптер, що
		// дозволено в CSP, які гейти взагалі є. Сховавши їх, отримуєш пораду «додати
		// eslint» до проєкту, де він стоїть, і правку залежності без правки CSP.
		//
		// Документація: `.private/docs/` — це канон рішень цього репозиторію, і канон
		// прямо каже, що виключається `secrets/`, а не тека цілком.
		const ignore = readFileSync(join(ROOT, '.geminiignore'), 'utf8');
		const lines = ignore
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#'));
		expect(lines.length, '.geminiignore порожній — перевірка мертва').toBeGreaterThan(0);

		const CONFIGS = [
			'package.json',
			'svelte.config.js',
			'vite.config.ts',
			'tsconfig.json',
			'eslint.config.js'
		];
		const hidden = CONFIGS.filter((file) => lines.includes(file));
		expect(hidden, `конфіги, без яких асистент не бачить проєкту: ${hidden.join(', ')}`).toEqual(
			[]
		);

		// Синтаксис gitignore не вміє повернути файл, чия ТЕКА виключена, тож
		// `.private/` + `!.private/docs/` виглядає правильно й не працює.
		expect(lines, 'уся .private/ виключена — разом із docs/').not.toContain('.private/');
		if (lines.some((line) => line.startsWith('.private'))) {
			expect(lines, 'docs/ не повернуто назад').toContain('!.private/docs/');
		}
	});

	it('кожен npm-скрипт із workflow справді існує', () => {
		// Крок, що кличе неіснуючий скрипт, падає лише на прогоні — тобто вже в
		// main, і зазвичай разом із деплоєм.
		const called = [...all.matchAll(/run:\s*npm run ([a-z0-9:_-]+)/g)].map((m) => m[1]);
		expect(called.length, 'жодного npm run у workflow — сканер шукає не там').toBeGreaterThan(0);

		const missing = [...new Set(called)].filter((name) => !(pkg.scripts ?? {})[name]);
		expect(
			missing,
			`workflow кличе скрипти, яких немає в package.json: ${missing.join(', ')}`
		).toEqual([]);
	});
});
