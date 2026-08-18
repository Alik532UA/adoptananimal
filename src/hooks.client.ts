import type { HandleClientError } from '@sveltejs/kit';
import { logService } from '$lib/services/logService.svelte';

/**
 * The last net under everything the browser runs (ERROR-HANDLING-v8 § 2.4).
 *
 * It is not a duplicate of the two nets already in place. `<svelte:boundary>` in the
 * root layout catches what throws while a component renders, and the `error` /
 * `unhandledrejection` listeners catch what throws outside SvelteKit's control. This
 * one catches the gap between them: an exception inside a client-side `load`, inside
 * navigation, or inside hydration itself — none of which reaches either.
 *
 * `error()` and `redirect()` do not pass through here: SvelteKit calls this only for
 * failures nobody expected, which is exactly the level `error` is for (§ 1.3).
 *
 * The empty message is deliberate. `+error.svelte` reads
 * `page.error?.message || t('error.generic')`, so anything returned here would be a
 * fixed English string shown to a Dutch or German visitor — and SvelteKit's own
 * default, `Internal Error`, is exactly that string. Returning nothing to say lets
 * the page say it in the language the visitor is reading.
 */
export const handleError: HandleClientError = ({ error, event }) => {
	logService.error('app', `Unhandled client error at ${event.url.pathname}: ${error}`);
	return { message: '' };
};
