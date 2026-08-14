export const LOCALES = ['en', 'uk', 'de', 'nl'] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * English lives at the root, the others under a prefix: `/adopt/cat`, `/uk/adopt/cat`.
 *
 * The alternative — prefixing every language including the default — would have
 * meant `/en/...` and a redirect from `/`, which a static host cannot do without
 * a meta refresh. Keeping the default unprefixed also leaves every existing link
 * to the site working.
 */
export const DEFAULT_LOCALE: Locale = 'en';

/** Locales that appear as a path segment. */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export const isLocale = (value: string): value is Locale =>
	(LOCALES as readonly string[]).includes(value);

/** `''` for the default locale, `/uk` for the rest. */
export const localeSegment = (locale: Locale): string =>
	locale === DEFAULT_LOCALE ? '' : `/${locale}`;

/**
 * Splits a base-relative pathname into its locale and the rest.
 * `/uk/adopt/cat` → `{ locale: 'uk', path: '/adopt/cat' }`
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
	const [, first = '', ...rest] = pathname.split('/');

	if (isLocale(first) && first !== DEFAULT_LOCALE) {
		return { locale: first, path: `/${rest.join('/')}` };
	}

	return { locale: DEFAULT_LOCALE, path: pathname === '' ? '/' : pathname };
}

/** BCP 47 tags for `<html lang>` and hreflang. */
export const HTML_LANG: Record<Locale, string> = {
	en: 'en',
	uk: 'uk',
	de: 'de',
	nl: 'nl'
};
