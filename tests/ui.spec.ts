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
					type: card.querySelector('.animal-card__image--cat') ? 'cat' : 'dog',
					adopted: card.classList.contains('animal-card--adopted')
				})
			)
		);

	test('shows every animal, mixed, with no three of a kind in a row', async ({ page }) => {
		await page.goto('/');
		const cards = await order(page);

		// Everyone still looking for a home, plus a few who found one.
		expect(cards.length).toBeGreaterThan(30);
		expect(new Set(cards.map((c) => c.slug)).size).toBe(cards.length);

		// A shelter that shows nothing but successes reads as an archive.
		const adopted = cards.filter((c) => c.adopted).length;
		expect(adopted / cards.length).toBeLessThanOrEqual(0.1);

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
		const first = await order(page);

		await page.reload();
		const second = await order(page);

		expect(second.map((c) => c.slug).join()).not.toBe(first.map((c) => c.slug).join());

		// Everyone still looking for a home is there both times. Which few adopted
		// animals come along is drawn fresh, so that part of the set is expected to move.
		const stillLooking = (cards: typeof first) =>
			cards
				.filter((c) => !c.adopted)
				.map((c) => c.slug)
				.sort();

		expect(stillLooking(second)).toEqual(stillLooking(first));
	});
});

test.describe('the about heading', () => {
	// It has been "fixed" more than once in both directions: made to wrap so it would
	// centre, then made nowrap again so it would be one line. It has to be both, and
	// the only way that holds is if the type shrinks to the card it sits in. This test
	// fails on either symptom, in every language and at every width that matters.
	const LANGUAGES = ['/', '/uk', '/de', '/nl'] as const;
	const WIDTHS = [1440, 1024, 768, 500, 400, 320];

	for (const path of LANGUAGES) {
		test(`stays on one line and centred at every width (${path})`, async ({ page }) => {
			for (const width of WIDTHS) {
				await page.setViewportSize({ width, height: 900 });
				await page.goto(path);

				const measured = await page.evaluate(() => {
					const card = document.querySelector('.about__card') as HTMLElement;
					const title = document.querySelector('.about .section__title') as HTMLElement;
					const range = document.createRange();
					range.selectNodeContents(title);
					const rects = [...range.getClientRects()];
					const c = card.getBoundingClientRect();

					return {
						text: title.textContent?.trim() ?? '',
						lines: rects.length,
						leftGap: rects[0].left - c.left,
						rightGap: c.right - rects[0].right,
						fontSize: parseFloat(getComputedStyle(title).fontSize),
						whiteSpace: getComputedStyle(title).whiteSpace
					};
				});

				const where = `${path} at ${width}px ("${measured.text}")`;

				expect(measured.lines, `${where} wrapped onto ${measured.lines} lines`).toBe(1);
				// Asserted directly, not only through the outcome: the type currently shrinks
				// enough that the text would fit anyway, so dropping the declaration would
				// pass unnoticed until a longer translation arrived.
				expect(measured.whiteSpace, `${where} lost white-space: nowrap`).toBe('nowrap');
				expect(measured.leftGap, `${where} overflows the card on the left`).toBeGreaterThanOrEqual(
					0
				);
				expect(
					measured.rightGap,
					`${where} overflows the card on the right`
				).toBeGreaterThanOrEqual(0);
				expect(
					Math.abs(measured.leftGap - measured.rightGap),
					`${where} is off centre by ${Math.round(Math.abs(measured.leftGap - measured.rightGap))}px`
				).toBeLessThanOrEqual(2);
				// Small is acceptable on a 320px screen; invisible is not.
				expect(
					measured.fontSize,
					`${where} shrank to ${measured.fontSize}px`
				).toBeGreaterThanOrEqual(12);
			}
		});
	}
});
