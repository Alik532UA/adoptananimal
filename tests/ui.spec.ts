import { expect, test } from '@playwright/test';

/**
 * Layout and affordance checks for things that fail silently.
 *
 * None of these were caught by svelte-check, eslint or axe: a lost CSS selector left
 * the fields with the browser's default styling, and the browser default happens to
 * have adequate contrast. The page looked broken and every gate stayed green.
 */

const THEMES = ['dark', 'light-green', 'orange-purple', 'winter'] as const;

test.describe('the application form', () => {
	for (const theme of THEMES) {
		test(`fields read as fields in theme ${theme}`, async ({ page }) => {
			await page.goto('/apply');
			await page.evaluate((t) => localStorage.setItem('adoptananimal_theme', t), theme);
			await page.reload();

			const fields = await page.evaluate(() => {
				const els = [
					...document.querySelectorAll<HTMLElement>('.apply__form input, .apply__form textarea')
				];
				return els.map((el) => {
					const cs = getComputedStyle(el);
					return {
						testId: el.getAttribute('data-testid'),
						height: Math.round(el.getBoundingClientRect().height),
						transparent: cs.backgroundColor === 'rgba(0, 0, 0, 0)',
						paddingTop: parseFloat(cs.paddingTop),
						borderWidth: parseFloat(cs.borderTopWidth),
						radius: parseFloat(cs.borderTopLeftRadius),
						fontSize: parseFloat(cs.fontSize)
					};
				});
			});

			expect(fields.length).toBeGreaterThan(3);

			for (const field of fields) {
				// A field with no surface of its own reads as text floating on the page.
				expect(field.transparent, `${field.testId} has no background`).toBe(false);
				// The browser default is a 16px bar with no padding; ours is a real control.
				expect(field.height, `${field.testId} is too short`).toBeGreaterThanOrEqual(40);
				expect(field.paddingTop, `${field.testId} has no padding`).toBeGreaterThanOrEqual(8);
				expect(field.borderWidth, `${field.testId} has no edge`).toBeGreaterThan(0);
				expect(field.radius, `${field.testId} is not rounded like the rest`).toBeGreaterThan(0);
				// 13.33px is the UA default, and it is smaller than the labels above it.
				expect(
					field.fontSize,
					`${field.testId} uses the browser default size`
				).toBeGreaterThanOrEqual(15);
			}

			// Every field is styled the same way; one odd control out is the visible symptom.
			const shapes = new Set(fields.map((f) => `${f.paddingTop}/${f.borderWidth}/${f.radius}`));
			expect(shapes.size, 'fields are styled inconsistently').toBe(1);
		});
	}

	test('the card does not cover the text above it', async ({ page }) => {
		await page.goto('/apply');

		const gap = await page.evaluate(() => {
			const subtitle = document.querySelector('.apply-hero__subtitle')!.getBoundingClientRect();
			const card = document.querySelector('.apply__form-card')!.getBoundingClientRect();
			return Math.round(card.top - subtitle.bottom);
		});

		// The card is pulled up over the hero on purpose; it must eat padding, not words.
		expect(gap).toBeGreaterThan(0);
	});
});

test('the sticky header hides what scrolls under it', async ({ page }) => {
	await page.goto('/apply');
	await page.evaluate(() => window.scrollTo(0, 400));

	const header = await page.evaluate(() => {
		const cs = getComputedStyle(document.querySelector('.header')!);
		const alpha = cs.backgroundColor
			.match(/[\d.]+\s*\)$/)?.[0]
			.replace(')', '')
			.trim();
		return {
			alpha: alpha ? parseFloat(alpha) : 1,
			blur: cs.backdropFilter
		};
	});

	// Either it blurs what is behind it or it is opaque enough to stand on its own.
	// At 50% with no blur, form fields read straight through the bar into the logo.
	expect(header.blur !== 'none' || header.alpha >= 0.95).toBe(true);
	expect(header.alpha).toBeGreaterThanOrEqual(0.85);
});

test.describe('the featured carousel', () => {
	const order = (page: import('@playwright/test').Page) =>
		page.evaluate(() =>
			[...document.querySelectorAll('.carousel-content:not([aria-hidden]) .animal-card')].map(
				(card) => ({
					slug: card.id.replace('card-', ''),
					type: card.querySelector('.animal-card__image--cat') ? 'cat' : 'dog'
				})
			)
		);

	test('shows every animal, mixed, with no three of a kind in a row', async ({ page }) => {
		await page.goto('/');
		const cards = await order(page);

		// The whole shelter, not a selection: the carousel is the front page.
		expect(cards.length).toBeGreaterThan(40);
		expect(new Set(cards.map((c) => c.slug)).size).toBe(cards.length);

		let run = 1;
		let longest = 1;
		for (let i = 1; i < cards.length; i++) {
			run = cards[i].type === cards[i - 1].type ? run + 1 : 1;
			longest = Math.max(longest, run);
		}

		expect(longest, 'three of the same kind in a row').toBeLessThanOrEqual(2);
	});

	test('picks a different order on each visit', async ({ page }) => {
		// The order used to come from the build, so every visitor saw the same one and
		// the visible window of the carousel was always the same few cats.
		await page.goto('/');
		const first = (await order(page)).map((c) => c.slug).join();

		await page.reload();
		const second = (await order(page)).map((c) => c.slug).join();

		expect(second).not.toBe(first);
		expect(second.split(',').sort()).toEqual(first.split(',').sort());
	});
});
