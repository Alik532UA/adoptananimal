import { describe, expect, it } from 'vitest';
import { breedTerms, normaliseGender, normaliseSize } from './filters';
import { animalService } from '$lib/services/animals';
import { cats, dogs } from './animals';

const all = [...cats, ...dogs];

describe('normaliseGender', () => {
	it('does not read female as male', () => {
		// The bug this replaces: `'female'.includes('male')` is true, so filtering by
		// male returned every animal on the site.
		expect(normaliseGender('female')).toBe('female');
		expect(normaliseGender('female (spayed)')).toBe('female');
		expect(normaliseGender('male')).toBe('male');
		expect(normaliseGender('male (castrated)')).toBe('male');
	});

	it('reports a value it does not know rather than guessing', () => {
		expect(normaliseGender('unknown')).toBeNull();
		expect(normaliseGender('')).toBeNull();
	});
});

describe('normaliseSize', () => {
	it('maps the words the data actually uses', () => {
		expect(normaliseSize('small')).toBe('small');
		expect(normaliseSize('medium')).toBe('medium');
		expect(normaliseSize('large')).toBe('large');
		expect(normaliseSize('tiny')).toBe('small');
	});

	it('reads a weight as a size', () => {
		expect(normaliseSize('up to 4 kg')).toBe('small');
		expect(normaliseSize('20 kg')).toBe('medium');
		expect(normaliseSize('35 kg')).toBe('large');
	});

	it('reports a value it does not know rather than guessing', () => {
		expect(normaliseSize('enormous')).toBeNull();
	});
});

describe('every animal is reachable by the filters', () => {
	// This is the check that matters. Both bugs came from data holding a word the
	// filter had never been told about, and the animal then vanished from the listing
	// with nothing failing anywhere.
	it('has a known gender for every animal', () => {
		const unknown = all
			.filter((animal) => normaliseGender(animal.gender.en) === null)
			.map((animal) => `${animal.slug}: "${animal.gender.en}"`);

		expect(unknown).toEqual([]);
	});

	it('has a known size for every animal', () => {
		const unknown = all
			.filter((animal) => normaliseSize(animal.size.en) === null)
			.map((animal) => `${animal.slug}: "${animal.size.en}"`);

		expect(unknown).toEqual([]);
	});

	it('has a breed in every language for every animal', () => {
		const missing = all
			.filter((animal) => breedTerms(animal).some((term) => term.trim() === ''))
			.map((animal) => animal.slug);

		expect(missing).toEqual([]);
	});
});

describe('getFiltered', () => {
	const base = { gender: '', size: '', status: '', search: '' };

	it('splits the animals cleanly between male and female', () => {
		const males = animalService.getFiltered('all', { ...base, gender: 'male' });
		const females = animalService.getFiltered('all', { ...base, gender: 'female' });

		expect(males.length).toBeGreaterThan(0);
		expect(females.length).toBeGreaterThan(0);
		expect(males.length + females.length).toBe(all.length);
		expect(males.some((a) => females.includes(a))).toBe(false);
	});

	it('leaves no dog out of the three size filters', () => {
		const counted = (['small', 'medium', 'large'] as const)
			.map((size) => animalService.getFiltered('dog', { ...base, size }).length)
			.reduce((a, b) => a + b, 0);

		// Three dogs are listed as "tiny" and used to fall outside every size filter.
		expect(counted).toBe(dogs.length);
	});

	it('splits cleanly between available and adopted', () => {
		const available = animalService.getFiltered('all', { ...base, status: 'available' });
		const adopted = animalService.getFiltered('all', { ...base, status: 'adopted' });

		expect(available.length + adopted.length).toBe(all.length);
		expect(available.every((a) => !a.isAdopted)).toBe(true);
		expect(adopted.every((a) => a.isAdopted)).toBe(true);
	});

	it('finds a breed in a language other than English', () => {
		const withUkBreed = all.find((a) => a.breed.uk && a.breed.uk !== a.breed.en);
		expect(withUkBreed).toBeDefined();

		const found = animalService.getFiltered('all', {
			...base,
			search: withUkBreed!.breed.uk.slice(0, 6)
		});
		expect(found.length).toBeGreaterThan(0);
	});

	it('finds an animal by name regardless of case and padding', () => {
		const target = all[0];
		const found = animalService.getFiltered('all', {
			...base,
			search: `  ${target.name.toUpperCase()}  `
		});

		expect(found.map((a) => a.slug)).toContain(target.slug);
	});

	it('combines filters instead of letting one override another', () => {
		const maleAvailable = animalService.getFiltered('all', {
			...base,
			gender: 'male',
			status: 'available'
		});

		expect(maleAvailable.every((a) => !a.isAdopted)).toBe(true);
		expect(maleAvailable.every((a) => normaliseGender(a.gender.en) === 'male')).toBe(true);
	});
});
