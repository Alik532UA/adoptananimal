import { describe, expect, it } from 'vitest';
import { en } from './translations/en';
import { uk } from './translations/uk';
import { de } from './translations/de';
import { nl } from './translations/nl';

const locales = { uk, de, nl };
const baseKeys = Object.keys(en);

describe('translation parity', () => {
	for (const [code, strings] of Object.entries(locales)) {
		it(`${code} has exactly the keys of en`, () => {
			expect(Object.keys(strings).sort()).toEqual(baseKeys.slice().sort());
		});

		it(`${code} has no empty values`, () => {
			const empty = Object.entries(strings)
				.filter(([, value]) => (value as string).trim() === '')
				.map(([key]) => key);
			expect(empty).toEqual([]);
		});
	}

	it('en itself has no empty values', () => {
		const empty = Object.entries(en)
			.filter(([, value]) => value.trim() === '')
			.map(([key]) => key);
		expect(empty).toEqual([]);
	});
});
