import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * axe over the built site. Contrast in particular cannot be checked by reading CSS:
 * the project ships four themes across three skins, and a pairing that fails only in
 * the theme nobody develops in is exactly the one that reaches users.
 */

const THEMES = ['dark', 'light-green', 'orange-purple', 'winter'] as const;
const PAGES = ['/', '/adopt/cat', '/adopt/cat/basti', '/apply', '/favorites'];

const audit = (page: import('@playwright/test').Page) =>
	new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

for (const path of PAGES) {
	test(`${path} has no accessibility violations`, async ({ page }) => {
		await page.goto(path);
		await page.waitForLoadState('networkidle');

		const results = await audit(page);
		expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
	});
}

for (const theme of THEMES) {
	test(`theme ${theme} keeps contrast within WCAG AA`, async ({ page }) => {
		await page.goto('/adopt/cat');
		await page.evaluate((t) => {
			localStorage.setItem('adoptananimal_theme', t);
		}, theme);
		await page.reload();
		await page.waitForLoadState('networkidle');

		expect(await page.getAttribute('html', 'data-theme')).toBe(theme);

		const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
		const contrast = results.violations.filter((v) => v.id === 'color-contrast');

		expect(
			contrast.flatMap((v) => v.nodes.map((n) => `${theme}: ${n.target} — ${n.failureSummary}`))
		).toEqual([]);
	});
}

test('the skip link reaches this page, not the home page', async ({ page }) => {
	await page.goto('/adopt/cat');

	await page.keyboard.press('Tab');
	const skip = page.locator('.skip-link');
	await expect(skip).toBeFocused();

	await page.keyboard.press('Enter');
	// It must stay on the same page — the bug it replaced sent keyboard users home.
	await expect(page).toHaveURL(/\/adopt\/cat(#main-content)?$/);
});

test('the language pages declare their own language', async ({ page }) => {
	for (const [path, lang] of [
		['/', 'en'],
		['/uk/adopt/cat', 'uk'],
		['/de/apply', 'de'],
		['/nl', 'nl']
	] as const) {
		await page.goto(path);
		expect(await page.getAttribute('html', 'lang')).toBe(lang);
	}
});
