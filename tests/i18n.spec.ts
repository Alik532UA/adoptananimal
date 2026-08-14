import { expect, test } from '@playwright/test';

/**
 * Switching language must keep the reader on the page they were reading, and every
 * link they follow afterwards must stay in that language. Getting this wrong is not
 * an error anyone sees in the console — the site simply drifts back to English.
 */

test('switching language keeps the page and carries into later links', async ({ page }) => {
	await page.goto('/adopt/cat/basti');

	await page.getByTestId('lang-toggle-btn').click();
	const german = page.getByTestId('lang-option-de-link');

	// A real link, so it can be opened in a new tab and followed by a crawler.
	await expect(german).toHaveAttribute('href', '/de/adopt/cat/basti');
	await german.click();

	await expect(page).toHaveURL(/\/de\/adopt\/cat\/basti$/);
	expect(await page.getAttribute('html', 'lang')).toBe('de');

	await page.getByTestId('back-to-cats-link').click();
	await expect(page).toHaveURL(/\/de\/adopt\/cat$/);
});

test('the site chrome is in the same language as the page', async ({ page }) => {
	// The bug this guards: prerendering runs every page in one process, so a language
	// held in a module singleton leaked into the next page — a Ukrainian page came out
	// with Dutch navigation.
	for (const [path, expected] of [
		['/uk', 'uk'],
		['/de/adopt/dog', 'de'],
		['/nl/apply', 'nl'],
		['/favorites', 'en']
	] as const) {
		await page.goto(path);

		expect(await page.getAttribute('html', 'lang')).toBe(expected);

		const chromeLang = await page.evaluate(() => {
			const logo = document.querySelector('.header__logo-text')?.textContent?.trim() ?? '';
			return logo;
		});

		const byLanguage: Record<string, string> = {
			en: 'Adopt an animal',
			uk: 'Прихистити тварину',
			de: 'Tier adoptieren',
			nl: 'Adopteer een dier'
		};
		expect(chromeLang).toBe(byLanguage[expected]);
	}
});

test('each language declares the others', async ({ page }) => {
	await page.goto('/uk/adopt/cat');

	const alternates = await page.$$eval('link[rel="alternate"]', (links) =>
		links.map((l) => ({ lang: l.getAttribute('hreflang'), href: l.getAttribute('href') }))
	);

	expect(alternates.map((a) => a.lang).sort()).toEqual(['de', 'en', 'nl', 'uk', 'x-default']);
	expect(alternates.every((a) => a.href?.startsWith('https://'))).toBe(true);
});
