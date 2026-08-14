import { SITE_BASE, SITE_ORIGIN } from '$lib/config';

// Prerendered so the sitemap line can carry the real origin and base path,
// which a file in static/ cannot know.
export const prerender = true;

export function GET() {
	const body = `# allow crawling everything by default
User-agent: *
Disallow:

Sitemap: ${SITE_ORIGIN}${SITE_BASE}/sitemap.xml
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
}
