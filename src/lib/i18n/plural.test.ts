import { describe, expect, it } from 'vitest';
import { LOCALES } from './locales';
import { en } from './translations/en';
import { uk } from './translations/uk';
import { de } from './translations/de';
import { nl } from './translations/nl';

const dictionaries = { en, uk, de, nl };

/**
 * Ukrainian needs four plural categories where English needs two. A missing category
 * does not throw — it renders the wrong word — so the check is that every counted
 * message covers every category its language can produce.
 */

const COUNTED = ['list.cat.count', 'list.dog.count'];

describe('plural coverage', () => {
	for (const locale of LOCALES) {
		const rules = new Intl.PluralRules(locale);
		const categories = rules.resolvedOptions().pluralCategories;
		const dictionary = dictionaries[locale] as Record<string, string>;

		it(`${locale} has every category its language uses`, () => {
			const missing: string[] = [];
			for (const base of COUNTED) {
				for (const category of categories) {
					if (!dictionary[`${base}.${category}`]) missing.push(`${base}.${category}`);
				}
			}
			expect(missing).toEqual([]);
		});

		it(`${locale} interpolates the count instead of concatenating it`, () => {
			const withoutPlaceholder: string[] = [];
			for (const base of COUNTED) {
				for (const category of categories) {
					const value = dictionary[`${base}.${category}`];
					if (value && !value.includes('{count}')) {
						withoutPlaceholder.push(`${base}.${category}`);
					}
				}
			}
			expect(withoutPlaceholder).toEqual([]);
		});
	}

	it('picks different Ukrainian words for 1, 2 and 5', () => {
		const rules = new Intl.PluralRules('uk');
		const forms = [1, 2, 5].map(
			(n) => (uk as Record<string, string>)[`list.cat.count.${rules.select(n)}`]
		);
		expect(new Set(forms).size).toBe(3);
	});

	it('keeps English to one singular and one plural', () => {
		const rules = new Intl.PluralRules('en');
		expect(rules.select(1)).toBe('one');
		expect(rules.select(5)).toBe('other');
	});
});
