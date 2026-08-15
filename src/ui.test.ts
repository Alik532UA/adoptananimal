// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * SVELTE-UI-v8 § 4, UI-UX-v8 § 4, PERFORMANCE-v8 § 10.2 — конвенції розмітки,
 * яких не покриває жоден плагін.
 *
 * Спільна риса всього, що тут перевіряється: воно не ламає збірку. Svelte 4 API
 * компілюється (з попередженням, яке легко не побачити серед іншого виводу),
 * `<img>` без розмірів рендериться, `content="light"` у мета-тезі виглядає
 * правильніше за `light dark`. Ціну платить відвідувач — стрибком розкладки на
 * першому кадрі або інвертованими кольорами на Android.
 */

const ROOT = process.cwd().replace(/\\/g, '/');

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(full.replace(/\\/g, '/'));
	}
	return out;
}

const files = walk(join(ROOT, 'src')).map((f) => f.slice(ROOT.length + 1));
const svelteFiles = files.filter((f) => f.endsWith('.svelte'));
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

/** Коментарі відрізаються там, де вони цитують анти-патерн, який пояснюють. */
const withoutComments = (source: string) => source.replace(/<!--[\s\S]*?-->/g, '');

/**
 * Теги `<img …>` цілком, із урахуванням `>` усередині виразів Svelte.
 *
 * Наївне `/<img\s[^>]*>/` тут не годиться, і це не теорія: у розмітці цього
 * проєкту є `alt={t(...)}` і `{locales.find((l) => …)}`, тобто стрілка всередині
 * атрибута. Регулярка обривала тег на цій стрілці й звітувала, що атрибутів
 * немає, — про теги, у яких вони були. Тому лічильник фігурних дужок: тег
 * закінчується на `>`, що стоїть поза виразом.
 */
function imgTags(source: string): string[] {
	const tags: string[] = [];
	const re = /<img\s/g;
	let match: RegExpExecArray | null;

	while ((match = re.exec(source))) {
		let depth = 0;
		let quote: string | null = null;

		for (let i = match.index; i < source.length; i++) {
			const char = source[i];
			if (quote) {
				if (char === quote) quote = null;
				continue;
			}
			if (char === '"' || char === "'") quote = char;
			else if (char === '{') depth++;
			else if (char === '}') depth--;
			else if (char === '>' && depth === 0) {
				tags.push(source.slice(match.index, i + 1));
				break;
			}
		}
	}
	return tags;
}

const appHtml = read('src/app.html');

describe('UI-конвенції', () => {
	it('перевірка жива: компоненти знайдено', () => {
		expect(svelteFiles.length, 'сканер шукає не там').toBeGreaterThan(10);
	});

	it('немає Svelte 4 API (§ анти-патерни)', () => {
		// `<slot>`, `on:click` і `<svelte:component>` компілюються далі, тож
		// проєкт може роками мати дві ідіоми поруч і не знати про це.
		const bad = svelteFiles.filter((f) =>
			/<slot[\s/>]|\son:[a-z]+=|<svelte:component/.test(withoutComments(read(f)))
		);
		expect(bad, `застарілі API Svelte 4:\n${bad.join('\n')}`).toEqual([]);
	});

	it('кожен svelte-ignore має обґрунтування поруч (§ 2.1)', () => {
		// Обґрунтування приймається і в тому самому коментарі, і в сусідньому —
		// над директивою або під нею. У цьому проєкті прийнята друга форма, бо
		// пояснення зазвичай довше за рядок, і зустрічаються обидва порядки.
		// Важливо, що воно Є, а не де саме воно стоїть; вимагати одного
		// написання означало б правити робочий код заради форми коментаря.
		const bad: string[] = [];
		for (const file of svelteFiles) {
			const lines = read(file).split('\n');
			lines.forEach((line, index) => {
				const match = /<!--\s*svelte-ignore\s+(\S+)([^>]*)-->/.exec(line);
				if (!match) return;

				const inline = match[2].replace(/-->/, '').trim();
				// Вікно, а не рівно сусідній рядок: між поясненням і директивою
				// цілком законно стоїть відкриття блоку — `{#if visible}` у
				// Minimap саме такий випадок. Вимагати суміжності означало б
				// пересувати правильний коментар заради форми.
				const near = [
					...lines.slice(Math.max(0, index - 3), index),
					...lines.slice(index + 1, index + 2)
				].map((l) => l.trim());

				const explained = inline.length > 0 || near.some((l) => l.startsWith('<!--') || l.endsWith('-->'));
				if (!explained) bad.push(`${file}:${index + 1}: ${match[1]} без причини`);
			});
		}
		expect(bad, `svelte-ignore без обґрунтування:\n${bad.join('\n')}`).toEqual([]);
	});

	it('сирий <svg> не живе у сторінках (UI-UX § 3)', () => {
		// У компонентах іконок — можна; у маршруті це розмітка, яку неможливо
		// ані перевикористати, ані перефарбувати під тему.
		const bad = svelteFiles
			.filter((f) => f.startsWith('src/routes/'))
			.filter((f) => /<svg[\s>]/.test(withoutComments(read(f))));
		expect(bad, `сирий <svg> у маршруті — винести в компонент:\n${bad.join('\n')}`).toEqual([]);
	});

	it('кожен <img> має відомий розмір до завантаження (PERFORMANCE § 10.2)', () => {
		// Правило про CLS, а не про атрибути. Браузеру треба знати, скільки місця
		// лишити, ДО того як зображення приїде; звідки він це знає — байдуже.
		//
		// Джерел два, і обидва законні:
		//   1. атрибути width/height на самому теге — потрібні там, де розмір
		//      залежить від файлу (логотип із `width: auto` займе стільки, скільки
		//      скаже його власна пропорція, і до завантаження це невідомо);
		//   2. визначений бокс від CSS — `width` І `height` на класі цього
		//      зображення в тому ж компоненті. Тоді місце тримає контейнер, і
		//      зсуву не буде незалежно від того, коли прийде картинка.
		//
		// Вимагати атрибути й у другому випадку означало б вписувати числа, які
		// нічого не вирішують: CSS усе одно виграє. Гірше — для фото тварин
		// довелося б вигадати одну пропорцію на всіх, і вона була б неправдою.
		const bad: string[] = [];

		for (const file of svelteFiles) {
			const source = read(file);
			const style = /<style[^>]*>([\s\S]*)<\/style>/.exec(source)?.[1] ?? '';

			/** Чи задає CSS цьому класу і ширину, і висоту. */
			const hasDefiniteBox = (className: string) => {
				const rule = new RegExp(`\\.${className}\\b[^{]*\\{([^}]*)\\}`, 'g');
				return [...style.matchAll(rule)].some(
					(m) => /(^|[;\s])width\s*:/.test(m[1]) && /(^|[;\s])height\s*:/.test(m[1])
				);
			};

			for (const tag of imgTags(withoutComments(source))) {
				if (/\bwidth[={\s]/.test(tag) && /\bheight[={\s]/.test(tag)) continue;

				const classes = (/class="([^"]*)"/.exec(tag)?.[1] ?? '')
					.split(/\s+/)
					.filter((c) => c && !c.includes('{'));

				if (classes.some(hasDefiniteBox)) continue;

				bad.push(`${file}: ${tag.replace(/\s+/g, ' ').slice(0, 72)}`);
			}
		}

		expect(
			bad,
			`розмір невідомий до завантаження — ні атрибутів, ні визначеного боксу в CSS:\n${bad.join('\n')}`
		).toEqual([]);
	});
});

describe('перший кадр', () => {
	it('meta color-scheme не провокує Force Dark Mode (UI-UX § 1.2)', () => {
		// Саме `light` — не `light dark` — вмикає на Android Chrome примусову
		// інверсію, і сайт стає темним не тими кольорами, які хтось обирав.
		const value = /name="color-scheme"[^>]*content="([^"]+)"/.exec(appHtml)?.[1];
		expect(value, 'мета-тега немає — перевірка мертва').toBeDefined();
		expect(value, 'значення "light" на Android Chrome інвертує кольори').not.toBe('light');
	});

	it('скрипт першого кадру не падає без сховища (UI-UX § 1.1)', () => {
		// Неперехоплений виняток тут зупиняє скрипт до кінця — сторінка лишається
		// без data-theme і data-style узагалі, тобто без палітри й без радіусів.
		// У приватному режимі частини браузерів звернення до localStorage кидає.
		//
		// Перевіряється КОЖНЕ звернення, а не наявність try/catch десь у скрипті.
		// Перша редакція питала друге — і зворотний експеримент (§ 1.1) показав,
		// що вона лишається зеленою, коли зняти один із двох блоків: у цьому
		// скрипті їх два, тема й режим смуги, і кожен читає сховище окремо.
		const scripts = [...appHtml.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
			(m) => m[1]
		);
		expect(scripts.length, 'інлайн-скрипта немає — перевірка мертва').toBeGreaterThan(0);

		/** Діапазони [початок, кінець) тіл усіх `try { … }` у джерелі. */
		const tryRanges = (body: string): Array<[number, number]> => {
			const ranges: Array<[number, number]> = [];
			const re = /\btry\s*\{/g;
			let match: RegExpExecArray | null;

			while ((match = re.exec(body))) {
				let depth = 0;
				for (let i = match.index + match[0].length - 1; i < body.length; i++) {
					if (body[i] === '{') depth++;
					else if (body[i] === '}' && --depth === 0) {
						ranges.push([match.index, i]);
						break;
					}
				}
			}
			return ranges;
		};

		const unguarded: string[] = [];
		for (const body of scripts) {
			const ranges = tryRanges(body);
			for (const access of body.matchAll(/\b(localStorage|sessionStorage)\b/g)) {
				const at = access.index ?? 0;
				if (!ranges.some(([from, to]) => at > from && at < to)) {
					unguarded.push(`${access[1]} поза try/catch (зсув ${at})`);
				}
			}
		}

		expect(
			unguarded,
			`звернення до сховища без try/catch у скрипті першого кадру:\n${unguarded.join('\n')}`
		).toEqual([]);
	});
});
