import { localeSegment, type Locale } from '$lib/i18n/locales';

/**
 * Absolute origin of the deployed site.
 *
 * Not derived from `page.url.origin`: during prerendering SvelteKit replaces the
 * origin with the placeholder host `sveltekit-prerender`, which would then be
 * baked into every canonical, og:url and sitemap entry.
 *
 * Override at build time with SITE_ORIGIN when the site moves to another host.
 */
export const SITE_ORIGIN = __SITE_ORIGIN__;

/**
 * Base path as a literal string.
 *
 * Deliberately not `base` from `$app/paths`: SvelteKit rewrites that one to a
 * *relative* prefix in prerendered HTML, so `SITE_ORIGIN + resolve(path)` comes out
 * as `https://example.com/../../images/x.jpg`. Relative is right for links inside
 * the page and wrong for anything a crawler reads as an absolute URL.
 */
export const SITE_BASE = __BASE_PATH__;

/**
 * Contact addresses, in one place. They used to be typed out in the footer and again
 * in the apply form, which is how two copies of the same address start to differ.
 */
export const CONTACT_EMAIL = {
	notpfote: 'info@notpfote.de',
	vetcrew: 'vet.crew.cooperation@gmail.com'
} as const;

/** Address the adoption form writes to. */
export const ADOPTION_EMAIL = CONTACT_EMAIL.notpfote;

/**
 * The Google Form the shelter collects applications through — the same one the
 * previous site embedded. `?embedded=true` is what strips Google's own page chrome.
 *
 * The host must also be listed in `frame-src` in svelte.config.js: a CSP without a
 * directive for a resource type blocks it, and a blocked frame fails silently.
 */
export const GOOGLE_FORM_URL =
	'https://docs.google.com/forms/d/e/1FAIpQLSfE2I8DI1hBkK9VesiGx8GU0t03UdD2YvdGpgM2Y8GTxsdSOg/viewform';

export const GOOGLE_FORM_EMBED_URL = `${GOOGLE_FORM_URL}?embedded=true`;

/** Image used for link previews when a page has nothing more specific. */
export const DEFAULT_OG_IMAGE = '/images/logo/adoptananimal_logo_Notpfote.webp';

/** Absolute URL from a site-root-relative path, i.e. one that does *not* include the base. */
export const absoluteFromRoot = (path: string): string =>
	`${SITE_ORIGIN}${SITE_BASE}${path.startsWith('/') ? path : `/${path}`}`;

/** Absolute URL from a pathname that already includes the base, e.g. `page.url.pathname`. */
export const absoluteFromPathname = (pathname: string): string => `${SITE_ORIGIN}${pathname}`;

/**
 * Absolute URL of a page in a given language, from a locale-free path such as
 * `/adopt/cat`. Used for canonical and for the hreflang alternates, which have to
 * be absolute to mean anything to a crawler.
 */
export const absoluteLocale = (path: string, locale: Locale): string => {
	const tail = path === '/' ? '' : path;
	const url = `${SITE_ORIGIN}${SITE_BASE}${localeSegment(locale)}${tail}`;
	// Root of a language with no base configured would otherwise be a bare origin.
	return url === SITE_ORIGIN ? `${SITE_ORIGIN}/` : url;
};
