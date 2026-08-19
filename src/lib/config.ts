import { localeSegment, type Locale } from '$lib/i18n/locales';
import type { TranslationKey } from '$lib/i18n/translations/en';
import type { ScrollbarMode } from '$lib/services/scrollbar.svelte';
import type { IconName } from '$lib/components/ui/icons';

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
 * Routes that are served in every language and kept out of the index
 * (BETA-CHECKLIST-v8 § 4, § 4.1).
 *
 * One list, three consequences, and that is the point of it being a list. The layout
 * draws no `canonical`, no `hreflang` and no `og:url` for these paths and writes
 * `noindex` instead; the sitemap filters them out; `robots.txt` disallows every
 * language of each. Before this they were hidden by three unrelated edits in three
 * files, so hiding a second route meant remembering all three — and forgetting one of
 * them looks exactly like remembering it.
 *
 * `/apply/form` — the form that came before the embedded Google one, kept against the
 * day applications come back to the site (PROJECT-CONTEXT § 4.12).
 *
 * Hidden is not secret, and pretending otherwise is self-deception: the repository is
 * public and the address works for anyone who types it. It is kept out of the index so
 * a search for an animal does not land on a page for testers.
 */
export const HIDDEN_ROUTES = ['/apply/form', '/beta-test-checklists'] as const;

export const isHiddenRoute = (path: string): boolean =>
	(HIDDEN_ROUTES as readonly string[]).includes(path);

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

/**
 * The scrollbar modes, in one place (SCROLLBAR-v8 § 2.2).
 *
 * Rendered by the bar's context menu, and by a settings panel too if this site grows
 * one. Two copies drift the moment a fifth mode is added and one of the places forgets
 * it. Order runs from the familiar to the most expensive.
 */
export const SCROLLBAR_MODES: { id: ScrollbarMode; key: TranslationKey }[] = [
	{ id: 'standard', key: 'scrollbar.standard' },
	{ id: 'custom', key: 'scrollbar.custom' },
	{ id: 'minimap', key: 'scrollbar.minimap' },
	{ id: 'minimap-full', key: 'scrollbar.minimapFull' }
];

/**
 * The shelter's other sites, offered quietly from the footer.
 *
 * Deliberately understated: they are not what someone came here for, and a visitor
 * looking for an animal should not be advertised at. See the opacity rules on
 * `.footer__aside` in Footer.svelte.
 */
export const SIDE_PROJECTS = [
	{
		id: 'games',
		url: 'https://alik532ua.github.io/VetCrewGames/',
		icon: 'gamepad',
		key: 'footer.play'
	},
	{
		id: 'order-site',
		url: 'https://alik532ua.github.io/DigitalWorkshop/',
		icon: 'plus',
		key: 'footer.orderSite'
	}
] as const satisfies readonly {
	id: string;
	url: string;
	icon: IconName;
	key: TranslationKey;
}[];
