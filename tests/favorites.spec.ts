import { expect, test, type Page } from '@playwright/test';

/**
 * Keeping an animal: the button on its own page, the hearts that say where it went,
 * and letting go of one without the rest of the grid lurching.
 *
 * All three are motion, and motion is the thing a green suite is worst at noticing —
 * every one of these passes trivially if you only look at the state afterwards. So each
 * test here samples DURING the change: mid-flight, mid-fade, mid-reflow.
 */

/** Slugs that exist in the data and are cheap to seed. */
const SEED = ['basti', 'berry', 'bill', 'black', 'cherry', 'demi'];

async function seedFavourites(page: Page, slugs: string[]) {
	await page.addInitScript((list) => {
		try {
			localStorage.setItem('adoptananimal_favorites', JSON.stringify(list));
		} catch {
			/* private mode — the assertions will say the list never arrived */
		}
	}, slugs);
}

test.describe("an animal's own page", () => {
	test('offers a way to keep the animal, and says which state it is in', async ({ page }) => {
		// It had none: the card in a list carried the only favourite button on the site,
		// so the page a visitor opens to decide was the one place they could not decide.
		await page.goto('/adopt/cat/basti');

		const button = page.getByTestId('detail-favorite-btn');
		await expect(button).toBeVisible();
		await expect(button, 'nothing has been saved yet').toHaveAttribute('aria-pressed', 'false');

		await button.click();
		await expect(button).toHaveAttribute('aria-pressed', 'true');
		await expect(page.getByTestId('nav-favorites-link')).toContainText('1');

		// The label states the state rather than the action, so it has to change with it.
		const saved = (await button.innerText()).trim();
		await button.click();
		await expect(button).toHaveAttribute('aria-pressed', 'false');
		expect(
			(await button.innerText()).trim(),
			'the label reads the same saved and unsaved'
		).not.toBe(saved);
	});

	test('the button sits beside the name and keeps its label back until asked', async ({ page }) => {
		// It used to be in the column of buttons under the photograph, which is a list of
		// ways OFF the page. Icon only now, following the two side buttons in the footer.
		await page.goto('/adopt/cat/basti');

		const button = page.getByTestId('detail-favorite-btn');
		const label = page.locator('.detail__fav-label');

		const nameBox = await page.locator('.detail__name').boundingBox();
		const buttonBox = await button.boundingBox();
		expect(buttonBox!.x, 'the button is not after the name').toBeGreaterThan(nameBox!.x);

		/*
		 * Level with the LETTERS, not merely on the same line.
		 *
		 * This used to allow 60px of slack between the two boxes, which is most of the
		 * heading — it passed happily while the button floated 6px above the name,
		 * pinned to the top of a line box taller than itself. Measured against the ink
		 * (a Range over the text) rather than the h1's box, because the box includes the
		 * line-height leading and centring against that is not the same thing.
		 */
		const offset = await page.evaluate(() => {
			const heading = document.querySelector('.detail__name')!;
			const range = document.createRange();
			range.selectNodeContents(heading);
			const ink = range.getBoundingClientRect();
			const glyph = document.querySelector('.detail__fav')!.getBoundingClientRect();
			return Math.abs(glyph.top + glyph.height / 2 - (ink.top + ink.height / 2));
		});
		expect(
			offset,
			`the button sits ${Math.round(offset)}px off the middle of the name`
		).toBeLessThanOrEqual(2);

		expect(
			await page.locator('.detail__aside-actions [data-testid="detail-favorite-btn"]').count()
		).toBe(0);

		// WCAG 2.5.8 — the glyph is small, the target is not.
		expect(buttonBox!.width).toBeGreaterThanOrEqual(44);
		expect(buttonBox!.height).toBeGreaterThanOrEqual(44);

		await expect(label).toHaveCSS('opacity', '0');
		await button.hover();
		await expect(label).toHaveCSS('opacity', '1');
	});

	test('the choice survives a reload', async ({ page }) => {
		await page.goto('/adopt/cat/berry');
		await page.getByTestId('detail-favorite-btn').click();
		await page.reload();
		await expect(page.getByTestId('detail-favorite-btn')).toHaveAttribute('aria-pressed', 'true');
	});
});

test.describe('the header on a phone', () => {
	test('offers Favorites in the bar, but only once something is saved', async ({ page }) => {
		// With nothing saved it is a link to an empty page beside a zero. Rendered at all
		// rather than shown disabled: a control that does nothing is worse than no control.
		await page.setViewportSize({ width: 480, height: 900 });
		await page.goto('/adopt/cat');
		await expect(page.getByTestId('header-favorites-mobile-link')).toHaveCount(0);

		await page.locator('button[data-testid$="-favorite-btn"]').first().click();

		const link = page.getByTestId('header-favorites-mobile-link');
		await expect(link).toBeVisible();
		await expect(link).toContainText('1');
		// Its only text is a number, so the name has to come from aria-label.
		await expect(link).toHaveAttribute('aria-label', /1$/);

		// Its own locator, not the nav's: two elements answering `nav-favorites-link`
		// would make every test that uses it a guess, and tests/testids.spec.ts says so.
		await expect(page.locator('[data-testid="nav-favorites-link"]')).toHaveCount(1);
	});

	test('the bar link is a phone thing — the wide layout has its own', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto('/adopt/cat');
		await page.locator('button[data-testid$="-favorite-btn"]').first().click();

		await expect(page.getByTestId('nav-favorites-link')).toBeVisible();
		await expect(page.getByTestId('header-favorites-mobile-link')).toBeHidden();
	});
});

test.describe('the hearts that fly to the counter', () => {
	test('leave the button that was pressed and clear up after themselves', async ({ page }) => {
		await page.goto('/adopt/cat/basti');
		await page.getByTestId('detail-favorite-btn').click();

		const layer = page.locator('.fly-to-favorites');
		await expect(layer).toBeAttached();

		// Animating, not merely present: seven motionless glyphs pinned over the page
		// would satisfy a count and look like a rendering fault.
		const running = await layer.evaluate(
			(el) =>
				[...el.querySelectorAll('.fly-to-favorites__heart')].filter(
					(h) => h.getAnimations().length > 0
				).length
		);
		expect(running, 'the hearts are on the page but nothing is moving them').toBeGreaterThan(0);

		// It appends itself to <body>; left behind, one layer per click accumulates.
		await expect(layer).not.toBeAttached({ timeout: 5000 });
	});

	test('do not fly on the way out — that would point the wrong way', async ({ page }) => {
		await seedFavourites(page, ['basti']);
		await page.goto('/adopt/cat/basti');
		await expect(page.getByTestId('detail-favorite-btn')).toHaveAttribute('aria-pressed', 'true');

		/*
		 * An observer, because "never appeared" is not something a locator can say.
		 *
		 * The first version of this waited 150ms and asserted `toHaveCount(0)`. That
		 * passes whether or not the hearts flew: `toHaveCount` retries until it matches,
		 * and the layer removes itself after about nine hundred milliseconds — so the
		 * assertion simply waited for it to leave and called that success. Found by
		 * reverse experiment: with the guard deliberately removed, the test stayed green.
		 *
		 * Recording every addition from before the click is the only way to tell "it was
		 * never there" from "it is not there any more".
		 */
		await page.evaluate(() => {
			const seen = { flew: false };
			(window as unknown as { __flight: typeof seen }).__flight = seen;
			new MutationObserver((records) => {
				for (const record of records) {
					for (const node of record.addedNodes) {
						if (node instanceof HTMLElement && node.classList.contains('fly-to-favorites')) {
							seen.flew = true;
						}
					}
				}
			}).observe(document.body, { childList: true });
		});

		await page.getByTestId('detail-favorite-btn').click();
		await expect(page.getByTestId('detail-favorite-btn')).toHaveAttribute('aria-pressed', 'false');
		await page.waitForTimeout(300);

		const flew = await page.evaluate(
			() => (window as unknown as { __flight: { flew: boolean } }).__flight.flew
		);
		expect(flew, 'hearts flew to the counter while the animal was being removed from it').toBe(
			false
		);
	});
});

test.describe('letting one go', () => {
	test('the card fades while the others glide into place', async ({ page }) => {
		await seedFavourites(page, SEED);
		await page.goto('/favorites');

		const cells = page.locator('.favs-grid__cell');
		await expect(cells).toHaveCount(SEED.length);

		/** Where the last in-flow card is, and what the leaving one is doing. */
		const sample = () =>
			page.evaluate(() => {
				const all = [...document.querySelectorAll<HTMLElement>('.favs-grid__cell')];
				const leaving = all.find((c) => getComputedStyle(c).position === 'absolute');
				const inFlow = all.filter((c) => c !== leaving);
				return {
					lastX: inFlow.at(-1) ? Math.round(inFlow.at(-1)!.getBoundingClientRect().left) : null,
					leavingIsOutOfFlow: !!leaving,
					leavingOpacity: leaving ? Number(getComputedStyle(leaving).opacity) : null
				};
			});

		const before = await sample();
		await page.locator('.favs-grid__cell button[data-testid$="-favorite-btn"]').first().click();

		const frames = [];
		for (let i = 0; i < 8; i++) {
			frames.push(await sample());
			await page.waitForTimeout(45);
		}

		// Out of flow on the very first frame. This is the part that makes the rest
		// possible: while the leaving card still holds its cell nothing else can move,
		// so the others would wait for it and then jump — which is what this replaced.
		expect(
			frames[0].leavingIsOutOfFlow,
			'the leaving card still occupies its cell, so nothing else can move yet'
		).toBe(true);

		// Fading rather than vanishing.
		const opacities = frames.map((f) => f.leavingOpacity).filter((o): o is number => o !== null);
		expect(opacities.length, 'the card was gone before it could fade').toBeGreaterThan(2);
		expect(Math.min(...opacities), 'it never became more transparent').toBeLessThan(0.9);

		// And the survivors travel. Two positions would be a jump with a frame either
		// side of it; a glide leaves a trail of them.
		const positions = new Set(frames.map((f) => f.lastX).filter((x) => x !== null));
		expect(
			positions.size,
			`the remaining cards jumped instead of moving: seen at ${[...positions].join(', ')}`
		).toBeGreaterThan(2);

		await expect(cells).toHaveCount(SEED.length - 1);
		const after = await sample();
		expect(after.lastX, 'nothing actually moved').not.toBe(before.lastX);
	});
});

test.describe('with reduced motion asked for', () => {
	// An explicit context rather than `test.use({ reducedMotion })`: that option is not
	// in the `use` type this Playwright exposes, and `npm run check` says so. Making the
	// context here is the same setting, stated where it is read.
	test('nothing flies and nothing glides — the state still changes', async ({ browser }) => {
		const context = await browser.newContext({ reducedMotion: 'reduce' });
		const page = await context.newPage();

		await seedFavourites(page, ['basti', 'berry', 'bill']);
		await page.goto('/favorites');
		await expect(page.locator('.favs-grid__cell')).toHaveCount(3);

		await page.locator('.favs-grid__cell button[data-testid$="-favorite-btn"]').first().click();

		// Straight to the answer: the grid has already settled, and no flight was ever
		// started — checked at a moment when a running one would still be on screen.
		await page.waitForTimeout(80);
		expect(await page.locator('.fly-to-favorites').count()).toBe(0);
		await expect(page.locator('.favs-grid__cell')).toHaveCount(2);

		await context.close();
	});
});
