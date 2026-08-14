import { PREFIXED_LOCALES } from './locales';

/**
 * One entry per language for the optional [[lang]] segment: the default locale as
 * the bare path, the rest prefixed. Without this the crawler would only reach the
 * languages that happen to be linked from a page it already visited.
 */
export const langEntries = () => [
	{ lang: undefined },
	...PREFIXED_LOCALES.map((lang) => ({ lang }))
];
