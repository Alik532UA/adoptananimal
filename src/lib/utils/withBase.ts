import { base } from '$app/paths';

/**
 * Prefixes an in-app path or a file in `static/` with the app's base path.
 *
 * Used instead of SvelteKit's typed `resolve()`, which takes a route id plus params
 * and so cannot express what this project actually links to: animal slugs coming from
 * data files, query-string-only navigation, and image paths that are not routes.
 * The base handling is identical; what is lost is compile-time route validation, and
 * `scripts/check-build.js` covers that by checking real links in the built output.
 *
 * The result is relative once prerendered, so it must never be concatenated into an
 * absolute URL — `absoluteFromRoot()` in `$lib/config` exists for that.
 */
export const withBase = (path: string): string => {
	if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('#')) return path;
	if (path.startsWith('?')) return path;
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
