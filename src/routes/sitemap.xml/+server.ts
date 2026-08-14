import { absoluteLocale } from '$lib/config';
import { DEFAULT_LOCALE, HTML_LANG, LOCALES, type Locale } from '$lib/i18n/locales';
import { animalService } from '$lib/services/animals';

// Written at build time like every other page, so the file exists on a static host.
export const prerender = true;

const STATIC_PATHS = ['/', '/adopt/cat', '/adopt/dog', '/apply', '/favorites'];

// Same builder as the canonical tags, so the two can never disagree about a URL.
const url = (path: string, locale: Locale) => absoluteLocale(path, locale);

const priorityOf = (path: string) =>
	path === '/' ? '1.0' : path.split('/').length > 3 ? '0.6' : '0.8';

export function GET() {
	const paths = [
		...STATIC_PATHS,
		...animalService.cats.map((cat) => `/adopt/cat/${cat.slug}`),
		...animalService.dogs.map((dog) => `/adopt/dog/${dog.slug}`)
	];

	// Each URL lists every language of the same page through xhtml:link, which is how
	// a sitemap expresses hreflang. Listing the languages as unrelated URLs instead
	// would leave a crawler to guess that they are translations of one another.
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths
	.flatMap((path) =>
		LOCALES.map(
			(locale) => `\t<url>
\t\t<loc>${url(path, locale)}</loc>
${LOCALES.map(
	(alt) =>
		`\t\t<xhtml:link rel="alternate" hreflang="${HTML_LANG[alt]}" href="${url(path, alt)}" />`
).join('\n')}
\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${url(path, DEFAULT_LOCALE)}" />
\t\t<changefreq>weekly</changefreq>
\t\t<priority>${priorityOf(path)}</priority>
\t</url>`
		)
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
