import { expect, test } from '@playwright/test';

/**
 * The path a visitor actually takes: find an animal, read about it, start an
 * application. Every step uses a role or label first, and a testid only where the
 * semantics are not enough (CODE-QUALITY § 5.1).
 */

test('a visitor can go from the home page to an application for a specific cat', async ({
	page
}) => {
	await page.goto('/');

	await page.getByTestId('nav-adopt-cat-link').click();
	await expect(page).toHaveURL(/\/adopt\/cat$/);

	const firstCat = page.getByTestId('cats-list').getByRole('link').first();
	const name = (await firstCat.locator('.animal-card__name').textContent())?.trim();
	await firstCat.click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(name ?? '');

	await page.getByTestId('apply-top-link').click();
	await expect(page).toHaveURL(/\/apply\?animal=/);

	// The animal travels with the visitor instead of having to be typed again.
	await expect(page.getByTestId('form-animal-input')).toHaveValue(name ?? '');
});

test('the form refuses to submit empty and says what is wrong', async ({ page }) => {
	await page.goto('/apply');

	await page.getByTestId('apply-submit-btn').click();

	// Errors are announced, not just coloured red.
	const errors = page.getByRole('alert');
	await expect(errors.first()).toBeVisible();
	await expect(await errors.count()).toBeGreaterThan(1);

	await expect(page.getByTestId('form-email-input')).toHaveAttribute('aria-invalid', 'true');
});

test('filtering narrows the list and survives a reload', async ({ page }) => {
	await page.goto('/adopt/cat');

	const all = await page.getByTestId('cats-list').getByRole('link').count();

	await page.getByTestId('filter-gender-female-btn').click();
	await expect(page).toHaveURL(/gender=female/);

	const filtered = await page.getByTestId('cats-list').getByRole('link').count();
	expect(filtered).toBeLessThan(all);

	// The filter lives in the URL, so a reload — or a shared link — keeps it.
	await page.reload();
	await expect(page.getByTestId('filter-gender-female-btn')).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	expect(await page.getByTestId('cats-list').getByRole('link').count()).toBe(filtered);
});

test('a favourite survives a reload', async ({ page }) => {
	await page.goto('/adopt/cat');

	const card = page.getByTestId('cats-list').getByRole('link').first();
	const slug = (await card.getAttribute('href'))?.split('/').pop();

	await page.getByTestId(`animal-card-${slug}-favorite-btn`).click();
	await page.goto('/favorites');

	await expect(page.getByTestId(`animal-card-${slug}-card`)).toBeVisible();
});
