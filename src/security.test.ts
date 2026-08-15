// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * SECURITY-v8 § 16 — інваріанти безпеки по джерелах.
 *
 * Межа методу названа прямо, бо без неї файл читався б як більше, ніж він є.
 * Канон (§ 6.2, § 16) каже, що ЗАБЛОКОВАНИЙ РЕСУРС видно лише в рантаймі:
 * збій CSP не ламає розкладку, не валить збірку й не червонить тести — сторінка
 * рендериться правильно, просто без тієї речі. Тому перевірити «директиви
 * досить» звідси неможливо, і цей файл цього не робить.
 *
 * Що він робить: тримає узгодженість між політикою та джерелами. Це друга
 * половина того самого дефекту й та, яку статика бачить точно — allowlist, що
 * розійшовся з кодом, в обидва боки:
 *
 *   - хост з'явився в коді, директиви для нього немає → ресурс мовчки
 *     заблокований у відвідувача;
 *   - хост лишився в директиві, а з коду зник → чужий origin, якому ми досі
 *     дозволяємо вантажити щось на нашу сторінку, без жодної причини.
 *
 * Другий випадок і знайшовся на першому ж прогоні: www.transparenttextures.com
 * в img-src, не згаданий у src/ жодного разу.
 */

const ROOT = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(full.replace(/\\/g, '/'));
	}
	return out;
}

const sources = walk(join(ROOT, 'src'))
	.filter((f) => /\.(ts|svelte|html|css)$/.test(f))
	.filter((f) => !/\.(test|spec)\.ts$/.test(f))
	.map((f) => f.slice(ROOT.replace(/\\/g, '/').length + 1));

const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

/** Коментарі відрізаються: вони цитують анти-патерни, які самі ж і пояснюють. */
const withoutComments = (source: string) =>
	source
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/(^|[^:])\/\/.*$/gm, '$1');

const appHtml = read('src/app.html');
const svelteConfig = read('svelte.config.js');

describe('безпека — джерела', () => {
	it('перевірка жива: джерела знайдено', () => {
		expect(sources.length, 'сканер шукає не там').toBeGreaterThan(20);
	});

	it('немає eval і подібного (§ 13)', () => {
		// ESLint уже забороняє це правилами no-eval / no-new-func, але вони
		// не покривають document.write і не дивляться в app.html.
		const bad = sources.filter((f) =>
			/\beval\s*\(|new Function\s*\(|document\.write\s*\(/.test(withoutComments(read(f)))
		);
		expect(bad, `заборонені конструкції:\n${bad.join('\n')}`).toEqual([]);
	});

	it('кожен {@html} санітизований або підпадає під виняток § 5.3', () => {
		const bad: string[] = [];
		for (const file of sources.filter((f) => f.endsWith('.svelte'))) {
			for (const match of withoutComments(read(file)).matchAll(/\{@html\s+([^}]+)\}/g)) {
				const expression = match[1];
				// Виняток § 5.3 — структуровані дані: значення проходить
				// JSON.stringify і походить із файлів даних проєкту, не з вводу.
				const allowed = /sanitize|JSON\.stringify|[Jj]sonLd|ld\+json/.test(expression);
				if (!allowed) bad.push(`${file}: {@html ${expression.trim().slice(0, 48)}}`);
			}
		}
		expect(bad, `неперевірений {@html}:\n${bad.join('\n')}`).toEqual([]);
	});
});

describe('безпека — CSP', () => {
	/** Хости, які політика дозволяє понад 'self' і схеми. */
	const allowedHosts = [...svelteConfig.matchAll(/'(https?:\/\/[^']+)'/g)].map((m) =>
		m[1].replace(/^https?:\/\//, '')
	);

	it('перевірка жива: у політиці є хоч один зовнішній хост', () => {
		expect(allowedHosts.length, 'директиви не розібралися — змінився формат конфігу').toBeGreaterThan(
			0
		);
	});

	it("script-src не має 'unsafe-inline' (§ 6.1)", () => {
		const scriptSrc = /'script-src':\s*\[([^\]]*)\]/.exec(svelteConfig)?.[1] ?? '';
		expect(scriptSrc, 'директиву не знайдено — перевірка мертва').not.toBe('');
		expect(scriptSrc.includes('unsafe-inline'), "'unsafe-inline' зводить script-src нанівець").toBe(
			false
		);
	});

	it('хеш інлайн-скрипта рахується з app.html, а не вписаний рядком (§ 6.3)', () => {
		// Вписаний рядок розходиться зі скриптом при першій же правці, і єдиним
		// симптомом буде тема, що не застосувалася, — на машині відвідувача.
		expect(/readFileSync\(\s*['"]src\/app\.html['"]/.test(svelteConfig)).toBe(true);
		expect(
			/'sha256-[A-Za-z0-9+/=]{20,}'/.test(svelteConfig),
			'у конфігу є вписаний хеш — він розійдеться зі скриптом'
		).toBe(false);
	});

	it('власні інлайн-скрипти стоять ПІСЛЯ %sveltekit.head% (§ 6.3)', () => {
		// Мета-політика діє лише на те, що йде після неї. Скрипт вище цього
		// місця не покритий узагалі, і хеш для нього декоративний — тести при
		// цьому лишаються зеленими.
		const head = appHtml.indexOf('%sveltekit.head%');
		expect(head, '%sveltekit.head% не знайдено — перевірка мертва').toBeGreaterThan(-1);

		const early = [...appHtml.matchAll(/<script(?![^>]*\bsrc=)[^>]*>/g)]
			.map((m) => m.index ?? -1)
			.filter((index) => index < head);

		expect(early, 'інлайн-скрипт вище мета-політики нею не покритий').toEqual([]);
	});

	it('кожен дозволений хост справді використовується джерелами', () => {
		// Мертвий запис — це чужий origin, якому ми досі дозволяємо вантажити
		// щось на нашу сторінку. Він нічого не ламає й тому живе роками.
		const text = sources.map(read).join('\n');
		const unused = allowedHosts.filter((host) => !text.includes(host));
		expect(
			unused,
			`дозволені політикою, але не згадані в src/ — прибрати з директив:\n${unused.join('\n')}`
		).toEqual([]);
	});
});
