import { describe, expect, it } from 'vitest';
import { ageDisplay, ageInEnglish, ageInMonths } from './age';
import { cats, dogs } from './animals';

const all = [...cats, ...dogs];

describe('ageInMonths', () => {
	it('counts whole months, and only once the day comes round again', () => {
		expect(ageInMonths('2024-07-09', new Date('2025-07-08T00:00:00Z'))).toBe(11);
		expect(ageInMonths('2024-07-09', new Date('2025-07-09T00:00:00Z'))).toBe(12);
		expect(ageInMonths('2024-07-09', new Date('2025-08-01T00:00:00Z'))).toBe(12);
		expect(ageInMonths('2024-07-09', new Date('2025-08-09T00:00:00Z'))).toBe(13);
	});

	it('never reads as negative, whatever the clock says', () => {
		// A visitor whose machine is set to last year is not worth a "-3 months" card.
		expect(ageInMonths('2025-01-01', new Date('2024-01-01T00:00:00Z'))).toBe(0);
	});
});

describe('ageDisplay', () => {
	it('counts in months while that still distinguishes anything', () => {
		expect(ageDisplay(4)).toEqual({ unit: 'months', value: 4 });
		expect(ageDisplay(11)).toEqual({ unit: 'months', value: 11 });
	});

	it('turns over to years at one, not at "12 months"', () => {
		expect(ageDisplay(12)).toEqual({ unit: 'years', value: 1 });
	});

	it('keeps half years through the second and third', () => {
		expect(ageDisplay(15)).toEqual({ unit: 'years', value: 1.5 });
		expect(ageDisplay(16)).toEqual({ unit: 'years', value: 1.5 });
		expect(ageDisplay(24)).toEqual({ unit: 'years', value: 2 });
		expect(ageDisplay(30)).toEqual({ unit: 'years', value: 2.5 });
	});

	it('drops to whole years after three, where the estimate cannot carry more', () => {
		expect(ageDisplay(36)).toEqual({ unit: 'years', value: 3 });
		expect(ageDisplay(53)).toEqual({ unit: 'years', value: 4 });
		expect(ageDisplay(102)).toEqual({ unit: 'years', value: 9 });
	});
});

describe('ageInEnglish', () => {
	it('says about, and gets the singular right', () => {
		expect(ageInEnglish({ unit: 'years', value: 1 })).toBe('about 1 year');
		expect(ageInEnglish({ unit: 'years', value: 1.5 })).toBe('about 1.5 years');
		expect(ageInEnglish({ unit: 'months', value: 1 })).toBe('about 1 month');
		expect(ageInEnglish({ unit: 'months', value: 4 })).toBe('about 4 months');
	});
});

describe('every animal carries a usable birth date', () => {
	/*
	 * The check that matters. `bornOn` is derived by hand from a document date minus a
	 * stated age, and a typo there is silent: the page would simply offer a fourteen
	 * year old kitten, or one born next spring, and every other gate would stay green.
	 */
	it('is a real date in ISO form', () => {
		const bad = all
			.filter((a) => !/^\d{4}-\d{2}-\d{2}$/.test(a.bornOn) || Number.isNaN(Date.parse(a.bornOn)))
			.map((a) => `${a.slug}: "${a.bornOn}"`);

		expect(bad).toEqual([]);
	});

	it('is in the past and inside a lifetime', () => {
		const now = new Date();
		const wrong = all
			.map((a) => ({ slug: a.slug, months: ageInMonths(a.bornOn, now), bornOn: a.bornOn }))
			.filter((a) => a.months <= 0 || a.months > 25 * 12)
			.map((a) => `${a.slug}: ${a.bornOn} is ${a.months} months ago`);

		expect(wrong).toEqual([]);
	});

	it('renders to something a reader would accept', () => {
		const now = new Date();
		const odd = all
			.map((a) => ({ slug: a.slug, ...ageDisplay(ageInMonths(a.bornOn, now)) }))
			.filter((a) => a.value <= 0 || (a.unit === 'months' && a.value >= 12))
			.map((a) => `${a.slug}: ${a.value} ${a.unit}`);

		expect(odd).toEqual([]);
	});
});
