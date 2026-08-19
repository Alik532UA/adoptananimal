/**
 * A run of presses on one key, treated as a service gesture.
 *
 * **Why a module rather than ten lines inside the handler.** Because the whole
 * point here is the GUARDS, and a guard nobody tests is a wish. The same gesture
 * exists in the sibling projects on this origin, and it was written from scratch
 * each time: one of them counted `R` presses *above* its text-entry check, so a
 * held-down key inside a search field wiped every local key in under two seconds.
 * The difference was not carelessness — it was that the logic lived inside a
 * handler and had no test.
 *
 * **Five guards, each closing a real way to fire this by accident.**
 *
 *  1. `event.repeat` — auto-repeat delivers ~30 events per second, so a held key
 *     reaches even a threshold of 55 in under two seconds. A held key is one
 *     press, not a run.
 *  2. Text entry. The listener sits on the document, so it also fires while
 *     someone types. The word 'rrrr' must not launch anything.
 *  3. A window between presses. Without it the counter lives for the whole
 *     session: pressing the key once an hour would eventually trigger a gesture
 *     nobody performed.
 *  4. Any other key resets the counter. That is what makes this a RUN rather
 *     than a running total.
 *  5. Modifiers. `Ctrl+V` is a paste, `Ctrl+R` is a reload; neither is a step in
 *     a run (HOTKEYS-v8 § 2.1).
 *
 * Threshold and window are chosen by the caller: the cost of an accidental
 * trigger differs per gesture, so one shared number would be a coincidence
 * rather than a decision.
 */

/** The minimum a stroke needs. A test does not have to build a real `KeyboardEvent`. */
export interface KeyStroke {
	code: string;
	repeat?: boolean;
	target?: EventTarget | null;
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
}

export interface KeySequenceOptions {
	/** `KeyboardEvent.code`, e.g. `'KeyR'` — not `key`, which depends on the layout. */
	code: string;
	/**
	 * How many presses in a row complete the gesture.
	 *
	 * As a function when the threshold depends on state the gesture itself
	 * changes: revealing the badge in production costs 55 presses, hiding it
	 * again costs 5. A plain number cannot express that — the needed threshold is
	 * unknown when the sequence is created, and recreating the sequence on every
	 * state change would throw away half of a run in progress.
	 */
	threshold: number | (() => number);
	/** How long the next press has to arrive. Two seconds by default. */
	windowMs?: number;
	onComplete: () => void;
}

export interface KeySequence {
	handle(stroke: KeyStroke): void;
	/** Presses collected so far. Read by tests and diagnostics. */
	readonly count: number;
	/** Clear the counter and drop the timer. Called on teardown. */
	reset(): void;
}

/** Elements whose own keystrokes must not be counted. */
const TEXT_ENTRY_SELECTOR =
	'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/**
 * `closest`, not a `tagName` comparison: inside a `contenteditable` the focus
 * sits on a nested node whose `tagName` is `SPAN`, so a tag check misses it.
 */
function isTypingTarget(target: EventTarget | null | undefined): boolean {
	const element = target as HTMLElement | null | undefined;
	if (!element || typeof element.closest !== 'function') return false;
	return element.closest(TEXT_ENTRY_SELECTOR) !== null;
}

function isPlainKey(stroke: KeyStroke): boolean {
	return !stroke.ctrlKey && !stroke.metaKey && !stroke.altKey;
}

export function createKeySequence(options: KeySequenceOptions): KeySequence {
	const windowMs = options.windowMs ?? 2000;
	let count = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function reset(): void {
		count = 0;
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
	}

	return {
		get count() {
			return count;
		},
		reset,
		handle(stroke: KeyStroke): void {
			/*
			 * Auto-repeat, typing and chords do not count — but they do not reset
			 * the counter either: pressing the right key while a field happens to
			 * have focus, or while `Ctrl` is held, and silently losing the run would
			 * be behaviour nobody could explain.
			 */
			if (stroke.repeat) return;
			if (!isPlainKey(stroke)) return;
			if (isTypingTarget(stroke.target)) return;

			if (stroke.code !== options.code) {
				reset();
				return;
			}

			count++;
			if (timer !== undefined) clearTimeout(timer);

			// Read on EVERY press: it may have changed when this same gesture last
			// completed.
			const threshold =
				typeof options.threshold === 'function' ? options.threshold() : options.threshold;

			if (count >= threshold) {
				reset();
				options.onComplete();
				return;
			}

			timer = setTimeout(reset, windowMs);
		}
	};
}
