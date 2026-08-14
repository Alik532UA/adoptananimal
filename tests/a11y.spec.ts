import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * axe over the built site. Contrast in particular cannot be checked by reading CSS:
 * the project ships four themes across three skins, and a pairing that fails only in
 * the theme nobody develops in is exactly the one that reaches users.
 */

const THEMES = ['dark', 'light-green', 'orange-purple', 'winter'] as const;
const PAGES = ['/', '/adopt/cat', '/adopt/cat/basti', '/apply', '/favorites'];

/**
 * Waits for every running animation on the element to finish.
 *
 * axe samples colours at the moment it runs, so a menu still fading in measures as a
 * blend of itself and what is behind it: white over green read as #d3ddcd and scored
 * 4.48 against a pair that actually passes at 6.28. Emulating reduced motion did not
 * settle it reliably; waiting on the animations themselves does.
 */
const settle = (locator: import('@playwright/test').Locator) =>
	locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => {}));

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

for (const theme of THEMES) {
	test(`the open menus pass contrast in theme ${theme}`, async ({ page }) => {
		// A closed menu has nothing to measure, so axe over the page as loaded said
		// nothing about it. The active item paired --color-primary with a literal
		// white, which is 2.14:1 on the dark theme's green.
		await page.goto('/adopt/cat');
		await page.evaluate((t) => localStorage.setItem('adoptananimal_theme', t), theme);
		await page.reload();

		for (const menu of ['theme', 'style', 'lang']) {
			await page.getByTestId(`${menu}-toggle-btn`).click();
			await expect(page.getByRole('menu')).toBeVisible();
			await settle(page.getByRole('menu'));

			const results = await new AxeBuilder({ page })
				.include('[role="menu"]')
				.withTags(['wcag2aa'])
				.analyze();

			expect(
				results.violations.flatMap((v) =>
					v.nodes.map((n) => `${theme}/${menu}: ${v.id} ${n.target}`)
				)
			).toEqual([]);

			await page.keyboard.press('Escape');
		}
	});
}

test('a dropdown can be operated and left with the keyboard alone', async ({ page }) => {
	await page.goto('/adopt/cat');

	await page.getByTestId('theme-toggle-btn').click();
	// Focus moves into the menu, so the arrow keys have somewhere to start.
	await expect(page.getByTestId('theme-option-dark-btn')).toBeFocused();

	await page.keyboard.press('ArrowDown');
	await expect(page.getByTestId('theme-option-light-green-btn')).toBeFocused();

	await page.keyboard.press('End');
	await expect(page.getByTestId('theme-option-winter-btn')).toBeFocused();

	// Escape closes and hands focus back, rather than stranding the user inside.
	await page.keyboard.press('Escape');
	await expect(page.getByRole('menu')).toBeHidden();
	await expect(page.getByTestId('theme-toggle-btn')).toBeFocused();
});
