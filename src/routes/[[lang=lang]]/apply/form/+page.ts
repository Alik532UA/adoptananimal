import { langEntries } from '$lib/i18n/entries';
import type { EntryGenerator } from './$types';

/**
 * The on-site application form, kept as a fallback.
 *
 * /apply embeds the Google Form the shelter actually collects through. This page
 * holds the form that came before it, unlinked and marked noindex, so returning to
 * collecting applications on the site is a routing change rather than a rewrite.
 * It is prerendered like everything else, so it does not rot: the type check, the
 * unit tests and the E2E suite all still cover it.
 */
export const prerender = true;

export const entries: EntryGenerator = langEntries;
