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

/** Image used for link previews when a page has nothing more specific. */
export const DEFAULT_OG_IMAGE = '/images/logo/adoptananimal_logo_Notpfote.webp';

/** Absolute URL from a site-root-relative path, i.e. one that does *not* include the base. */
export const absoluteFromRoot = (path: string): string =>
	`${SITE_ORIGIN}${SITE_BASE}${path.startsWith('/') ? path : `/${path}`}`;

/** Absolute URL from a pathname that already includes the base, e.g. `page.url.pathname`. */
export const absoluteFromPathname = (pathname: string): string => `${SITE_ORIGIN}${pathname}`;
