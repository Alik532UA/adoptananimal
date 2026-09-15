import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ANALYTICS-v9 § 5.1 — гарди лічильника (AN-GUARD-TEST-TRAFFIC).
 */
function stubEnvironment(env: { browser: boolean; dev: boolean }) {
	vi.doMock('$app/environment', () => ({ ...env, building: false, version: 'test' }));
}

describe('аналітика: гарди (ANALYTICS-v9 § 5.1)', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.stubGlobal('window', {
			location: { hostname: 'localhost', origin: 'http://localhost:5699', pathname: '/' },
			dataLayer: [],
			gtag: undefined
		});
		vi.stubGlobal('navigator', { webdriver: false });
		vi.stubGlobal('document', {
			createElement: vi.fn(() => ({ src: '', async: false })),
			head: {
				appendChild: vi.fn()
			}
		});
	});

	afterEach(() => {
		vi.doUnmock('$app/environment');
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('у dev-режимі не відправляє нічого й не вантажить скрипт', async () => {
		stubEnvironment({ browser: true, dev: true });
		const { track, trackPageView, initAnalytics } = await import('./analytics');

		initAnalytics();
		track('language_change');
		trackPageView();

		expect(
			(window as unknown as { gtag?: unknown }).gtag,
			'у dev `gtag` не має з’являтися'
		).toBeUndefined();
	});

	it('мовчить на localhost навіть при dev: false (preview/локальні тести)', async () => {
		stubEnvironment({ browser: true, dev: false });
		vi.stubGlobal('window', {
			location: { hostname: 'localhost', origin: 'http://localhost:5699', pathname: '/' },
			dataLayer: [],
			gtag: undefined
		});
		const { track, trackPageView, initAnalytics } = await import('./analytics');
		initAnalytics();
		track('language_change');
		trackPageView();
		expect((window as unknown as { dataLayer?: unknown[] }).dataLayer?.length ?? 0).toBe(0);
	});

	it('мовчить при navigator.webdriver: true навіть на робочому домені', async () => {
		stubEnvironment({ browser: true, dev: false });
		vi.stubGlobal('window', {
			location: {
				hostname: 'adoptananimal.org',
				origin: 'https://adoptananimal.org',
				pathname: '/'
			},
			dataLayer: [],
			gtag: undefined
		});
		vi.stubGlobal('navigator', { webdriver: true });
		const { track, trackPageView, initAnalytics } = await import('./analytics');
		initAnalytics();
		track('language_change');
		trackPageView();
		expect((window as unknown as { dataLayer?: unknown[] }).dataLayer?.length ?? 0).toBe(0);
	});

	it('працює у продакшені (не dev, не localhost, не webdriver)', async () => {
		stubEnvironment({ browser: true, dev: false });
		let mockDataLayer: unknown[] = [];
		vi.stubGlobal('window', {
			location: {
				hostname: 'adoptananimal.org',
				origin: 'https://adoptananimal.org',
				pathname: '/'
			},
			// Сетер СПРАВЖНІЙ: `initAnalytics` робить `window.dataLayer = window.dataLayer ?? []`,
			// і порожній сетер мовчки губив би присвоєння — перевірка трималася б
			// на значенні виразу присвоєння, а не на стані вікна.
			get dataLayer() {
				return mockDataLayer;
			},
			set dataLayer(value: unknown[]) {
				mockDataLayer = value;
			}
		});
		vi.stubGlobal('navigator', { webdriver: false });
		const { trackPageView, initAnalytics } = await import('./analytics');
		initAnalytics();
		trackPageView();
		expect(mockDataLayer.length).toBeGreaterThan(0);
	});

	it('без браузера мовчить — prerender не має слати подій', async () => {
		stubEnvironment({ browser: false, dev: false });
		const { track, trackPageView } = await import('./analytics');

		track('language_change');
		trackPageView();

		expect(
			(window as unknown as { dataLayer?: unknown[] }).dataLayer?.length ?? 0,
			'черга подій не має підніматися під час prerender'
		).toBe(0);
	});

	it('перевірка плейсхолдера жива, а не завжди-хибна (CODE-QUALITY-v8 § 1.3)', () => {
		const source = readFileSync('src/lib/services/analytics.ts', 'utf8');
		expect(
			source,
			'GA_ID без анотації `: string` — порівняння з плейсхолдером стане мертвим кодом'
		).toMatch(/const GA_ID: string =/);
		expect(source, 'зник сам плейсхолдер, з яким звіряються').toContain('G-XXXXXXXXXX');
	});
});
