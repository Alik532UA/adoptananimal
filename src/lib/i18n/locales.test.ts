import { describe, expect, it } from 'vitest';
import {
	DEFAULT_LOCALE,
	isLocale,
	LOCALES,
	localeSegment,
	PREFIXED_LOCALES,
	splitLocale
} from './locales';

/**
 * Path parsing decides which language a page renders in, so a mistake here shows up
 * as the whole site quietly served in the wrong language rather than as an error.
 */

describe('locale set', () => {
	it('has the default locale in it', () => {
		expect(LOCALES).toContain(DEFAULT_LOCALE);
	});

	it('prefixes every locale except the default', () => {
		expect(PREFIXED_LOCALES).toEqual(LOCALES.filter((l) => l !== DEFAULT_LOCALE));
		expect(PREFIXED_LOCALES).not.toContain(DEFAULT_LOCALE);
	});

	it('recognises its own locales and nothing else', () => {
		for (const locale of LOCALES) expect(isLocale(locale)).toBe(true);
		for (const other of ['adopt', 'apply', 'favorites', 'EN', '', 'ua']) {
			expect(isLocale(other)).toBe(false);
		}
	});
});

describe('localeSegment', () => {
	it('is empty for the default locale', () => {
		expect(localeSegment(DEFAULT_LOCALE)).toBe('');
	});

	it('is a leading path segment for the rest', () => {
		for (const locale of PREFIXED_LOCALES) {
			expect(localeSegment(locale)).toBe(`/${locale}`);
		}
	});
});

describe('splitLocale', () => {
	it('reads the default locale from an unprefixed path', () => {
		expect(splitLocale('/')).toEqual({ locale: DEFAULT_LOCALE, path: '/' });
		expect(splitLocale('/adopt/cat')).toEqual({ locale: DEFAULT_LOCALE, path: '/adopt/cat' });
	});

	it('reads a prefixed locale and strips it', () => {
		expect(splitLocale('/uk')).toEqual({ locale: 'uk', path: '/' });
		expect(splitLocale('/de/adopt/cat')).toEqual({ locale: 'de', path: '/adopt/cat' });
		expect(splitLocale('/nl/adopt/cat/basti')).toEqual({
			locale: 'nl',
			path: '/adopt/cat/basti'
		});
	});

	it('does not mistake a route segment for a language', () => {
		// The reason src/params/lang.ts exists: without the matcher, /adopt would be
		// read as the language "adopt" and the page would silently not exist.
		expect(splitLocale('/adopt')).toEqual({ locale: DEFAULT_LOCALE, path: '/adopt' });
		expect(splitLocale('/apply')).toEqual({ locale: DEFAULT_LOCALE, path: '/apply' });
	});

	it('round-trips every locale', () => {
		for (const locale of LOCALES) {
			const path = '/adopt/dog/vira';
			const url = `${localeSegment(locale)}${path}`;
			expect(splitLocale(url)).toEqual({ locale, path });
		}
	});
});
