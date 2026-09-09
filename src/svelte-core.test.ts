// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * SVELTE-CORE-v9 §§ 1.6 and 2.2.2 — the two source-level rules behind
 * `GATE-SVELTE-SOURCES`.
 *
 * SVELTE-CORE-v9 § 1.6 — a `$state` proxy must not cross into an outside API.
 *
 * `$state` hands back a Proxy, not the object. Everything inside the app reads through
 * it and never notices; everything OUTSIDE it either notices or, worse, half-notices.
 * `structuredClone` throws on a proxy outright. `JSON.stringify` does not — it walks the
 * traps and produces the right text — which is exactly what makes this class expensive:
 * the wrong version works, is committed, and breaks later when the same value is handed
 * to something stricter, or when a nested field starts holding a class instance.
 *
 * The project already knew the rule: `settings.svelte.ts` snapshots its favourites and
 * says so in a comment naming this very section. Two other places did not, and nothing
 * was comparing them — which is the difference between a convention and a gate.
 *
 * `.slice()` and spread do not count as the fix, and that is the point worth stating.
 * They unwrap ONE level: `this.logs.slice(-200)` is a plain array of proxied entries,
 * and `{ ...this.marks }` is a plain object of proxied values. Both read as done.
 */

const ROOT = resolve(__dirname, '..');
const SELF = 'src/svelte-core.test.ts';

const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');

/** Runes only compile in these two, so nowhere else can hold a `$state` field. */
function runeFiles(dir = 'src', out: string[] = []): string[] {
	for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) runeFiles(path, out);
		else if (/\.svelte$|\.svelte\.ts$/.test(entry.name) && path !== SELF) out.push(path);
	}
	return out;
}

/**
 * Calls that leave the app: serialisation, cloning, the storage facade's JSON door.
 * Each takes the value apart with something other than a property read, which is the
 * one thing the proxy cannot make transparent.
 */
const CROSSINGS = /\b(JSON\.stringify|structuredClone|setJSON|postMessage)\s*\(/g;

const files = runeFiles().map((path) => ({ path, text: read(path) }));

describe('§ 1.6 — what crosses out of the app is a snapshot, not a proxy', () => {
	const stateful = files
		.map((file) => ({
			...file,
			// `name = $state(...)`, `let name = $state(...)`, `name = $state<T>(...)`.
			fields: [
				...file.text.matchAll(/(?:^|\s)(?:let\s+)?([A-Za-z_$][\w$]*)\s*=\s*\$state[<(]/g)
			].map((m) => m[1])
		}))
		.filter((file) => file.fields.length > 0);

	it('the scan finds rune state at all — the check is alive', () => {
		expect(stateful.length, 'no $state field found anywhere — the walker is lost').toBeGreaterThan(
			3
		);
	});

	it('no serialiser is handed a field declared with $state', () => {
		const bad: string[] = [];

		for (const { path, text, fields } of stateful) {
			for (const call of text.matchAll(CROSSINGS)) {
				// The argument list, up to the end of the statement. Long enough to hold a
				// nested call, short enough not to run into the next one.
				const args = text.slice(call.index, call.index + 240).split('\n')[0];
				if (args.includes('$state.snapshot')) continue;

				const leaked = fields.filter((field) =>
					new RegExp(`(this\\.|\\b)${field}\\b`).test(args.slice(call[0].length))
				);
				if (leaked.length > 0) {
					bad.push(`${path}: ${call[1]}(… ${leaked.join(', ')} …) without $state.snapshot`);
				}
			}
		}

		expect(bad, `a reactive proxy is leaving the app:\n${bad.join('\n')}`).toEqual([]);
	});
});

/**
 * § 2.2.2 — a listener is removed in the same file that adds it (`SC-LISTENER-CLEANUP`).
 *
 * The leak this catches is invisible by every other means. The page works, the tests
 * are green, and after twenty client-side navigations `window` carries twenty `resize`
 * handlers, each holding its component in memory. The compiler says nothing:
 * `addEventListener` without a pair is not its subject.
 *
 * The heuristic is per FILE, and deliberately crude: it does not prove the right
 * listener was removed, only that removal was thought about at all. Anything finer
 * would need to follow the identity of the handler function across a closure, and a
 * check that is nearly right about that is worse than one that is obviously rough.
 *
 * `AbortSignal` and `once: true` count as removal — they are the mechanism, not an
 * omission of it (§ 2.2.1). A `$effect` or attachment returning a cleanup function is
 * the shape most of this project uses, and it names `removeEventListener` inside, so
 * it needs no special case.
 */
const ATTACH = /\.addEventListener\s*\(|\.observe\s*\(|\bsetInterval\s*\(/;
const DETACH =
	/\.removeEventListener\s*\(|\.disconnect\s*\(|\.unobserve\s*\(|\bclearInterval\s*\(|once:\s*true|\bsignal\b/;

describe('§ 2.2.2 — що підписалося, те й відписується', () => {
	// Every source, not only the rune files: `imageQueue.ts` and `imageFallback.ts` add
	// listeners and hold no state at all.
	const sources = (function collect(dir = 'src', out: string[] = []): string[] {
		for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
			const path = `${dir}/${entry.name}`;
			if (entry.isDirectory()) collect(path, out);
			else if (/\.(svelte|ts)$/.test(entry.name) && !/\.(test|spec)\.ts$/.test(entry.name)) {
				out.push(path);
			}
		}
		return out;
	})().map((path) => ({ path, text: read(path) }));

	const attaching = sources.filter((file) => ATTACH.test(file.text));

	it('перевірка жива: файли з підписками знайдено', () => {
		// Zero subscribing files would report zero leaks, which reads like a project that
		// never touches the DOM. There are fourteen.
		expect(attaching.length, 'жодного addEventListener — обхід дивиться не туди').toBeGreaterThan(
			5
		);
	});

	it('у кожному файлі з підпискою є й зняття', () => {
		const leaking = attaching.filter((file) => !DETACH.test(file.text)).map((file) => file.path);

		expect(
			leaking,
			`підписка без пари — по одному слухачу на кожен перехід:\n${leaking.join('\n')}`
		).toEqual([]);
	});
});
