// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Версія має рівно одне джерело (VERSIONING-v8 § 2, § 6).
 *
 * Проєкт іде підходом A — build-time injection: `vite.config.ts` читає
 * `package.json` і підставляє `__APP_VERSION__`. Підхід B (`app-version.json` і
 * runtime fetch) не застосований, тож перевірки з § 6 про той файл тут не існує —
 * писати її означало б перевіряти відсутнє.
 *
 * Лишається те, що застосовне: другого джерела бути не має. Захардкоджений рядок
 * ламається тихо — версія в звіті логів перестає збігатися з тим, що насправді
 * виконується, і звіт починає вказувати не на ту збірку. Помітно це тоді, коли за
 * звітом уже шукають дефект, тобто в найгірший момент.
 *
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1) — у повідомленні коміту, що
 * додав цей файл.
 */

const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (/\.(ts|svelte)$/.test(entry)) out.push(full.replace(/\\/g, '/'));
	}
	return out;
};

/** Сам цей файл виключено: нижче цитується саме та форма, яку він забороняє. */
const sources = walk('src').filter((f) => !f.endsWith('version.test.ts'));

describe('версіонування', () => {
	it('перевірка жива: джерела знайдено', () => {
		expect(sources.length, 'сканер шукає не там').toBeGreaterThan(50);
	});

	it('версія ніде не захардкоджена (§ 6)', () => {
		const bad = sources.filter((f) =>
			/const\s+\w*VERSION\w*\s*=\s*['"]\d+\.\d+\.\d+['"]/i.test(readFileSync(f, 'utf8'))
		);
		expect(bad, `друге джерело версії:\n${bad.join('\n')}`).toEqual([]);
	});

	it('єдине джерело — package.json через define (§ 2, підхід A)', () => {
		const config = readFileSync('vite.config.ts', 'utf8');
		expect(config, 'версія має читатися з package.json, а не стояти рядком').toMatch(
			/__APP_VERSION__:\s*JSON\.stringify\(pkg\.version\)/
		);
	});
});
