/**
 * Google Analytics 4 — єдиний лічильник проєкту (ANALYTICS-v8 § 1).
 *
 * Endpoints for CSP validation (ANALYTICS-v8 § 2.3):
 * - https://www.googletagmanager.com
 * - https://*.google-analytics.com
 * - https://*.analytics.google.com
 */
import { browser, dev } from '$app/environment';

export const GA_ID_PLACEHOLDER = 'G-XXXXXXXXXX';

/**
 * ID лічильника Google Analytics 4.
 * Анотація `: string` обов'язкова, щоб TypeScript не звужував літерал.
 */
const GA_ID: string = 'G-XXXXXXXXXX';

export type AnalyticsEvent =
	| 'adopt_click'
	| 'animal_filter'
	| 'form_open'
	| 'language_change'
	| 'theme_change'
	| 'section_view'
	| 'service_badge_click';

const isConfigured = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== GA_ID_PLACEHOLDER;
const enabled = () => browser && !dev && isConfigured;

let started = false;

export function initAnalytics() {
	if (!enabled() || started) return;
	started = true;

	window.dataLayer = window.dataLayer || [];
	window.gtag = function gtag() {
		window.dataLayer.push(arguments);
	};
	window.gtag('js', new Date());
	// Ручні page_view у SvelteKit SPA, щоб не було подвійного обліку
	window.gtag('config', GA_ID, { send_page_view: false });

	const s = document.createElement('script');
	s.async = true;
	s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
	document.head.appendChild(s);
}

export function trackPageView(path = typeof location !== 'undefined' ? location.pathname : '/') {
	if (!enabled()) return;
	initAnalytics();
	window.gtag('event', 'page_view', { page_path: path });
}

export function track(event: AnalyticsEvent, params: Record<string, string | number> = {}) {
	if (!enabled()) return;
	initAnalytics();
	window.gtag('event', event, params);
}

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
	}
}
