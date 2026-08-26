// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

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

/**
 * ВМІСТ WORKFLOW ЧИТАЄТЬСЯ ЛИШЕ ЧЕРЕЗ ЦЕ, і `\r\n` тут нормалізується.
 *
 * Причина не в стилі, а в тому, як JavaScript читає рядки. `.` не збігається з
 * `\r` — це термінатор рядка, — а `$` без прапорця `m` стоїть перед `\n`, але не
 * перед `\r`. Тому регулярка виду `/^(\s+)- name: (.*)$/` на рядку
 * «      - name: Install dependencies\r» не збігається ЖОДНОГО разу: не «інший
 * результат», а нуль знайденого.
 *
 * Наслідок цього такий: у CI чекаут із `\n`, і розбір бачить усі кроки; на
 * Windows-чекауті `core.autocrlf` дає `\r\n`, і той самий розбір бачить НУЛЬ
 * кроків. Тобто тест червоніє локально на тому, що в CI зелене, — а це гірше за
 * відсутню перевірку: вона привчає не дивитися на червоне. У сусідніх проєктах
 * пакета (`teatralo4ka.odesa.ua`, `MindStep`) це вже сталося, двічі.
 *
 * Тут це ПРОФІЛАКТИКА, і сказати про це треба прямо: workflow у робочому дереві
 * лежать із `\n`, а жодна з регулярок нижче поки не має тієї форми, що ламається
 * (`\s*$` переживає `\r`, бо `\s` його з'їдає). Тобто зараз не болить нічого.
 *
 * Друга половина цього «зараз» більше не тримається ні на чому, і це варто
 * виправити тут, бо неправдивий коментар дорожчий за відсутній: форму закінчень
 * фіксує `.gitattributes` із `* text=auto eol=lf` (коміт af5db52), тож `\r\n` у
 * робочому дереві не з'являється навіть при `core.autocrlf=true`. Отже ця
 * нормалізація тепер друга лінія, а не єдина.
 *
 * Лишається вона саме тому, що друга лінія тут дешева, а перша — теж один рядок,
 * який можна прибрати. Форма наступної регулярки — питання наступної правки.
 *
 * Профілактика саме на МЕЖІ читання, а не всередині якоїсь перевірки, — щоб
 * наступна регулярка без `m`, яку тут допишуть, не наступила на те саме. Той, хто
 * її допише, не має жодної причини думати про закінчення рядків; після цієї
 * нормалізації йому й не треба.
 */
const readWorkflow = (file: string): string =>
	readFileSync(join(DIR, file), 'utf8').replace(/\r\n/g, '\n');

const workflows = files.map((f) => ({ name: f, text: readWorkflow(f) }));

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

type Step = {
	/** `run:`/`uses:` рядки кроку — те, за чим його впізнають. */
	command: string;
	/** Умова кроку без обгортки `${{ }}`, або порожній рядок, якщо її немає. */
	condition: string;
};

/**
 * Кроки job'а рядками, без YAML-парсера.
 *
 * Залежності на `yaml` тут немає, і заводити її під один інваріант — це 1 пакет у
 * `devDependencies` проти 20 рядків розбору (DEPENDENCIES-v8 § 1.1). Розбір
 * тримається на одному факті: крок — це елемент списку на тому ж відступі, що й
 * перший елемент після `steps:`. Усе між двома такими рядками належить першому.
 *
 * Коментарі зрізаються до розбору — рівно з тієї причини, що описана вище над
 * `all`: речення в коментарі не є кроком і не має відповідати на греп.
 */
function parseSteps(text: string): Step[] {
	const lines = text.split('\n').filter((line) => !/^\s*#/.test(line));
	const stepsAt = lines.findIndex((line) => /^\s*steps:\s*$/.test(line));
	if (stepsAt === -1) return [];

	const indent = lines
		.slice(stepsAt + 1)
		.find((line) => /^\s*- /.test(line))
		?.match(/^\s*/)?.[0];
	if (indent === undefined) return [];

	const opensStep = (line: string) => line.startsWith(`${indent}- `);
	const steps: Step[] = [];

	for (let i = stepsAt + 1; i < lines.length; i++) {
		if (!opensStep(lines[i])) continue;
		let end = i + 1;
		while (end < lines.length && !opensStep(lines[end])) end++;
		const block = lines.slice(i, end);
		steps.push({
			command: block.filter((line) => /(^|\s)(run|uses):/.test(line)).join('\n'),
			condition: block.find((line) => /(^|\s)if:/.test(line))?.replace(/^.*?if:\s*/, '') ?? ''
		});
		i = end - 1;
	}

	return steps;
}

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

	it('бюджети Lighthouse виводять приховані маршрути, а не тримають їхню копію', () => {
		/*
		 * Крок Lighthouse стоїть ВИЩЕ `upload-pages-artifact`, тож його падіння —
		 * це не попередження, а відсутність деплою. Саме так і сталося: сторінка
		 * чеклиста має `noindex` за задумом (§ 4.22), її стеля в категорії SEO —
		 * 0.69 (`is-crawlable`, вага 4.04 з 13.04, решта аудитів проходить), а
		 * конфіг вимагав 0.9 з усіх сторінок, крім `/apply`. Гейт став
		 * невиконуваним, і сайт не публікувався з дня появи тієї сторінки.
		 *
		 * Тому перевіряється не число, а спосіб, яким конфіг дізнається перелік:
		 * четвертий список прихованих маршрутів відстав би так само, як відстав
		 * третій.
		 */
		const config = readFileSync(join(ROOT, 'lighthouserc.cjs'), 'utf8');

		expect(config, 'конфіг не читає HIDDEN_ROUTES із джерела').toContain(
			"readFileSync('src/lib/config.ts'"
		);

		const routes = JSON.parse(
			readFileSync(join(ROOT, 'src/lib/config.ts'), 'utf8')
				.match(/HIDDEN_ROUTES\s*=\s*\[([^\]]*)\]/)?.[1]
				.replace(/'/g, '"')
				.replace(/,\s*$/, '')
				.replace(/^/, '[')
				.replace(/$/, ']') ?? '[]'
		) as string[];
		expect(routes.length, 'HIDDEN_ROUTES не прочитано — перевірка мертва').toBeGreaterThan(0);

		// Дзеркальна половина: жоден із маршрутів не виписаний у конфізі рядком.
		// Копія, яка збігається сьогодні, — це копія, яка розійдеться завтра.
		//
		// Коментарі знімаються перед пошуком — і це не дрібниця. Перша редакція цієї
		// перевірки почервоніла на прозі, яка ПОЯСНЮЄ, звідки взялася стеля 0.69, тобто
		// вимагала б прибрати саме той текст, заради якого конфіг і став `.cjs`. Той
		// самий випадок, що греп `ctrlKey` у `keyboard.test.ts`, лише з іншого боку.
		const code = config.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
		const copied = routes.filter((route) => code.includes(route));
		expect(copied, `перелічені літералом замість виведення: ${copied.join(', ')}`).toEqual([]);

		// І крок справді кличе той файл, який існує.
		expect(all, 'workflow не вказує конфіг Lighthouse явно').toMatch(
			/--config=\.\/lighthouserc\.cjs/
		);
		expect(
			existsSync(join(ROOT, 'lighthouserc.json')),
			'лишився старий lighthouserc.json — discovery може взяти його замість .cjs'
		).toBe(false);
	});

	it('кожна сторінка Lighthouse потрапляє рівно в один набір порогів', () => {
		/*
		 * `lighthouserc.cjs` попереджає про це коментарем із першого дня: lhci
		 * застосовує ВСІ записи `assertMatrix`, чий шаблон збігся, тож вони мусять
		 * бути взаємовиключними. Дві збіжності означають, що діє суворіший порог, і
		 * ніде цього не видно — крок просто червоніє з числом, якого в конфізі для цієї
		 * сторінки не написано.
		 *
		 * Перевірити це стало можливо тільки тепер: доки адреси знаходило
		 * автовиявлення lhci, пари «адреса × шаблон» не існувало до прогону. Явний
		 * `collect.url` (§ 4.29) робить її статичною — і одразу ж перевірною.
		 *
		 * Нуль збіжностей ловиться тим самим твердженням і не менш важливий: сторінка
		 * без жодного набору не має порогів узагалі, тобто міряється й нічого не
		 * гейтить.
		 */
		const config = createRequire(import.meta.url)(join(ROOT, 'lighthouserc.cjs')) as {
			ci: {
				collect: { url?: string[] };
				assert: { assertMatrix: Array<{ matchingUrlPattern: string }> };
			};
		};

		const urls = config.ci.collect.url ?? [];
		const matrix = config.ci.assert.assertMatrix;

		expect(
			urls.length,
			'у конфізі немає переліку адрес — автовиявлення візьме 404.html'
		).toBeGreaterThan(0);
		expect(matrix.length, 'assertMatrix порожній — перевірка мертва').toBeGreaterThan(1);

		// Порт довільний: lhci підставляє свій, а шаблони на нього не дивляться.
		const wrong = urls
			.map((path) => {
				const url = `http://localhost:41234${path}`;
				const hits = matrix.filter((entry) => new RegExp(entry.matchingUrlPattern).test(url));
				return hits.length === 1 ? null : `${path}: ${hits.length} наборів замість одного`;
			})
			.filter(Boolean);

		expect(wrong, `пороги накладаються або відсутні:\n${wrong.join('\n')}`).toEqual([]);
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

	describe('впала перевірка не забирає звіт у решти (§ 1.8)', () => {
		/*
		 * Клас дефекту: гейти є, падіння лишає слід — і про стан проєкту все одно не
		 * відомо нічого. GitHub за замовчуванням не запускає кроки після червоного,
		 * тож `npm audit` на трьох low забирав звіт у типів, перекладів, лінта і 322
		 * юніт-тестів. У переліку кроків це один рядок «audit», який читається як
		 * «одна проблема», а означає «одна проблема плюс чотири невідомості».
		 *
		 * Перелік гейтів заданий командами, а не назвами: кроки тут переважно без
		 * `name:`, і назва, виведена GitHub'ом із команди, не існує в файлі. Перелік
		 * явний — щоб новий гейт треба було внести сюди руками, а не щоб він тихо
		 * випав із перевірки.
		 */
		const GATE =
			/npm audit|npm run check|npm run lint|npm test\b|npm run test:e2e|npm run build|git diff --exit-code|lhci/;

		/** Кроки з побічним ефектом — саме їм `!cancelled()` протипоказаний. */
		const SIDE_EFFECT = /upload-pages-artifact|deploy-pages/;

		it('перевірка жива: гейти в workflow узагалі знайдено', () => {
			const gates = workflows.flatMap((w) =>
				parseSteps(w.text).filter((s) => GATE.test(s.command))
			);
			expect(gates.length, 'жодного гейта — розбір кроків шукає не там').toBeGreaterThan(3);
		});

		it('кожен гейт після першого несе !cancelled()', () => {
			const naked: string[] = [];
			for (const { name, text } of workflows) {
				const gates = parseSteps(text).filter((step) => GATE.test(step.command));
				// Першому `if` не потрібен: до нього ніщо не падало.
				for (const step of gates.slice(1)) {
					if (!/!cancelled\(\)/.test(step.condition)) {
						naked.push(`${name} → ${step.command.trim()}`);
					}
				}
			}
			expect(
				naked,
				`гейт без !cancelled() — його падіння забере звіт у наступних:\n${naked.join('\n')}`
			).toEqual([]);
		});

		it('крок із побічним ефектом !cancelled() НЕ несе', () => {
			// Дзеркальна половина, і без неї перша половина небезпечна: `!cancelled()`
			// на вивантаженні артефакту або на деплої означає публікацію після
			// червоного гейта — тобто рівно те, від чого гейти й захищають.
			const armed: string[] = [];
			for (const { name, text } of workflows) {
				for (const step of parseSteps(text)) {
					if (SIDE_EFFECT.test(step.command) && /!cancelled\(\)|always\(\)/.test(step.condition)) {
						armed.push(`${name} → ${step.command.trim()}`);
					}
				}
			}
			expect(armed, `деплой виконається після впалого гейта:\n${armed.join('\n')}`).toEqual([]);
		});

		it('крок CI не кличе скрипт, у якому два гейти зчеплені через &&', () => {
			/*
			 * Те саме маскування, лише на рівень нижче за кроки, де `if:` не допомагає.
			 *
			 * `lint` був `prettier --check . && eslint .`. Prettier падає першим, і
			 * ESLint не запускається ВЗАГАЛІ — тобто червоний крок «Lint» означав «одна
			 * проблема плюс невідомо скільки». Стало 2026-08-26: один файл із
			 * чотирирядковим `expect()`, що вміщається в 100 колонок, і в логу кроку про
			 * ESLint жодного слова.
			 *
			 * Прерогатива тут не в тому, щоб забороняти `&&`, а в тому, щоб не зчіплювати
			 * два НЕЗАЛЕЖНІ гейти. `npm run check` — це `svelte-kit sync && svelte-check`,
			 * і там зчеплення правильне: перше не гейт, а передумова другого. Тому
			 * перелік команд-гейтів заданий явно й видний у diff, а рахуються саме вони.
			 *
			 * Правило діє лише на скрипти, які кличе WORKFLOW. Локальний `npm run lint`
			 * лишається послідовним — там зручність важливіша за повноту звіту.
			 *
			 * ВКЛАДЕНІ `npm run` РОЗГОРТАЮТЬСЯ, і цей абзац оплачено: перша редакція
			 * читала лише буквальні команди, і зворотний експеримент (§ 1.1) показав, що
			 * вона лишається ЗЕЛЕНОЮ на тому самому дефекті. Після поділу `lint` став
			 * `npm run lint:format && npm run lint:code` — два гейти, але жоден із них
			 * не команда-гейт буквально, тож перевірка бачила нуль. Тобто вона
			 * заперечувала не зчеплення гейтів, а лише один спосіб його записати — і
			 * найдешевший обхід був би саме тим, що я щойно й зробив.
			 */
			const GATE_COMMAND = [
				/\bprettier\b[^&|]*--check/,
				/\beslint\b/,
				/\bsvelte-check\b/,
				/\bvitest\b/,
				/\bplaywright\b[^&|]*\btest\b/,
				/\bnpm audit\b/
			];

			const scripts = pkg.scripts ?? {};

			/**
			 * Команди-гейти скрипта, з розгорнутими `npm run <name>`.
			 *
			 * `seen` — не про елегантність: `"a": "npm run b"`, `"b": "npm run a"` дає
			 * нескінченну рекурсію, і тест підвис би замість почервоніти.
			 */
			const gatesOf = (body: string, seen = new Set<string>()): string[] =>
				body.split('&&').flatMap((raw) => {
					const part = raw.trim();
					const nested = /^npm run ([a-z0-9:_-]+)/.exec(part)?.[1];

					if (nested) {
						if (seen.has(nested) || !scripts[nested]) return [];
						return gatesOf(scripts[nested], new Set([...seen, nested]));
					}

					return GATE_COMMAND.some((pattern) => pattern.test(part)) ? [part] : [];
				});

			const called = [
				...new Set([...all.matchAll(/run:\s*npm run ([a-z0-9:_-]+)/g)].map((m) => m[1]))
			];
			expect(
				called.length,
				'у workflow немає жодного npm run — сканер шукає не там'
			).toBeGreaterThan(0);

			const chained: string[] = [];
			for (const name of called) {
				const body = scripts[name];
				if (!body) continue;

				const gates = gatesOf(body, new Set([name]));
				if (gates.length > 1) {
					chained.push(`${name}: ${gates.join(' && ')}`);
				}
			}

			expect(
				chained,
				`скрипт зчіплює незалежні гейти — перший червоний з'їдає звіт решти, ` +
					`і умова кроку тут не допоможе. Розділіть на окремі кроки:\n${chained.join('\n')}`
			).toEqual([]);
		});

		it('continue-on-error не вживається — він робить гейт незначущим', () => {
			// Не мʼякша версія правила, а протилежна: job зеленіє при червоному гейті.
			expect(
				/continue-on-error:\s*true/.test(all),
				'гейт із continue-on-error нічого не гейтує'
			).toBe(false);
		});
	});

	it('між збіркою для деплою й вивантаженням артефакту ніхто не перезаписує build/', () => {
		/*
		 * Найдорожчий дефект цього файлу за всю його історію, і жоден інший гейт
		 * його не бачив.
		 *
		 * `playwright.config.ts` піднімає власний сервер командою `npm run build &&
		 * npm run preview` — у ту саму теку `build/`, але БЕЗ `BASE_PATH` і
		 * `SITE_ORIGIN`, які має лише крок збірки для деплою. Крок e2e стояв НИЖЧЕ
		 * збірки, тож послідовність була така: збірка з базовим шляхом →
		 * `check:build` над нею (зелений, і по праву) → e2e перезаписує `build/`
		 * збіркою з порожнім базовим шляхом → `upload-pages-artifact` вивантажує
		 * саме її.
		 *
		 * На сайті це виглядало так: сторінки відкривалися (пререндер робить шляхи
		 * до ресурсів відносними), а `canonical` і кожен `<loc>` у `sitemap.xml`
		 * вказували на `https://alik532ua.github.io/` — корінь СУСІДНЬОГО сайту на
		 * спільному домені. 229 сторінок, оголошених за адресами, які віддають 404.
		 * Тобто рівно ціна ігнорування SEO-v8: «сайт існує і його не видно».
		 *
		 * Чому це не побачив жоден гейт: кожен із них міряв теку, яка на момент
		 * його погляду була правильною. Дефект живе не в кроці, а в ПОРЯДКУ кроків,
		 * і перевіряти треба саме порядок.
		 *
		 * Перевірка свідомо груба: будь-який крок між збіркою й вивантаженням, чия
		 * команда згадує `npm run build` або `npm run test:e2e` (який тягне збірку
		 * за собою), — порушення. Хибна тривога тут коштує рядка в цьому тесті,
		 * пропуск — тижня в індексі.
		 */
		const REBUILDS = /npm run build|npm run test:e2e/;

		for (const { name, text: raw } of workflows) {
			// Коментарі зрізаються ПЕРЕД пошуком, і цей рядок оплачено: пояснення
			// порядку в самому workflow згадує `upload-pages-artifact`, і перша
			// редакція перевірки знайшла ту згадку замість кроку — тобто впала на
			// правильному файлі. Той самий клас, що й фільтр коментарів вище.
			const lines = raw.split('\n').filter((line) => !/^\s*#/.test(line));

			const upload = lines.findIndex((line) => line.includes('upload-pages-artifact'));
			if (upload === -1) continue;

			// Крок збірки позначений `id: build` — саме щоб на нього можна було
			// послатися і звідси, і з умов `if:` у самому workflow.
			const deployBuild = lines.findIndex((line) => /^\s*- id: build\s*$/.test(line));
			expect(
				deployBuild,
				`${name}: крок збірки для деплою не має «id: build» — цю перевірку нема на чому закріпити`
			).toBeGreaterThan(-1);
			expect(deployBuild, `${name}: збірка стоїть ПІСЛЯ вивантаження артефакту`).toBeLessThan(
				upload
			);

			// Власна команда кроку збірки перезаписом не є, тож зріз починається з
			// НАСТУПНОГО кроку — першого рядка нижче, що відкриває елемент списку.
			const nextStep = lines.findIndex((line, i) => i > deployBuild && /^\s*- /.test(line));

			const offenders = lines
				.slice(nextStep, upload)
				.filter((line) => /^\s*(- )?run:/.test(line) && REBUILDS.test(line))
				.map((line) => line.trim());

			expect(
				offenders,
				`${name}: між збіркою для деплою й вивантаженням артефакту build/ перезаписується — ` +
					`вивантажиться не та збірка, яку перевірив check:build:\n${offenders.join('\n')}`
			).toEqual([]);
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
