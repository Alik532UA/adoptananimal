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
		expect(Object.keys(all).length, 'залежностей не знайдено — перевірка мертва').toBeGreaterThan(0);

		const floating = Object.entries(all)
			.filter(([, range]) => range === '*' || range === 'latest' || range.startsWith('http'))
			.map(([name, range]) => `${name}: ${range}`);
		expect(floating, `невідтворювані версії: ${floating.join(', ')}`).toEqual([]);
	});

	it('engines.node оголошено і збігається з версією в CI (§ 2.3)', () => {
		// Без цього рядка версія Node існує лише у workflow, і локальна збірка на
		// іншій мажорній може поводитися інакше, ніж та, що поїде на хостинг.
		const declared = pkg.engines?.node;
		expect(declared, 'engines.node не оголошено').toBeDefined();

		const workflow = readFileSync(join(ROOT, '.github/workflows/deploy.yml'), 'utf8');
		const inCi = /node-version:\s*'?(\d+)/.exec(workflow)?.[1];
		expect(inCi, 'у workflow немає node-version — перевірка мертва').toBeDefined();

		const floor = /(\d+)/.exec(declared as string)?.[1];
		expect(
			floor,
			`engines.node каже «${declared}», а CI ставить Node ${inCi} — збірка перевіряється не тією версією`
		).toBe(inCi);
	});
});
