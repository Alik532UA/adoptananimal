/**
 * Baseline for the whole-page axe sweep.
 *
 * WHY THIS FILE EXISTS. The sweep used to assert `toEqual([])` — zero violations,
 * full stop. That reads as the strictest possible gate and is in fact the most
 * brittle one: axe-core ships new rules in MINOR versions, and Dependabot opens a
 * PR for those every week. A gate that turns red because a dependency moved, with
 * no change to our code, is a gate somebody eventually switches off — and a
 * threshold you have to switch off the next day is worse than no threshold.
 *
 * So the count is a number that may only ever go DOWN, and the rule ids we
 * currently tolerate are listed separately. That second list is the important
 * half: it means a NEW kind of violation fails the run even while the total stays
 * under the limit, which a bare number would happily hide.
 *
 * Both maps are empty on purpose. Every page is clean today, so the gate is
 * exactly as strict as it was — what changed is the failure message on the day
 * axe learns a new rule: it names the rule instead of diffing two arrays.
 *
 * TO RAISE EITHER NUMBER you need a reason in the comment and a task to remove it
 * again. Lowering one needs nothing.
 */

/** Violations tolerated per page. Absent path = 0. */
export const A11Y_BASELINE: Record<string, number> = {};

/** Rule ids tolerated per page. Absent path = none; a new id fails the run. */
export const A11Y_KNOWN: Record<string, string[]> = {};

export const baselineFor = (path: string): number => A11Y_BASELINE[path] ?? 0;
export const knownFor = (path: string): string[] => A11Y_KNOWN[path] ?? [];
