// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import config from '../svelte.config.js';

/**
 * SECURITY-v8 § 6.3.1 — хеш інлайн-скрипта береться з тексту, нормалізованого до
 * LF (`SEC-CSP-HASH-EOL`).
 *
 * Обчислити хеш із файлу — недосить, і це найдорожча половина правила. Браузер
 * хешує не байти файлу, а ТЕКСТОВИЙ ВУЗОЛ `<script>` після розбору HTML, а розбір
 * нормалізує `\r\n` і одиночний `\r` у `\n` ще до появи DOM. Отже на машині, де
 * `app.html` лежить із CRLF — Windows із типовим `core.autocrlf`, — `readFileSync`
 * дає один текст, а браузер хешує інший, і політика блокує рівно те, що мала
 * дозволити.
 *
 * Симптом майже ніколи не той, на який схоже: блокується ВЕСЬ скрипт першого
 * кадру, а не окремий рядок. Тут це `data-theme` і `data-style` — сторінка
 * лишається без палітри взагалі, а `border-radius: var(--radius-md)` стає
 * невалідним, тож кожна картка, кнопка й поле малюються квадратними до кінця
 * гідрації. Виглядає як «зламали дизайн», а не як CSP.
 *
 * ЦЕ ОБОВʼЯЗКОВО ЮНІТ, А НЕ E2E. На Linux (CI, продакшн) файл із LF, тож дефекту
 * там немає ЗА ВИЗНАЧЕННЯМ: e2e зеленіє в середовищі, де перевіряти нічого, і не
 * виконується на машині, де дефект живе. Це той самий клас, що AI-AGENT-PITFALLS
 * § 1.4: перевірка є, вона правильна, і вона дивиться не туди.
 *
 * Чому це потрібно, коли `.gitattributes` уже ставить `eol=lf`, а `svelte.config.js`
 * уже нормалізує: обидві половини — рядок коду, який можна прибрати, не побачивши
 * наслідку. Наслідок видно лише в браузері на Windows. Ця перевірка ставить його
 * під гейт, який видно в CI.
 */

const APP_HTML = join(process.cwd(), 'src/app.html');
const html = readFileSync(APP_HTML, 'utf8');

/**
 * Інлайн-скрипти сторінки — ЗА ФОРМОЮ, у якій їх бачить браузер: будь-який
 * `<script>` без `src`, із атрибутами чи без.
 *
 * Шаблон навмисно ширший за той, яким `svelte.config.js` збирає хеші (`<script>`
 * без атрибутів). Це не дублювання, а те, заради чого перевірка й потрібна: скрипт,
 * якому дописали атрибут — `<script defer>`, `<script type="module">`, — перестане
 * збігатися з вужчим шаблоном, хеш для нього не порахується, і політика заблокує
 * його МОВЧКИ. У джерелах при цьому все виглядає правильно.
 */
function inlineScripts(source: string): string[] {
	return [...source.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
}

/** Той самий текст, що його бачить браузер після розбору HTML. */
const asBrowserSees = (text: string) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const sha256 = (text: string) => `sha256-${createHash('sha256').update(text).digest('base64')}`;

const scriptSrc = (config.kit?.csp?.directives?.['script-src'] ?? []) as readonly string[];
const hashesInPolicy = scriptSrc.filter((value) => value.startsWith('sha256-'));

describe('хеші інлайн-скриптів у CSP (SECURITY-v8 § 6.3.1)', () => {
	const scripts = inlineScripts(html);

	it('перевірка жива: у app.html знайдено інлайн-скрипт і в політиці є хеші', () => {
		// Обидві половини потрібні. Нуль скриптів означає, що шаблон шукає не те, і
		// тоді решта перевірок нижче зеленіє на порожніх списках. Нуль хешів означає,
		// що політика взагалі перестала їх нести — і сторінка вже зламана.
		expect(scripts.length, 'жодного інлайн-скрипта — шаблон шукає не те').toBeGreaterThan(0);
		expect(hashesInPolicy.length, 'у script-src немає жодного sha256 — скрипт заблокований').toBe(
			scripts.length
		);
	});

	it('кожен інлайн-скрипт має в політиці свій БРАУЗЕРНИЙ хеш', () => {
		const missing = scripts
			.map((body) => ({ hash: sha256(asBrowserSees(body)), head: body.trim().slice(0, 60) }))
			.filter((entry) => !hashesInPolicy.includes(entry.hash));

		expect(
			missing.map((entry) => `${entry.hash} ← ${entry.head}…`),
			'скрипт без свого хеша в політиці. Якщо в політиці хеш є, а тут інший — ' +
				'різниця лише в переносах рядків, тобто хеш обчислено над CRLF'
		).toEqual([]);
	});

	it('хеш, обчислений над CRLF, у політику НЕ потрапляє', () => {
		// Дзеркальна половина, і без неї перша нічого не доводить на Windows: якби
		// `svelte.config.js` перестав нормалізувати, у політику приїхав би CRLF-хеш —
		// і перша перевірка червоніла б, не назвавши причини. Ця називає.
		const crlf = scripts
			.filter((body) => body.includes('\r'))
			.map((body) => sha256(body))
			.filter((hash) => hashesInPolicy.includes(hash));

		expect(
			crlf,
			'у політиці лежить хеш над CRLF — браузер його не приймає й блокує ВЕСЬ скрипт першого кадру'
		).toEqual([]);
	});

	it('політика не несе зайвих хешів', () => {
		// Хеш скрипта, якого на сторінці вже немає, — не діра, а слід: він означає,
		// що хеші десь вписані вручну, а не порахувані з `app.html`. Наступний, хто
		// правитиме скрипт, покладатиметься на автоматику, якої вже немає.
		const known = new Set(scripts.map((body) => sha256(asBrowserSees(body))));
		const stale = hashesInPolicy.filter((hash) => !known.has(hash));

		expect(stale, 'хеш без скрипта на сторінці — ознака вписаних руками значень').toEqual([]);
	});
});
