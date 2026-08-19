import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createKeySequence, type KeyStroke } from './keySequence';

/**
 * Every case here corresponds to a real way of firing a service gesture by
 * accident, not to an abstract notion of coverage.
 *
 * The text-entry and auto-repeat cases are the expensive ones: in a sibling
 * project on this origin the same gesture counted presses ABOVE its text-entry
 * check and ignored `event.repeat`, so a held-down `R` inside a search field wiped
 * every local key in under two seconds, with no confirmation.
 */

const OUTSIDE_FIELD = { closest: () => null } as unknown as EventTarget;
const INSIDE_FIELD = { closest: () => ({}) } as unknown as EventTarget;

function press(overrides: Partial<KeyStroke> = {}): KeyStroke {
	return { code: 'KeyR', repeat: false, target: OUTSIDE_FIELD, ...overrides };
}

describe('createKeySequence', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('fires exactly at the threshold, not before', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 3, onComplete });

		sequence.handle(press());
		sequence.handle(press());
		expect(onComplete).not.toHaveBeenCalled();

		sequence.handle(press());
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it('resets after firing, so the next run starts from zero', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 2, onComplete });

		sequence.handle(press());
		sequence.handle(press());
		expect(sequence.count).toBe(0);

		sequence.handle(press());
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it('does not count auto-repeat: a held key is one press', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 3, onComplete });

		// ~30 events per second is how a threshold of 55 used to be reached in
		// under two seconds.
		for (let i = 0; i < 60; i++) sequence.handle(press({ repeat: true }));

		expect(sequence.count).toBe(0);
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('does not count typing inside a field', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 2, onComplete });

		sequence.handle(press({ target: INSIDE_FIELD }));
		sequence.handle(press({ target: INSIDE_FIELD }));

		expect(onComplete).not.toHaveBeenCalled();
	});

	it('sees a nested contenteditable node, which a tagName check would miss', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 2, onComplete });
		// Focus inside an editable block sits on a SPAN, not on INPUT.
		const span = { closest: () => ({}) } as unknown as EventTarget;

		sequence.handle(press({ target: span }));
		sequence.handle(press({ target: span }));

		expect(onComplete).not.toHaveBeenCalled();
	});

	it('a press inside a field does not discard what was already collected', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 2, onComplete });

		sequence.handle(press());
		sequence.handle(press({ target: INSIDE_FIELD }));
		expect(sequence.count).toBe(1);

		sequence.handle(press());
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it.each(['ctrlKey', 'metaKey', 'altKey'] as const)(
		'does not count %s: that is a browser command, not a step in a run',
		(modifier) => {
			const onComplete = vi.fn();
			const sequence = createKeySequence({ code: 'KeyR', threshold: 2, onComplete });

			sequence.handle(press({ [modifier]: true }));
			sequence.handle(press({ [modifier]: true }));

			expect(onComplete).not.toHaveBeenCalled();
		}
	);

	it('any other key resets the counter: this is a run, not a running total', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 3, onComplete });

		sequence.handle(press());
		sequence.handle(press());
		sequence.handle(press({ code: 'KeyA' }));
		expect(sequence.count).toBe(0);

		sequence.handle(press());
		sequence.handle(press());
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('a pause longer than the window resets the counter', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 3, windowMs: 2000, onComplete });

		sequence.handle(press());
		sequence.handle(press());
		vi.advanceTimersByTime(2001);
		expect(sequence.count).toBe(0);

		sequence.handle(press());
		sequence.handle(press());
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('presses within the window continue the run', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 3, windowMs: 2000, onComplete });

		sequence.handle(press());
		vi.advanceTimersByTime(1900);
		sequence.handle(press());
		vi.advanceTimersByTime(1900);
		sequence.handle(press());

		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it('a function threshold is read on EVERY press', () => {
		// Exactly what the badge needs: 55 to reveal in production, 5 to hide.
		let threshold = 3;
		const onComplete = vi.fn(() => {
			threshold = 2;
		});
		const sequence = createKeySequence({ code: 'KeyR', threshold: () => threshold, onComplete });

		sequence.handle(press());
		sequence.handle(press());
		sequence.handle(press());
		expect(onComplete).toHaveBeenCalledTimes(1);

		// The second run already uses the new, lower threshold.
		sequence.handle(press());
		sequence.handle(press());
		expect(onComplete).toHaveBeenCalledTimes(2);
	});

	it('reset() drops the timer, not just the counter', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 2, windowMs: 2000, onComplete });

		sequence.handle(press());
		sequence.reset();
		// A surviving timer would clear a BRAND NEW run at somebody else's moment.
		sequence.handle(press());
		vi.advanceTimersByTime(1999);
		sequence.handle(press());

		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it('does not throw on a target without closest', () => {
		const onComplete = vi.fn();
		const sequence = createKeySequence({ code: 'KeyR', threshold: 1, onComplete });

		expect(() => sequence.handle(press({ target: null }))).not.toThrow();
		expect(onComplete).toHaveBeenCalledTimes(1);
	});
});
