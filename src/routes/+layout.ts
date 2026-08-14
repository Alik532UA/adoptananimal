import { base } from '$app/paths';
import { splitLocale } from '$lib/i18n/locales';
import type { LayoutLoad } from './$types';

export const prerender = true;

// Explicit per SVELTEKIT-DATA § 2.4: on a static host the value decides whether
// /adopt/cat resolves to a file or to a directory index.
export const trailingSlash = 'never';

/**
 * The language is resolved here, in the *root* layout, not in the [[lang]] one.
 *
 * Header and Footer render above the language layout, so resolving it any deeper
 * left them holding whatever language the previously prerendered page used — the
 * whole site chrome in Dutch on the Ukrainian page.
 */
export const load: LayoutLoad = ({ url }) => {
	const pathname =
		base && url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname;

	return splitLocale(pathname);
};
