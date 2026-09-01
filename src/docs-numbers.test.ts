// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Numbers written in prose are checked against the thing they describe
 * (AI-AGENT-PITFALLS-v8 § 5.5.1, `PIT-NUMBER-UNDER-GATE`).
 *
 * § 5.5 asks for a number to be MEASURED. That is not enough on its own: the
 * measurement is true at the moment it is written and starts drifting with the next
 * commit, and from then on it is read as fact precisely because it once was one.
 *
 * Found here on 2026-09-02, in a repository that already knew the class:
 *
 * | Where            | Written                          | Actually            |
 * |------------------|----------------------------------|---------------------|
 * | `AGENTS.md`      | 42 + 12 check files              | 43 + 12             |
 * | `AGENTS.md`      | dev port 5173, per `launch.json` | 5195 in that file   |
 * | `README.md`      | dev port 5173                    | as above            |
 * | `README.md`      | `uk` is the default language     | `en` is             |
 * | `README.md`      | seven Playwright suites, named   | twelve              |
 * | `.gitattributes` | 20 gates of 38                   | 38 was already 43   |
 *
 * The language line is the worst of them, and not because of arithmetic: it is the
 * first paragraph of the front door, it contradicts `AGENTS.md` and ADR 0001, and
 * anyone who believed it would look for `/uk/...` as the canonical address of a page
 * that lives at the root.
 *
 * The canon offers two ways out — put the number under a gate, or do not write it.
 * Both are used below: what is useful to know at a glance is checked here, and the
 * fraction in `.gitattributes` was dropped in favour of naming the gates it meant.
 */

const read = (file: string) => readFileSync(file, 'utf8');

/** Same walk and the same two suffixes as `scripts/check-test-discovery.js`. */
const IS_CHECK_FILE = /\.(spec|test)\.(ts|js)$/;
const walk = (dir: string, out: string[] = []): string[] => {
	if (!existsSync(dir)) return out;
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (IS_CHECK_FILE.test(entry)) out.push(full.replace(/\\/g, '/'));
	}
	return out;
};

describe('числа в прозі', () => {
	it('AGENTS.md називає стільки файлів перевірок, скільки їх на диску', () => {
		const claimed = read('AGENTS.md').match(/усі (\d+) \+ (\d+) файлів перевірок/);
		expect(claimed, 'рядок про check:discovery в AGENTS.md зник або переписаний').not.toBeNull();

		const [, unit, e2e] = claimed!;
		expect(
			[Number(unit), Number(e2e)],
			'оновити AGENTS.md після додавання або видалення файлу перевірки'
		).toEqual([walk('src').length, walk('tests').length]);
	});

	it('AGENTS.md перелічує рівно ті набори Playwright, що лежать у tests/', () => {
		const agents = read('AGENTS.md');
		const onDisk = readdirSync('tests')
			.filter((f) => f.endsWith('.spec.ts'))
			.map((f) => f.replace(/\.spec\.ts$/, ''))
			.sort();

		const missing = onDisk.filter((name) => !agents.includes(`\`${name}\``));
		expect(missing, 'набір є в tests/, але AGENTS.md про нього не знає').toEqual([]);

		// The word, not only the list: "дванадцять" is what a reader takes away.
		const WORDS = [
			'',
			'один',
			'два',
			'три',
			'чотири',
			'п’ять',
			'шість',
			'сім',
			'вісім',
			'дев’ять',
			'десять',
			'одинадцять',
			'дванадцять',
			'тринадцять',
			'чотирнадцять'
		];
		const word = WORDS[onDisk.length];
		expect(word, `немає слова для числа ${onDisk.length} — доповнити перелік`).toBeTruthy();
		expect(
			agents.includes(`**${word}** файлів у \`tests/\``),
			`AGENTS.md має сказати «${word} файлів у \`tests/\`»`
		).toBe(true);
	});

	it('README.md і AGENTS.md називають типовою ту мову, яка типова в коді', () => {
		const locales = read('src/lib/i18n/locales.ts');
		const fallback = locales.match(/DEFAULT_LOCALE:\s*Locale\s*=\s*'([a-z]{2})'/)?.[1];
		expect(fallback, 'DEFAULT_LOCALE не читається з locales.ts').toBeTruthy();

		// Any code in backticks with the word "типова" just after it, whatever the
		// sentence around it: README says "`en` (типова, без префікса)", AGENTS.md says
		// "`en` типова й без префікса", and a check tied to either shape would pass on
		// the other by finding nothing at all.
		const CLAIM = /`([a-z]{2})`[^\n]{0,12}типова/g;

		for (const file of ['README.md', 'AGENTS.md']) {
			const claims = [...read(file).matchAll(CLAIM)].map((m) => m[1]);
			expect(claims.length, `${file} більше не каже, яка мова типова`).toBeGreaterThan(0);
			expect(
				claims.filter((code) => code !== fallback),
				`${file} називає типовою мову, якою вона не є`
			).toEqual([]);
		}
	});

	/**
	 * Ports, not sentences. Matching the shape of the paragraph would break on the
	 * next rewording and prove nothing; what has to hold is that both numbers a
	 * reader will act on are the numbers the two config files actually carry.
	 *
	 * `npm run dev` on its own still lands on Vite's default 5173, and the docs say
	 * so — that is a fact about Vite, not about this repository, so it is prose here
	 * and nothing more.
	 */
	it('порти в документації — ті, що в .claude/launch.json і playwright.config.ts', () => {
		const launch = JSON.parse(read('.claude/launch.json')) as {
			configurations: { name: string; port: number }[];
		};
		const dev = launch.configurations.find((c) => c.name.endsWith('-dev'));
		expect(dev, 'у launch.json немає конфігурації, що закінчується на -dev').toBeTruthy();

		const e2ePort = read('playwright.config.ts').match(/const PORT = (\d{4});/)?.[1];
		expect(e2ePort, 'PORT не читається з playwright.config.ts').toBeTruthy();

		for (const file of ['README.md', 'AGENTS.md']) {
			const text = read(file);
			expect(text.includes(`**${dev!.port}**`), `${file} не називає порт dev із launch.json`).toBe(
				true
			);
			expect(text.includes(e2ePort!), `${file} не називає порт, на якому працює Playwright`).toBe(
				true
			);
		}
	});
});
