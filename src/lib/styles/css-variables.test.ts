import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Every var(--x) must be declared, and declared in *every* theme.
 *
 * This is the check that would have caught --color-primary-rgb: it was used in four
 * places with a fallback of the dark theme's green, declared in no theme at all, and
 * therefore tinted the other three themes green without anyone noticing.
 */

const THEMES_DIR = resolve('src/lib/styles/themes');
const themeFiles = readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css'));

const declarationsIn = (css: string) =>
	new Set([...css.matchAll(/(?:^|[;{"\s])(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]));

const collectSources = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = resolve(dir, entry.name);
		if (entry.isDirectory()) collectSources(full, out);
		else if (/\.(svelte|css)$/.test(entry.name)) out.push(full);
	}
	return out;
};

const sources = collectSources(resolve('src'));
const allCss = sources.map((f) => readFileSync(f, 'utf-8')).join('\n');

const declared = declarationsIn(allCss);
const used = new Set([...allCss.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]));

describe('CSS custom properties', () => {
	it('has themes to compare', () => {
		expect(themeFiles.length).toBeGreaterThan(1);
	});

	it('declares every variable that is used', () => {
		const undeclared = [...used].filter((name) => !declared.has(name));
		expect(undeclared).toEqual([]);
	});

	it('declares the same variables in every theme', () => {
		const perTheme = themeFiles.map((file) => ({
			file,
			names: declarationsIn(readFileSync(resolve(THEMES_DIR, file), 'utf-8'))
		}));

		const union = new Set(perTheme.flatMap(({ names }) => [...names]));
		const gaps = perTheme.flatMap(({ file, names }) =>
			[...union].filter((name) => !names.has(name)).map((name) => `${file} is missing ${name}`)
		);

		expect(gaps).toEqual([]);
	});

	it('never uses var(--x, fallback) — a fallback hides a missing declaration', () => {
		const withFallback = [...allCss.matchAll(/var\(\s*--[a-z0-9-]+\s*,/gi)].map((m) => m[0]);
		expect(withFallback).toEqual([]);
	});
});

/**
 * Контраст пари токенів у КОЖНІЙ темі, а не в тій, що активна після `goto()`
 * (ACCESSIBILITY-v9 § 10.7, `A11Y-CONTRAST-ALL-PAIRS`).
 *
 * `tests/a11y.spec.ts` міряє контраст по чотирьох темах на дев'яти сторінках — і
 * бачить лише те, що на цих сторінках намальовано зараз. Токен, оголошений у темі
 * й ще не поставлений на екран, у той замір не входить, а WCAG порушить у той
 * день, коли хтось напише перше посилання в тексті сторінки.
 *
 * **Заміряно 2026-09-10, до правки:** саме це й було. `a { color: var(--color-link) }`
 * стоїть глобальним правилом у `base.css`, тобто посилання може лягти на будь-яку
 * поверхню теми. У `winter` `--color-link` показував на `--color-primary-dark`
 * (#3385ff) — 3.28:1 на `--color-bg` і 3.12:1 на `--color-bg-surface`, а
 * `--color-link-hover` 2.78:1. У `light-green` 4.17:1 на `--color-bg-surface`.
 * axe був зелений увесь час, бо жодне посилання на дев'яти сторінках цього кольору
 * не бере: усі вони мають власний `color` від компонента. Тобто дефект був
 * заряджений і чекав на наступне звичайне посилання.
 *
 * Чому саме ці токени, а не всі пари підряд. Повний перебір «кожен текстовий
 * токен × кожна поверхня» дає 176 пар і 26 нижче AA — але більшість із них ніде
 * не зустрічається: `--color-text-light` малюється рівно на `--color-bg-warm`, і
 * там усе гаразд. Гейт із двадцятьма шістьма записами в базовому переліку не
 * стереже нічого, він лише привчає до червоного. Тут перевіряються ті токени,
 * для яких «на будь-якій поверхні» — правда за побудовою: їх ставить глобальне
 * правило, а не компонент зі своїм тлом.
 *
 * Зворотний експеримент: `--color-link` у `winter` повернено на
 * `var(--color-primary-dark)` — гейт назвав тему, токен, поверхню й число.
 */

/** Токени, які глобальне правило може покласти на будь-яку поверхню теми. */
const GLOBAL_TEXT = ['--color-link', '--color-link-hover'];
const SURFACES = [
	'--color-bg',
	'--color-bg-surface',
	'--color-bg-warm',
	'--color-bg-card',
	'--color-bg-card-hover'
];
const AA_NORMAL = 4.5;

const valuesIn = (css: string) =>
	new Map([...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]));

/** Розгортає ланцюжок `var(--a)` → `var(--b)` → літерал у межах однієї теми. */
function literal(name: string, values: Map<string, string>, seen = new Set<string>()): string {
	if (seen.has(name)) return '';
	seen.add(name);
	const raw = values.get(name) ?? '';
	const ref = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(raw);
	return ref ? literal(ref[1], values, seen) : raw;
}

/** `#abc`, `#aabbcc`. Нічого іншого в поверхнях і текстових токенах тут немає. */
function rgb(value: string): [number, number, number] | null {
	const short = /^#([0-9a-f]{3})$/i.exec(value);
	if (short) return [...short[1]].map((c) => parseInt(c + c, 16)) as [number, number, number];
	const long = /^#([0-9a-f]{6})$/i.exec(value);
	if (!long) return null;
	return [0, 2, 4].map((i) => parseInt(long[1].slice(i, i + 2), 16)) as [number, number, number];
}

const relativeLuminance = ([r, g, b]: [number, number, number]) => {
	const channel = (c: number) => {
		const v = c / 255;
		return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (fg: [number, number, number], bg: [number, number, number]) => {
	const [a, b] = [relativeLuminance(fg), relativeLuminance(bg)];
	const [hi, lo] = a > b ? [a, b] : [b, a];
	return (hi + 0.05) / (lo + 0.05);
};

describe('§ 10.7 — контраст по всіх темах, а не по активній', () => {
	const themes = themeFiles.map((file) => ({
		file,
		values: valuesIn(readFileSync(resolve(THEMES_DIR, file), 'utf-8'))
	}));

	it('перевірка жива: токени розгортаються в кольори', () => {
		// Розв'язувач, який нічого не розбирає, дає нуль порушень і читається як
		// чистий проєкт — саме той мовчазний пропуск, проти якого написано § 10.7.
		const resolved = themes.flatMap(({ values }) =>
			[...GLOBAL_TEXT, ...SURFACES].map((name) => rgb(literal(name, values)))
		);
		expect(resolved.length, 'тем або токенів не знайдено').toBeGreaterThan(20);
		expect(
			resolved.filter((colour) => colour === null),
			'токен не розібрався як колір — мовчазний пропуск гірший за червоне'
		).toEqual([]);
	});

	it('посилання читається на кожній поверхні кожної теми', () => {
		const below: string[] = [];
		for (const { file, values } of themes) {
			for (const text of GLOBAL_TEXT) {
				const fg = rgb(literal(text, values));
				for (const surface of SURFACES) {
					const bg = rgb(literal(surface, values));
					if (!fg || !bg) continue;
					const ratio = contrast(fg, bg);
					if (ratio < AA_NORMAL) {
						below.push(`${file}: ${text} on ${surface} = ${ratio.toFixed(2)}`);
					}
				}
			}
		}
		expect(below, `нижче AA 4.5:1:\n${below.join('\n')}`).toEqual([]);
	});
});
