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
const sentryPkg = '@sentry/sveltekit';

interface SentryClient {
	init: (options: Record<string, unknown>) => void;
	captureException: (error: unknown, context?: Record<string, unknown>) => void;
}

const tracker: Promise<SentryClient | null> | null =
	DSN && !dev
		? import(/* @vite-ignore */ sentryPkg)
				.then((module: unknown) => {
					const Sentry = module as SentryClient;
					Sentry.init({
						dsn: DSN,
						enabled: !dev,
						tracesSampleRate: 0.1,
						replaysSessionSampleRate: 0.0,
						replaysOnErrorSampleRate: 1.0,
						environment: import.meta.env.MODE,
						ignoreErrors: ['AbortError', 'Failed to fetch', 'ResizeObserver loop limit exceeded'],
						// `any` тут валив `@typescript-eslint/no-explicit-any`, тож
						// заголовки звужуються явно — так само, як у решті репозиторіїв.
						beforeSend(event: Record<string, unknown>) {
							const req = event.request as Record<string, Record<string, unknown>> | undefined;
							if (req?.headers) {
								delete req.headers['authorization'];
								delete req.headers['cookie'];
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
