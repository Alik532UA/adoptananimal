// @vitest-environment node
import { existsSync } from 'node:fs';
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
 *
 * Існування файлу перевіряється окремим тестом нижче, і ось чому. ESLint
 * розвʼязує конфіг за ІМЕНЕМ шляху, а не за вмістом диска: заміряно 2026-08-28,
 * `calculateConfigForFile('src/routes/+does-not-exist.svelte')` спокійно віддає
 * 503 правила, серед них `svelte/no-at-html-tags: [2]`. Тобто перейменований або
 * видалений `+layout.svelte` не зробив би цей файл червоним — усі п'ятнадцять
 * перевірок лишилися б зеленими, доводячи щось про неіснуючий шлях.
 *
 * Це той самий клас, що й «перевірка жива» у другій половині файлу: гейт мусить
 * червоніти, коли міряти стало нічого, а не звітувати про порожнечу.
 */
const SAMPLE = 'src/routes/+layout.svelte';

/**
 * Бюджет часу на обидва хуки цього файлу — детектор зависання, а не норматив
 * швидкості.
 *
 * Заміряно 2026-08-28 на цій машині (16 ядер, свіжий процес Node):
 * `calculateConfigForFile` — 1.1 с, `lintFiles(['.'])` — 13.5–18 с. Усередині
 * `vitest run --coverage` та сама робота коштує дорожче: 24.4 с на прогрітій
 * файловій системі і ПОНАД 30 с лише на розвʼязання конфігу на холодній.
 *
 * На холодній гейт того ж дня і впав: файл ішов 121.9 с, перший хук вибрав свої
 * 30 с, і 15 перевірок пішли у звіт як `skipped`. Тобто CRITICAL-гейт
 * відзвітував червоним на дереві з нулем порушень — рівно те, що § 6.4.1
 * забороняє: гейт, який червоніє без порушення, до кінця тижня вимикають.
 *
 * Розкид не від кеша Vite — його чистили, без змін. Покриття v8 знімає
 * інлайнінг з усього завантаженого графа, а граф ESLint із пресетами svelte і
 * typescript-eslint — найбільший у прогоні; згори лягає конкуренція з 41 іншим
 * файлом на воркерах.
 *
 * Спільний інстанс ESLint на обидва хуки перевіряли окремо: у свіжому процесі
 * виграшу немає (14.7 с проти 16.7 с — шум). Перше вимірювання показало «вшестеро
 * швидше» лише тому, що обидва варіанти міряли в одному прогрітому процесі.
 *
 * Тому число тут відповідає не на «скільки має тривати», а на «за скільки вже
 * точно зависло». Найдовший спостережений хук — понад 30 с; 120 с лишає
 * чотирикратний запас і далі ловить справжній цикл без виходу.
 */
const HOOK_BUDGET_MS = 120_000;

function levelOf(entry: unknown): string | number | undefined {
	return Array.isArray(entry) ? (entry[0] as string | number) : (entry as string | number);
}

describe('базовий набір ESLint (CODE-QUALITY-v8 § 6.4.1)', () => {
	let rules: Record<string, unknown>;

	it('перевірка жива: файл-зразок існує', () => {
		expect(
			existsSync(SAMPLE),
			`${SAMPLE} немає на диску — ESLint усе одно віддасть конфіг за розширенням, ` +
				'і решта перевірок цього блоку доводитиме щось про неіснуючий шлях'
		).toBe(true);
	});

	beforeAll(async () => {
		const config = (await new ESLint().calculateConfigForFile(SAMPLE)) as {
			rules: Record<string, unknown>;
		};
		rules = config.rules;
	}, HOOK_BUDGET_MS);

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
	}, HOOK_BUDGET_MS);

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
