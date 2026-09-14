import { ALL_BETA_CHECKS, BETA_TABS } from '$lib/data/beta/tabs';
import type { BetaCheck } from '$lib/data/beta/types';
import { storage } from '$lib/services/storage';

export type Vote = 'fail' | 'weird' | 'ok';

/**
 * One answer, and the version it was given on (BETA-CHECKLIST-v8 § 3.1).
 *
 * The version is not decoration. A tick from forty commits ago looks exactly like
 * today's, and a list that cannot tell them apart turns into a report about the past
 * that gets read as a report about the present. A mark from another version does not
 * disappear — it still means something — but it is labelled and it does not count.
 */
export interface Mark {
	vote: Vote;
	version: string;
}

const STORAGE_KEY = 'beta_marks';

/**
 * Answers live in the browser, and the button turns them into text (§ 6.1).
 *
 * Not a table on a server: that would mean access rules and other people's names in a
 * database, for data nobody reads yet. Cheap to reverse — aggregation can be glued on
 * later without rewriting the page.
 */
const VOTES: readonly Vote[] = ['fail', 'weird', 'ok'];

function isMark(value: unknown): value is Mark {
	if (typeof value !== 'object' || value === null) return false;
	const m = value as Record<string, unknown>;
	return VOTES.includes(m.vote as Vote) && typeof m.version === 'string';
}

/**
 * What comes back from storage is UNTRUSTED INPUT (§ 8.6, `BETA-MARKS-UNTRUSTED`).
 *
 * The key outlives both the checklist and the shape of a mark. The commonest case is
 * the harmless-looking one and the worst: an item was REMOVED from the list and its
 * mark stayed behind. It has a perfectly valid shape, so it passed — and it kept
 * counting, so the page showed «40 / 38». There is no way to fix that from inside:
 * the item is gone from the list, so there is nothing left to unmark.
 */
function readMarks(): Record<string, Mark> {
	const raw = storage.getJSON<unknown>(STORAGE_KEY);
	if (typeof raw !== 'object' || raw === null) return {};

	const known = new Set(ALL_BETA_CHECKS.map((check) => check.id));
	const out: Record<string, Mark> = {};
	for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
		if (known.has(id) && isMark(value)) out[id] = value;
	}
	return out;
}

class BetaProgress {
	marks = $state<Record<string, Mark>>({});

	/**
	 * Whether the erase button is armed (§ 6.3, `BETA-CLEAR-TWO-STEP`).
	 *
	 * Erasing is the ONLY irreversible action on the page, and it sits in the same row
	 * as «Copy report», which gets reached for every single time. The cost is
	 * asymmetric: an hour of a tester's work against one extra click.
	 *
	 * Not `confirm()`: a native dialog blocks the thread, is untranslatable, looks
	 * foreign in every theme, and needs its own handler in headless — i.e. it would
	 * complicate the e2e of § 5.7 for nothing.
	 */
	clearArmed = $state(false);

	/** Read once at construction; the facade adds the project prefix and never throws. */
	constructor() {
		this.marks = readMarks();
	}

	vote(id: string, vote: Vote) {
		// Same answer again means «unmark»: the fourth state is «not checked», and
		// without a way back a mis-click is permanent.
		if (this.marks[id]?.vote === vote && this.marks[id]?.version === __APP_VERSION__) {
			const { [id]: _dropped, ...rest } = this.marks;
			this.marks = rest;
		} else {
			this.marks = { ...this.marks, [id]: { vote, version: __APP_VERSION__ } };
		}
		// $state.snapshot, not the field itself: `setJSON` ends in `JSON.stringify`, and
		// what crosses into it must not be a reactive proxy (SVELTE-CORE-v8 § 1.6).
		storage.setJSON(STORAGE_KEY, $state.snapshot(this.marks));
	}

	/** A mark given on an earlier build: shown, labelled, not counted (§ 3.1). */
	isStale(id: string): boolean {
		const mark = this.marks[id];
		return mark !== undefined && mark.version !== __APP_VERSION__;
	}

	/** Marks that count: this version only. */
	get markedOnThisVersion(): number {
		return Object.values(this.marks).filter((mark) => mark.version === __APP_VERSION__).length;
	}

	get total(): number {
		return ALL_BETA_CHECKS.length;
	}

	/**
	 * Two-step erasing (§ 6.3): the first call only arms the button, the second one
	 * erases. Returns `true` when the marks are actually gone.
	 */
	requestClear(): boolean {
		if (!this.clearArmed) {
			this.clearArmed = true;
			return false;
		}
		this.clear();
		return true;
	}

	/** Disarms without erasing: the button must not stay loaded behind the tester. */
	disarmClear() {
		this.clearArmed = false;
	}

	/**
	 * Progress of ONE tab (§ 8.1, `BETA-TAB-PROGRESS`).
	 *
	 * The overall «12 / 38» does not answer the only question a tester asks: is THIS
	 * tab finished. Tabs are walked one at a time, so without a per-tab count the
	 * position has to be held in the head or counted by eye.
	 */
	progressOf(checks: readonly { id: string }[]): { done: number; total: number } {
		const done = checks.filter((check) => this.marks[check.id]?.version === __APP_VERSION__).length;
		return { done, total: checks.length };
	}

	clear() {
		this.marks = {};
		this.clearArmed = false;
		storage.remove(STORAGE_KEY);
	}

	/**
	 * The report, as text (§ 6.1).
	 *
	 * Only marked items — a list of what nobody looked at makes the report unreadable —
	 * and what is broken first, because that is what the reader is looking for. An item
	 * that fails while claiming test coverage gets a line of its own: that is a report
	 * about the TEST, and it devalues every green run until someone looks at it.
	 */
	report(): string {
		const order: Vote[] = ['fail', 'weird', 'ok'];
		const label: Record<Vote, string> = {
			fail: 'НЕ ПРАЦЮЄ',
			weird: 'ПРАЦЮЄ, АЛЕ ДИВНО',
			ok: 'ПРАЦЮЄ'
		};

		// A plain object rather than a Map: `svelte/prefer-svelte-reactivity` does not
		// tell a local lookup inside a method from reactive state, and as a rule it is
		// right — a bare Map held as state does not notify. Nothing is lost here.
		const byId: Record<string, { check: BetaCheck; tab: string }> = {};
		for (const tab of BETA_TABS) {
			for (const check of tab.checks) byId[check.id] = { check, tab: tab.title.uk };
		}

		const header = [
			'--- BETA CHECKLIST REPORT ---',
			`VERSION: v${__APP_VERSION__}`,
			`DATE: ${new Date().toISOString()}`,
			`UA: ${navigator.userAgent}`,
			`LANG: ${document.documentElement.lang}`,
			`THEME: ${document.documentElement.dataset.theme ?? 'unknown'}`,
			`STYLE: ${document.documentElement.dataset.style ?? 'unknown'}`,
			`MARKED: ${Object.keys(this.marks).length} of ${this.total}`,
			'---'
		];

		const lines: string[] = [];
		for (const vote of order) {
			for (const [id, mark] of Object.entries(this.marks)) {
				if (mark.vote !== vote) continue;
				const entry = byId[id];
				if (!entry) continue;

				const stale = mark.version === __APP_VERSION__ ? '' : ` (v${mark.version})`;
				lines.push(`[${label[vote]}] ${id} (${entry.tab})${stale}`);
				lines.push(`    ${entry.check.text.uk}`);
				if (vote !== 'ok' && entry.check.coverage === 'covered') {
					lines.push(
						`    !!! ПУНКТ ПОКРИТО АВТОТЕСТОМ ${entry.check.test} — тест цього не побачив`
					);
				}
			}
		}

		if (lines.length === 0) lines.push('(нічого не позначено)');

		return [...header, ...lines].join('\n');
	}
}

export const betaProgress = new BetaProgress();
