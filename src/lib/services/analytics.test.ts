import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ANALYTICS-v8 § 5 — гарди лічильника.
 */
function stubEnvironment(env: { browser: boolean; dev: boolean }) {
	vi.doMock('$app/environment', () => ({ ...env, building: false, version: 'test' }));
}

describe('аналітика: гарди (ANALYTICS-v8 § 5)', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.stubGlobal('window', {
			dataLayer: [],
			gtag: undefined
		});
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
