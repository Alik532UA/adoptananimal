import { base } from '$app/paths';
import { HTML_LANG, splitLocale } from '$lib/i18n/locales';
import type { Handle } from '@sveltejs/kit';

/**
 * Writes the real language into `<html lang>`.
 *
 * On a static host this hook still runs — during prerendering, at build time — so the
 * generated HTML carries the right language before any JavaScript executes. Setting
 * the attribute from an effect instead would leave every prerendered page claiming
 * `lang="en"` to the crawler and to a screen reader on first paint.
 */
export const handle: Handle = ({ event, resolve }) => {
	const pathname =
		base && event.url.pathname.startsWith(base)
			? event.url.pathname.slice(base.length)
			: event.url.pathname;

	const { locale } = splitLocale(pathname);

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', HTML_LANG[locale])
	});
};
