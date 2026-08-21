import { HIDDEN_ROUTES, SITE_BASE, SITE_ORIGIN } from '$lib/config';
import { LOCALES, localeSegment } from '$lib/i18n/locales';

// Prerendered so the sitemap line can carry the real origin and base path,
// which a file in static/ cannot know.
export const prerender = true;

/**
 * One `Disallow` per language of every hidden route (BETA-CHECKLIST-v8 § 4).
 *
 * Every language, not a pattern: `/apply/form` and `/uk/apply/form` are four separate
 * addresses, and a rule that names one leaves the other three crawlable. Written from
 * HIDDEN_ROUTES rather than by hand, so a route added there cannot arrive here late.
 */
const disallowLines = HIDDEN_ROUTES.flatMap((path) =>
	LOCALES.map((locale) => `Disallow: ${SITE_BASE}${localeSegment(locale)}${path}`)
).join('\n');

export function GET() {
	const body = `# allow crawling everything except the routes kept out of the index
User-agent: *
${disallowLines}

# AI Search Crawlers
User-agent: GPTBot
Allow: /
${disallowLines}

User-agent: PerplexityBot
Allow: /
${disallowLines}

User-agent: ClaudeBot
Allow: /
${disallowLines}

Sitemap: ${SITE_ORIGIN}${SITE_BASE}/sitemap.xml
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
}
