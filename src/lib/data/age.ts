/**
 * How old an animal is, worked out rather than written down.
 *
 * The data used to carry the answer — `age: { en: '1.4 years', uk: '1.4 роки', … }` —
 * and an answer goes stale while the question does not. It had: every one of the fifty
 * animals was understated by between twelve and twenty-two months, TOBEY was offered as
 * a seven-month puppy at two and a half years old, and SHAGGY as a six-year-old dog at
 * eight. Nobody had done anything wrong; the field was simply true on the day it was
 * typed and never again.
 *
 * So the file stores `bornOn` and this works out the rest. The date is not a birthday —
 * none of these animals has one — it is the shelter's own estimate carried back to a
 * fixed point: the age it wrote, subtracted from the day it wrote it. Where two
 * documents record the same animal, the earlier one wins, because the later ones were
 * copied from it rather than re-observed.
 *
 * The estimate is why every rendering says "about". Twenty cats arrived on one line of
 * one document as "1 year", and a birth date derived from that is worth a season, not a
 * day.
 */

/** What to put on the page: a number and the unit it is counted in. */
export type AgeDisplay = { unit: 'months' | 'years'; value: number };

/** Whole months between a birth date and a moment. UTC on both sides, so the answer
 *  does not depend on which side of midnight the reader is standing. */
export function ageInMonths(bornOn: string, now: Date | number): number {
	const born = new Date(bornOn + 'T00:00:00Z');
	if (Number.isNaN(born.getTime())) return NaN;

	const at = typeof now === 'number' ? new Date(now) : now;
	let months =
		(at.getUTCFullYear() - born.getUTCFullYear()) * 12 + (at.getUTCMonth() - born.getUTCMonth());
	// Not a full month until the day of the month comes round again.
	if (at.getUTCDate() < born.getUTCDate()) months--;

	return Math.max(0, months);
}

/**
 * The number to show, coarsened to the precision the source actually had.
 *
 * Months while that still distinguishes anything — a four-month kitten and an
 * eleven-month adolescent are different animals to somebody choosing. Half years
 * through the second and third, where "1.5" still says something. Whole years after
 * that, because at four the difference between four and four and a half is nothing an
 * adopter is deciding on, and the underlying estimate cannot support it anyway.
 */
export function ageDisplay(months: number): AgeDisplay {
	if (months < 12) return { unit: 'months', value: months };
	if (months < 36) return { unit: 'years', value: Math.round(months / 6) / 2 };
	return { unit: 'years', value: Math.round(months / 12) };
}

/**
 * The same age in English, for the JSON-LD payload.
 *
 * That block is read by machines and is not translated, so it cannot go through
 * `tPlural` — which answers in whatever language the reader happens to be using.
 */
export function ageInEnglish({ unit, value }: AgeDisplay): string {
	const noun = unit === 'months' ? 'month' : 'year';
	return `about ${value} ${value === 1 ? noun : noun + 's'}`;
}
