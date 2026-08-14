import type { ParamMatcher } from '@sveltejs/kit';
import { PREFIXED_LOCALES } from '$lib/i18n/locales';

/**
 * Without a matcher the optional [[lang]] segment would swallow every first path
 * segment, so /adopt would be read as the language "adopt" and the page would
 * silently not exist (SVELTEKIT-DATA § 2.2).
 */
export const match = ((param: string) =>
	(PREFIXED_LOCALES as readonly string[]).includes(param)) satisfies ParamMatcher;
