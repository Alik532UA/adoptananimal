import { expect, test } from '@playwright/test';

/**
 * The pause on hover is the one part of the toast that unit tests can only
 * approximate: :hover cannot be produced by a synthetic event, so the CSS half of
 * the pause needs a real pointer (WCAG 2.2.1 Timing Adjustable).
 */

test('clicking an email copies it and offers to open the mail app', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/apply/form');

	await page.getByTestId('apply-contact-email-link').click();

	const toast = page.getByTestId('toast-success-toast');
	await expect(toast).toBeVisible();
	await expect(toast).toContainText('info@notpfote.de');
	await expect(page.getByTestId('toast-action-btn')).toBeVisible();

	// No mail client was launched behind the visitor's back.
	await expect(page).toHaveURL(/\/apply\/form$/);

	const clipboard = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboard).toBe('info@notpfote.de');
});

test('the countdown stops under a real pointer and resumes after it leaves', async ({
	page,
	context
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/apply/form');
	await page.getByTestId('apply-contact-email-link').click();

	const toast = page.getByTestId('toast-success-toast');
	await expect(toast).toBeVisible();

	await toast.hover();
	// The toast lasts 6s; well past that, a hovered one must still be there.
	await page.waitForTimeout(8000);
	await expect(toast).toBeVisible();

	const progress = toast.locator('.toast__progress');
	await expect(progress).toHaveCSS('animation-play-state', 'paused');

	// Move the pointer away and it finishes the time it had left.
	await page.mouse.move(0, 0);
	await expect(toast).toBeHidden({ timeout: 10_000 });
});

test('the toast is announced rather than only shown', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-write']);
	await page.goto('/apply/form');
	await page.getByTestId('apply-contact-email-link').click();

	// status, not alert: a copied address is not an interruption.
	await expect(page.getByTestId('toast-success-toast')).toHaveAttribute('role', 'status');
	await expect(page.locator('.toast__progress')).toHaveAttribute('aria-hidden', 'true');
});
