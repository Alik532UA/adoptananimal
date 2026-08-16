import { expect, test } from '@playwright/test';

/**
 * A skin's override actually beats the component it overrides.
 *
 * WHY THIS FILE EXISTS. `[data-style='playful'] .animal-card:hover` rotates the card a
 * degree and a half. It did that in `npm run dev` and did nothing at all in a build,
 * and nothing anywhere reported it — not the compiler, not svelte-check, not the
 * hundred and seventy e2e cases that were already walking these pages.
 *
 * The skin rule has been there since the initial commit; the collision arrived on
 * 2026-08-14 in a1d11d8, when the card gained a hover transform of its own. Two days,
 * by the dates in the log — but nothing about the mechanism limits it to two days,
 * and the reason it was found at all is that somebody looked at dev and prod side by
 * side, which is not something a test suite does on its own.
 *
 * The mechanism is worth stating because it is not specific to this rule. Svelte
 * compiles a component's `.animal-card:hover` to `.animal-card.svelte-HASH:hover` —
 * the scoping class is invisible in the source and it counts. That makes the
 * component's selector (0,3,0), which is exactly what `[attribute] .class:hover`
 * comes to. A tie is broken by source order, and source order is not a property of
 * the code: in dev Vite injects component CSS as a <style> after app.css, in a build
 * it emits a separate <link> that the global bundle precedes. Same stylesheets, same
 * specificity, opposite winner.
 *
 * So the check has to run against the built site — which is what `webServer` in
 * playwright.config.ts serves — and it has to measure the composed transform rather
 * than assert a class is present. A class being present was never the problem.
 *
 * The fix these guard is the `:root` prefix on the skin selectors, which takes them to
 * (0,4,0) and settles the question without depending on the bundler.
 */

/** What each skin's hover must come to, read off the computed matrix. */
const EXPECTED = [
	{
		style: 'playful',
		rotationDeg: 1.5,
		scale: 1.05,
		translateY: 0,
		note: 'the skin rotates and grows the card; no lift'
	},
	{
		style: 'modern',
		rotationDeg: 0,
		scale: 1,
		translateY: -8,
		note: 'a straight lift, and deliberately no scale — the component base adds 1.02'
	},
	{
		style: 'minimal',
		rotationDeg: 0,
		scale: 1.02,
		translateY: -8,
		note: 'no override of its own, so the component base is what should show'
	}
];

/** Rotation, scale and vertical offset out of a computed `matrix(...)`. */
function decompose(transform: string) {
	const parts = transform
		.match(/matrix\(([^)]+)\)/)?.[1]
		.split(',')
		.map(Number);
	if (!parts) return null;
	const [a, b, , , , f] = parts;
	return {
		rotationDeg: Math.round((Math.atan2(b, a) * 180) / Math.PI / 0.1) * 0.1,
		scale: Math.round(Math.hypot(a, b) * 1000) / 1000,
		translateY: Math.round(f)
	};
}

for (const { style, rotationDeg, scale, translateY, note } of EXPECTED) {
	test(`skin ${style}: the card hover is ${note}`, async ({ page }) => {
		// Chosen the way a visitor chooses it: the first-frame script in app.html reads
		// this key before hydration, so the skin is on from the very first paint.
		await page.addInitScript((chosen) => {
			try {
				localStorage.setItem('adoptananimal_style', chosen as string);
			} catch {
				/* private mode — the assertion below will say the skin never applied */
			}
		}, style);

		await page.goto('/adopt/cat');
		await expect(page.locator('main')).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('data-style', style);

		const card = page.locator('.animal-card').first();
		await card.scrollIntoViewIfNeeded();

		const atRest = decompose(await card.evaluate((el) => getComputedStyle(el).transform));
		expect(atRest?.rotationDeg ?? 0, 'the card is already turned before anything hovers it').toBe(
			0
		);

		await card.hover();
		// The transform is a spring; sample once it has settled rather than mid-flight.
		await page.waitForTimeout(700);

		const hovered = decompose(await card.evaluate((el) => getComputedStyle(el).transform));
		expect(hovered, 'no transform on hover at all — the rule did not apply').not.toBeNull();

		expect(
			hovered!.rotationDeg,
			`${style} should settle at ${rotationDeg}° — a mismatch here is the skin losing to the ` +
				`component's own hover, which is invisible in dev and shows only in a build`
		).toBeCloseTo(rotationDeg, 1);

		expect(hovered!.scale, `${style} should settle at scale ${scale}`).toBeCloseTo(scale, 2);
		expect(hovered!.translateY, `${style} should settle at translateY ${translateY}px`).toBe(
			translateY
		);
	});
}
