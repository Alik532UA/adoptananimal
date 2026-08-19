import { langEntries } from '$lib/i18n/entries';
import type { EntryGenerator } from './$types';

/**
 * The checklist for a live tester (BETA-CHECKLIST-v8).
 *
 * Prerendered in every language like every other page, and kept out of the index by
 * `HIDDEN_ROUTES` in `src/lib/config.ts`: no canonical, no hreflang, `noindex`, absent
 * from the sitemap, disallowed in `robots.txt`. `scripts/check-build.js` asserts all
 * of that on the built output, and asserts the page exists in each language — a hidden
 * page that quietly stopped being generated would hand testers a 404.
 *
 * Not excused from the rest of the build checks. Treating it like the 404 shell would
 * be two lines cheaper and would make the page testers actually use the least covered
 * one in the build (§ 5.5).
 */
export const prerender = true;

export const entries: EntryGenerator = langEntries;
