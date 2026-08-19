/**
 * The checklist for a live tester, as data (BETA-CHECKLIST-v8 § 2).
 *
 * Data rather than a page of prose, and that is the whole reason the file exists.
 * A `QA.md` nobody diffs against the code says «checked» about things that were
 * removed months ago; a list with invariants over it cannot (§ анти-патерни, HIGH).
 */

/**
 * Both languages in one object, not two trees of files (§ 2.4).
 *
 * Correspondence is then a TYPE rather than a rule with its own checker: an item
 * missing its English text does not compile. The reference project kept
 * `Checklists/uk/` beside `Checklists/en/` and needed a script to prove the two had
 * the same ids in the same order.
 *
 * Two languages, not four. Item texts do NOT live in the interface dictionary: there
 * are dozens of them, they change on their own cycle, and four-language parity
 * (I18N-v8) would make every edit fourfold. German and Dutch testers read the
 * English column — which is honest, because that is the language the shelter's
 * partners already correspond in.
 */
export interface Localized {
	uk: string;
	en: string;
}

/** Whether a machine can check this item, and what it costs a person if it cannot. */
export type Coverage = 'manual' | 'testable' | 'covered';

/**
 * The claim about coverage, as a discriminated union rather than an optional field.
 *
 * The canon states two rules — `test` is required for `covered` and forbidden for
 * the rest — and both are free here: `{ coverage: 'manual', test: '…' }` does not
 * compile, and neither does `{ coverage: 'covered' }`. A rule the type holds needs
 * no invariant, and an invariant that cannot fail is noise.
 *
 * What the levels mean:
 *   - `manual`   — eye, finger, a second person, a real phone. No test can do it.
 *   - `testable` — a test could cover this and none does. This is the test backlog,
 *                  with names, rather than «we need more tests».
 *   - `covered`  — covered, and the file is named. Stays in the list as a control
 *                  group: a failure here is a report about the TEST, not the site.
 */
export type CoverageClaim =
	| { coverage: 'manual' | 'testable' }
	| { coverage: 'covered'; test: string };

export type BetaCheck = {
	/**
	 * Stable forever — it is the key the person's progress is stored under (§ 2.2).
	 * Renaming `home_3` erases a tick someone earned. New items are appended with a
	 * new number; existing ones are never renumbered, not even when the order changes.
	 */
	id: string;

	/** Non-empty in both languages: an item has to belong somewhere. */
	category: Localized;

	/**
	 * Written for the person holding the phone (§ 2.1): an action and a consequence
	 * they can see or hear. No file names, no locators, no service names — «works
	 * correctly» is not a consequence, «the count above the heart goes up by one» is.
	 */
	text: Localized;

	/**
	 * Required wherever the text says «press» (§ 5.3), and the invariant enforces it.
	 * An item asking for a click on something that cannot be named by a locator is
	 * unverifiable by construction — that is how one item in the reference project
	 * described logic that had been gone for 46 commits.
	 */
	testid?: string;

	/**
	 * A boundary check: something that must NOT happen (§ 2.3). The most expensive
	 * defects are quiet — a limit that stopped applying looks exactly like a limit
	 * that applies — so «must not» has to be asked separately or nobody presses it.
	 */
	negative?: true;
} & CoverageClaim;

export interface BetaTab {
	id: string;
	title: Localized;

	/**
	 * The locale-free route paths this tab answers for (§ 5.1).
	 *
	 * Routes, not a description of the feature: the list of routes already exists on
	 * disk and nobody forgets to extend it, because without it there is no page. A
	 * second list kept in step by hand diverges at the first new route.
	 */
	routes: readonly string[];

	checks: readonly BetaCheck[];
}
