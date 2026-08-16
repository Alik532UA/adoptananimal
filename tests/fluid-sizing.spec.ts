import { expect, test } from '@playwright/test';

/**
 * FLUID-SIZING-v8 § 9 — the narrow end of the site, measured rather than eyeballed.
 *
 * Every rule in that file exists because the same three symptoms keep arriving from
 * a user's phone rather than from a build: content clipped, a scrollbar where
 * something should have shrunk, an element pushed off-screen and out of reach.
 * None of them is visible in the source, where they are only numbers in CSS — so
 * this runs in a browser at sizes real devices actually have.
 *
 * The size list is the canon's, and the choices in it are deliberate. A phone in
 * landscape (740×380) and a short portrait (360×500) are the two that break;
 * 375×812, the one everybody tests, almost never does. Desktop is in the list for
 * the opposite reason: `clamp()` is as easy to overdo downward as to forget.
 *
 * WHAT THIS DOES NOT DO, and why. The canon also offers `min-content` on `<body>`
 * as the site's minimum width (§ 8.1). It was tried here as a gate and dropped,
 * because on this site the number does not mean what the gate would claim:
 *
 *   - `min-content` ignores `overflow`, so the home page measures 24024px — the
 *     full length of the carousel strip, which is a horizontal scroller on
 *     purpose. Nothing is wrong and no threshold can say so.
 *   - Measured at a desktop viewport it reports the DESKTOP layout's floor, since
 *     media queries answer to the viewport and not to the element being measured.
 *     /apply reads 358px at 1280px wide and 297px at 320px wide. The first number
 *     describes a layout no phone ever receives.
 *
 * So `min-content` stays what the canon presents it as — a way to find the culprit
 * once something is known to be wrong — and the gate measures the thing the visitor
 * actually gets.
 */

const PAGES = ['/', '/adopt/dog', '/adopt/cat', '/favorites', '/apply', '/adopt/cat/basti'];

/**
 * Pages that already travel sideways at some width, and by how much.
 *
 * A budget, not a pardon: the number can only come down. Zero is the default and what
 * every other page holds; an entry here says "known, measured, not fixed yet".
 *
 * An animal's page was added to PAGES on 2026-08-16 after a change to it introduced a
 * 725px-wide layout on a 320px screen and nothing noticed — the list did not include a
 * single animal page, so the widest defect in the project's history sailed past this
 * gate. The 56px below was already there before that change and is a different fault:
 * the first grid column keeps a floor of 352px where 272 is available.
 */
const SIDEWAYS_BUDGET_PX: Record<string, number> = {
	'/adopt/cat/basti': 56
};

const SIZES = [
	{ width: 320, height: 450, label: 'small phone' },
	{ width: 360, height: 500, label: 'short screen' },
	{ width: 740, height: 380, label: 'phone in landscape' },
	{ width: 1280, height: 800, label: 'desktop — guards against over-shrinking' }
];

test.describe('the narrow end', () => {
	for (const { width, height, label } of SIZES) {
		test(`${width}×${height} (${label}) never scrolls sideways`, async ({ page }) => {
			await page.setViewportSize({ width, height });

			const offenders: string[] = [];
			for (const path of PAGES) {
				await page.goto(path);
				await expect(page.locator('main')).toBeVisible();

				const measured = await page.evaluate(() => ({
					scrollWidth: document.documentElement.scrollWidth,
					viewport: window.innerWidth
				}));

				// One pixel of slack: sub-pixel layout rounds, and a gate that fails on
				// half a pixel is one people re-run rather than read.
				const budget = SIDEWAYS_BUDGET_PX[path] ?? 0;
				const over = measured.scrollWidth - measured.viewport;
				if (over > budget + 1) {
					offenders.push(
						`${path}: ${measured.scrollWidth}px of content in a ${measured.viewport}px window` +
							(budget ? ` — ${over}px over, and the recorded budget is ${budget}px` : '')
					);
				}
			}

			expect(offenders, `the page travels sideways:\n${offenders.join('\n')}`).toEqual([]);
		});
	}

	for (const { width, height, label } of SIZES) {
		test(`${width}×${height} (${label}) keeps the header controls reachable`, async ({ page }) => {
			// The classic failure this file exists for is not clipping but reach: an
			// element pushed past an edge is still in the DOM, still visible to a test
			// that only asks `toBeVisible()`, and impossible to press.
			await page.setViewportSize({ width, height });
			await page.goto('/');
			await expect(page.locator('main')).toBeVisible();

			const controls = page.locator('header a, header button').filter({ visible: true });
			const count = await controls.count();
			expect(count, 'no header controls found — the check is dead').toBeGreaterThan(0);

			const out: string[] = [];
			for (let i = 0; i < count; i++) {
				const box = await controls.nth(i).boundingBox();
				if (!box) continue;
				if (box.x < -1 || box.x + box.width > width + 1) {
					const html = await controls.nth(i).evaluate((n) => n.outerHTML.slice(0, 70));
					out.push(`${Math.round(box.x)}…${Math.round(box.x + box.width)} of ${width}: ${html}`);
				}
			}

			expect(out, `outside the window and unreachable:\n${out.join('\n')}`).toEqual([]);
		});
	}
});

test('a recorded sideways budget is not larger than it needs to be', async ({ page }) => {
	// The same discipline as the touch-target list: once a page stops overflowing, this
	// fails until the entry comes out, so the numbers can only ever shrink.
	await page.setViewportSize({ width: 320, height: 450 });

	const slack: string[] = [];
	for (const [path, budget] of Object.entries(SIDEWAYS_BUDGET_PX)) {
		await page.goto(path);
		await expect(page.locator('main')).toBeVisible();
		const over = await page.evaluate(
			() => document.documentElement.scrollWidth - window.innerWidth
		);
		if (over < budget) slack.push(`${path}: budgeted ${budget}px, now ${Math.max(over, 0)}px`);
	}

	expect(slack, 'the budget is bigger than the defect — lower it: ' + slack.join('; ')).toEqual([]);
});
