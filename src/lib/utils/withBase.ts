import { base } from '$app/paths';
import { localeSegment, type Locale } from '$lib/i18n/locales';
import { settings } from '$lib/services/settings.svelte';

/**
 * Prefixes a file in `static/` with the app's base path.
 *
 * Assets are not translated, so this one carries no language segment. For links
 * inside the app use `localePath()` below, which keeps the reader in the language
 * they are already reading.
 *
 * The result is root-absolute — `/adoptananimal/images/x.webp` — and identical on
 * every page, because `paths.relative` is `false` (see svelte.config.js). It used to
 * be relative, and that was a defect rather than a detail: this helper reads nothing
 * reactive, so Svelte writes its attributes once and never again, while the header
 * and footer that hold them survive every navigation. A prefix computed for the
 * address the document arrived at then went stale the moment the address changed.
 *
 * Still not something to concatenate into an absolute URL: that needs the origin as
 * well, and `absoluteFromRoot()` in `$lib/config` exists for it.
 */
export const withBase = (path: string): string => {
	if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('#')) return path;
	if (path.startsWith('?')) return path;
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * An in-app link in a given language: `/adopt/cat` → `/uk/adopt/cat`.
 *
 * Defaults to the language currently being rendered, so following a link never
 * silently drops the reader back to English.
 */
export const localePath = (path: string, locale: Locale = settings.locale): string => {
	if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('#')) return path;
	if (path.startsWith('?')) return path;

	const clean = path.startsWith('/') ? path : `/${path}`;
	const localised = `${localeSegment(locale)}${clean}`;

	// `/uk/` would 404 on a static host that generated `/uk.html`; `/uk` is the page.
	return `${base}${localised === '/' ? '/' : localised.replace(/\/$/, '')}`;
};
