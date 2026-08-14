import type { AnimalSummary } from './types';

/**
 * The filter buttons offer a small fixed vocabulary; the animal files are written by
 * hand and hold free text — 'male (castrated)', 'up to 4 kg', 'tiny'. Mapping one to
 * the other has to be explicit.
 *
 * It used to be `value.includes(filter)`, which quietly broke twice: 'female'
 * contains 'male', so the male filter matched every animal on the site, and any size
 * word outside small/medium/large made that animal unreachable by any size filter.
 *
 * Both functions return null for a value they do not recognise, and
 * `filters.test.ts` asserts that no animal in the data produces a null. A new word in
 * a data file fails the suite instead of hiding an animal from the listing.
 */

export type Gender = 'male' | 'female';
export type SizeBucket = 'small' | 'medium' | 'large';

export function normaliseGender(value: string): Gender | null {
	const text = value.trim().toLowerCase();

	// female first: it also starts with nothing that would match male, but the reverse
	// substring is exactly the trap this replaces.
	if (text.startsWith('female')) return 'female';
	if (text.startsWith('male')) return 'male';
	return null;
}

export function normaliseSize(value: string): SizeBucket | null {
	const text = value.trim().toLowerCase();

	if (/\b(tiny|mini)\b/.test(text)) return 'small';
	if (text.startsWith('small')) return 'small';
	if (text.startsWith('medium')) return 'medium';
	if (text.startsWith('large')) return 'large';

	// 'up to 4 kg' and similar: a weight rather than a word.
	const kilos = text.match(/(\d+(?:[.,]\d+)?)\s*kg/);
	if (kilos) {
		const weight = parseFloat(kilos[1].replace(',', '.'));
		if (weight <= 10) return 'small';
		if (weight <= 25) return 'medium';
		return 'large';
	}

	return null;
}

/** Every translation of the breed, so a search works in the language being read. */
export function breedTerms(animal: AnimalSummary): string[] {
	return Object.values(animal.breed).map((term) => term.toLowerCase());
}
