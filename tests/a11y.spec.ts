import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { baselineFor, knownFor } from './a11y-baseline';

/**
 * axe over the built site. Contrast in particular cannot be checked by reading CSS:
 * the project ships four themes across three skins, and a pairing that fails only in
 * the theme nobody develops in is exactly the one that reaches users.
 */

const THEMES = ['dark', 'light-green', 'orange-purple', 'winter'] as const;
const STYLES = ['modern', 'minimal', 'playful'] as const;
const PAGES = [
	'/',
	'/adopt/cat',
	'/adopt/cat/basti',
	'/apply',
	'/apply/form',
	'/favorites',
	// Kept out of the index, not out of the audit: it is the page testers spend the
	// most time on, and BETA-CHECKLIST-v8 § 5.5 says so explicitly.
	'/beta-test-checklists'
];

/**
 * Waits for every running animation on the element to finish.
 *
 * axe samples colours at the moment it runs, so a menu still fading in measures as a
 * blend of itself and what is behind it: white over green read as #d3ddcd and scored
 * 4.48 against a pair that actually passes at 6.28. Emulating reduced motion did not
 * settle it reliably; waiting on the animations themselves does.
 *
 * subtree: true, because what axe measures is the items inside the menu, not the menu
 * box. Without it this waited for the container to stop moving and then sampled
 * children that were still fading — which passed alone and failed under load, the
 * worst way for a check to be wrong.
 */
const settle = (locator: import('@playwright/test').Locator) =>
	locator.evaluate((el) =>
		Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)).then(() => {})
	);

/**
 * The same wait, for everything on the page.
 *
 * networkidle says the requests finished, not that the page stopped moving, so the
 * whole-page audits were sampling colours mid-animation and had been getting away
 * with it. A link fading in over the page measured #4782d6 instead of the #1f66cc it
 * settles to and scored 3.68 against a pair that actually passes at 5.08.
 *
 * Endless animations are skipped: they never finish, and awaiting one would hang the
 * run rather than fail it. The timeout is the same reasoning applied to an animation
 * that is finite in theory and stuck in practice.
 */
const settlePage = (page: import('@playwright/test').Page) =>
	page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				const finite = document
					.getAnimations()
					.filter((a) => (a.effect?.getComputedTiming().iterations ?? 1) !== Infinity);
				void Promise.all(finite.map((a) => a.finished.catch(() => undefined))).then(() =>
					resolve()
				);
				setTimeout(resolve, 3000);
			})
	);

/**
 * The one thing the owner has decided to keep at a contrast the audit would reject.
 *
 * Cards for animals that already found a home render at 50% opacity — greyscale read
 * as mourning for a happy outcome — and half-transparent text does not reach 4.5:1
 * whatever colours sit underneath. The trade is deliberate and bounded: they are at
 * most a tenth of the carousel, they are not the path to anything, and hovering or
 * focusing one brings it back to full opacity. PROJECT-CONTEXT.md § 4.11.
 *
 * It is written as an exclusion rather than a loosened threshold, so it is visible in
 * the diff the day that decision changes — and so nothing else drifts out of range
 * unnoticed in the meantime. The plated section title was on this list for one commit
 * and came off it: the colours it was excluded for have been replaced by ones that
 * measure.
 */
const OWNER_EXCEPTIONS = ['.animal-card--adopted'];

/** Someone else's document: axe cannot audit across the origin boundary, and what is
 *  inside is not ours to fix. */
const NOT_OURS = 'iframe';

const audit = (page: import('@playwright/test').Page) =>
	new AxeBuilder({ page })
		.exclude(OWNER_EXCEPTIONS)
		.exclude(NOT_OURS)
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
		.analyze();

for (const path of PAGES) {
	test(`${path} has no accessibility violations`, async ({ page }) => {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
		await settlePage(page);

		const results = await audit(page);

		/*
		 * Two assertions, not one, and the order matters.
		 *
		 * The ids first: a violation type we have never seen fails the run even if
		 * the total is still under the limit. A bare count would swallow it — one
		 * old violation fixed and one new one introduced nets to zero.
		 *
		 * Then the count, as a ceiling that only ever comes down. See
		 * ./a11y-baseline.ts for why this is not `toEqual([])`.
		 */
		const report = results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`).join('\n');

		const ids = [...new Set(results.violations.map((v) => v.id))].sort();
		expect(ids, `${path}: violation type that is not in the baseline\n${report}`).toEqual(
			knownFor(path)
		);

		expect(
			results.violations.length,
			`${path}: more violations than the baseline allows\n${report}`
		).toBeLessThanOrEqual(baselineFor(path));
	});
}

/*
 * Every theme on every page, not one theme on one page.
 *
 * This used to audit /adopt/cat alone, which is the same blind spot the note at the
 * top of this file describes, only one level up: the pairing that fails is the one on
 * the page nobody thought to check in the theme nobody develops in. It missed a
 * secondary button that measures 2.89:1 in winter and 5.98:1 in the default, and it
 * missed it because the page it sits on was only ever audited in the default.
 */
for (const theme of THEMES) {
	for (const path of PAGES) {
		test(`theme ${theme} keeps contrast within WCAG AA on ${path}`, async ({ page }) => {
			await page.goto(path);
			await page.evaluate((t) => {
				localStorage.setItem('adoptananimal_theme', t);
			}, theme);
			await page.reload();
			await page.waitForLoadState('networkidle');
			await settlePage(page);

			expect(await page.getAttribute('html', 'data-theme')).toBe(theme);

			const results = await new AxeBuilder({ page })
				.exclude(OWNER_EXCEPTIONS)
				.exclude(NOT_OURS)
				.withTags(['wcag2aa'])
				.analyze();
			const contrast = results.violations.filter((v) => v.id === 'color-contrast');

			expect(
				contrast.flatMap((v) =>
					v.nodes.map((n) => `${theme} ${path}: ${n.target} — ${n.failureSummary}`)
				)
			).toEqual([]);
		});
	}
}

/*
 * Every skin as well, not only every theme.
 *
 * The same blind spot one step along. The sweep above varies the theme and leaves the
 * skin wherever it was, so a rule that exists in one skin alone was never measured at
 * all: playful puts the section title on a plate of --color-secondary and took the
 * foreground meant for --color-primary. That reads as deliberate in the three themes
 * whose secondary is a light amber, and it came out at 1.71:1 — dark purple on dark
 * purple — in the one whose secondary is not.
 *
 * The home page alone, because it carries both of the things a skin repaints, the
 * plated title and the badges on the cards; three skins over six pages is a sweep
 * nobody would keep waiting for.
 */
for (const style of STYLES) {
	for (const theme of THEMES) {
		test(`style ${style} keeps contrast within WCAG AA in theme ${theme}`, async ({ page }) => {
			await page.goto('/');
			await page.evaluate(
				([s, t]) => {
					localStorage.setItem('adoptananimal_style', s);
					localStorage.setItem('adoptananimal_theme', t);
				},
				[style, theme] as const
			);
			await page.reload();
			await page.waitForLoadState('networkidle');
			await settlePage(page);

			// Both, because a skin that failed to apply would leave the default one in
			// place and the audit would quietly pass on a page it never tested.
			expect(await page.getAttribute('html', 'data-style')).toBe(style);
			expect(await page.getAttribute('html', 'data-theme')).toBe(theme);

			const results = await new AxeBuilder({ page })
				.exclude(OWNER_EXCEPTIONS)
				.exclude(NOT_OURS)
				.withTags(['wcag2aa'])
				.analyze();

			expect(
				results.violations
					.filter((v) => v.id === 'color-contrast')
					.flatMap((v) =>
						v.nodes.map((n) => `${style}/${theme}: ${n.target} — ${n.failureSummary}`)
					)
			).toEqual([]);
		});
	}
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
	// Focus moves into the menu, so the arrow keys have somewhere to start. First in the
	// list is the theme the site opens in.
	await expect(page.getByTestId('theme-option-light-green-btn')).toBeFocused();

	await page.keyboard.press('ArrowDown');
	await expect(page.getByTestId('theme-option-dark-btn')).toBeFocused();

	await page.keyboard.press('End');
	await expect(page.getByTestId('theme-option-winter-btn')).toBeFocused();

	// Escape closes and hands focus back, rather than stranding the user inside.
	await page.keyboard.press('Escape');
	await expect(page.getByRole('menu')).toBeHidden();
	await expect(page.getByTestId('theme-toggle-btn')).toBeFocused();
});
