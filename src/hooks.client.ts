import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';
import { logService } from '$lib/services/logService.svelte';
import type { HandleClientError } from '@sveltejs/kit';

/**
 * Telemetry endpoint for CSP validation (OBSERVABILITY-v8 § 1.5):
 * - https://*.sentry.io
 * - https://*.ingest.sentry.io
 */
const DSN = env.PUBLIC_SENTRY_DSN || '';

const tracker =
	DSN && !dev
		? // @ts-ignore - optional telemetry package
			import('@sentry/sveltekit')
				.then((Sentry) => {
					Sentry.init({
						dsn: DSN,
						enabled: !dev,
						tracesSampleRate: 0.1,
						replaysSessionSampleRate: 0.0,
						replaysOnErrorSampleRate: 1.0,
						environment: import.meta.env.MODE,
						ignoreErrors: ['AbortError', 'Failed to fetch', 'ResizeObserver loop limit exceeded'],
						beforeSend(event: any) {
							if (event.request?.headers) {
								delete event.request.headers['authorization'];
								delete event.request.headers['cookie'];
							}
							return event;
						}
					});
					return Sentry;
				})
				.catch(() => null)
		: null;

export const handleError: HandleClientError = async ({ error, event, status, message }) => {
	logService.error('app', `Unhandled client error at ${event.url.pathname}: ${error}`);
	if (tracker) {
		const Sentry = await tracker;
		Sentry?.captureException(error, { extra: { route: event.url.pathname, status, message } });
	}
	return { message: '' };
};
