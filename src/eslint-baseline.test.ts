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
