import { expect, test } from '@playwright/test';

/**
 * The checklist page over the built site (BETA-CHECKLIST-v8 § 3, § 4, § 6).
 *
 * The invariants in `src/lib/data/beta/beta.test.ts` prove the DATA holds its shape.
 * They cannot prove the page behaves: that a mark survives a reload, that a mark from
 * another version is labelled and does not count, that a refused clipboard still hands
 * the tester their work. Each of those breaks silently — the page keeps rendering.
 *
 * `/beta-test-checklists` is also in the three page lists of the other suites (axe,
 * runtime testid duplicates, narrow viewports): kept out of the index is not kept out
 * of the checks (§ 5.5).
 */

const PAGE = '/beta-test-checklists';
const KEY = 'adoptananimal_beta_marks';

/** Any three of the fifty-one; ids are stable forever by § 2.2, so naming them is safe. */
const ITEM = 'common_2';
const OTHER = 'common_6';

const progress = (page: import('@playwright/test').Page) =>
	page.getByTestId('beta-progress-value').innerText();

test.describe('the beta checklist', () => {
	test('shows its tabs and its three coverage levels in order', async ({ page }) => {
		await page.goto(PAGE);

		await expect(page.getByTestId('beta-tab-common-btn')).toBeVisible();
		await expect(page.getByTestId('beta-tab-favorites-btn')).toBeVisible();

		// The order is the rule, not the decoration: a person spends themselves first
		// where no machine exists (§ 3).
		const levels = await page
			.locator('[data-testid^="beta-level-"]')
			.evaluateAll((nodes) => nodes.map((n) => (n as HTMLElement).dataset.testid));
		expect(levels).toEqual([
			'beta-level-manual-section',
			'beta-level-testable-section',
			'beta-level-covered-section'
		]);
	});

	test('counts a mark, and the same answer twice takes it back', async ({ page }) => {
		await page.goto(PAGE);
		const before = await progress(page);

		await page.getByTestId(`beta-check-${ITEM}-vote-fail-btn`).click();
		const marked = await progress(page);
		expect(marked).not.toBe(before);

		// Without a way back a mis-click is permanent, and «not checked» is one of the
		// four states (§ 3.2).
		await page.getByTestId(`beta-check-${ITEM}-vote-fail-btn`).click();
		expect(await progress(page)).toBe(before);
	});

	test('keeps a mark across a reload', async ({ page }) => {
		await page.goto(PAGE);
		await page.getByTestId(`beta-check-${OTHER}-vote-ok-btn`).click();
		const marked = await progress(page);

		await page.reload();

		expect(await progress(page)).toBe(marked);
		await expect(page.getByTestId(`beta-check-${OTHER}-vote-ok-btn`)).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	test('labels a mark from another version and does not count it (§ 3.1)', async ({ page }) => {
		await page.goto(PAGE);
		await page.evaluate(
			([key, id]) =>
				localStorage.setItem(key, JSON.stringify({ [id]: { vote: 'ok', version: '0.0.1' } })),
			[KEY, ITEM]
		);
		await page.reload();

		await expect(page.getByTestId(`beta-check-${ITEM}-stale-hint`)).toContainText('0.0.1');
		// Visible, meaningful, and not part of «done on this build».
		expect(await progress(page)).toMatch(/^0 \//);
	});

	test('tells the states apart by more than colour (§ 3.2)', async ({ page }) => {
		await page.goto(PAGE);
		const button = page.getByTestId(`beta-check-${ITEM}-vote-weird-btn`);

		const resting = await button.evaluate((el) => getComputedStyle(el).borderTopWidth);
		await button.click();
		const chosen = await button.evaluate((el) => ({
			width: getComputedStyle(el).borderTopWidth,
			weight: getComputedStyle(el).fontWeight
		}));

		expect(chosen.width).not.toBe(resting);
		expect(Number(chosen.weight)).toBeGreaterThan(700);
	});

	test('hands over the report, and hands it over even when the clipboard refuses', async ({
		page
	}) => {
		await page.goto(PAGE);
		await page.getByTestId(`beta-check-${ITEM}-vote-fail-btn`).click();

		// The clipboard refuses for reasons that are not defects — an unfocused tab, a
		// denied permission. Before § 6.2 the report then existed nowhere at all.
		await page.addInitScript(() => {
			Object.defineProperty(navigator, 'clipboard', {
				value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) },
				configurable: true
			});
		});
		await page.reload();

		await page.getByTestId('beta-report-btn').click();

		await expect(page.getByTestId('beta-report-failed-hint')).toBeVisible();
		const report = await page.getByTestId('beta-report-input').inputValue();
		expect(report).toContain('--- BETA CHECKLIST REPORT ---');
		expect(report, 'the version the marks belong to').toContain('VERSION: v');
		expect(report, 'the marked item, with the answer given').toContain(ITEM);
	});

	test('erasing the marks empties both the count and the storage', async ({ page }) => {
		await page.goto(PAGE);
		await page.getByTestId(`beta-check-${ITEM}-vote-ok-btn`).click();

		await page.getByTestId('beta-clear-btn').click();

		expect(await progress(page)).toMatch(/^0 \//);
		expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull();
	});

	test('is reachable in every language and says so in the language of the URL', async ({
		page
	}) => {
		await page.goto(`/uk${PAGE}`);
		await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
		await expect(page.getByTestId('beta-tab-common-btn')).toContainText('Спільне');

		await page.goto(PAGE);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await expect(page.getByTestId('beta-tab-common-btn')).toContainText('Shared');
	});
});
