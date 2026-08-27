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

	// An adopted animal has no application button, and the first card in canonical
	// order happens to be one — picking "the first card" made this test depend on
	// which animals are currently available.
	const available = page
		.getByTestId('cats-list')
		.getByRole('link')
		.filter({ hasNot: page.locator('.animal-card__adopted-badge') })
		.first();

	const name = (await available.locator('.animal-card__name').textContent())?.trim();
	await available.click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(name ?? '');

	await page.getByTestId('apply-top-link').click();
	await expect(page).toHaveURL(/\/apply\?animal=/);

	// Applications go through an embedded Google form, which cannot be prefilled from
	// here, so the animal is named on the page instead of being silently dropped.
	await expect(page.getByTestId('apply-google-form-container')).toBeVisible();
	await expect(page.getByTestId('apply-chosen-animal-text')).toContainText(name ?? '');
});

test('the form refuses to submit empty and says what is wrong', async ({ page }) => {
	await page.goto('/apply/form');

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

	// Polled, not sampled once: the URL updates before the list re-renders, so a
	// single read lands on the old count roughly one run in ten.
	await expect
		.poll(() => page.getByTestId('cats-list').getByRole('link').count())
		.toBeLessThan(all);

	const filtered = await page.getByTestId('cats-list').getByRole('link').count();

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

/**
 * The chrome keeps its pictures across a navigation that changes the URL depth.
 *
 * A single-page app never re-creates the header and the footer, so any attribute
 * written into them at hydration outlives every navigation. While `paths.relative`
 * was on its default, those attributes held a prefix computed for the address the
 * document had arrived at — `../images/logo/…` on `/adopt/cat`. One click through to
 * `/adopt/cat/<name>` and the same string asked for `/adopt/images/logo/…`: 27 broken
 * images in the header and the footer, including both shelters' logos.
 *
 * Reloading put them back, which is what made it read as intermittent rather than as
 * a rule, and is why it outlived three audits: every gate measured a document that
 * had just been served, and this only appears after a click.
 *
 * **Asserted by fetching the addresses, not by waiting for the pictures to decode.**
 * Most of these images sit inside the closed social panels, where the browser is free
 * never to load them at all — `decode()` on one of those never settles, and the first
 * draft of this test timed out instead of failing. What went wrong was the address,
 * so the address is what is checked. The two footer logos are then confirmed to have
 * really decoded, because they are the ones a visitor can see.
 *
 * Reverse experiment: `paths.relative: true` in svelte.config.js reddens this with
 * 27 of 27 unreachable, and `npm run check:build` § 8 goes red beside it.
 */
test('header and footer keep their images after a navigation that changes depth', async ({
	page
}) => {
	await page.goto('/adopt/cat');

	// A real click, not goto(): the defect lives in the client-side navigation, and a
	// freshly served document would arrive with a prefix that is correct for it.
	await page.getByTestId('cats-list').getByRole('link').first().click();
	await expect(page).toHaveURL(/\/adopt\/cat\/[^/]+$/);

	const unreachable = await page.evaluate(async () => {
		const images = [...document.querySelectorAll('header img, footer img')];
		const results = await Promise.all(
			images.map(async (img) => {
				const url = (img as HTMLImageElement).src;
				const status = await fetch(url, { method: 'HEAD' })
					.then((response) => response.status)
					.catch(() => 0);
				return { attribute: img.getAttribute('src'), status };
			})
		);
		return { total: images.length, bad: results.filter((r) => r.status !== 200) };
	});

	expect(
		unreachable.total,
		'no chrome images found — this check would pass on an empty page'
	).toBeGreaterThan(0);
	expect(
		unreachable.bad,
		`addresses the chrome lost on navigation (of ${unreachable.total}):\n` +
			unreachable.bad.map((b) => `${b.status} ${b.attribute}`).join('\n')
	).toEqual([]);

	// And the two a visitor actually looks at really arrived, not merely answered 200.
	await page.locator('footer').scrollIntoViewIfNeeded();
	const logos = page.locator('footer .org-logos__img');
	await expect(logos).toHaveCount(2);

	for (const logo of await logos.all()) {
		await expect
			.poll(() => logo.evaluate((img) => (img as HTMLImageElement).naturalWidth))
			.toBeGreaterThan(0);
	}
});
