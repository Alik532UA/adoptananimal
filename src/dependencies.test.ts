// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * DEPENDENCIES-v8 § 6 — стан `package.json` як інваріант.
 *
 * canon.json називає GATE-DEPS серед блокуючих гейтів. Усе, що тут ловиться,
 * має спільну рису: воно не проявляється на машині, де його зробили. Другий
 * lockfile працює, доки всі ставлять залежності тим самим менеджером; `latest`
 * у версії відтворюється, доки нікого не оновили; інструмент збірки в
 * `dependencies` нічого не ламає взагалі — він лише розширює те, що `npm audit
 * --omit=dev` вважає поверхнею атаки, тобто тихо звужує звіт про безпеку.
 */

const ROOT = process.cwd();
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	engines?: Record<string, string>;
};

const LOCKFILES = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'];

describe('залежності', () => {
	it('рівно один менеджер пакетів (§ 2.1)', () => {
		// Два lockfile у корені — це дві різні збірки, і яка з них поїде,
		// вирішує те, чим користувався останній.
		const found = LOCKFILES.filter((f) => existsSync(join(ROOT, f)));
		expect(found, `знайдено кілька lockfile: ${found.join(', ')}`).toHaveLength(1);
	});

	it('інструменти збірки не в dependencies (§ 2.2)', () => {
		const runtime = Object.keys(pkg.dependencies ?? {});
		expect(runtime.length, 'жодної прод-залежності — перевірка мертва').toBeGreaterThan(0);

		const buildOnly = runtime.filter((name) =>
			/^(vite|vitest|typescript|svelte-check|prettier|eslint|globals|tsx|@sveltejs\/(kit|adapter|vite-plugin)|@playwright|@axe-core|@eslint|@types)/.test(
				name
			)
		);
		expect(buildOnly, `мають бути у devDependencies: ${buildOnly.join(', ')}`).toEqual([]);
	});

	it('немає плаваючих версій (§ 2.3)', () => {
		const all = { ...pkg.dependencies, ...pkg.devDependencies };
		expect(Object.keys(all).length, 'залежностей не знайдено — перевірка мертва').toBeGreaterThan(
			0
		);

		const floating = Object.entries(all)
			.filter(([, range]) => range === '*' || range === 'latest' || range.startsWith('http'))
			.map(([name, range]) => `${name}: ${range}`);
		expect(floating, `невідтворювані версії: ${floating.join(', ')}`).toEqual([]);
	});

	/**
	 * Версія Node у ТРЬОХ місцях, а не у двох (§ 2.3, CI-CD-AND-TOOLS-v8 § 1.2).
	 *
	 * Доти тут звірялися лише `engines.node` і `node-version` у workflow, а
	 * `.nvmrc` у проєкті не було зовсім — єдиний такий випадок із восьми
	 * репозиторіїв. Хвиля «версія Node у трьох місцях і під гейтом» (23.08)
	 * пройшла по сусідах і сіла тут на два місця.
	 *
	 * Чому третє місце не косметика: `engines` — це лише ПОРІГ, який npm за
	 * замовчуванням не примушує, а `node-version` живе в CI. Локальна версія при
	 * цьому не звіряється ні з чим, і розбіжність дає найнеприємніший клас
	 * падіння: у CI зелено, локально не відтворюється, бо локально стоїть третя
	 * версія. `.nvmrc` — те єдине, що читають `nvm`, `fnm` і `volta`.
	 *
	 * Форма `engines.node` — `">=X"` чи `">=X.Y.Z"`: порівнюються МАЖОРИ, а не
	 * рядки, інакше `">=22"` і `">=22.12.0"` читалися б як розбіжність.
	 */
	it('engines.node, .nvmrc і node-version у CI називають той самий мажор (§ 2.3)', () => {
		const declared = pkg.engines?.node;
		expect(declared, 'engines.node не оголошено').toBeDefined();

		const majorOfRange = (range: string): number | null => {
			const m = /^>=\s*(\d+)/.exec(range.trim());
			return m ? Number(m[1]) : null;
		};
		const enginesMajor = majorOfRange(declared as string);
		expect(enginesMajor, `engines.node="${declared}" не у формі ">=X"`).not.toBeNull();

		expect(
			existsSync(join(ROOT, '.nvmrc')),
			'немає .nvmrc — локальна версія ні з чим не звіряється'
		).toBe(true);
		const nvmrcMajor = Number(
			readFileSync(join(ROOT, '.nvmrc'), 'utf8').trim().replace(/^v/, '').split('.')[0]
		);
		expect(nvmrcMajor, '.nvmrc не містить номера версії').not.toBeNaN();

		// Усі згадки, а не перша: два кроки на різних мажорах — це саме те
		// розходження, яке ця перевірка мусить бачити, а `exec` побачив би лише один.
		const workflow = readFileSync(join(ROOT, '.github/workflows/deploy.yml'), 'utf8');
		const ciMajors = [...workflow.matchAll(/node-version:\s*["']?v?(\d+)/g)].map((m) =>
			Number(m[1])
		);
		expect(
			ciMajors.length,
			'у workflow немає node-version — перевірка мертва'
		).toBeGreaterThan(0);

		const mismatch = [...new Set(ciMajors.filter((v) => v !== nvmrcMajor))];
		expect(
			mismatch,
			`node-version у CI (${mismatch.join(', ')}) розходиться з .nvmrc (${nvmrcMajor})`
		).toEqual([]);
		expect(
			nvmrcMajor,
			`.nvmrc ${nvmrcMajor} не збігається з мажором engines.node "${declared}"`
		).toBe(enginesMajor);
	});
});
