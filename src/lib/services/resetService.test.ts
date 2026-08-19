// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * DBG-HARD-RESET — the one CRITICAL rule of DEBUGGING-v8 (§ 3.4), and the only place in
 * this project where a bug destroys data that is not ours.
 *
 * The origin `alik532ua.github.io` is shared with the sibling projects. Three of the
 * four browser APIs this function touches are ORIGIN-wide by design: `caches.keys()`
 * lists every cache on the host, `getRegistrations()` every service worker on it, and
 * `localStorage.clear()` wipes the lot. The reset is correct only because each half
 * filters, and every filter is one expression long. Deleting one is a two-character
 * edit whose entire visible effect is that a reset works — on the machine of whoever
 * made it, where there are no neighbours.
 *
 * The canon names a source invariant for this ("no `localStorage.clear()`, filters by
 * prefix and by scope"). Half of that is already held by ESLint, which forbids reaching
 * for `localStorage` outside the facade. The other half is a claim about behaviour, and
 * a grep for the word `filter` cannot tell a filter that keeps our own from one that
 * keeps everyone else's. So it is asked here as a question: put a neighbour's cache and
 * a neighbour's worker in front of the reset and require that they survive it.
 *
 * `resetService.ts` was at 0% coverage before this file, and coverage is what found it.
 */

const PREFIX = 'adoptananimal_';
const ORIGIN = 'https://alik532ua.github.io';
const BASE = '/adoptananimal';

vi.mock('$app/environment', () => ({ browser: true, dev: false }));
vi.mock('$app/paths', () => ({ base: BASE }));

/** Minimal Web Storage — indexed, because the facade's `clear()` walks keys by index. */
function makeStorage(seed: Record<string, string> = {}): Storage {
	const data = new Map(Object.entries(seed));
	return {
		get length() {
			return data.size;
		},
		key: (i: number) => [...data.keys()][i] ?? null,
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		removeItem: (k: string) => void data.delete(k),
		clear: () => data.clear()
	} as Storage;
}

const keysOf = (store: Storage) =>
	Array.from({ length: store.length }, (_, i) => store.key(i)).filter(
		(k): k is string => k !== null
	);

interface World {
	local: Storage;
	session: Storage;
	deletedCaches: string[];
	unregistered: string[];
	cookieWrites: string[];
	reloaded: () => number;
}

/**
 * A browser with a neighbour already living in it.
 *
 * Every collection here holds at least one entry belonging to someone else, and that is
 * the whole design of this file: a reset that deletes everything passes a test that only
 * checks that our own things are gone.
 */
function makeWorld(overrides: { confirm?: boolean; brokenCookies?: boolean } = {}): World {
	const local = makeStorage({
		[`${PREFIX}theme`]: 'dark',
		[`${PREFIX}favorites`]: '["cat_mia"]',
		vetcrewgames_progress: 'level-7'
	});
	const session = makeStorage({
		[`${PREFIX}logs`]: '[]',
		vetcrewgames_session: 'x'
	});

	const deletedCaches: string[] = [];
	const unregistered: string[] = [];
	const cookieWrites: string[] = [];
	let reloads = 0;

	vi.stubGlobal('window', globalThis);
	vi.stubGlobal('localStorage', local);
	vi.stubGlobal('sessionStorage', session);
	vi.stubGlobal('confirm', () => overrides.confirm ?? true);
	vi.stubGlobal('location', { origin: ORIGIN, reload: () => void reloads++ });

	vi.stubGlobal('caches', {
		keys: async () => [`${PREFIX}assets-v1`, `${PREFIX}pages`, 'vetcrewgames_assets', 'workbox-x'],
		delete: async (name: string) => void deletedCaches.push(name)
	});

	vi.stubGlobal('navigator', {
		serviceWorker: {
			getRegistrations: async () => [
				{ scope: `${ORIGIN}${BASE}/`, unregister: async () => void unregistered.push('ours') },
				{
					scope: `${ORIGIN}/VetCrewGames/`,
					unregister: async () => void unregistered.push('neighbour')
				},
				{ scope: `${ORIGIN}/`, unregister: async () => void unregistered.push('root') }
			]
		}
	});

	vi.stubGlobal('document', {
		get cookie() {
			return 'lang=uk; theme=dark';
		},
		set cookie(value: string) {
			if (overrides.brokenCookies) throw new Error('cookies blocked');
			cookieWrites.push(value);
		}
	});

	return { local, session, deletedCaches, unregistered, cookieWrites, reloaded: () => reloads };
}

/** Fresh module per test: the facade and the paths mock are both read at import time. */
async function loadReset() {
	vi.resetModules();
	return (await import('./resetService')).hardReset;
}

describe('emergency reset', () => {
	let world: World;

	beforeEach(() => {
		world = makeWorld();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('takes our storage keys and leaves the neighbour theirs', async () => {
		const hardReset = await loadReset();
		await hardReset(false);

		expect(keysOf(world.local), "a neighbour's key was destroyed").toEqual([
			'vetcrewgames_progress'
		]);
		expect(keysOf(world.session)).toEqual(['vetcrewgames_session']);
	});

	it('deletes only caches carrying the project prefix', async () => {
		// `caches.keys()` is origin-wide. Without the filter this line reads
		// "reset the domain", not "reset this site".
		const hardReset = await loadReset();
		await hardReset(false);

		expect(world.deletedCaches.sort()).toEqual([`${PREFIX}assets-v1`, `${PREFIX}pages`]);
	});

	it('unregisters only workers whose scope is under our base', async () => {
		// Origin-wide again, and worse: an unregistered worker takes the neighbour's
		// offline site with it. The root-scoped one is the trap — it is a prefix of
		// nothing and contains everything.
		const hardReset = await loadReset();
		await hardReset(false);

		expect(world.unregistered).toEqual(['ours']);
	});

	it('expires cookies on our own path, so the write deletes instead of duplicating', async () => {
		const hardReset = await loadReset();
		await hardReset(false);

		expect(world.cookieWrites).toHaveLength(2);
		for (const write of world.cookieWrites) {
			expect(write, 'wrong path: the cookie is duplicated, not removed').toContain(`path=${BASE}`);
			expect(write).toContain('expires=Thu, 01 Jan 1970');
		}
	});

	it('reloads once everything is swept', async () => {
		const hardReset = await loadReset();
		await hardReset(false);

		expect(world.reloaded()).toBe(1);
	});

	it('a refused confirmation changes nothing at all', async () => {
		vi.unstubAllGlobals();
		world = makeWorld({ confirm: false });
		const hardReset = await loadReset();

		await hardReset(true);

		expect(keysOf(world.local)).toHaveLength(3);
		expect(world.deletedCaches).toEqual([]);
		expect(world.unregistered).toEqual([]);
		expect(world.reloaded(), 'the page reloaded after the visitor said no').toBe(0);
	});

	it('one half failing does not cancel the others', async () => {
		// The reason each half has its own `try`. A reset runs when things are already
		// broken, so "cookies refused, therefore the caches stayed" is the wrong answer.
		vi.unstubAllGlobals();
		world = makeWorld({ brokenCookies: true });
		const hardReset = await loadReset();

		await expect(hardReset(false)).resolves.toBeUndefined();

		expect(world.deletedCaches).toHaveLength(2);
		expect(world.unregistered).toEqual(['ours']);
		expect(world.reloaded()).toBe(1);
	});

	it('survives a browser without the Cache API or service workers', async () => {
		vi.unstubAllGlobals();
		world = makeWorld();
		vi.stubGlobal('caches', undefined);
		vi.stubGlobal('navigator', {});
		const hardReset = await loadReset();

		await expect(hardReset(false)).resolves.toBeUndefined();
		expect(world.reloaded(), 'the reset gave up before reloading').toBe(1);
	});
});
