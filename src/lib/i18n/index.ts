import { en, type TranslationKey } from './translations/en';
import { uk } from './translations/uk';
import { de } from './translations/de';
import { nl } from './translations/nl';
import { settings, type Locale } from '$lib/services/settings.svelte';
import { base } from '$app/paths';

type Translations = Record<TranslationKey, string>;

const translations: Record<string, Translations> = {
	en,
	uk,
	de,
	nl
};

/**
 * Translates a given key based on the current application locale.
 * Fallback to the key itself if translation is missing.
 */
export const t = (key: TranslationKey): string => {
	return translations[settings.locale]?.[key] ?? en[key] ?? key;
};

/**
 * Formats a date according to the current locale.
 */
export const formatDate = (
	date: Date | string,
	options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat(settings.locale, options).format(d);
};

/**
 * Formats a number according to the current locale.
 */
export const formatNumber = (num: number, options: Intl.NumberFormatOptions = {}): string => {
	return new Intl.NumberFormat(settings.locale, options).format(num);
};

/**
 * Resolves a given path to include the base path of the application.
 * This ensures that links work correctly when the app is deployed in a subfolder.
 */
export const resolve = (path: string): string => {
	if (path.startsWith('http') || path.startsWith('mailto:')) return path;
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	return base + cleanPath;
};

export const setLocale = (locale: string) => {
	if (translations[locale]) {
		settings.setLocale(locale as Locale);
	}
};

export const getLocale = () => {
	return settings.locale;
};

export type { TranslationKey };
