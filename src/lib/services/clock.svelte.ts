/**
 * Today, and the chance to say it again once the page is actually running.
 *
 * Every page here is prerendered, so an age computed in a component is computed during
 * `npm run build` and shipped as a fixed string. That is already worlds better than the
 * hand-written field it replaces — a build is regenerated on every deploy, a data file
 * is not — but it is the same shape of bug: a number that was true when it was written.
 * A site left undeployed for a year would drift a year, which is exactly what this whole
 * change exists to stop.
 *
 * So the date is a rune, and `refreshToday()` restamps it after hydration. The reader
 * sees an age worked out in their own browser, on the day they are reading. Crawlers and
 * anyone without scripting get the build date, which is the best a static host can do
 * and is bounded by the deploy cadence rather than by the data's age.
 *
 * A number of milliseconds rather than a `Date`, because a `Date` is mutable and a rune
 * cannot see through a mutation of one — `svelte/prefer-svelte-reactivity` says so, and
 * it is right: the day something reached for `setMonth` on it, the page would go on
 * showing the old value. A timestamp has no such edge, so replacing it is the only way
 * to change it, which is what the reactivity needs anyway.
 */
let stamp = $state(Date.now());

export const clock = {
	/** Milliseconds since the epoch, as the page currently believes them. */
	get now(): number {
		return stamp;
	}
};

/** Called once from the root layout, after the page has been handed to the browser. */
export function refreshToday(): void {
	stamp = Date.now();
}
