import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clock, refreshToday } from './clock.svelte';

/**
 * The whole point of this module is that a prerendered page stops lying about the date.
 * If `refreshToday` ever became a no-op — a `const`, a memo, an early return on "same
 * day" — every age on the site would silently freeze at the build again, which is the
 * bug this replaced and which no other test would notice.
 */
describe('the clock behind the ages', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		refreshToday();
	});

	it('moves when told to, so a page built last year catches up', () => {
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
		refreshToday();
		expect(new Date(clock.now).toISOString().slice(0, 10)).toBe('2026-01-01');

		vi.setSystemTime(new Date('2027-03-04T00:00:00Z'));
		refreshToday();
		expect(new Date(clock.now).toISOString().slice(0, 10)).toBe('2027-03-04');
	});
});
