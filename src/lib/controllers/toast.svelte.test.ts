import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from './toast.svelte';

/**
 * The pause behaviour is the reason this controller exists (WCAG 2.2.1): a toast
 * carrying an action the user has to reach with Tab must not disappear under them.
 * It is also the part that quietly breaks when someone "simplifies" the timers.
 */

describe('toast controller', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		toast.clear();
	});

	afterEach(() => {
		toast.clear();
		vi.useRealTimers();
	});

	it('dismisses itself after the given duration', () => {
		toast.info('hello', 5000);
		expect(toast.messages).toHaveLength(1);

		vi.advanceTimersByTime(4999);
		expect(toast.messages).toHaveLength(1);

		vi.advanceTimersByTime(1);
		expect(toast.messages).toHaveLength(0);
	});

	it('does not dismiss while paused', () => {
		const id = toast.info('hello', 5000);

		vi.advanceTimersByTime(1000);
		toast.pause(id);
		vi.advanceTimersByTime(60_000);

		expect(toast.messages).toHaveLength(1);
	});

	it('resumes from where it paused, not from the full duration', () => {
		const id = toast.info('hello', 5000);

		vi.advanceTimersByTime(4000);
		toast.pause(id);
		vi.advanceTimersByTime(10_000);
		toast.resume(id);

		// 1000 ms of the original 5000 are left, so 999 is not yet enough
		vi.advanceTimersByTime(999);
		expect(toast.messages).toHaveLength(1);

		vi.advanceTimersByTime(1);
		expect(toast.messages).toHaveLength(0);
	});

	it('keeps the timer stopped while any hold remains', () => {
		// Hover and focus overlap: leaving with the pointer while the action button
		// still has focus must not restart the countdown.
		const id = toast.info('hello', 5000);

		toast.pause(id); // hover
		toast.pause(id); // focus
		toast.resume(id); // pointer leaves, focus stays

		vi.advanceTimersByTime(60_000);
		expect(toast.messages).toHaveLength(1);

		toast.resume(id); // focus leaves
		vi.advanceTimersByTime(5000);
		expect(toast.messages).toHaveLength(0);
	});

	it('caps how many toasts stack up', () => {
		for (let i = 0; i < 10; i++) toast.info(`toast ${i}`, 5000);

		expect(toast.messages.length).toBeLessThanOrEqual(4);
		// the newest survive, the oldest are dropped
		expect(toast.messages.at(-1)?.message).toBe('toast 9');
	});

	it('replaces an earlier toast anchored to the same element', () => {
		const anchor = {} as HTMLElement;

		toast.success('first', 5000, undefined, anchor);
		toast.success('second', 5000, undefined, anchor);

		expect(toast.messages).toHaveLength(1);
		expect(toast.messages[0].message).toBe('second');
	});

	it('reports elapsed time so the progress bar can resume mid-way', () => {
		const id = toast.info('hello', 5000);

		vi.advanceTimersByTime(2000);
		toast.pause(id);

		expect(toast.elapsedOf(id)).toBe(2000);
	});
});
