import { en, type TranslationKey } from './translations/en';
import { uk } from './translations/uk';
import { de } from './translations/de';
import { nl } from './translations/nl';
import { settings } from '$lib/services/settings.svelte';

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
 * Translates a counted message, picking the plural form the language actually uses.
 *
 * Not `count === 1 ? singular : plural`: Ukrainian has four categories, so 1 кіт,
 * 2 коти and 5 котів are three different words, and hand-rolled arithmetic over
 * `n % 10` is exactly the anti-pattern I18N § 4.2 names. Intl.PluralRules knows the
 * rules for every locale, including the ones added later.
 *
 * The count is interpolated rather than concatenated, so each language decides where
 * the number belongs in the sentence.
 */
export const tPlural = (base: string, count: number): string => {
	const category = new Intl.PluralRules(settings.locale).select(count);
	const key = `${base}.${category}` as TranslationKey;
	const fallback = `${base}.other` as TranslationKey;
	const template = translations[settings.locale]?.[key] ?? en[key] ?? en[fallback] ?? base;

	return template.replaceAll('{count}', formatNumber(count));
};

/**
 * Fills `{name}` placeholders in a translated string, so a sentence is never built
 * by joining fragments — word order differs between languages.
 */
export const tFormat = (key: TranslationKey, values: Record<string, string | number>): string =>
	Object.entries(values).reduce(
		(text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
		t(key)
	);

/**
 * Formats a number in the SITE's language, not the machine's.
 *
 * Internal on purpose: the only caller is `tPlural` above. Exporting it would put a
 * second, equally plausible way to render a number next to the sentence that already
 * contains one — and the two would drift the first time a language wants a different
 * grouping. `Intl.NumberFormat` with an explicit locale is what the ESLint rule against
 * bare `toLocaleString()` exists to push callers towards (I18N-v8 § 4.3).
 */
const formatNumber = (num: number, options: Intl.NumberFormatOptions = {}): string => {
	return new Intl.NumberFormat(settings.locale, options).format(num);
};

export type { TranslationKey };
