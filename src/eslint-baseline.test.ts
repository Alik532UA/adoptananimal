// @vitest-environment node
import { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * CODE-QUALITY-v8 § 6.4.2 — базовий набір ESLint увімкнений.
 *
 * Чому цей тест існує. До 2026-08-15 шість правил цього набору були відсутні у
 * зібраному конфігу взагалі: `no-restricted-imports`, `no-eval`,
 * `no-implied-eval`, `no-new-func`, `no-script-url`, `no-restricted-syntax`,
 * плюс `svelte/valid-compile`. `npm run lint` давав нуль помилок — і цей нуль
 * ішов у звіт про якість нарівні з нулем у проєкті, де ті самі правила
 * увімкнені. Відсутність правила не видно ніде: вивід лінтера виглядає
 * однаково.
 *
 * Тест читає ЗІБРАНИЙ конфіг (`calculateConfigForFile`), а не текст файлу:
 * правило може зникнути через зміну пресету, і в тексті цього не видно.
 *
 * Правила з боргом (`warn`) навмисно проходять перевірку: борг у звіті — це не
 * те саме, що вимкнене правило. Тест ловить лише `off` і відсутність.
 */
const BASELINE = [
	'no-restricted-imports',
	'no-eval',
	'no-implied-eval',
	'no-new-func',
	'no-script-url',
	'no-restricted-syntax',
	'@typescript-eslint/no-explicit-any',
	'@typescript-eslint/no-unused-vars',
	'@typescript-eslint/ban-ts-comment',
	'svelte/no-at-html-tags',
	'svelte/require-each-key',
	'svelte/valid-compile',
	'svelte/prefer-svelte-reactivity',
	// DEBUGGING-v8 § 4. Not in the canon's own baseline list, added here because
	// the failure mode is the same one that list is about: a console call still
	// prints, so nothing looks broken, and the event is simply missing from every
	// report a visitor could send. Off would be indistinguishable from clean.
	'no-console'
] as const;

/**
 * `svelte/no-navigation-without-resolve` у базовому наборі каноном є, а тут
 * свідомо вимкнене: проєкт ходить через `withBase()` замість типізованого
 * `resolve()`, бо той не виражає ні slug'и тварин із файлів даних, ні
 * навігацію лише за query, ні шляхи до зображень. Компіляційну перевірку
 * маршрутів, яку `resolve()` дає, заміняє `scripts/check-build.js` над
 * зібраним виводом. Причина записана в PROJECT-CONTEXT.md § 4.8.
 *
 * Виняток стоїть тут явно, а не «випав» зі списку мовчки: якщо колись
 * `withBase()` зникне, цей рядок — місце, де про відхилення згадають.
 */
const DOCUMENTED_EXCEPTIONS = ['svelte/no-navigation-without-resolve'] as const;

/**
 * Файл-зразок мусить бути `.svelte`: частина правил (`svelte/*`) живе лише в
 * overrides-блоці для цього розширення, і на `.ts` їх у зібраному конфігу немає.
 */
const SAMPLE = 'src/routes/+layout.svelte';

function levelOf(entry: unknown): string | number | undefined {
	return Array.isArray(entry) ? (entry[0] as string | number) : (entry as string | number);
}

describe('базовий набір ESLint (CODE-QUALITY-v8 § 6.4.1)', () => {
	let rules: Record<string, unknown>;

	beforeAll(async () => {
		const config = (await new ESLint().calculateConfigForFile(SAMPLE)) as {
			rules: Record<string, unknown>;
		};
		rules = config.rules;
		// 30 с, а не типові 5: розвʼязання конфігу тягне пресети svelte та
		// typescript-eslint. Під паралельним прогоном у CI типового ліміту не
		// вистачає, і файл падає з пропущеними перевірками — гейт червоніє без
		// порушення.
	}, 30_000);

	it.each(BASELINE)('%s не вимкнене', (rule) => {
		const level = levelOf(rules[rule]);
		expect(
			level,
			'правило відсутнє у зібраному конфігу — звіт lint не покриває цей клас порушень'
		).toBeDefined();
		expect(level, 'правило вимкнене — зелений lint нічого не доводить').not.toBe('off');
		expect(level, 'правило вимкнене — зелений lint нічого не доводить').not.toBe(0);
	});

	it.each(DOCUMENTED_EXCEPTIONS)('%s лишається свідомим винятком', (rule) => {
		const level = levelOf(rules[rule]);
		expect(
			level === 'off' || level === 0,
			`правило увімкнули — прибери його з DOCUMENTED_EXCEPTIONS і онови PROJECT-CONTEXT.md § 4.8`
		).toBe(true);
	});
});

/**
 * Борг ESLint — число під гейтом, а не число в коментарі (§ 6.4.3).
 *
 * § 6.4.2 вище доводить лише, що правило не в `off`. Про КІЛЬКІСТЬ порушень воно
 * не каже нічого — а `eslint .` завершується кодом 0, поки порушення мають рівень
 * `warn`. Тобто попередження в цьому проєкті зараз не видно ніде: `npm run lint`
 * зелений, у CI зелений, і борг може завестися мовчки в тому ж коміті, що його
 * створив.
 *
 * Мапа порожня, і це ЗАМІР, а не заготовка: станом на 2026-08-26 повний прохід по
 * 227 файлах дає 0 помилок і 0 попереджень. Тому головна тут — остання перевірка:
 * будь-яке нове попередження валить прогін, поки його не внесуть у `DEBT` числом.
 * Внесення — свідома дія з рядком у diff, а не тиша.
 *
 * Порівняння на РІВНІСТЬ, а не «не більше». «Не більше» ловить зростання й
 * пропускає застарівання: виправив три місця — число лишилося старим, і наступний
 * читач бачить борг, якого немає (AI-AGENT-PITFALLS § 5.5). Рівність змушує
 * опустити число тим самим комітом, яким борг скоротили.
 *
 * Ціна: повний прохід ESLint — 13 с на цій машині, і це найдовший юніт-файл
 * проєкту. Дешевшого способу дізнатися кількість попереджень немає: `npm run lint`
 * її не звітує, а меншою вибіркою файлів вимірюється не борг проєкту, а борг
 * вибірки.
 */
const DEBT: Readonly<Record<string, number>> = {};

/**
 * Сума окремим числом, і навмисно не `Object.values(DEBT)`.
 *
 * Саму суму називають у `PROJECT-CONTEXT.md` і в описах комітів — і саме вона
 * старіє першою. Виведена з мапи, вона повторювала б мапу й не перевіряла нічого.
 */
const DEBT_TOTAL = 0;

describe('борг ESLint — число, що лише спадає (CODE-QUALITY-v8 § 6.4.3)', () => {
	const counts: Record<string, number> = {};
	let errors = 0;
	let linted = 0;

	beforeAll(async () => {
		// Той самий прохід, що й `npm run lint`, тільки через Node API — щоб
		// результат був даними, а не текстом, який довелося б розбирати.
		const results = await new ESLint().lintFiles(['.']);
		linted = results.length;
		for (const result of results) {
			for (const message of result.messages) {
				const rule = message.ruleId ?? '(без правила)';
				counts[rule] = (counts[rule] ?? 0) + 1;
				if (message.severity === 2) errors++;
			}
		}
	}, 60_000);

	it('перевірка жива: lint пройшов по джерелах', () => {
		// Без цього порожній прохід читається як «боргу немає» — і мапа нижче
		// сходилася б із будь-яким станом коду.
		expect(linted, 'ESLint не взяв жодного файлу — гейт міряє порожнечу').toBeGreaterThan(100);
	});

	it('помилок немає — борг це попередження, а не поламана збірка', () => {
		expect(errors, 'помилка означає червоний lint, а не борг').toBe(0);
	});

	it('мапа боргу дослівно збігається з фактом', () => {
		expect(
			counts,
			'три читання одного розходження: правило ЗРОСЛО — почини або підніми число свідомо; ' +
				'СКОРОТИЛОСЯ — опусти число тим самим комітом; правила НЕМА в DEBT — борг заводиться мовчки'
		).toEqual(DEBT);
	});

	it('сума боргу дорівнює записаній', () => {
		const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
		expect(total, `DEBT_TOTAL застарів: у коді ${total}, записано ${DEBT_TOTAL}`).toBe(DEBT_TOTAL);
	});
});
