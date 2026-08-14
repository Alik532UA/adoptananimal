import { SITE_BASE, SITE_ORIGIN } from '$lib/config';
import { animalService } from '$lib/services/animals';

// Written at build time like every other page, so the file exists on a static host.
export const prerender = true;

const STATIC_PATHS = ['/', '/adopt/cat', '/adopt/dog', '/apply', '/favorites'];

const url = (path: string) => `${SITE_ORIGIN}${SITE_BASE}${path === '/' ? '/' : path}`;

export function GET() {
	const paths = [
		...STATIC_PATHS,
		...animalService.cats.map((cat) => `/adopt/cat/${cat.slug}`),
		...animalService.dogs.map((dog) => `/adopt/dog/${dog.slug}`)
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
	.map(
		(path) => `\t<url>
\t\t<loc>${url(path)}</loc>
\t\t<changefreq>weekly</changefreq>
\t\t<priority>${path === '/' ? '1.0' : path.split('/').length > 3 ? '0.6' : '0.8'}</priority>
\t</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
