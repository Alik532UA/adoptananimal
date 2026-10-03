// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_BETA_CHECKS, BETA_TABS } from '$lib/data/beta/tabs';
import type { BetaCheck } from '$lib/data/beta/types';

/**
 * The progress controller — CODE-QUALITY-v8 § 3.1 ("every `.svelte.ts` controller has a
 * test file beside it") and BETA-CHECKLIST-v8's own BETA-VERSION-STAMP, which names a
 * unit test of this service as the way that rule is held.
 *
 * It was the one controller of three without one, and coverage put a number on it: 0%.
 * The e2e suite does drive the page, so the behaviour was not unwatched — but what e2e
 * proves is that a click leaves a mark on screen. It cannot ask what happens to a mark
 * that arrived from build 0.22.9, because it has no way to produce one: every mark it
 * makes carries the version of the build it is running against.
 *
 * That gap matters more than its size. The version stamp is the whole reason a mark is
 * an object rather than a string, and the failure mode it exists to prevent is silent:
 * a checklist that cannot tell a tick from forty commits ago from today's turns into a
 * report about the past that gets read as a report about the present.
 *
 * `$app/environment` is mocked because the storage facade reads `browser` and returns
 * `null` for everything when it is false — the controller would then be tested against
 * a facade that never stores anything, which is the shape of a passing test that proves
 * nothing.
 */

vi.mock('$app/environment', () => ({ browser: true, dev: true }));

const PREFIX = 'adoptananimal_';
const KEY = `${PREFIX}beta_marks`;

/** Minimal Web Storage. Same shape as the one in `storage.test.ts`, and for the same
 *  reason: the facade walks keys by index in `clear()`, which a bare Map cannot do. */
function makeStorage(): Storage {
	const data = new Map<string, string>();
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

/**
 * A fresh module per test. The controller is a module-level singleton that reads
 * storage in its constructor, so seeding has to happen before the import — otherwise
 * every test after the first would share one instance and the constructor branch would
 * never run again.
 */
async function load(seed?: Record<string, { vote: string; version: string }>) {
	vi.resetModules();
	const store = makeStorage();
	if (seed) store.setItem(KEY, JSON.stringify(seed));
	vi.stubGlobal('localStorage', store);
	const { betaProgress } = await import('./betaProgress.svelte');
	return { betaProgress, store };
}

const stored = (store: Storage) => JSON.parse(store.getItem(KEY) ?? '{}');

/** A build that is not this one. Derived, so it stays wrong after every version bump. */
const OTHER_VERSION = `${__APP_VERSION__}-old`;

/**
 * A real item that claims a test file, picked from the checklist rather than invented:
 * the report looks its text up by id, so a made-up id would exercise the "unknown item"
 * branch instead of the one under test.
 *
 * Narrowed by a type guard so `.test` is reachable — on the union it exists only on the
 * `covered` arm, and reaching for it through a ternary would have written an assertion
 * that passes on the empty string.
 */
const coveredCheck = ALL_BETA_CHECKS.find(
	(check): check is Extract<BetaCheck, { coverage: 'covered' }> => check.coverage === 'covered'
);
if (!coveredCheck) throw new Error('no checklist item claims coverage — those cases cannot run');

/** Any real item: a made-up id is dropped on load by § 8.6, so it must be real. */
const someCheck = ALL_BETA_CHECKS[0];

describe('beta progress', () => {
	beforeEach(() => {
		vi.stubGlobal('navigator', { userAgent: 'test-agent' });
		vi.stubGlobal('document', {
			documentElement: { lang: 'uk', dataset: { theme: 'dark', style: 'playful' } }
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('the checklist has items at all — the check is alive', () => {
		expect(
			ALL_BETA_CHECKS.length,
			'no checks found; every assertion below is vacuous'
		).toBeGreaterThan(10);
	});

	it('reads what an earlier session left behind', async () => {
		const { betaProgress } = await load({ common_1: { vote: 'ok', version: __APP_VERSION__ } });
		expect(betaProgress.marks.common_1).toEqual({ vote: 'ok', version: __APP_VERSION__ });
	});

	it('starts empty when storage holds nothing', async () => {
		const { betaProgress } = await load();
		expect(betaProgress.marks).toEqual({});
		expect(betaProgress.markedOnThisVersion).toBe(0);
	});

	it('stamps a vote with the running build and persists it', async () => {
		const { betaProgress, store } = await load();
		betaProgress.vote('common_1', 'ok');

		expect(betaProgress.marks.common_1).toEqual({ vote: 'ok', version: __APP_VERSION__ });
		expect(stored(store).common_1.version, 'the mark reached storage unstamped').toBe(
			__APP_VERSION__
		);
	});

	it('the same answer twice is an unmark — the fourth state is «not checked»', async () => {
		const { betaProgress, store } = await load();
		betaProgress.vote('common_1', 'ok');
		betaProgress.vote('common_1', 'ok');

		expect(betaProgress.marks.common_1).toBeUndefined();
		expect(stored(store), 'the unmark stayed in memory only').toEqual({});
	});

	it('a different answer replaces rather than unmarks', async () => {
		const { betaProgress } = await load();
		betaProgress.vote('common_1', 'ok');
		betaProgress.vote('common_1', 'fail');

		expect(betaProgress.marks.common_1.vote).toBe('fail');
	});

	it('the same answer as a mark from ANOTHER build re-stamps it', async () => {
		// The expensive case, and the one no e2e run can produce. Treating it as a repeat
		// would erase the tester's answer at the moment they confirmed it on a new build —
		// they pressed «works» and the item went back to «not checked».
		const { betaProgress } = await load({ common_1: { vote: 'ok', version: OTHER_VERSION } });
		betaProgress.vote('common_1', 'ok');

		expect(betaProgress.marks.common_1).toEqual({ vote: 'ok', version: __APP_VERSION__ });
	});

	it('a mark from another build is stale, one from this build is not', async () => {
		const { betaProgress } = await load({
			common_1: { vote: 'ok', version: OTHER_VERSION },
			common_2: { vote: 'ok', version: __APP_VERSION__ }
		});

		expect(betaProgress.isStale('common_1')).toBe(true);
		expect(betaProgress.isStale('common_2')).toBe(false);
		expect(betaProgress.isStale('never_marked')).toBe(false);
	});

	it('only this build counts towards progress', async () => {
		const { betaProgress } = await load({
			common_1: { vote: 'ok', version: OTHER_VERSION },
			common_2: { vote: 'fail', version: __APP_VERSION__ }
		});

		expect(betaProgress.markedOnThisVersion, 'a stale mark was counted').toBe(1);
		expect(betaProgress.total).toBe(ALL_BETA_CHECKS.length);
	});

	it('clearing empties the marks and the storage key together', async () => {
		const { betaProgress, store } = await load({
			common_1: { vote: 'ok', version: __APP_VERSION__ }
		});
		betaProgress.clear();

		expect(betaProgress.marks).toEqual({});
		expect(store.getItem(KEY), 'the key survived the clear').toBeNull();
	});

	/**
	 * § 6.3 `BETA-CLEAR-TWO-STEP`. Erasing is the only irreversible action on the page
	 * and it sits in the same row as «Copy report», which gets reached for every time.
	 * The cost is asymmetric: an hour of work against one extra click.
	 */
	it('needs two presses to erase', async () => {
		const { betaProgress, store } = await load();
		betaProgress.vote(someCheck.id, 'ok');

		expect(betaProgress.requestClear(), 'the first press already erased').toBe(false);
		expect(betaProgress.clearArmed).toBe(true);
		expect(betaProgress.markedOnThisVersion, 'one press wiped the whole session').toBe(1);
		expect(store.getItem(KEY), 'storage was cleared on the first step').not.toBeNull();

		expect(betaProgress.requestClear()).toBe(true);
		expect(betaProgress.markedOnThisVersion).toBe(0);
		expect(betaProgress.clearArmed, 'the button stayed armed after erasing').toBe(false);
	});

	it('disarms without erasing', async () => {
		const { betaProgress } = await load();
		betaProgress.vote(someCheck.id, 'ok');
		betaProgress.requestClear();
		betaProgress.disarmClear();

		expect(betaProgress.clearArmed).toBe(false);
		expect(betaProgress.markedOnThisVersion).toBe(1);
	});

	/**
	 * § 8.6 `BETA-MARKS-UNTRUSTED`. A mark left behind by a removed item has a
	 * perfectly valid shape, so it used to pass and keep counting — the page then
	 * showed «40 / 38», a number that means nothing and has nowhere to be fixed.
	 */
	it('drops a mark whose item is gone from the checklist', async () => {
		const { betaProgress } = await load({
			[someCheck.id]: { vote: 'ok', version: __APP_VERSION__ },
			removed_99: { vote: 'ok', version: __APP_VERSION__ }
		});

		expect(betaProgress.marks[someCheck.id], 'dead check: the real mark went too').toBeDefined();
		expect(Object.keys(betaProgress.marks), 'the removed item kept its mark').toEqual([
			someCheck.id
		]);
		expect(betaProgress.markedOnThisVersion).toBe(1);
	});

	it('drops a mark of the wrong shape', async () => {
		const { betaProgress } = await load({
			[someCheck.id]: { vote: 'maybe', version: __APP_VERSION__ }
		} as never);

		expect(Object.keys(betaProgress.marks)).toEqual([]);
	});

	/**
	 * § 8.1 `BETA-TAB-PROGRESS`. The overall count does not answer the only question a
	 * tester asks: is THIS tab finished.
	 */
	it('counts progress per tab, and only for this version', async () => {
		const { betaProgress } = await load();
		const own = BETA_TABS[0];
		const other = BETA_TABS[1];

		expect(betaProgress.progressOf(own.checks).total).toBe(own.checks.length);
		expect(betaProgress.progressOf(own.checks).done).toBe(0);

		betaProgress.vote(own.checks[0].id, 'ok');
		expect(betaProgress.progressOf(own.checks).done).toBe(1);
		expect(betaProgress.progressOf(other.checks).done, 'the mark leaked into another tab').toBe(0);
	});
});

describe('the report', () => {
	beforeEach(() => {
		vi.stubGlobal('navigator', { userAgent: 'test-agent' });
		vi.stubGlobal('document', {
			documentElement: { lang: 'uk', dataset: { theme: 'dark', style: 'playful' } }
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('says so when nothing has been marked', async () => {
		const { betaProgress } = await load();
		const report = betaProgress.report();

		expect(report).toContain(`VERSION: v${__APP_VERSION__}`);
		expect(report).toContain(`MARKED: 0 of ${ALL_BETA_CHECKS.length}`);
		expect(report).toContain('(нічого не позначено)');
	});

	it('puts what is broken first', async () => {
		// The order is the point: the reader is looking for failures, and a report that
		// opens with forty green lines is one nobody reads to the end.
		const { betaProgress } = await load({
			common_1: { vote: 'ok', version: __APP_VERSION__ },
			common_2: { vote: 'fail', version: __APP_VERSION__ },
			common_3: { vote: 'unclear', version: __APP_VERSION__ }
		});
		const report = betaProgress.report();

		expect(report.indexOf('НЕ ПРАЦЮЄ')).toBeLessThan(report.indexOf('НЕ ЗРОЗУМІЛО'));
		expect(report.indexOf('НЕ ЗРОЗУМІЛО')).toBeLessThan(report.lastIndexOf('[ПРАЦЮЄ]'));
	});

	it('normalizes legacy weird vote to unclear', async () => {
		const { betaProgress } = await load({
			common_1: { vote: 'weird', version: __APP_VERSION__ }
		});
		expect(betaProgress.marks.common_1.vote).toBe('unclear');
	});

	it('labels a mark that came from another build', async () => {
		const { betaProgress } = await load({ common_1: { vote: 'ok', version: OTHER_VERSION } });
		expect(betaProgress.report()).toContain(`(v${OTHER_VERSION})`);
	});

	it('shouts when an item that claims test coverage is the one that failed', async () => {
		// A report about the TEST rather than about the site, and it devalues every green
		// run until someone looks at it — which is why it gets a line of its own.
		const { betaProgress } = await load({
			[coveredCheck.id]: { vote: 'fail', version: __APP_VERSION__ }
		});
		const report = betaProgress.report();

		expect(report).toContain('ПУНКТ ПОКРИТО АВТОТЕСТОМ');
		// The file name, not just the shout: a warning that does not say which test is
		// suspect leaves the reader with the whole suite to look through.
		expect(report).toContain(coveredCheck.test);
	});

	it('stays quiet about a covered item that passed', async () => {
		const { betaProgress } = await load({
			[coveredCheck.id]: { vote: 'ok', version: __APP_VERSION__ }
		});

		expect(betaProgress.report()).not.toContain('ПУНКТ ПОКРИТО АВТОТЕСТОМ');
	});

	it('ignores an id that no longer exists in the checklist', async () => {
		// Storage outlives the code. An item removed between builds leaves its mark
		// behind, and looking up its text would throw on the reader's machine.
		const { betaProgress } = await load({ removed_99: { vote: 'ok', version: __APP_VERSION__ } });

		expect(() => betaProgress.report()).not.toThrow();
		expect(betaProgress.report()).toContain('(нічого не позначено)');
	});
});
