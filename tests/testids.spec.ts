import { expect, test } from '@playwright/test';

/**
 * Duplicate data-testid values only exist at runtime: the source holds one literal
 * inside a component that a list renders fifty times. A static check cannot see it,
 * and a duplicate makes every E2E locator that uses it non-deterministic.
 */

const PAGES = ['/', '/adopt/cat', '/adopt/dog', '/apply', '/favorites', '/uk', '/uk/adopt/cat'];

for (const path of PAGES) {
	test(`no duplicate data-testid on ${path}`, async ({ page }) => {
		await page.goto(path);
		await page.waitForLoadState('networkidle');

		const duplicates = await page.evaluate(() => {
			const counts = new Map<string, number>();
			for (const el of document.querySelectorAll('[data-testid]')) {
				// The cloned carousel half is aria-hidden and out of the tab order; its
				// copies are the same elements, not separate targets.
				if (el.closest('[aria-hidden="true"]')) continue;
				const id = el.getAttribute('data-testid') as string;
				counts.set(id, (counts.get(id) ?? 0) + 1);
			}
			return [...counts.entries()].filter(([, n]) => n > 1).map(([id, n]) => `${id} x${n}`);
		});

		expect(duplicates).toEqual([]);
	});
}

test('every interactive element can be reached by a stable locator', async ({ page }) => {
	await page.goto('/adopt/cat');
	await page.waitForLoadState('networkidle');

	// A control with neither an accessible name nor a testid cannot be targeted in a
	// test and, more importantly, cannot be announced to a screen reader.
	const unreachable = await page.evaluate(() =>
		[...document.querySelectorAll('button, a[href], input, select, textarea')]
			.filter((el) => !el.closest('[aria-hidden="true"]'))
			.filter((el) => {
				const named =
					el.getAttribute('aria-label') ||
					el.getAttribute('aria-labelledby') ||
					(el.textContent ?? '').trim() ||
					(el.id && document.querySelector(`label[for="${el.id}"]`));
				return !named && !el.getAttribute('data-testid');
			})
			.map((el) => `${el.tagName.toLowerCase()}.${el.className || '(no class)'}`)
	);

	expect(unreachable).toEqual([]);
});
